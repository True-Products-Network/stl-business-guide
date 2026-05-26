-- Add existing blog posts to database
-- Run this in Supabase SQL Editor

INSERT INTO blog_posts (title, slug, excerpt, content, author, category, read_time, is_published, published_at)
VALUES 
(
    '10 Local Marketing Tips for Small Businesses',
    'marketing-tips',
    'Learn proven strategies to help your local business thrive and attract more customers.',
    '<p class="text-lg text-gray-600 mb-6">Marketing your local business doesn''t have to be complicated or expensive. Here are ten proven strategies to help you attract more customers and grow your business in the St. Louis area.</p>

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
    '<p class="text-lg text-gray-600 mb-6">Search engine optimization (SEO) is essential for local businesses looking to attract customers online. This guide covers everything you need to know about local SEO.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">What is Local SEO?</h2>
<p class="text-gray-600 mb-4">Local SEO is the practice of optimizing your online presence to attract more business from relevant local searches. These searches take place on Google and other search engines.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Google Business Profile</h2>
<p class="text-gray-600 mb-4">Your Google Business Profile is the most important tool for local SEO. Claim and verify your listing, add accurate information, upload photos, and regularly post updates.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Local Keywords</h2>
<p class="text-gray-600 mb-4">Research and use keywords that include your location. Tools like Google Keyword Planner can help you find terms your customers are searching for.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">NAP Consistency</h2>
<p class="text-gray-600 mb-4">Ensure your Name, Address, and Phone number are consistent across all online directories and your website. Inconsistencies can hurt your rankings.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Local Link Building</h2>
<p class="text-gray-600 mb-4">Get listed in local directories, sponsor local events, and partner with other businesses to earn quality backlinks to your website.</p>

<div class="bg-[#54afe6]/10 rounded-xl p-6 mt-8">
    <h3 class="text-xl font-bold text-[#371a5b] mb-2">Improve Your Local SEO</h3>
    <p class="text-gray-600 mb-4">List your business on STL Business Guide for better local search visibility.</p>
    <a href="/submit-listing?plan=free" class="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">Get Started Free</a>
</div>',
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
    '<p class="text-lg text-gray-600 mb-6">Customer reviews are one of the most powerful marketing tools for local businesses. They build trust, improve SEO, and influence purchasing decisions.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Why Reviews Matter</h2>
<p class="text-gray-600 mb-4">92% of consumers read online reviews before making a purchase decision. Reviews are social proof that your business delivers on its promises.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Ask at the Right Time</h2>
    <p class="text-gray-600 mb-4">The best time to ask for a review is immediately after a positive interaction. Strike while the customer is still excited about their experience.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Make It Easy</h2>
<p class="text-gray-600 mb-4">Provide direct links to your review profiles. Remove friction by sending follow-up emails with one-click review links.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Respond to All Reviews</h2>
<p class="text-gray-600 mb-4">Thank customers for positive reviews and address negative reviews professionally. This shows you value customer feedback.</p>

<div class="bg-[#54afe6]/10 rounded-xl p-6 mt-8">
    <h3 class="text-xl font-bold text-[#371a5b] mb-2">Build Your Online Reputation</h3>
    <p class="text-gray-600 mb-4">A complete business listing on STL Business Guide helps you collect and showcase reviews.</p>
    <a href="/submit-listing?plan=free" class="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">Get Started Free</a>
</div>',
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
    '<p class="text-lg text-gray-600 mb-6">Local business directories are often overlooked, but they remain a powerful tool for attracting customers and improving your online presence.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Increased Visibility</h2>
<p class="text-gray-600 mb-4">Being listed in multiple directories means more places where potential customers can find you. Each listing is another opportunity to be discovered.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">SEO Benefits</h2>
<p class="text-gray-600 mb-4">Directory listings create valuable backlinks to your website and help search engines understand your business location and category.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Targeted Traffic</h2>
<p class="text-gray-600 mb-4">People browsing local directories are actively looking for businesses like yours. This is high-intent traffic more likely to convert.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Cost-Effective Marketing</h2>
<p class="text-gray-600 mb-4">Many directories offer free listings. Even premium listings are often more affordable than other forms of advertising.</p>

<div class="bg-[#54afe6]/10 rounded-xl p-6 mt-8">
    <h3 class="text-xl font-bold text-[#371a5b] mb-2">Get Listed Today</h3>
    <p class="text-gray-600 mb-4">Join STL Business Guide and reach thousands of local customers searching for businesses like yours.</p>
    <a href="/submit-listing?plan=free" class="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">Get Started Free</a>
</div>',
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
    '<p class="text-lg text-gray-600 mb-6">Social media is a powerful tool for local businesses to connect with their community, build relationships, and attract new customers.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Choose the Right Platforms</h2>
<p class="text-gray-600 mb-4">Focus on platforms where your customers spend time. Facebook is great for most local businesses, while Instagram works well for visual businesses.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Share Local Content</h2>
<p class="text-gray-600 mb-4">Post about local events, community news, and behind-the-scenes content. Show that you''re part of the community.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Engage with Followers</h2>
<p class="text-gray-600 mb-4">Respond to comments and messages promptly. Engagement builds relationships and shows you care about your customers.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Use Local Hashtags</h2>
<p class="text-gray-600 mb-4">Include location-based hashtags like #StLouisBusiness or #ChesterfieldMO to reach local audiences.</p>

<div class="bg-[#54afe6]/10 rounded-xl p-6 mt-8">
    <h3 class="text-xl font-bold text-[#371a5b] mb-2">Amplify Your Social Presence</h3>
    <p class="text-gray-600 mb-4">A complete STL Business Guide listing includes social media links to help customers connect with you.</p>
    <a href="/submit-listing?plan=free" class="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">Get Started Free</a>
</div>',
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
    '<p class="text-lg text-gray-600 mb-6">High-quality photos are one of the most important elements of your business listing. They create first impressions and help customers choose your business.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Showcase Your Space</h2>
<p class="text-gray-600 mb-4">Include photos of your storefront, interior, and any unique features. Help customers know what to expect when they visit.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Feature Your Products/Services</h2>
<p class="text-gray-600 mb-4">Show what you offer. For restaurants, this means food photos. For service businesses, show your team in action.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Include Your Team</h2>
<p class="text-gray-600 mb-4">Photos of friendly staff members build trust and humanize your business. Customers like to know who they''ll be working with.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Quality Matters</h2>
<p class="text-gray-600 mb-4">Use high-resolution images with good lighting. Blurry or dark photos can hurt your credibility.</p>

<div class="bg-[#54afe6]/10 rounded-xl p-6 mt-8">
    <h3 class="text-xl font-bold text-[#371a5b] mb-2">Upload Your Photos</h3>
    <p class="text-gray-600 mb-4">Premium and VIP listings on STL Business Guide include photo galleries to showcase your business.</p>
    <a href="/submit-listing?plan=premium" class="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">Upgrade to Premium</a>
</div>',
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
    '<p class="text-lg text-gray-600 mb-6">Analytics help you understand how customers interact with your business listing. Use this data to make informed decisions and improve your results.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Profile Views</h2>
<p class="text-gray-600 mb-4">This metric shows how many people viewed your business listing. High views but low engagement might indicate your listing needs improvement.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Website Clicks</h2>
<p class="text-gray-600 mb-4">Track how many visitors click through to your website. This indicates strong interest in learning more about your business.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Phone Calls</h2>
<p class="text-gray-600 mb-4">Phone clicks show high purchase intent. These are potential customers ready to talk business.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Email Inquiries</h2>
<p class="text-gray-600 mb-4">Email clicks indicate customers prefer written communication. Make sure your email is monitored and responses are prompt.</p>

<h2 class="text-2xl font-bold text-[#371a5b] mt-8 mb-4">Using the Data</h2>
<p class="text-gray-600 mb-4">Review your analytics regularly. Look for trends and patterns. Test changes to your listing and measure the impact on these metrics.</p>

<div class="bg-[#54afe6]/10 rounded-xl p-6 mt-8">
    <h3 class="text-xl font-bold text-[#371a5b] mb-2">Track Your Performance</h3>
    <p class="text-gray-600 mb-4">All STL Business Guide listings include analytics to help you understand your impact.</p>
    <a href="/submit-listing?plan=free" class="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">Get Started Free</a>
</div>',
    'Nigel Lear',
    'Analytics',
    '7 min read',
    true,
    '2026-04-15'
)
ON CONFLICT (slug) DO NOTHING;

-- Verify posts were added
SELECT title, slug, category, is_published, published_at 
FROM blog_posts 
ORDER BY published_at DESC;
