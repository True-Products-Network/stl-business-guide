-- Drop existing view if it exists
DROP VIEW IF EXISTS public_approved_listings;

-- Create improved public_approved_listings view with proper category data
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
    b.cover_image_url,
    b.google_place_id,
    b.google_rating,
    b.google_reviews_count,
    b.status,
    b.created_at,
    b.updated_at,
    -- Location data
    bl.city,
    bl.state,
    bl.zip_code,
    -- Category data - get the primary category name
    c.name as category,
    c.slug as category_slug,
    -- Also get all categories as JSON array
    (
        SELECT json_agg(json_build_object('name', c2.name, 'slug', c2.slug))
        FROM business_categories bc2
        JOIN categories c2 ON bc2.category_id = c2.id
        WHERE bc2.business_id = b.id AND c2.is_active = true
    ) as categories,
    -- Listing plan data
    lp.name as plan_name,
    lp.plan_key,
    lp.monthly_price,
    l.is_featured,
    l.listing_status as plan_status,
    l.sort_priority
FROM businesses b
LEFT JOIN business_locations bl ON bl.business_id = b.id
LEFT JOIN business_categories bc ON bc.business_id = b.id
LEFT JOIN categories c ON bc.category_id = c.id AND c.is_active = true
LEFT JOIN business_listings l ON l.business_id = b.id
LEFT JOIN listing_plans lp ON l.plan_id = lp.id
WHERE b.status = 'approved'
    AND (l.listing_status = 'active' OR l.listing_status IS NULL)
    AND (l.id IS NULL OR lp.plan_key IN ('free', 'premium', 'vip'));

-- Grant permissions
GRANT SELECT ON public_approved_listings TO anon;
GRANT SELECT ON public_approved_listings TO authenticated;

-- Verify the view
SELECT * FROM public_approved_listings LIMIT 3;
