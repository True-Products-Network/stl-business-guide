-- Find businesses that have no category assigned
SELECT b.id, b.business_name, b.slug
FROM businesses b
LEFT JOIN business_categories bc ON bc.business_id = b.id
WHERE bc.id IS NULL;

-- Show all businesses with their categories
SELECT b.id, b.business_name, c.name as category_name
FROM businesses b
LEFT JOIN business_categories bc ON bc.business_id = b.id
LEFT JOIN categories c ON c.id = bc.category_id
ORDER BY b.business_name;
