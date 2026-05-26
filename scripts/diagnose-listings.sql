-- Diagnose why public_approved_listings shows 0 results

-- Check businesses status values
SELECT DISTINCT status, COUNT(*) as count 
FROM businesses 
GROUP BY status;

-- Check business_listings status values  
SELECT DISTINCT listing_status, COUNT(*) as count
FROM business_listings
GROUP BY listing_status;

-- Check listing_plans
SELECT id, plan_key, monthly_price FROM listing_plans;

-- Check businesses with their listings
SELECT 
    b.id,
    b.business_name,
    b.status as business_status,
    l.listing_status,
    lp.plan_key
FROM businesses b
LEFT JOIN business_listings l ON l.business_id = b.id
LEFT JOIN listing_plans lp ON l.plan_id = lp.id
LIMIT 10;

-- Try a simpler view without strict filters
CREATE OR REPLACE VIEW public_approved_listings_simple AS
SELECT 
    b.id,
    b.business_name,
    b.slug,
    b.description_short,
    b.description_long,
    b.phone,
    b.email,
    b.website_url,
    b.logo_url,
    b.status,
    b.created_at,
    b.updated_at,
    bl.city,
    bl.state,
    bl.zip_code,
    c.name as category,
    c.slug as category_slug,
    (
        SELECT json_agg(json_build_object('name', c2.name, 'slug', c2.slug))
        FROM business_categories bc2
        JOIN categories c2 ON bc2.category_id = c2.id
        WHERE bc2.business_id = b.id AND c2.is_active = true
    ) as categories,
    COALESCE(lp.plan_key, 'free') as plan_name,
    COALESCE(lp.plan_key, 'free') as plan_key,
    lp.monthly_price,
    COALESCE(l.is_featured, false) as is_featured,
    COALESCE(l.listing_status, 'active') as plan_status,
    l.sort_priority
FROM businesses b
LEFT JOIN business_locations bl ON bl.business_id = b.id
LEFT JOIN business_categories bc ON bc.business_id = b.id
LEFT JOIN categories c ON bc.category_id = c.id AND c.is_active = true
LEFT JOIN business_listings l ON l.business_id = b.id
LEFT JOIN listing_plans lp ON l.plan_id = lp.id
WHERE b.status = 'approved';

-- Test the simple view
SELECT COUNT(*) as total FROM public_approved_listings_simple;
SELECT business_name, category, plan_status, plan_key 
FROM public_approved_listings_simple 
LIMIT 5;
