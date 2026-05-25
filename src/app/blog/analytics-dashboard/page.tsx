import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

export default function AnalyticsDashboardPage() {
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
            Analytics
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Understanding Your Analytics Dashboard
          </h1>
          <div className="flex items-center text-white/80 space-x-6">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Nigel Lear
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              April 15, 2026
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              7 min read
            </span>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-16">
        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            Make data-driven decisions by understanding the metrics that matter for your business listing.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            1. Profile Views
          </h2>
          <p className="text-gray-600 mb-4">
            This metric shows how many people have viewed your business profile. Track trends over time to see if your marketing efforts are driving more interest in your business.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            2. Click-Through Rate (CTR)
          </h2>
          <p className="text-gray-600 mb-4">
            CTR measures how often people click on your contact information, website link, or call button after viewing your profile. A high CTR means your profile is compelling and relevant.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            3. Search Impressions
          </h2>
          <p className="text-gray-600 mb-4">
            See how many times your business appeared in search results. If impressions are high but clicks are low, you may need to improve your business description or photos.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            4. Customer Actions
          </h2>
          <p className="text-gray-600 mb-4">
            Track specific actions customers take: phone calls, website visits, direction requests, and photo views. This helps you understand how customers prefer to engage with your business.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            5. Review Metrics
          </h2>
          <p className="text-gray-600 mb-4">
            Monitor your average rating, total review count, and review response rate. Respond to all reviews to show customers you value their feedback and improve your reputation.
          </p>

          <div className="bg-[#54afe6]/10 rounded-xl p-6 mt-8">
            <h3 className="text-xl font-bold text-[#371a5b] mb-2">
              Ready to Track Your Success?
            </h3>
            <p className="text-gray-600 mb-4">
              List your business on STL Business Guide and get access to detailed analytics with a Premium or VIP listing.
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
