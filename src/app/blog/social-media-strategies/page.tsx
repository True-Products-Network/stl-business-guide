import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

export default function SocialMediaStrategiesPage() {
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
            Social Media
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Social Media Strategies for Local Businesses
          </h1>
          <div className="flex items-center text-white/80 space-x-6">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Nigel Lear
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              April 28, 2026
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              5 min read
            </span>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-16">
        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            Connect with your community and build brand awareness with these proven social media tactics.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            1. Choose the Right Platforms
          </h2>
          <p className="text-gray-600 mb-4">
            Focus on platforms where your target customers spend time. Facebook is great for community building, Instagram for visual businesses, and LinkedIn for B2B services.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            2. Share Local Content
          </h2>
          <p className="text-gray-600 mb-4">
            Post about local events, community news, and neighborhood happenings. This shows you&apos;re invested in the community and helps you connect with local customers.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            3. Showcase Your Work
          </h2>
          <p className="text-gray-600 mb-4">
            Share photos and videos of your products, services, and happy customers (with permission). Visual content gets more engagement and helps potential customers see what you offer.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            4. Engage with Your Audience
          </h2>
          <p className="text-gray-600 mb-4">
            Respond to comments, messages, and mentions promptly. Ask questions, run polls, and encourage conversations. Social media is about building relationships, not just broadcasting.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            5. Use Local Hashtags
          </h2>
          <p className="text-gray-600 mb-4">
            Include location-based hashtags like #StLouisBusiness #ChesterfieldMO or #ShopLocalSTL to reach people in your area who are looking for local businesses.
          </p>

          <div className="bg-[#54afe6]/10 rounded-xl p-6 mt-8">
            <h3 className="text-xl font-bold text-[#371a5b] mb-2">
              Ready to Grow Your Business?
            </h3>
            <p className="text-gray-600 mb-4">
              List your business on STL Business Guide and complement your social media efforts with a professional online presence.
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
