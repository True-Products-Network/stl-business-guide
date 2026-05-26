-- Add test analytics data for all existing business listings
-- This will create 30 days of sample data for each listing

INSERT INTO business_analytics (business_id, date, profile_views, website_clicks, phone_clicks, email_clicks, direction_clicks)
SELECT 
    bl.id as business_id,
    d.date,
    floor(random() * 50 + 10)::int as profile_views,  -- 10-60 views per day
    floor(random() * 8 + 1)::int as website_clicks,    -- 1-9 clicks per day
    floor(random() * 5)::int as phone_clicks,          -- 0-5 calls per day
    floor(random() * 3)::int as email_clicks,          -- 0-3 emails per day
    floor(random() * 6)::int as direction_clicks       -- 0-6 direction requests per day
FROM business_listings bl
CROSS JOIN generate_series(
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE,
    INTERVAL '1 day'
) AS d(date)
ON CONFLICT (business_id, date) DO UPDATE SET
    profile_views = EXCLUDED.profile_views,
    website_clicks = EXCLUDED.website_clicks,
    phone_clicks = EXCLUDED.phone_clicks,
    email_clicks = EXCLUDED.email_clicks,
    direction_clicks = EXCLUDED.direction_clicks,
    updated_at = NOW();

-- Show how many records were created
SELECT COUNT(*) as total_analytics_records FROM business_analytics;
