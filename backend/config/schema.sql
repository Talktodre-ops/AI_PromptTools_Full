-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}'::jsonb,
  usage_quota INTEGER DEFAULT 5, -- daily prompts for free tier
  usage_count INTEGER DEFAULT 0,
  usage_reset_date DATE DEFAULT CURRENT_DATE
);

-- User sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Prompt templates (public library)
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'marketing', 'video', 'development', etc.
  template_content TEXT NOT NULL,
  mode VARCHAR(20) NOT NULL, -- 'quick', 'deep', 'video', etc.
  tone VARCHAR(20) DEFAULT 'default',
  persona VARCHAR(100),
  tags TEXT[], -- for search and filtering
  is_premium BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- User-generated prompts
CREATE TABLE IF NOT EXISTS user_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL,
  raw_input TEXT NOT NULL,
  refined_prompts JSONB NOT NULL, -- array of generated prompts
  mode VARCHAR(20) NOT NULL,
  tone VARCHAR(20) DEFAULT 'default',
  persona VARCHAR(100),
  return_format VARCHAR(20) DEFAULT 'plain',
  quality_score DECIMAL(3,2), -- AI-generated quality score
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false, -- can be shared publicly
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Prompt ratings and feedback
CREATE TABLE IF NOT EXISTS prompt_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES user_prompts(id) ON DELETE CASCADE,
  template_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, prompt_id, template_id)
);

-- Prompt embeddings for similarity search
CREATE TABLE IF NOT EXISTS prompt_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES user_prompts(id) ON DELETE CASCADE,
  template_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE,
  embedding vector(1536), -- OpenAI embedding size
  content_hash VARCHAR(64) NOT NULL, -- for deduplication
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_hash)
);

-- Create vector index for fast similarity search
CREATE INDEX IF NOT EXISTS prompt_embeddings_vector_idx ON prompt_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- User activity tracking
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'prompt_generated', 'template_used', etc.
  resource_id UUID, -- prompt_id or template_id
  metadata JSONB, -- flexible data storage
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage analytics (time-series data)
CREATE TABLE IF NOT EXISTS usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  prompts_generated INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  subscription_tier VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Blog posts and content
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES users(id),
  category VARCHAR(50),
  tags TEXT[],
  meta_title VARCHAR(255),
  meta_description TEXT,
  featured_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  view_count INTEGER DEFAULT 0
);

-- SEO metadata
CREATE TABLE IF NOT EXISTS seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path VARCHAR(255) UNIQUE NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  canonical_url TEXT,
  og_image_url TEXT,
  schema_markup JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  billing_cycle VARCHAR(20) NOT NULL, -- 'monthly', 'yearly'
  features JSONB NOT NULL,
  prompt_limit INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(20) NOT NULL, -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
); 