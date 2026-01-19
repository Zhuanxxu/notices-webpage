-- Migration: Add excerpt field to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt VARCHAR(500);
