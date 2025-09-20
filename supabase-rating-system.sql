-- =====================================================================
-- SUPABASE DATABASE SCRIPTS FOR REAL-TIME RATING SYSTEM
-- =====================================================================

-- 1. Create prompts table with dynamic categories
CREATE TABLE IF NOT EXISTS prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    category VARCHAR(100), -- Dynamic: Linux Developer, Data Scientist, etc.
    tags TEXT[] DEFAULT '{}', -- Array of tags
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'video', 'image')),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE
);

-- 2. Create ratings table for user ratings
CREATE TABLE IF NOT EXISTS prompt_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(prompt_id, user_id) -- One rating per user per prompt
);

-- 3. Create favorites table
CREATE TABLE IF NOT EXISTS prompt_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(prompt_id, user_id) -- One favorite per user per prompt
);

-- 4. Create usage tracking table
CREATE TABLE IF NOT EXISTS prompt_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    platform VARCHAR(50) DEFAULT 'web', -- web, api, mobile, etc.
    ip_address INET,
    user_agent TEXT
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_type ON prompts(type);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_usage_count ON prompts(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompt_ratings_prompt_id ON prompt_ratings(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_ratings_user_id ON prompt_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_favorites_user_id ON prompt_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_prompt_id ON prompt_usage(prompt_id);

-- 6. Create view for prompts with aggregated ratings
CREATE OR REPLACE VIEW prompts_with_ratings AS
SELECT
    p.*,
    COALESCE(AVG(pr.rating)::NUMERIC(3,2), 0) as average_rating,
    COUNT(pr.rating)::INTEGER as rating_count,
    COUNT(pf.id)::INTEGER as favorite_count
FROM prompts p
LEFT JOIN prompt_ratings pr ON p.id = pr.prompt_id
LEFT JOIN prompt_favorites pf ON p.id = pf.prompt_id
GROUP BY p.id;

-- 7. Function to update prompt usage count
CREATE OR REPLACE FUNCTION increment_prompt_usage(prompt_id UUID, user_id UUID DEFAULT NULL, platform VARCHAR DEFAULT 'web')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert usage record
    INSERT INTO prompt_usage (prompt_id, user_id, platform, ip_address, user_agent)
    VALUES (prompt_id, user_id, platform, inet_client_addr(), current_setting('request.headers')::json->>'user-agent');

    -- Update usage count
    UPDATE prompts
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = prompt_id;
END;
$$;

-- 8. Function to rate a prompt
CREATE OR REPLACE FUNCTION rate_prompt(prompt_id UUID, user_id UUID, rating INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Validate rating
    IF rating < 1 OR rating > 5 THEN
        RAISE EXCEPTION 'Rating must be between 1 and 5';
    END IF;

    -- Insert or update rating
    INSERT INTO prompt_ratings (prompt_id, user_id, rating)
    VALUES (prompt_id, user_id, rating)
    ON CONFLICT (prompt_id, user_id)
    DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW();

    -- Return updated stats
    SELECT json_build_object(
        'average_rating', COALESCE(AVG(pr.rating)::NUMERIC(3,2), 0),
        'rating_count', COUNT(pr.rating)::INTEGER,
        'user_rating', rating
    )
    INTO result
    FROM prompt_ratings pr
    WHERE pr.prompt_id = rate_prompt.prompt_id;

    RETURN result;
END;
$$;

-- 9. Function to toggle favorite
CREATE OR REPLACE FUNCTION toggle_favorite(prompt_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_favorited BOOLEAN;
BEGIN
    -- Check if already favorited
    SELECT EXISTS(
        SELECT 1 FROM prompt_favorites
        WHERE prompt_id = toggle_favorite.prompt_id
        AND user_id = toggle_favorite.user_id
    ) INTO is_favorited;

    IF is_favorited THEN
        -- Remove favorite
        DELETE FROM prompt_favorites
        WHERE prompt_id = toggle_favorite.prompt_id
        AND user_id = toggle_favorite.user_id;
        RETURN FALSE;
    ELSE
        -- Add favorite
        INSERT INTO prompt_favorites (prompt_id, user_id)
        VALUES (toggle_favorite.prompt_id, toggle_favorite.user_id);
        RETURN TRUE;
    END IF;
END;
$$;

-- 10. Function to search prompts with full-text search
CREATE OR REPLACE FUNCTION search_prompts(
    search_query TEXT DEFAULT '',
    prompt_type VARCHAR DEFAULT 'all',
    category_filter VARCHAR DEFAULT 'all',
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    title VARCHAR,
    description TEXT,
    prompt TEXT,
    category VARCHAR,
    tags TEXT[],
    type VARCHAR,
    usage_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    average_rating NUMERIC,
    rating_count INTEGER,
    favorite_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pwr.id,
        pwr.title,
        pwr.description,
        pwr.prompt,
        pwr.category,
        pwr.tags,
        pwr.type,
        pwr.usage_count,
        pwr.created_at,
        pwr.average_rating,
        pwr.rating_count,
        pwr.favorite_count
    FROM prompts_with_ratings pwr
    WHERE
        (prompt_type = 'all' OR pwr.type = prompt_type)
        AND (category_filter = 'all' OR pwr.category = category_filter)
        AND (
            search_query = ''
            OR pwr.title ILIKE '%' || search_query || '%'
            OR pwr.description ILIKE '%' || search_query || '%'
            OR pwr.category ILIKE '%' || search_query || '%'
            OR pwr.prompt ILIKE '%' || search_query || '%'
            OR EXISTS (
                SELECT 1 FROM unnest(pwr.tags) as tag
                WHERE tag ILIKE '%' || search_query || '%'
            )
        )
        AND pwr.is_public = TRUE
    ORDER BY
        CASE
            WHEN search_query != '' THEN
                (CASE WHEN pwr.title ILIKE '%' || search_query || '%' THEN 10 ELSE 0 END) +
                (CASE WHEN pwr.category ILIKE '%' || search_query || '%' THEN 8 ELSE 0 END) +
                (CASE WHEN pwr.description ILIKE '%' || search_query || '%' THEN 5 ELSE 0 END) +
                (CASE WHEN EXISTS (SELECT 1 FROM unnest(pwr.tags) as tag WHERE tag ILIKE '%' || search_query || '%') THEN 3 ELSE 0 END)
            ELSE 0
        END DESC,
        pwr.average_rating DESC,
        pwr.usage_count DESC,
        pwr.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- 11. Row Level Security (RLS) policies
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_usage ENABLE ROW LEVEL SECURITY;

-- Public prompts are visible to everyone
CREATE POLICY "Public prompts are viewable by everyone" ON prompts
    FOR SELECT USING (is_public = TRUE);

-- Users can create prompts
CREATE POLICY "Users can create prompts" ON prompts
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can edit their own prompts
CREATE POLICY "Users can edit own prompts" ON prompts
    FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete their own prompts
CREATE POLICY "Users can delete own prompts" ON prompts
    FOR DELETE USING (auth.uid() = created_by);

-- Users can rate any public prompt
CREATE POLICY "Users can rate prompts" ON prompt_ratings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = prompt_ratings.prompt_id
            AND prompts.is_public = TRUE
        )
        AND auth.uid() = user_id
    );

-- Users can favorite any public prompt
CREATE POLICY "Users can favorite prompts" ON prompt_favorites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = prompt_favorites.prompt_id
            AND prompts.is_public = TRUE
        )
        AND auth.uid() = user_id
    );

-- Usage tracking for all prompts
CREATE POLICY "Anyone can track usage" ON prompt_usage
    FOR INSERT WITH CHECK (TRUE);

-- 12. Trigger to auto-extract category from prompt content
CREATE OR REPLACE FUNCTION extract_category_from_prompt()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Auto-extract category if not provided
    IF NEW.category IS NULL OR NEW.category = '' THEN
        -- Look for "Act as a..." patterns
        IF NEW.prompt ~* 'act as a ([^.!?]+)' THEN
            NEW.category := initcap(trim(substring(NEW.prompt FROM 'act as a ([^.!?]+)')));
        -- Look for "I want you to act as..." patterns
        ELSIF NEW.prompt ~* 'i want you to act as (?:a |an )?([^.!?]+)' THEN
            NEW.category := initcap(trim(substring(NEW.prompt FROM 'i want you to act as (?:a |an )?([^.!?]+)')));
        -- Look for role-based patterns
        ELSIF NEW.prompt ~* '(?:play|be) (?:the role of |a |an )?([^.!?]+)' THEN
            NEW.category := initcap(trim(substring(NEW.prompt FROM '(?:play|be) (?:the role of |a |an )?([^.!?]+)')));
        ELSE
            NEW.category := 'General';
        END IF;

        -- Clean up category (limit length, remove unwanted chars)
        NEW.category := LEFT(regexp_replace(NEW.category, '[^a-zA-Z0-9 ]', '', 'g'), 50);
    END IF;

    -- Update timestamp
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_extract_category
    BEFORE INSERT OR UPDATE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION extract_category_from_prompt();

-- 13. Insert sample data
INSERT INTO prompts (title, description, prompt, category, tags, type) VALUES
('Linux Developer', 'Act as a Linux terminal expert',
'I want you to act as a linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. do not write explanations. do not type commands unless I instruct you to do so.',
'Linux Developer',
ARRAY['linux', 'terminal', 'command-line'],
'text'),

('Data Scientist', 'Professional data analysis and insights',
'I want you to act as a data scientist. Imagine you''re working on a challenging project for a cutting-edge tech company. You''ve been tasked with extracting valuable insights from a large dataset. Please analyze the data I provide and give me actionable insights.',
'Data Scientist',
ARRAY['data-analysis', 'python', 'statistics'],
'text'),

('UX/UI Designer', 'Design thinking and user experience expertise',
'I want you to act as a UX/UI developer. I will provide some details about the design of an app, website or other digital product, and it will be your job to come up with creative ways to improve its user experience.',
'UX/UI Designer',
ARRAY['design', 'user-experience', 'interface'],
'text'),

('Software Engineer', 'Code reviews and technical architecture',
'I want you to act as a software engineer. I''ll provide you with code and you should analyze it for best practices, potential bugs, performance optimizations, and suggest improvements. Focus on clean code principles, SOLID principles, and maintainability.',
'Software Engineer',
ARRAY['coding', 'review', 'architecture'],
'text'),

('Digital Marketer', 'Marketing strategy and campaign creation',
'I want you to act as a digital marketing expert. Create a comprehensive marketing strategy for [PRODUCT/SERVICE]. Include target audience analysis, key messaging, content strategy, and recommended channels for maximum reach and conversion.',
'Digital Marketer',
ARRAY['marketing', 'strategy', 'campaigns'],
'text'),

('Film Director', 'Cinematic video scene direction',
'I want you to act as a film director. Describe a cinematic scene for [SCENE DESCRIPTION]. Include camera movements, lighting setup, mood, color palette, and specific technical details for achieving professional cinematography.',
'Film Director',
ARRAY['cinematography', 'directing', 'visual'],
'video');

-- 14. Add some sample ratings
INSERT INTO prompt_ratings (prompt_id, user_id, rating)
SELECT p.id, gen_random_uuid(), (random() * 5 + 1)::integer
FROM prompts p
CROSS JOIN generate_series(1, (random() * 100 + 50)::integer);

-- 15. Create API helper functions for frontend
CREATE OR REPLACE FUNCTION get_user_prompt_data(user_id UUID, prompt_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'user_rating', pr.rating,
        'is_favorited', (pf.id IS NOT NULL),
        'prompt_data', row_to_json(pwr.*)
    )
    INTO result
    FROM prompts_with_ratings pwr
    LEFT JOIN prompt_ratings pr ON pwr.id = pr.prompt_id AND pr.user_id = get_user_prompt_data.user_id
    LEFT JOIN prompt_favorites pf ON pwr.id = pf.prompt_id AND pf.user_id = get_user_prompt_data.user_id
    WHERE pwr.id = get_user_prompt_data.prompt_id;

    RETURN result;
END;
$$;

-- =====================================================================
-- USAGE EXAMPLES:
-- =====================================================================

/*
-- Search for prompts
SELECT * FROM search_prompts('developer', 'text', 'all', 10, 0);

-- Rate a prompt (user must be authenticated)
SELECT rate_prompt('prompt-uuid-here', auth.uid(), 5);

-- Toggle favorite
SELECT toggle_favorite('prompt-uuid-here', auth.uid());

-- Track usage
SELECT increment_prompt_usage('prompt-uuid-here', auth.uid(), 'web');

-- Get user-specific data for a prompt
SELECT get_user_prompt_data(auth.uid(), 'prompt-uuid-here');
*/

-- =====================================================================
-- INDEXES FOR FULL-TEXT SEARCH (Optional - for better performance)
-- =====================================================================

-- Create tsvector column for full-text search
ALTER TABLE prompts ADD COLUMN search_vector tsvector;

-- Update search vector
UPDATE prompts SET search_vector =
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(tags, ' ')), 'D');

-- Create index on tsvector
CREATE INDEX IF NOT EXISTS idx_prompts_search_vector ON prompts USING GIN(search_vector);

-- Function to update search vector automatically
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.category, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
        setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'D');
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_search_vector
    BEFORE INSERT OR UPDATE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_search_vector();

COMMENT ON TABLE prompts IS 'Stores AI prompts with dynamic categories and real-time ratings';
COMMENT ON TABLE prompt_ratings IS 'User ratings for prompts (1-5 stars)';
COMMENT ON TABLE prompt_favorites IS 'User favorites/bookmarks';
COMMENT ON TABLE prompt_usage IS 'Usage tracking and analytics';