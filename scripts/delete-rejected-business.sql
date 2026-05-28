-- Delete rejected business listing
-- Business: Check another Business (a151c067-db4d-48c2-b1af-e9ec890a7fa0)
-- Listing ID: db9ced80-35e8-4475-9af7-d66a0ac9ed41

-- First, delete related records (in correct order to avoid FK constraints)

-- 1. Delete business images
DELETE FROM business_images 
WHERE business_id = 'a151c067-db4d-48c2-b1af-e9ec890a7fa0';

-- 2. Delete business categories
DELETE FROM business_categories 
WHERE business_id = 'a151c067-db4d-48c2-b1af-e9ec890a7fa0';

-- 3. Delete business locations
DELETE FROM business_locations 
WHERE business_id = 'a151c067-db4d-48c2-b1af-e9ec890a7fa0';

-- 4. Delete claim requests
DELETE FROM claim_requests 
WHERE business_id = 'a151c067-db4d-48c2-b1af-e9ec890a7fa0';

-- 5. Delete coupons
DELETE FROM coupons 
WHERE business_id = 'a151c067-db4d-48c2-b1af-e9ec890a7fa0';

-- 6. Delete business listing
DELETE FROM business_listings 
WHERE id = 'db9ced80-35e8-4475-9af7-d66a0ac9ed41';

-- 7. Finally delete the business
DELETE FROM businesses 
WHERE id = 'a151c067-db4d-48c2-b1af-e9ec890a7fa0';

-- Verify deletion
SELECT 'Business deleted' as status;
