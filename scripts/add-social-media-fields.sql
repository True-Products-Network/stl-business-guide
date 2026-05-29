-- Add social media URL fields to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Add comment to document the fields
COMMENT ON COLUMN businesses.facebook_url IS 'Facebook page URL for paid listings';
COMMENT ON COLUMN businesses.instagram_url IS 'Instagram profile URL for paid listings';
COMMENT ON COLUMN businesses.linkedin_url IS 'LinkedIn company URL for paid listings';
COMMENT ON COLUMN businesses.youtube_url IS 'YouTube channel URL for paid listings';

SELECT 'Social media fields added successfully' as status;
