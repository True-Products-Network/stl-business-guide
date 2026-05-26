-- Check current public_approved_listings view definition
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'public_approved_listings';

-- Alternative: Get the view columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'public_approved_listings';
