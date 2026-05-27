-- Fix ownership for claimed business
-- Business ID: 34a03091-8a40-42bf-bf8e-c19e5f7c0d1b
-- New owner email: nigel@trueproductsnetwork.com

-- Step 1: Find the profile ID for the new owner
SELECT id, email, full_name 
FROM profiles 
WHERE email = 'nigel@trueproductsnetwork.com';

-- Step 2: Update the business with the new owner profile ID
-- (Replace PROFILE_ID_FROM_STEP_1 with the actual ID from step 1)
UPDATE businesses 
SET 
    owner_profile_id = 'PROFILE_ID_FROM_STEP_1',
    email = 'nigel@trueproductsnetwork.com',
    updated_at = NOW()
WHERE id = '34a03091-8a40-42bf-bf8e-c19e5f7c0d1b';

-- Step 3: Verify the update
SELECT 
    b.id,
    b.business_name,
    b.email,
    b.owner_profile_id,
    p.email as owner_email,
    p.full_name as owner_name
FROM businesses b
LEFT JOIN profiles p ON p.id = b.owner_profile_id
WHERE b.id = '34a03091-8a40-42bf-bf8e-c19e5f7c0d1b';
