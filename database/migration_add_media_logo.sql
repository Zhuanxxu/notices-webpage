-- Migration: Add logo field to media_sources table
ALTER TABLE media_sources ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);
