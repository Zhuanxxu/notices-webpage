-- Seed data for development

-- Insert a default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, password_hash, role) VALUES
('admin@noticias.com', '$2b$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'admin'),
('editor@noticias.com', '$2b$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJq', 'editor')
ON CONFLICT (email) DO NOTHING;

-- Insert some sample media sources
INSERT INTO media_sources (name, url, bias_rating) VALUES
('BBC News', 'https://www.bbc.com', 'center'),
('CNN', 'https://www.cnn.com', 'left'),
('Fox News', 'https://www.foxnews.com', 'right'),
('The Guardian', 'https://www.theguardian.com', 'left'),
('The Wall Street Journal', 'https://www.wsj.com', 'right'),
('Reuters', 'https://www.reuters.com', 'center')
ON CONFLICT DO NOTHING;
