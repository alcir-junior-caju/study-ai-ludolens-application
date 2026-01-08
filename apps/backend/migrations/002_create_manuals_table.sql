-- Migration: Create table for game manuals metadata
-- Description: Store manual metadata (id, name, file info, processing status)
-- Date: 2026-01-07

-- Create table for storing game manual metadata
CREATE TABLE IF NOT EXISTS game_manuals (
  id UUID PRIMARY KEY,
  game_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS game_manuals_game_name_idx
  ON game_manuals
  USING btree (game_name);

CREATE INDEX IF NOT EXISTS game_manuals_uploaded_at_idx
  ON game_manuals
  USING btree (uploaded_at DESC);

CREATE INDEX IF NOT EXISTS game_manuals_is_processed_idx
  ON game_manuals
  USING btree (is_processed);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_game_manuals_updated_at
  BEFORE UPDATE ON game_manuals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE game_manuals IS 'Metadata for uploaded game manuals';
COMMENT ON COLUMN game_manuals.id IS 'Unique identifier for the manual';
COMMENT ON COLUMN game_manuals.game_name IS 'Name of the board game';
COMMENT ON COLUMN game_manuals.file_name IS 'Original filename of the PDF';
COMMENT ON COLUMN game_manuals.file_path IS 'Path where the PDF file is stored';
COMMENT ON COLUMN game_manuals.uploaded_at IS 'When the manual was uploaded';
COMMENT ON COLUMN game_manuals.is_processed IS 'Whether the manual has been processed (embeddings generated)';
COMMENT ON COLUMN game_manuals.processed_at IS 'When the processing completed';
