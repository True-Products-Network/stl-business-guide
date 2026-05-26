-- Check how categories are stored for businesses
-- Look at the public_approved_listings view

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'businesses'
ORDER BY ordinal_position;

-- Check if there's a category column in business_listings
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'business_listings'
ORDER BY ordinal_position;

-- Check the public view
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'public_approved_listings'
ORDER BY ordinal_position;
