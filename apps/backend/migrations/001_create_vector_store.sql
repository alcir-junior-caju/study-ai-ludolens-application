-- Migration: Create pgvector extension and game manuals vectors table
-- Description: Setup PostgreSQL with pgvector for storing document embeddings
-- Date: 2026-01-06

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for storing game manual vectors
CREATE TABLE IF NOT EXISTS game_manuals_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(768), -- text-embedding-004 produces 768-dimensional vectors
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search using HNSW (Hierarchical Navigable Small World)
-- This index dramatically improves performance for similarity searches
CREATE INDEX IF NOT EXISTS game_manuals_vectors_embedding_idx
  ON game_manuals_vectors
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Create index for fast filtering by manualId in metadata
CREATE INDEX IF NOT EXISTS game_manuals_vectors_manual_id_idx
  ON game_manuals_vectors
  USING btree ((metadata->>'manualId'));

-- Create index for created_at for time-based queries
CREATE INDEX IF NOT EXISTS game_manuals_vectors_created_at_idx
  ON game_manuals_vectors
  USING btree (created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER update_game_manuals_vectors_updated_at
  BEFORE UPDATE ON game_manuals_vectors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE game_manuals_vectors IS 'Stores vector embeddings for game manual documents';
COMMENT ON COLUMN game_manuals_vectors.id IS 'Unique identifier for each vector entry';
COMMENT ON COLUMN game_manuals_vectors.content IS 'Text content of the document chunk';
COMMENT ON COLUMN game_manuals_vectors.embedding IS '768-dimensional vector from Google text-embedding-004 model';
COMMENT ON COLUMN game_manuals_vectors.metadata IS 'JSONB metadata including manualId, pageNumber, chunkIndex, etc.';
COMMENT ON INDEX game_manuals_vectors_embedding_idx IS 'HNSW index for fast cosine similarity search';
COMMENT ON INDEX game_manuals_vectors_manual_id_idx IS 'B-tree index for filtering by manualId';
