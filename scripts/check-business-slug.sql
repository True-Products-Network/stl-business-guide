-- Check business slug issue
-- Business: Check another business - amy@aimwithamy.com

-- Find the business by name or email
SELECT 
    b.id,
    b.business_name,
    b.slug,
    b.email,
    b.status,
    b.owner_profile_id,
    bl.id as listing_id,
    bl.listing_status,
    lp.plan_key
FROM businesses b
LEFT JOIN business_listings bl ON bl.business_id = b.id
LEFT JOIN listing_plans lp ON lp.id = bl.plan_id
WHERE b.business_name ILIKE '%check another business%'
   OR b.email = 'amy@aimwithamy.com';

-- Check if the slug exists
SELECT * FROM businesses WHERE slug = 'check-another-business-mpkmdvex';

-- List all slugs for this business
SELECT id, business_name, slug, email FROM businesses 
WHERE email = 'amy@aimwithamy.com'
OR business_name ILIKE '%aim%';
