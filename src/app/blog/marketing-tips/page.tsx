import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

export default function MarketingTipsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <article className="max-w-4xl mx-auto px-4 py-16">
        {/* Back Link */}
        <a
          href="/blog"
          className="inline-flex items-center text-[#54afe6] hover:text-[#371a5b] mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </a>

        {/* Header */}
        <header className="mb-8">
          <span className="inline-block bg-[#54afe6]/10 text-[#54afe6] px-3 py-1 rounded-full text-sm font-medium mb-4">
            Marketing
          </span>
          <h1
            className="text-4xl font-bold text-[#371a5b] mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            10 Local Marketing Tips for Small Businesses
          </h1>
          <div className="flex items-center text-gray-500 space-x-6">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Nigel Lear
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              May 20, 2026
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              5 min read
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            Marketing your local business doesn&apos;t have to be complicated or
            expensive. Here are ten proven strategies to help you attract more
            customers and grow your business in the St. Louis area.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            1. Claim Your Business Listings
          </h2>
          <p className="text-gray-600 mb-4">
            Make sure your business is listed on all major directories including
            STL Business Guide, Google Business Profile, Yelp, and industry-specific
            sites. Consistent information across platforms helps with SEO and makes
            it easier for customers to find you.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            2. Encourage Customer Reviews
          </h2>
          <p className="text-gray-600 mb-4">
            Positive reviews build trust and improve your search rankings. Ask
            satisfied customers to leave reviews, and always respond to both
            positive and negative feedback professionally.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            3. Use Local Keywords
          </h2>
          <p className="text-gray-600 mb-4">
            Include location-specific keywords in your website content, business
            descriptions, and blog posts. Think &quot;plumber in Chesterfield&quot; rather
            than just &quot;plumber.&quot;
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            4. Partner with Other Local Businesses
          </h2>
          <p className="text-gray-600 mb-4">
            Cross-promotion with complementary businesses can expand your reach.
            A wedding photographer might partner with a florist, or a gym with a
            nutritionist.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            5. Sponsor Local Events
          </h2>
          <p className="text-gray-600 mb-4">
            Community involvement builds brand awareness and goodwill. Sponsor
            little league teams, charity runs, or school events to get your name
            in front of local families.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            6. Create Valuable Content
          </h2>
          <p className="text-gray-600 mb-4">
            Share your expertise through blog posts, videos, or social media.
            A HVAC company might share seasonal maintenance tips; a restaurant
            could post recipes or cooking techniques.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            7. Leverage Social Media
          </h2>
          <p className="text-gray-600 mb-4">
            Focus on platforms where your customers spend time. Share behind-the-scenes
            content, customer success stories, and local community involvement.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            8. Offer Referral Incentives
          </h2>
          <p className="text-gray-600 mb-4">
            Word-of-mouth is powerful. Encourage referrals by offering discounts
            or free services to customers who bring in new business.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            9. Use Email Marketing
          </h2>
          <p className="text-gray-600 mb-4">
            Build an email list and send regular newsletters with special offers,
            company news, and valuable content. Email remains one of the most
            cost-effective marketing channels.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            10. Track and Measure Results
          </h2>
          <p className="text-gray-600 mb-4">
            Use analytics to understand what&apos;s working. Track website traffic,
            conversion rates, and customer acquisition costs to optimize your
            marketing spend.
          </p>

          <div className="bg-[#54afe6]/10 rounded-xl p-6 mt-8">
            <h3 className="text-xl font-bold text-[#371a5b] mb-2">
              Ready to Grow Your Business?
            </h3>
            <p className="text-gray-600 mb-4">
              List your business on STL Business Guide and reach thousands of
              local customers.
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
