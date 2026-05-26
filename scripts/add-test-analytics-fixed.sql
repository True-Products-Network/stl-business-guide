-- Add test analytics data for all existing business listings
-- This will create 30 days of sample data for each listing

INSERT INTO business_analytics (business_id, date, profile_views, website_clicks, phone_clicks, email_clicks, direction_clicks)
SELECT 
    bl.id as business_id,
    d.date,
    floor(random() * 50 + 10)::int as profile_views,
    floor(random() * 8 + 1)::int as website_clicks,
    floor(random() * 5)::int as phone_clicks,
    floor(random() * 3)::int as email_clicks,
    floor(random() * 6)::int as direction_clicks
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
    direction_clicks = EXCLUDED.direction_clicks;

-- Show how many records were created
SELECT COUNT(*) as total_analytics_records FROM business_analytics;
