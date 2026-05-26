-- Find businesses with empty/null category
SELECT b.id, b.business_name, b.category
FROM businesses b
WHERE b.category IS NULL OR b.category = '';

-- If you know the business name, you can update it directly:
-- UPDATE businesses 
-- SET category = 'Home Repair Services'
-- WHERE business_name = 'YOUR_BUSINESS_NAME';

-- Or update all businesses with empty category to Home Repair Services
-- UPDATE businesses 
-- SET category = 'Home Repair Services'
-- WHERE category IS NULL OR category = '';
