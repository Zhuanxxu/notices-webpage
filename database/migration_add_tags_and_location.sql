-- Migration: Add tags and location to articles

-- 1. Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create article_tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS article_tags (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, tag_id)
);

-- 3. Add location column to articles
ALTER TABLE articles ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- 4. Insert predefined tags
INSERT INTO tags (name, slug) VALUES
    ('Política', 'politica'),
    ('Economía', 'economia'),
    ('Sociedad', 'sociedad'),
    ('Salud', 'salud'),
    ('Tecnología', 'tecnologia'),
    ('Educación', 'educacion'),
    ('Seguridad', 'seguridad'),
    ('Justicia', 'justicia'),
    ('Medioambiente', 'medioambiente'),
    ('Ciencia', 'ciencia'),
    ('Cultura', 'cultura'),
    ('Deportes', 'deportes'),
    ('Energía', 'energia'),
    ('Transporte', 'transporte'),
    ('Trabajo', 'trabajo'),
    ('LGTBI', 'lgtbi')
ON CONFLICT (slug) DO NOTHING;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_article_tags_article ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_articles_location ON articles(location);
