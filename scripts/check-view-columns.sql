-- Check what columns the public_approved_listings view returns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'public_approved_listings'
ORDER BY ordinal_position;

-- Also check what a sample record looks like
SELECT * FROM public_approved_listings LIMIT 1;
