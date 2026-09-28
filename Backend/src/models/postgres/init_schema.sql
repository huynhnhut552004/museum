CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS unaccent;

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'viewer')),
    is_banned BOOLEAN DEFAULT FALSE,
    force_password_change BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_tag VARCHAR(5) UNIQUE NOT NULL,
    info JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- =========================
-- ARTWORKS
-- =========================
CREATE TABLE IF NOT EXISTS artworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    description_en TEXT,
    artist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    artist_display_name VARCHAR(255),
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) DEFAULT 'image',
    public_id VARCHAR(100),
    description TEXT,
    year INT,
    layout_type VARCHAR(20) DEFAULT 'classic'
        CHECK (layout_type IN ('classic', 'digital', 'both')),
    ai_attributes JSONB DEFAULT '{}'::jsonb,
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector(
            'simple',
            unaccent(COALESCE(title, '')) || ' ' ||
            unaccent(COALESCE(artist_display_name, '')) || ' ' ||
            unaccent(COALESCE(description, ''))
        )
    ) STORED,
    search_vector_en tsvector GENERATED ALWAYS AS (
        to_tsvector(
            'english',
            unaccent(COALESCE(title_en, '')) || ' ' ||
            unaccent(COALESCE(artist_display_name, '')) || ' ' ||
            unaccent(COALESCE(description_en, ''))
        )
    ) STORED,
    status VARCHAR(20) DEFAULT 'published'
        CHECK (status IN ('draft', 'published', 'hidden')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- COLLECTIONS
-- =========================
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Yêu thích',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collection_items (
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, artwork_id)
);

-- =========================
-- EVENTS
-- =========================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    slug_artwork VARCHAR(255) UNIQUE,
    description TEXT,
    content TEXT,
    banner_url TEXT,
    public_id VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- COMMENTS
-- =========================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    like_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_target CHECK (
        (event_id IS NOT NULL AND artwork_id IS NULL) OR
        (event_id IS NULL AND artwork_id IS NOT NULL)
    )
);

-- =========================
-- COMMENT LIKES
-- =========================
CREATE TABLE IF NOT EXISTS comment_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, comment_id)
);

-- =========================
-- LIKES
-- =========================
CREATE TABLE IF NOT EXISTS likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_like_target CHECK (
        (event_id IS NOT NULL AND artwork_id IS NULL) OR
        (event_id IS NULL AND artwork_id IS NOT NULL)
    ),

    UNIQUE (user_id, event_id, artwork_id)
);

-- =========================
-- SUBMISSION
-- =========================
CREATE TABLE IF NOT EXISTS submission (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('rule', 'contact', 'feedback')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- WEB CONTENTS
-- =========================
CREATE TABLE IF NOT EXISTS web_contents (
    id SERIAL PRIMARY KEY,
    page VARCHAR(50) NOT NULL,
    block_type VARCHAR(50) NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    display_order INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE ai_translation_jobs
ALTER COLUMN status TYPE VARCHAR(30);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_submission_email ON submission (email);
CREATE INDEX IF NOT EXISTS idx_submission_created_at ON submission (created_at);

CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_comments_event ON comments(event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_artwork ON comments(artwork_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_time ON events(start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_artworks_title ON artworks(title);

CREATE INDEX IF NOT EXISTS idx_artworks_search ON artworks USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_artworks_search_en ON artworks USING GIN (search_vector_en);

CREATE INDEX IF NOT EXISTS idx_artworks_attributes ON artworks USING GIN (ai_attributes);