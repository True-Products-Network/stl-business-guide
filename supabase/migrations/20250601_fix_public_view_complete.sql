-- Fix public_approved_listings view to include all categories and images
-- Categories returned as JSON array, images handled separately

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
    b.facebook_url,
    b.instagram_url,
    b.linkedin_url,
    b.youtube_url,
    b.business_hours,
    b.status,
    b.created_at,
    b.updated_at,
    -- Location info
    bl.id as location_id,
    bl.city,
    bl.state,
    bl.service_area,
    bl.address_line_1,
    bl.address_line_2,
    bl.zip_code,
    -- All categories as JSON array
    (
        SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
        FROM business_categories bc2
        JOIN categories c ON c.id = bc2.category_id
        WHERE bc2.business_id = b.id
    ) as categories,
    -- Primary category for display
    (
        SELECT c.name
        FROM business_categories bc2
        JOIN categories c ON c.id = bc2.category_id
        WHERE bc2.business_id = b.id AND bc2.is_primary = true
        LIMIT 1
    ) as primary_category,
    -- Plan info
    lp.id as plan_id,
    lp.plan_key,
    lp.plan_name,
    lp.monthly_price,
    lp.yearly_price,
    -- Listing info
    blst.id as listing_id,
    blst.listing_status,
    blst.is_featured,
    blst.sort_priority,
    blst.cta_button_text,
    blst.cta_button_url,
    blst.video_url,
    -- Featured image (first gallery image or logo)
    COALESCE(
        (
            SELECT bi.image_url
            FROM business_images bi
            WHERE bi.business_id = b.id
            ORDER BY bi.sort_order, bi.created_at
            LIMIT 1
        ),
        b.logo_url
    ) as featured_image_url,
    -- Gallery images as array
    (
        SELECT json_agg(bi.image_url ORDER BY bi.sort_order, bi.created_at)
        FROM business_images bi
        WHERE bi.business_id = b.id
    ) as gallery_images
FROM businesses b
LEFT JOIN business_listings blst ON blst.business_id = b.id
LEFT JOIN listing_plans lp ON lp.id = blst.plan_id
LEFT JOIN business_locations bl ON bl.business_id = b.id
WHERE b.status = 'active'
    AND blst.listing_status = 'approved';

-- Grant access to the view
GRANT SELECT ON public_approved_listings TO anon;
GRANT SELECT ON public_approved_listings TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW public_approved_listings IS 'Public view of approved business listings with categories, images, and contact info';
