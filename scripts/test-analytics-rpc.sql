-- Test if the increment_analytics function works
-- First, let's check if the function exists
SELECT proname, proargnames, prosrc 
FROM pg_proc 
WHERE proname = 'increment_analytics';

-- Test the function with a real business_listing ID
-- Replace 'YOUR_BUSINESS_LISTING_ID' with an actual ID from your database
SELECT increment_analytics(
    '5c324469-ec52-4dae-8a6d-02b5e7c895d1'::uuid,  -- Test A Business listing ID
    'website_clicks'
);

-- Check if the record was created/updated
SELECT * FROM business_analytics 
WHERE business_id = '5c324469-ec52-4dae-8a6d-02b5e7c895d1'::uuid
AND date = CURRENT_DATE;
