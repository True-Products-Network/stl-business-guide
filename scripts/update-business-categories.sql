-- Update business listings that use 'home-services' category to 'home-repair-services'
-- First, let's check what needs updating

-- Check businesses using the old Home Services category
SELECT b.id, b.business_name, bl.listing_status
FROM businesses b
JOIN business_listings bl ON bl.business_id = b.id
WHERE b.id IN (
    SELECT business_id FROM business_categories 
    WHERE category_id = (SELECT id FROM categories WHERE slug = 'home-services')
);

-- Update business_categories to use the new category
UPDATE business_categories 
SET category_id = (SELECT id FROM categories WHERE slug = 'home-repair-services')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'home-services');

-- Also update any businesses that have category stored as text
UPDATE businesses 
SET category = 'Home Repair Services'
WHERE category = 'Home Services';

-- Show updated count
SELECT COUNT(*) as businesses_updated FROM business_categories 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'home-repair-services');
