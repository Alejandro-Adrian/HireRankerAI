-- Add company_name column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT;
