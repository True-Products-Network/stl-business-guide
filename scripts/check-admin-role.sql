-- Check your user role and make you admin
-- Run this in Supabase SQL Editor

-- First, let's see your user
SELECT id, email, role, created_at 
FROM profiles 
WHERE email = 'nigel@trueproductsnetwork.com';

-- If you exist but aren't admin, run this:
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email = 'nigel@trueproductsnetwork.com';

-- Check all profiles to find your account
SELECT id, email, role, first_name, last_name
FROM profiles
ORDER BY created_at DESC
LIMIT 10;
