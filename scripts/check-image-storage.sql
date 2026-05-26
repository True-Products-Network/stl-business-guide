-- Check current image-related setup
-- 1. Check if business_images table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'business_images';

-- 2. Check storage buckets
SELECT name, public 
FROM storage.buckets;

-- 3. Check listing_plans for image limits
SELECT plan_name, plan_key, max_images, allows_video 
FROM listing_plans;
