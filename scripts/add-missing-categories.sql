-- Add sort_order column if missing
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add only the categories that don't exist yet
-- Using DO NOTHING to skip any that already exist
INSERT INTO categories (name, slug, description, is_active, sort_order) VALUES
('Health & Wellness', 'health-wellness', 'Medical practices, wellness centers, fitness, and health services', true, 11),
('Automotive', 'automotive', 'Car dealers, repair shops, detailing, and auto services', true, 12),
('Retail', 'retail', 'Clothing, electronics, home goods, and specialty stores', true, 13),
('HVAC Services', 'hvac-services', 'Heating, ventilation, air conditioning installation and repair', true, 14),
('IT Services', 'it-services', 'Computer repair, tech support, networking, and IT consulting', true, 15),
('Real Estate', 'real-estate', 'Agents, brokers, property management, and real estate services', true, 16),
('Financial Services', 'financial-services', 'Banks, accounting, insurance, and financial advisors', true, 17),
('Legal Services', 'legal-services', 'Attorneys, law firms, and legal consultants', true, 18),
('Fitness & Gyms', 'fitness-gyms', 'Gyms, yoga studios, personal training, and fitness centers', true, 19),
('Beauty & Spas', 'beauty-spas', 'Salons, spas, barbershops, and beauty services', true, 20),
('Pet Services', 'pet-services', 'Veterinarians, groomers, pet stores, and pet care', true, 21),
('Education & Tutoring', 'education-tutoring', 'Schools, tutors, training centers, and educational services', true, 22),
('Event Services', 'event-services', 'Wedding planners, venues, DJs, and party rentals', true, 23)
ON CONFLICT (slug) DO NOTHING
ON CONFLICT (name) DO NOTHING;

-- Show all categories
SELECT name, slug, sort_order FROM categories ORDER BY name;
