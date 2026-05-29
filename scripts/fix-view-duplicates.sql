-- Fix public_approved_listings view to avoid duplicates from multiple categories
DROP VIEW IF EXISTS public_approved_listings;

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
    -- Social media URLs
    b.facebook_url,
    b.instagram_url,
    b.linkedin_url,
    b.youtube_url,
    -- Business hours
    b.business_hours,
    l.id as listing_id,
    l.video_url,
    -- Featured image
    (
        SELECT image_url 
        FROM business_images bi 
        WHERE bi.business_id = b.id 
        AND bi.image_type = 'featured' 
        LIMIT 1
    ) as featured_image_url,
    -- Gallery images
    (
        SELECT json_agg(image_url ORDER BY sort_order)
        FROM business_images bi 
        WHERE bi.business_id = b.id 
        AND bi.image_type = 'gallery'
    ) as gallery_images,
    bl.city,
    bl.state,
    bl.zip_code,
    -- Primary category (first one)
    (
        SELECT c.name
        FROM business_categories bc
        JOIN categories c ON bc.category_id = c.id
        WHERE bc.business_id = b.id AND c.is_active = true
        ORDER BY c.name
        LIMIT 1
    ) as category,
    (
        SELECT c.slug
        FROM business_categories bc
        JOIN categories c ON bc.category_id = c.id
        WHERE bc.business_id = b.id AND c.is_active = true
        ORDER BY c.name
        LIMIT 1
    ) as category_slug,
    -- All categories as JSON array
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
    COALESCE(l.listing_status, 'pending') as plan_status,
    l.sort_priority
FROM businesses b
LEFT JOIN business_locations bl ON bl.business_id = b.id
LEFT JOIN business_listings l ON l.business_id = b.id
LEFT JOIN listing_plans lp ON l.plan_id = lp.id
WHERE b.status = 'active'
    AND (l.listing_status = 'approved' OR l.listing_status IS NULL)
    AND (lp.plan_key IN ('free', 'premium', 'vip') OR lp.plan_key IS NULL);

-- Grant permissions
GRANT SELECT ON public_approved_listings TO anon;
GRANT SELECT ON public_approved_listings TO authenticated;

SELECT 'public_approved_listings view fixed - no more duplicates' as status;
