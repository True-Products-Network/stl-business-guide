-- Check the current constraint on business_images.image_type
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'business_images'::regclass
AND conname LIKE '%image_type%';

-- Show current table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'business_images'
ORDER BY ordinal_position;

-- If needed, drop and recreate the constraint with correct values
-- First, let's see what values are currently in the table
SELECT DISTINCT image_type FROM business_images;
