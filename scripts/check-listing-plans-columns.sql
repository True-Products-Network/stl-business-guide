-- Check what columns exist in listing_plans table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listing_plans'
ORDER BY ordinal_position;
