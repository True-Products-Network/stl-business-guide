-- Fix public_approved_listings view to include proper category data
-- Run this in Supabase SQL Editor

-- First, drop the existing view
DROP VIEW IF EXISTS public_approved_listings;

-- Create improved view with proper category joins
-- Fixed filters based on actual data values
CREATE OR REPLACE VIEW public_approved_listings AS
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
    b.status as business_status,
    b.created_at,
    b.updated_at,
    -- Location data
    bl.city,
    bl.state,
    bl.zip_code,
    -- Primary category
    c.name as category,
    c.slug as category_slug,
    -- All categories as JSON array
    (
        SELECT json_agg(json_build_object('name', c2.name, 'slug', c2.slug))
        FROM business_categories bc2
        JOIN categories c2 ON bc2.category_id = c2.id
        WHERE bc2.business_id = b.id AND c2.is_active = true
    ) as categories,
    -- Plan info
    COALESCE(lp.plan_key, 'free') as plan_name,
    COALESCE(lp.plan_key, 'free') as plan_key,
    lp.monthly_price,
    COALESCE(l.is_featured, false) as is_featured,
    COALESCE(l.listing_status, 'pending') as plan_status,
    l.sort_priority
FROM businesses b
LEFT JOIN business_locations bl ON bl.business_id = b.id
LEFT JOIN business_categories bc ON bc.business_id = b.id
LEFT JOIN categories c ON bc.category_id = c.id AND c.is_active = true
LEFT JOIN business_listings l ON l.business_id = b.id
LEFT JOIN listing_plans lp ON l.plan_id = lp.id
WHERE b.status = 'active'
    AND (l.listing_status = 'approved' OR l.listing_status IS NULL)
    AND (lp.plan_key IN ('free', 'premium', 'vip') OR lp.plan_key IS NULL);

-- Grant permissions
GRANT SELECT ON public_approved_listings TO anon;
GRANT SELECT ON public_approved_listings TO authenticated;

-- Verify it works
SELECT 'View created successfully' as status;
SELECT COUNT(*) as total_listings FROM public_approved_listings;
SELECT business_name, category, plan_status, plan_key, city
FROM public_approved_listings 
LIMIT 10;
