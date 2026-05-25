import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

export default function LocalDirectoriesPage() {
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
            Directories
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            The Power of Local Business Directories
          </h1>
          <div className="flex items-center text-white/80 space-x-6">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Nigel Lear
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              May 5, 2026
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
            Why being listed in local directories like STL Business Guide can drive more customers to your door.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            1. Increased Online Visibility
          </h2>
          <p className="text-gray-600 mb-4">
            Local directories help your business appear in search results when potential customers are looking for services you offer. The more places you&apos;re listed, the more chances you have to be found.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            2. Improved SEO
          </h2>
          <p className="text-gray-600 mb-4">
            Directory listings create valuable backlinks to your website and help search engines verify your business information. This improves your overall search rankings.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            3. Targeted Local Traffic
          </h2>
          <p className="text-gray-600 mb-4">
            People using local directories are actively looking for businesses in their area. This means higher quality leads who are more likely to convert into customers.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            4. Build Trust and Credibility
          </h2>
          <p className="text-gray-600 mb-4">
            Being listed in reputable directories adds legitimacy to your business. Customers trust businesses that appear in multiple trusted sources.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            5. Cost-Effective Marketing
          </h2>
          <p className="text-gray-600 mb-4">
            Compared to traditional advertising, directory listings offer excellent ROI. Many directories offer free basic listings with options to upgrade for more visibility.
          </p>

          <div className="bg-[#54afe6]/10 rounded-xl p-6 mt-8">
            <h3 className="text-xl font-bold text-[#371a5b] mb-2">
              Ready to Get Listed?
            </h3>
            <p className="text-gray-600 mb-4">
              Join STL Business Guide and reach thousands of local customers searching for businesses like yours.
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
