-- Update coupon_redemptions table to add customer_name column
-- Run this in Supabase SQL Editor

-- Add customer_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'coupon_redemptions' 
        AND column_name = 'customer_name'
    ) THEN
        ALTER TABLE coupon_redemptions ADD COLUMN customer_name TEXT;
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'coupon_redemptions' 
ORDER BY 
    ordinal_position;
