-- Check if business appears in public_approved_listings view
SELECT * FROM public_approved_listings 
WHERE slug = 'check-another-business-mpkmdvex';

-- Check the view definition
SELECT pg_get_viewdef('public_approved_listings', true);

-- Check business_listings status
SELECT 
    b.id,
    b.business_name,
    b.slug,
    b.status as business_status,
    bl.listing_status,
    bl.is_featured
FROM businesses b
LEFT JOIN business_listings bl ON bl.business_id = b.id
WHERE b.slug = 'check-another-business-mpkmdvex';
