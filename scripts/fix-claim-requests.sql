-- Fix claim_requests table to reference businesses instead of business_listings
-- Run this in Supabase SQL Editor

-- First, drop the existing foreign key constraint
ALTER TABLE claim_requests 
DROP CONSTRAINT IF EXISTS claim_requests_business_id_fkey;

-- Add the correct foreign key constraint referencing businesses
ALTER TABLE claim_requests 
ADD CONSTRAINT claim_requests_business_id_fkey 
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

-- Verify the fix
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'claim_requests';
