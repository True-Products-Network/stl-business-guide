-- Update Home Services to Home Repair Services
UPDATE categories 
SET 
    name = 'Home Repair Services',
    slug = 'home-repair-services',
    description = 'Plumbing, electrical, roofing, and general home repair'
WHERE slug = 'home-services';

-- Show updated categories
SELECT name, slug FROM categories ORDER BY name;
