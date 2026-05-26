-- Create business_analytics table for tracking daily metrics
CREATE TABLE IF NOT EXISTS business_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_listings(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    profile_views INTEGER DEFAULT 0,
    website_clicks INTEGER DEFAULT 0,
    phone_clicks INTEGER DEFAULT 0,
    email_clicks INTEGER DEFAULT 0,
    direction_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_business_analytics_business_id ON business_analytics(business_id);
CREATE INDEX IF NOT EXISTS idx_business_analytics_date ON business_analytics(date);

-- Enable RLS
ALTER TABLE business_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow users to view analytics for businesses they own
CREATE POLICY "Allow users to view their business analytics"
    ON business_analytics
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM business_listings bl
            JOIN businesses b ON b.id = bl.business_id
            WHERE bl.id = business_analytics.business_id
            AND b.owner_profile_id = auth.uid()
        )
    );

-- Function to increment analytics metrics
CREATE OR REPLACE FUNCTION increment_analytics(
    p_business_id UUID,
    p_metric TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO business_analytics (business_id, date, profile_views, website_clicks, phone_clicks, email_clicks, direction_clicks)
    VALUES (
        p_business_id,
        CURRENT_DATE,
        CASE WHEN p_metric = 'profile_views' THEN 1 ELSE 0 END,
        CASE WHEN p_metric = 'website_clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_metric = 'phone_clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_metric = 'email_clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_metric = 'direction_clicks' THEN 1 ELSE 0 END
    )
    ON CONFLICT (business_id, date)
    DO UPDATE SET
        profile_views = business_analytics.profile_views + CASE WHEN p_metric = 'profile_views' THEN 1 ELSE 0 END,
        website_clicks = business_analytics.website_clicks + CASE WHEN p_metric = 'website_clicks' THEN 1 ELSE 0 END,
        phone_clicks = business_analytics.phone_clicks + CASE WHEN p_metric = 'phone_clicks' THEN 1 ELSE 0 END,
        email_clicks = business_analytics.email_clicks + CASE WHEN p_metric = 'email_clicks' THEN 1 ELSE 0 END,
        direction_clicks = business_analytics.direction_clicks + CASE WHEN p_metric = 'direction_clicks' THEN 1 ELSE 0 END,
        updated_at = NOW();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_analytics(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_analytics(UUID, TEXT) TO anon;

-- Insert some sample data for testing (optional - remove in production)
INSERT INTO business_analytics (business_id, date, profile_views, website_clicks, phone_clicks, email_clicks, direction_clicks)
SELECT 
    bl.id as business_id,
    d.date,
    floor(random() * 50)::int as profile_views,
    floor(random() * 10)::int as website_clicks,
    floor(random() * 5)::int as phone_clicks,
    floor(random() * 3)::int as email_clicks,
    floor(random() * 8)::int as direction_clicks
FROM business_listings bl
CROSS JOIN generate_series(
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE,
    INTERVAL '1 day'
) AS d(date)
WHERE bl.listing_status = 'active'
ON CONFLICT (business_id, date) DO NOTHING;
