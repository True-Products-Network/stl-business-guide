-- Check what columns actually exist in businesses table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'businesses'
ORDER BY ordinal_position;

-- Also check business_listings
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'business_listings'
ORDER BY ordinal_position;
