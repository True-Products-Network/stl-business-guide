-- Add website_url column to claim_requests table
-- Run this in Supabase SQL Editor

-- Add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'claim_requests' 
        AND column_name = 'website_url'
    ) THEN
        ALTER TABLE claim_requests ADD COLUMN website_url TEXT;
    END IF;
END $$;

-- Also add it to the interface/TypeScript types if needed
-- Update the ClaimRequest interface in the admin claims page

-- Verify the column was added
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'claim_requests' 
ORDER BY 
    ordinal_position;
