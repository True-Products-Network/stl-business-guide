-- Fix the profile ID mismatch
-- Run this in Supabase SQL Editor

-- Update the profile to match your auth user ID
UPDATE profiles 
SET id = 'bf9c4601-2c0b-4cd9-b862-a35d6d0ab34a'
WHERE email = 'nigel@trueproductsnetwork.com';

-- Or if that fails due to FK constraints, delete the old one and create new:
-- DELETE FROM profiles WHERE id = '07b17e57-499b-422a-a9f8-b3fef0d82b8a';

-- Insert correct profile
INSERT INTO profiles (id, email, role, first_name, last_name, created_at, updated_at)
VALUES (
    'bf9c4601-2c0b-4cd9-b862-a35d6d0ab34a',
    'nigel@trueproductsnetwork.com',
    'admin',
    'Nigel',
    'Lear',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin',
    email = 'nigel@trueproductsnetwork.com',
    updated_at = NOW();

-- Verify
SELECT id, email, role FROM profiles WHERE email = 'nigel@trueproductsnetwork.com';
