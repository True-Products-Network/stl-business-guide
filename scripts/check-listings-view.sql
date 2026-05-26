-- Check the public_approved_listings view structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'public_approved_listings';

-- Check sample data
SELECT * FROM public_approved_listings LIMIT 2;
