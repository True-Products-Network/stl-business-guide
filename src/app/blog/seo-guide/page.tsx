import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

export default function SEOGuidePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Link */}
          <a
            href="/blog"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blog
          </a>

          <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
            SEO
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Local SEO Guide for Small Businesses
          </h1>
          <div className="flex items-center text-white/80 space-x-6">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Nigel Lear
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              May 15, 2026
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              6 min read
            </span>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-16">
        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            Local SEO helps your business appear in search results when potential
            customers in your area are looking for products or services you offer.
            Here&apos;s your complete guide to dominating local search.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            What is Local SEO?
          </h2>
          <p className="text-gray-600 mb-4">
            Local SEO (Search Engine Optimization) is the practice of optimizing
            your online presence to attract more business from relevant local
            searches. These searches take place on Google and other search engines
            when people look for businesses &quot;near me&quot; or in a specific location.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            1. Optimize Your Google Business Profile
          </h2>
          <p className="text-gray-600 mb-4">
            Your Google Business Profile is often the first impression customers
            have of your business. Make sure it&apos;s complete with:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Accurate business name, address, and phone number</li>
            <li>Business hours and holiday hours</li>
            <li>High-quality photos of your business</li>
            <li>Detailed business description with relevant keywords</li>
            <li>Regular posts and updates</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            2. Build Local Citations
          </h2>
          <p className="text-gray-600 mb-4">
            Citations are mentions of your business name, address, and phone number
            (NAP) on other websites. Consistent NAP information across directories
            like STL Business Guide, Yelp, and industry-specific sites helps search
            engines verify your business information and improves your rankings.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            3. Use Local Keywords
          </h2>
          <p className="text-gray-600 mb-4">
            Research and use keywords that include your location. Instead of
            targeting &quot;plumber,&quot; target &quot;plumber in Chesterfield MO&quot; or
            &quot;emergency plumber St. Louis.&quot; Include these keywords naturally in:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Page titles and meta descriptions</li>
            <li>Header tags (H1, H2, H3)</li>
            <li>Body content</li>
            <li>Image alt text</li>
            <li>URL structures</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            4. Create Location Pages
          </h2>
          <p className="text-gray-600 mb-4">
            If you serve multiple areas, create dedicated pages for each location.
            These pages should include unique content about the services you offer
            in that specific area, local landmarks, and customer testimonials from
            that location.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            5. Get Quality Backlinks
          </h2>
          <p className="text-gray-600 mb-4">
            Backlinks from reputable local websites signal to search engines that
            your business is trustworthy and relevant. Seek links from:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Local business associations</li>
            <li>Chambers of commerce</li>
            <li>Local news websites</li>
            <li>Community organizations</li>
            <li>Partner businesses</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            6. Optimize for Mobile
          </h2>
          <p className="text-gray-600 mb-4">
            Most local searches happen on mobile devices. Ensure your website is
            mobile-friendly with fast loading times, easy navigation, and click-to-call
            buttons. Google uses mobile-first indexing, so your mobile site is what
            matters most for rankings.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            7. Encourage and Manage Reviews
          </h2>
          <p className="text-gray-600 mb-4">
            Reviews are a significant ranking factor for local SEO. Encourage
            satisfied customers to leave reviews on Google, Yelp, and industry-specific
            platforms. Respond to all reviews professionally, addressing any concerns
            raised in negative reviews.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            8. Use Schema Markup
          </h2>
          <p className="text-gray-600 mb-4">
            Schema markup is code that helps search engines understand your content
            better. For local businesses, use LocalBusiness schema to provide
            information about your business type, address, phone number, hours,
            and more. This can help you appear in rich snippets and knowledge panels.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            9. Create Local Content
          </h2>
          <p className="text-gray-600 mb-4">
            Write blog posts and create content about local events, news, and
            activities related to your industry. This shows search engines you&apos;re
            active in the community and helps you rank for local search terms.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            10. Monitor Your Results
          </h2>
          <p className="text-gray-600 mb-4">
            Use tools like Google Analytics and Google Search Console to track your
            local SEO performance. Monitor your rankings for target keywords, website
            traffic from local searches, and conversion rates. Adjust your strategy
            based on what&apos;s working.
          </p>

          <div className="bg-[#54afe6]/10 rounded-xl p-6 mt-8">
            <h3 className="text-xl font-bold text-[#371a5b] mb-2">
              Boost Your Local SEO Today
            </h3>
            <p className="text-gray-600 mb-4">
              List your business on STL Business Guide to improve your local search
              visibility and reach more customers in the St. Louis area.
            </p>
            <a
              href="/submit-listing?plan=free"
              className="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
