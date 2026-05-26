-- Fix the image_type check constraint on business_images
-- First drop the existing constraint
ALTER TABLE business_images 
DROP CONSTRAINT IF EXISTS business_images_image_type_check;

-- Add the correct constraint
ALTER TABLE business_images 
ADD CONSTRAINT business_images_image_type_check 
CHECK (image_type IN ('featured', 'gallery'));

-- Verify the fix
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'business_images'::regclass
AND conname = 'business_images_image_type_check';
