-- Fix listing_submissions table - add missing requested_plan_id column

-- Check if column exists first, then add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listing_submissions' 
        AND column_name = 'requested_plan_id'
    ) THEN
        ALTER TABLE listing_submissions 
        ADD COLUMN requested_plan_id UUID REFERENCES listing_plans(id);
        
        RAISE NOTICE 'Added requested_plan_id column to listing_submissions';
    ELSE
        RAISE NOTICE 'requested_plan_id column already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listing_submissions' 
ORDER BY ordinal_position;
