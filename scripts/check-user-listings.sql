-- Check listings for a specific email
-- Replace with your actual login email

-- Check what email is stored in businesses table
SELECT email, business_name, status 
FROM businesses 
WHERE email ILIKE '%trueproductsnetwork%'
ORDER BY created_at DESC;

-- Check all businesses and their emails
SELECT email, business_name, status, created_at
FROM businesses
ORDER BY created_at DESC
LIMIT 20;

-- Check if there are any NULL emails
SELECT COUNT(*) as null_email_count 
FROM businesses 
WHERE email IS NULL;
