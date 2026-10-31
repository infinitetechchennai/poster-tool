-- ==============================================================================
-- InfiniteTechAI Poster Generation Platform
-- PostgreSQL Relational Schema: Phase 1 (Layers A, B, and C)
-- Non-destructive DDL with idempotency guards (IF NOT EXISTS)
-- ==============================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- LAYER A: IMMUTABLE SOURCE DATA (Raw Provenance & Ingestion Auditing)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS source_imports (
    import_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(256) NOT NULL,
    file_hash_sha256 CHAR(64) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    import_version INTEGER NOT NULL DEFAULT 1,
    is_latest BOOLEAN NOT NULL DEFAULT TRUE,
    sheet_count INTEGER NOT NULL DEFAULT 0,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    import_status VARCHAR(32) NOT NULL DEFAULT 'completed', -- completed, partial, failed, skipped_unchanged
    audit_report JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT uq_file_hash UNIQUE (file_name, file_hash_sha256)
);

CREATE TABLE IF NOT EXISTS source_rows (
    source_row_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_id UUID NOT NULL REFERENCES source_imports(import_id) ON DELETE RESTRICT,
    workbook_name VARCHAR(256) NOT NULL,
    sheet_name VARCHAR(64) NOT NULL,
    source_row_number INTEGER NOT NULL,
    raw_data JSONB NOT NULL,
    row_hash_sha256 CHAR(64) NOT NULL,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_rows_import_sheet ON source_rows(import_id, sheet_name);
CREATE INDEX IF NOT EXISTS idx_source_rows_workbook_row ON source_rows(workbook_name, sheet_name, source_row_number);

-- ==============================================================================
-- LAYER B: NORMALIZED PROJECT DATA (Canonical Marketing Context)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS clusters (
    cluster_name VARCHAR(64) PRIMARY KEY,
    keyword_count INTEGER NOT NULL DEFAULT 0,
    common_intent VARCHAR(64),
    target_persona TEXT,
    main_pain_point TEXT,
    service_fit_guidance TEXT,
    primary_channel VARCHAR(128),
    landing_page_topic VARCHAR(128),
    default_cta VARCHAR(128),
    paid_search_suitability TEXT,
    organic_suitability TEXT,
    cluster_priority VARCHAR(64),
    source_row_id UUID REFERENCES source_rows(source_row_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS keywords (
    keyword_id VARCHAR(32) PRIMARY KEY, -- Immutable CEO ID: KW00001 - KW03816
    keyword_text TEXT NOT NULL,
    cluster_name VARCHAR(64) NOT NULL REFERENCES clusters(cluster_name) ON DELETE RESTRICT,
    primary_intent_estimated VARCHAR(64) NOT NULL,
    secondary_intent VARCHAR(64),
    searcher_persona TEXT,
    business_problem TEXT,
    likely_industry VARCHAR(128),
    buying_stage VARCHAR(64) NOT NULL,
    business_relevance_score SMALLINT NOT NULL CHECK (business_relevance_score BETWEEN 1 AND 5),
    commercial_intent_score SMALLINT NOT NULL CHECK (commercial_intent_score BETWEEN 1 AND 5),
    service_fit VARCHAR(128),
    priority VARCHAR(64) NOT NULL,
    research_confidence VARCHAR(128),
    recommended_action TEXT,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    avg_monthly_searches INTEGER NOT NULL DEFAULT 0,
    three_month_change VARCHAR(16),
    yoy_change VARCHAR(16),
    competition_tier VARCHAR(16),
    competition_indexed SMALLINT CHECK (competition_indexed BETWEEN 0 AND 100),
    bid_low_range NUMERIC(10, 2), -- Nullable: 363 source rows lack this
    bid_high_range NUMERIC(10, 2), -- Nullable: 363 source rows lack this
    source_row_id UUID REFERENCES source_rows(source_row_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keywords_cluster ON keywords(cluster_name);
CREATE INDEX IF NOT EXISTS idx_keywords_priority ON keywords(priority);
CREATE INDEX IF NOT EXISTS idx_keywords_buying_stage ON keywords(buying_stage);
CREATE INDEX IF NOT EXISTS idx_keywords_text ON keywords USING gin(to_tsvector('english', keyword_text));

CREATE TABLE IF NOT EXISTS source_headlines (
    headline_id VARCHAR(32) PRIMARY KEY, -- KW00001-H01 to KW03816-H10
    keyword_id VARCHAR(32) NOT NULL REFERENCES keywords(keyword_id) ON DELETE CASCADE,
    headline_draft TEXT NOT NULL,
    marketing_angle VARCHAR(64) NOT NULL,
    target_persona TEXT,
    funnel_stage VARCHAR(64),
    recommended_channel VARCHAR(128),
    call_to_action VARCHAR(128),
    google_ads_30_char VARCHAR(30) NOT NULL CHECK (LENGTH(google_ads_30_char) <= 30),
    original_char_count SMALLINT NOT NULL,
    google_ads_char_count SMALLINT NOT NULL CHECK (google_ads_char_count <= 30),
    disclaimer_note TEXT,
    source_row_id UUID REFERENCES source_rows(source_row_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_headlines_keyword ON source_headlines(keyword_id);
CREATE INDEX IF NOT EXISTS idx_headlines_angle ON source_headlines(marketing_angle);

CREATE TABLE IF NOT EXISTS social_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_content_id VARCHAR(32) NOT NULL, -- SOC001 - SOC013 (repeated 6x per cluster)
    cluster_name VARCHAR(64) NOT NULL REFERENCES clusters(cluster_name) ON DELETE RESTRICT,
    platform VARCHAR(32) NOT NULL, -- LinkedIn, Instagram, Facebook, X, Quora, Pinterest
    headline TEXT NOT NULL,
    body_copy TEXT NOT NULL,
    call_to_action VARCHAR(128),
    post_format VARCHAR(64),
    hashtags TEXT, -- Null for Quora (13 rows)
    destination_url VARCHAR(256),
    review_status VARCHAR(128),
    source_row_id UUID REFERENCES source_rows(source_row_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_social_content_platform UNIQUE (source_content_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_social_content_cluster ON social_content(cluster_name);

CREATE TABLE IF NOT EXISTS content_calendar (
    calendar_day SMALLINT PRIMARY KEY CHECK (calendar_day BETWEEN 1 AND 30),
    calendar_content_id VARCHAR(32) NOT NULL UNIQUE, -- CAL01 - CAL30
    cluster_name VARCHAR(64) NOT NULL REFERENCES clusters(cluster_name) ON DELETE RESTRICT,
    platform VARCHAR(32) NOT NULL,
    topic TEXT NOT NULL,
    headline TEXT,
    format VARCHAR(64),
    call_to_action VARCHAR(128),
    objective VARCHAR(128),
    funnel_stage VARCHAR(64),
    repurpose_instructions TEXT,
    source_row_id UUID REFERENCES source_rows(source_row_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_landing_pages (
    page_id VARCHAR(32) PRIMARY KEY, -- SEO001 - SEO013
    cluster_name VARCHAR(64) NOT NULL UNIQUE REFERENCES clusters(cluster_name) ON DELETE RESTRICT,
    keyword_theme VARCHAR(128),
    page_type VARCHAR(128),
    seo_title VARCHAR(256),
    meta_description TEXT,
    h1_heading VARCHAR(256),
    suggested_slug VARCHAR(128),
    page_sections TEXT,
    faq_ideas TEXT,
    internal_links TEXT,
    call_to_action VARCHAR(128),
    caution_caveat TEXT,
    source_row_id UUID REFERENCES source_rows(source_row_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_shortlist (
    keyword_id VARCHAR(32) PRIMARY KEY REFERENCES keywords(keyword_id) ON DELETE CASCADE,
    cluster_name VARCHAR(64) NOT NULL REFERENCES clusters(cluster_name) ON DELETE RESTRICT,
    suggested_ad_group VARCHAR(64),
    recommended_match_type VARCHAR(128),
    negative_keyword_ideas TEXT,
    landing_page_recommendation TEXT,
    conversion_recommendation TEXT,
    source_row_id UUID REFERENCES source_rows(source_row_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- LAYER C: GENERATED APPLICATION DATA (Runtime Assets & Job Queue)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS generation_jobs (
    job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(32) NOT NULL, -- intent_expansion, poster_generation
    keyword_id VARCHAR(32) REFERENCES keywords(keyword_id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'queued', -- queued, processing, validating, completed, failed, needs_review, cancelled
    progress_percent SMALLINT NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    model_name VARCHAR(64),
    prompt_version VARCHAR(32),
    error_message TEXT,
    execution_metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_keyword ON generation_jobs(keyword_id);

CREATE TABLE IF NOT EXISTS generated_intents (
    intent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword_id VARCHAR(32) NOT NULL REFERENCES keywords(keyword_id) ON DELETE CASCADE,
    job_id UUID REFERENCES generation_jobs(job_id) ON DELETE SET NULL,
    intent_phrase VARCHAR(256) NOT NULL,
    intent_category VARCHAR(64),
    audience_need TEXT,
    buying_stage VARCHAR(64),
    marketing_angle VARCHAR(64),
    semantic_similarity_score FLOAT,
    approval_status VARCHAR(32) NOT NULL DEFAULT 'approved', -- approved, rejected, needs_review
    rejection_reason TEXT,
    model_name VARCHAR(64),
    prompt_version VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_intents_kw ON generated_intents(keyword_id, approval_status);

CREATE TABLE IF NOT EXISTS poster_content (
    poster_content_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intent_id UUID NOT NULL REFERENCES generated_intents(intent_id) ON DELETE CASCADE,
    keyword_id VARCHAR(32) NOT NULL REFERENCES keywords(keyword_id) ON DELETE CASCADE,
    header VARCHAR(128) NOT NULL,
    title VARCHAR(256) NOT NULL,
    description TEXT NOT NULL,
    bullet_points JSONB NOT NULL, -- Array of 3 to 5 strings
    call_to_action VARCHAR(128) NOT NULL,
    image_prompt TEXT,
    template_id VARCHAR(64) NOT NULL DEFAULT 'corporate_minimal',
    visual_style VARCHAR(64),
    aspect_ratio VARCHAR(16) NOT NULL DEFAULT '4:5',
    seo_alt_text TEXT,
    validation_status VARCHAR(32) NOT NULL DEFAULT 'passed',
    human_approval_status VARCHAR(32) NOT NULL DEFAULT 'draft', -- draft, approved, rejected
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS image_assets (
    asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type VARCHAR(32) NOT NULL, -- local_ai_generated, curated_brand_asset, template_background
    file_path TEXT NOT NULL,
    prompt_used TEXT,
    model_engine VARCHAR(64),
    license_type VARCHAR(64) NOT NULL DEFAULT 'proprietary',
    attribution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posters (
    poster_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poster_content_id UUID NOT NULL REFERENCES poster_content(poster_content_id) ON DELETE CASCADE,
    asset_id UUID REFERENCES image_assets(asset_id) ON DELETE SET NULL,
    render_engine VARCHAR(32) NOT NULL DEFAULT 'playwright_html_css',
    output_format VARCHAR(8) NOT NULL DEFAULT 'PNG',
    output_path TEXT NOT NULL,
    dimensions_width INTEGER NOT NULL DEFAULT 1080,
    dimensions_height INTEGER NOT NULL DEFAULT 1350,
    rendered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
