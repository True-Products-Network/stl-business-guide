-- Add social media click tracking columns to business_analytics
ALTER TABLE business_analytics 
ADD COLUMN IF NOT EXISTS facebook_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS instagram_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS linkedin_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS youtube_clicks INTEGER DEFAULT 0;

-- Update the increment_analytics function to handle social media metrics
CREATE OR REPLACE FUNCTION increment_analytics(
    p_business_id UUID,
    p_metric TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO business_analytics (
        business_id, date, 
        profile_views, website_clicks, phone_clicks, email_clicks, direction_clicks,
        facebook_clicks, instagram_clicks, linkedin_clicks, youtube_clicks
    )
    VALUES (
        p_business_id,
        CURRENT_DATE,
        CASE WHEN p_metric = 'profile_views' THEN 1 ELSE 0 END,
        CASE WHEN p_metric = 'website_clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_metric = 'phone_clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_metric = 'email_clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_metric = 'direction_clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_metric = 'facebook_clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_metric = 'instagram_clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_metric = 'linkedin_clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_metric = 'youtube_clicks' THEN 1 ELSE 0 END
    )
    ON CONFLICT (business_id, date)
    DO UPDATE SET
        profile_views = business_analytics.profile_views + CASE WHEN p_metric = 'profile_views' THEN 1 ELSE 0 END,
        website_clicks = business_analytics.website_clicks + CASE WHEN p_metric = 'website_clicks' THEN 1 ELSE 0 END,
        phone_clicks = business_analytics.phone_clicks + CASE WHEN p_metric = 'phone_clicks' THEN 1 ELSE 0 END,
        email_clicks = business_analytics.email_clicks + CASE WHEN p_metric = 'email_clicks' THEN 1 ELSE 0 END,
        direction_clicks = business_analytics.direction_clicks + CASE WHEN p_metric = 'direction_clicks' THEN 1 ELSE 0 END,
        facebook_clicks = business_analytics.facebook_clicks + CASE WHEN p_metric = 'facebook_clicks' THEN 1 ELSE 0 END,
        instagram_clicks = business_analytics.instagram_clicks + CASE WHEN p_metric = 'instagram_clicks' THEN 1 ELSE 0 END,
        linkedin_clicks = business_analytics.linkedin_clicks + CASE WHEN p_metric = 'linkedin_clicks' THEN 1 ELSE 0 END,
        youtube_clicks = business_analytics.youtube_clicks + CASE WHEN p_metric = 'youtube_clicks' THEN 1 ELSE 0 END;
END;
$$;

-- Add sample social media data for existing records (for testing)
UPDATE business_analytics 
SET 
    facebook_clicks = floor(random() * 5)::int,
    instagram_clicks = floor(random() * 5)::int,
    linkedin_clicks = floor(random() * 3)::int,
    youtube_clicks = floor(random() * 2)::int
WHERE facebook_clicks IS NULL;

-- Show updated table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'business_analytics'
ORDER BY ordinal_position;
