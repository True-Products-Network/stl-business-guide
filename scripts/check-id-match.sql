-- Check if auth user ID matches profile ID
-- Run this in Supabase SQL Editor

SELECT 
    au.id as auth_user_id, 
    au.email as auth_email,
    p.id as profile_id,
    p.email as profile_email,
    p.role,
    CASE 
        WHEN au.id = p.id THEN 'MATCH ✓'
        ELSE 'MISMATCH ✗'
    END as status
FROM auth.users au
LEFT JOIN profiles p ON au.email = p.email
WHERE au.email = 'nigel@trueproductsnetwork.com';
