-- Gallery Schema Updates for PROMPTHERO
-- Adds new fields for enhanced prompt gallery features

-- Add new columns to prompt_templates table if they don't exist
ALTER TABLE prompt_templates
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'intermediate',
ADD COLUMN IF NOT EXISTS complexity_score DECIMAL(5,2) DEFAULT 50.0,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS platform_tags TEXT[] DEFAULT ARRAY['ChatGPT', 'Claude', 'Gemini'],
ADD COLUMN IF NOT EXISTS use_cases TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS effectiveness_score DECIMAL(5,2) DEFAULT 70.0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_source TEXT,
ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) DEFAULT 'system',
ADD COLUMN IF NOT EXISTS import_batch VARCHAR(50),
ADD COLUMN IF NOT EXISTS import_index INTEGER,
ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS examples JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS best_practices TEXT,
ADD COLUMN IF NOT EXISTS platform_optimizations JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS industry_customizations JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS enhanced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS enhancement_version VARCHAR(10);

-- Create prompt collections table
CREATE TABLE IF NOT EXISTS prompt_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7),
    prompts UUID[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompt reviews table
CREATE TABLE IF NOT EXISTS prompt_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    helpful_count INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(prompt_id, user_id)
);

-- Create prompt versions table for tracking changes
CREATE TABLE IF NOT EXISTS prompt_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title VARCHAR(255),
    template_content TEXT,
    changes_description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user favorites table
CREATE TABLE IF NOT EXISTS user_prompt_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, prompt_id)
);

-- Create prompt usage tracking
CREATE TABLE IF NOT EXISTS prompt_usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50),
    success_rating INTEGER CHECK (success_rating >= 1 AND success_rating <= 5),
    usage_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category_new ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_difficulty ON prompt_templates(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_effectiveness ON prompt_templates(effectiveness_score DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_rating ON prompt_templates(rating DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_usage ON prompt_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_tags ON prompt_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_platform_tags ON prompt_templates USING GIN(platform_tags);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_source ON prompt_templates(original_source);

CREATE INDEX IF NOT EXISTS idx_prompt_reviews_prompt ON prompt_reviews(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_reviews_user ON prompt_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_reviews_rating ON prompt_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON prompt_collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_featured ON prompt_collections(featured) WHERE featured = true;

-- Sample collections
INSERT INTO prompt_collections (name, description, slug, icon, color, featured, order_index)
VALUES
    ('Developer Essentials', 'Essential prompts for developers and programmers', 'developer-essentials', '💻', '#6366f1', true, 1),
    ('Creative Writing', 'Prompts for creative writing and storytelling', 'creative-writing', '✍️', '#ec4899', true, 2),
    ('Business & Marketing', 'Professional prompts for business use cases', 'business-marketing', '📊', '#10b981', true, 3),
    ('AI Art & Design', 'Prompts for AI-generated art and design', 'ai-art-design', '🎨', '#f59e0b', true, 4),
    ('Education & Learning', 'Educational prompts for teaching and learning', 'education-learning', '📚', '#3b82f6', true, 5),
    ('Productivity Boosters', 'Prompts to enhance productivity', 'productivity-boosters', '🚀', '#8b5cf6', false, 6)
ON CONFLICT (slug) DO NOTHING;

-- Function to update prompt rating when new review is added
CREATE OR REPLACE FUNCTION update_prompt_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE prompt_templates
    SET rating = (
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM prompt_reviews
        WHERE prompt_id = NEW.prompt_id
    ),
    rating_count = (
        SELECT COUNT(*)
        FROM prompt_reviews
        WHERE prompt_id = NEW.prompt_id
    )
    WHERE id = NEW.prompt_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ratings
DROP TRIGGER IF EXISTS update_prompt_rating_trigger ON prompt_reviews;
CREATE TRIGGER update_prompt_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON prompt_reviews
FOR EACH ROW EXECUTE FUNCTION update_prompt_rating();

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_prompt_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE prompt_templates
    SET usage_count = usage_count + 1
    WHERE id = NEW.prompt_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment usage
DROP TRIGGER IF EXISTS increment_usage_trigger ON prompt_usage_tracking;
CREATE TRIGGER increment_usage_trigger
AFTER INSERT ON prompt_usage_tracking
FOR EACH ROW EXECUTE FUNCTION increment_prompt_usage();