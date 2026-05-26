-- First, add sort_order column if it doesn't exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add more popular categories to the business directory
INSERT INTO categories (name, slug, description, is_active, sort_order) VALUES
('Health & Wellness', 'health-wellness', 'Medical practices, wellness centers, fitness, and health services', true, 11),
('Automotive', 'automotive', 'Car dealers, repair shops, detailing, and auto services', true, 12),
('Retail', 'retail', 'Clothing, electronics, home goods, and specialty stores', true, 13),
('HVAC Services', 'hvac-services', 'Heating, ventilation, air conditioning installation and repair', true, 14),
('IT Services', 'it-services', 'Computer repair, tech support, networking, and IT consulting', true, 15),
('Home Repair Services', 'home-repair-services', 'Plumbing, electrical, roofing, and general home repair', true, 16),
('Real Estate', 'real-estate', 'Agents, brokers, property management, and real estate services', true, 17),
('Financial Services', 'financial-services', 'Banks, accounting, insurance, and financial advisors', true, 18),
('Legal Services', 'legal-services', 'Attorneys, law firms, and legal consultants', true, 19),
('Fitness & Gyms', 'fitness-gyms', 'Gyms, yoga studios, personal training, and fitness centers', true, 20),
('Beauty & Spas', 'beauty-spas', 'Salons, spas, barbershops, and beauty services', true, 21),
('Pet Services', 'pet-services', 'Veterinarians, groomers, pet stores, and pet care', true, 22),
('Education & Tutoring', 'education-tutoring', 'Schools, tutors, training centers, and educational services', true, 23),
('Event Services', 'event-services', 'Wedding planners, venues, DJs, and party rentals', true, 24)
ON CONFLICT (slug) DO NOTHING;

-- Show all categories
SELECT name, slug, sort_order FROM categories ORDER BY sort_order;
