-- Check what columns exist in business_listings table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'business_listings'
ORDER BY ordinal_position;
