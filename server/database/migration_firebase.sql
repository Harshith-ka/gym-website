-- Migration to add firebase_uid
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE;
ALTER TABLE users ALTER COLUMN clerk_id DROP NOT NULL;
