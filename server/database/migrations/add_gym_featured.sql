-- Add is_featured column to gyms table
ALTER TABLE gyms 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_gyms_featured 
ON gyms(is_featured) WHERE is_featured = true;

-- Optional: Feature top 3 approved gyms by rating as initial featured gyms
UPDATE gyms 
SET is_featured = true 
WHERE id IN (
    SELECT id FROM gyms 
    WHERE is_approved = true 
    ORDER BY rating DESC NULLS LAST 
    LIMIT 3
);
