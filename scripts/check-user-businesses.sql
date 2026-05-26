-- Check businesses and their owner_profile_id
-- Run this to see what businesses exist and who owns them

SELECT 
    b.id,
    b.business_name,
    b.owner_profile_id,
    bl.id as listing_id,
    bl.listing_status
FROM businesses b
LEFT JOIN business_listings bl ON bl.business_id = b.id
ORDER BY b.created_at DESC
LIMIT 20;

-- Check if there are any businesses with NULL owner_profile_id
SELECT COUNT(*) as businesses_without_owner 
FROM businesses 
WHERE owner_profile_id IS NULL;

-- Show all businesses without an owner
SELECT id, business_name, email, created_at
FROM businesses 
WHERE owner_profile_id IS NULL
ORDER BY created_at DESC;
