-- Fix public_approved_listings view to ensure all contact fields are included
-- The view should include phone, email, website_url for display on listing pages

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
    b.featured_image_url,
    b.facebook_url,
    b.instagram_url,
    b.linkedin_url,
    b.youtube_url,
    b.business_hours,
    b.status,
    b.created_at,
    b.updated_at,
    -- Location info - City and State publicly visible
    bl.id as location_id,
    bl.city,
    bl.state,
    bl.service_area,
    -- Full address for Get Directions (not displayed publicly)
    bl.address_line_1,
    bl.address_line_2,
    bl.zip_code,
    -- Category info
    c.id as category_id,
    c.name as primary_category,
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
    blst.google_rating,
    blst.google_reviews_count
FROM businesses b
LEFT JOIN business_listings blst ON blst.business_id = b.id
LEFT JOIN listing_plans lp ON lp.id = blst.plan_id
LEFT JOIN business_locations bl ON bl.business_id = b.id
LEFT JOIN business_categories bc ON bc.business_id = b.id AND bc.is_primary = true
LEFT JOIN categories c ON c.id = bc.category_id
WHERE b.status = 'approved'
    AND blst.listing_status = 'active';

-- Grant access to the view
GRANT SELECT ON public_approved_listings TO anon;
GRANT SELECT ON public_approved_listings TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW public_approved_listings IS 'Public view of approved business listings with contact info and location data';
