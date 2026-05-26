-- Create blog_posts table for managing blog content
-- Run this in Supabase SQL Editor

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    author TEXT DEFAULT 'Nigel Lear',
    author_id UUID REFERENCES profiles(id),
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    category TEXT,
    read_time TEXT,
    featured_image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    meta_title TEXT,
    meta_description TEXT,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Create index on published status and date
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can view published posts
CREATE POLICY "Public can view published blog posts"
    ON blog_posts FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

-- Only admins can create/update/delete posts
CREATE POLICY "Admins can manage blog posts"
    ON blog_posts FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'super_admin')
        )
    );

-- Storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog images
CREATE POLICY "Public can view blog images"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'blog-images' AND
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'super_admin')
        )
    );

-- Migrate existing hardcoded blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, author, category, read_time, is_published, published_at)
VALUES 
(
    '10 Local Marketing Tips for Small Businesses',
    'marketing-tips',
    'Learn proven strategies to help your local business thrive and attract more customers.',
    E'<p class="text-lg text-gray-600 mb-6">Marketing your local business doesn''t have to be complicated or expensive. Here are ten proven strategies to help you attract more customers and grow your business in the St. Louis area.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">1. Claim Your Business Listings</h2>
<p class="text-gray-600 mb-4">Make sure your business is listed on all major directories including STL Business Guide, Google Business Profile, Yelp, and industry-specific sites. Consistent information across platforms helps with SEO and makes it easier for customers to find you.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">2. Encourage Customer Reviews</h2>
<p class="text-gray-600 mb-4">Positive reviews build trust and improve your search rankings. Ask satisfied customers to leave reviews, and always respond to both positive and negative feedback professionally.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">3. Use Local Keywords</h2>
<p class="text-gray-600 mb-4">Include location-specific keywords in your website content, business descriptions, and blog posts. Think "plumber in Chesterfield" rather than just "plumber."</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">4. Partner with Other Local Businesses</h2>
<p class="text-gray-600 mb-4">Cross-promotion with complementary businesses can expand your reach. A wedding photographer might partner with a florist, or a gym with a nutritionist.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">5. Sponsor Local Events</h2>
<p class="text-gray-600 mb-4">Community involvement builds brand awareness and goodwill. Sponsor little league teams, charity runs, or school events to get your name in front of local families.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">6. Create Valuable Content</h2>
<p class="text-gray-600 mb-4">Share your expertise through blog posts, videos, or social media. A HVAC company might share seasonal maintenance tips; a restaurant could post recipes or cooking techniques.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">7. Leverage Social Media</h2>
<p class="text-gray-600 mb-4">Focus on platforms where your customers spend time. Share behind-the-scenes content, customer success stories, and local community involvement.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">8. Offer Referral Incentives</h2>
<p class="text-gray-600 mb-4">Word-of-mouth is powerful. Encourage referrals by offering discounts or free services to customers who bring in new business.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">9. Use Email Marketing</h2>
<p class="text-gray-600 mb-4">Build an email list and send regular newsletters with special offers, company news, and valuable content. Email remains one of the most cost-effective marketing channels.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">10. Track and Measure Results</h2>
<p class="text-gray-600 mb-4">Use analytics to understand what''s working. Track website traffic, conversion rates, and customer acquisition costs to optimize your marketing spend.</p>

<div class="bg-[#54afe6]/10 rounded-xl p-6 mt-8">
    <h3 class="text-xl font-bold text-[#371a5b] mb-2">Ready to Grow Your Business?</h3>
    <p class="text-gray-600 mb-4">List your business on STL Business Guide and reach thousands of local customers.</p>
    <a href="/submit-listing?plan=free" class="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">Get Started Free</a>
</div>',
    'Nigel Lear',
    'Marketing',
    '5 min read',
    true,
    '2026-05-20'
),
(
    'Local SEO Guide for Small Businesses',
    'seo-guide',
    'Complete guide to optimizing your online presence and ranking higher in local search results.',
    '<p>SEO content here...</p>',
    'Nigel Lear',
    'SEO',
    '6 min read',
    true,
    '2026-05-15'
),
(
    'How to Get More Customer Reviews',
    'get-more-reviews',
    'Customer reviews can make or break your business. Here''s how to encourage satisfied customers to leave positive feedback.',
    '<p>Reviews content here...</p>',
    'Nigel Lear',
    'Reviews',
    '4 min read',
    true,
    '2026-05-10'
),
(
    'The Power of Local Business Directories',
    'local-directories',
    'Why being listed in local directories like STL Business Guide can drive more customers to your door.',
    '<p>Directories content here...</p>',
    'Nigel Lear',
    'Directories',
    '5 min read',
    true,
    '2026-05-05'
),
(
    'Social Media Strategies for Local Businesses',
    'social-media-strategies',
    'Connect with your community and build brand awareness with these proven social media tactics.',
    '<p>Social media content here...</p>',
    'Nigel Lear',
    'Social Media',
    '5 min read',
    true,
    '2026-04-28'
),
(
    'Maximizing Your Business Listing Photos',
    'listing-photos',
    'Great photos can significantly increase engagement. Learn what types of images perform best.',
    '<p>Photos content here...</p>',
    'Nigel Lear',
    'Marketing',
    '4 min read',
    true,
    '2026-04-20'
),
(
    'Understanding Your Analytics Dashboard',
    'analytics-dashboard',
    'Make data-driven decisions by understanding the metrics that matter for your business listing.',
    '<p>Analytics content here...</p>',
    'Nigel Lear',
    'Analytics',
    '7 min read',
    true,
    '2026-04-15'
)
ON CONFLICT (slug) DO NOTHING;

-- Show created table
SELECT 'blog_posts table created successfully' as status;
SELECT COUNT(*) as total_posts FROM blog_posts;
