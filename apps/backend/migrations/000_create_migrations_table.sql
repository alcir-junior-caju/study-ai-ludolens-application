-- Migration: Create schema_migrations table
-- This table tracks which migrations have been executed

CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);

-- Insert initial record for this migration
INSERT INTO schema_migrations (version, name)
VALUES ('000', 'create_migrations_table')
ON CONFLICT (version) DO NOTHING;
