-- Add business_owner_name column to businesses table
-- Run this in Supabase SQL Editor

-- Add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'businesses' 
        AND column_name = 'business_owner_name'
    ) THEN
        ALTER TABLE businesses ADD COLUMN business_owner_name TEXT;
    END IF;
END $$;

-- Add GRANT statements for Supabase security (May 30, 2026 guidelines)
GRANT ALL ON businesses TO authenticated;
GRANT ALL ON businesses TO anon;

-- Verify the column was added
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'businesses' 
ORDER BY 
    ordinal_position;
