-- Add featured_until column to track when featured listing expires
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_gyms_featured_until ON gyms(featured_until);

-- Optional: Add a check to automatically unfeatured expired gyms (can be done via cron job or trigger)
-- This is a simple trigger example (PostgreSQL):
CREATE OR REPLACE FUNCTION check_featured_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.featured_until IS NOT NULL AND NEW.featured_until < NOW() THEN
        NEW.is_featured = false;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_featured_expiry ON gyms;
CREATE TRIGGER trigger_check_featured_expiry
    BEFORE UPDATE ON gyms
    FOR EACH ROW
    EXECUTE FUNCTION check_featured_expiry();
