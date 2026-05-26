-- Fix listing_submissions table - add missing columns
-- Run this in Supabase SQL Editor

-- Check current columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listing_submissions';

-- Add missing columns if they don't exist
ALTER TABLE listing_submissions 
ADD COLUMN IF NOT EXISTS submitted_by_user_id UUID REFERENCES auth.users(id);

-- Also check if business_id column exists and is correct type
-- If it references businesses table, make sure that's set up

-- Verify the fix
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listing_submissions';
