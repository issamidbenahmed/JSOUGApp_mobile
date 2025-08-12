-- Add auth_provider column to users table
ALTER TABLE users 
ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'email' COMMENT 'Authentication provider (email, google, etc.)';

-- Update existing users to have the default auth provider
UPDATE users SET auth_provider = 'email' WHERE auth_provider IS NULL;
