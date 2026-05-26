-- Update business_categories to use the new category
UPDATE business_categories 
SET category_id = (SELECT id FROM categories WHERE slug = 'home-repair-services')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'home-services');

-- Show how many were updated
SELECT COUNT(*) as businesses_updated FROM business_categories 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'home-repair-services');
