-- Verify everything is set up correctly
-- Run this in Supabase SQL Editor

-- 1. Check your profile
SELECT id, email, role, first_name, last_name 
FROM profiles 
WHERE email = 'nigel@trueproductsnetwork.com';

-- 2. Check blog posts count
SELECT COUNT(*) as total_posts FROM blog_posts;

-- 3. List all blog posts
SELECT title, slug, category, is_published, published_at 
FROM blog_posts 
ORDER BY published_at DESC;

-- 4. Check if your auth user ID matches profile
SELECT 
    'Auth User' as source,
    id,
    email
FROM auth.users
WHERE email = 'nigel@trueproductsnetwork.com'
UNION ALL
SELECT 
    'Profile' as source,
    id,
    email
FROM profiles
WHERE email = 'nigel@trueproductsnetwork.com';
