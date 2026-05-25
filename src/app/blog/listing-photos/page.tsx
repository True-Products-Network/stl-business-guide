import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

export default function ListingPhotosPage() {
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
            Marketing
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Maximizing Your Business Listing Photos
          </h1>
          <div className="flex items-center text-white/80 space-x-6">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Nigel Lear
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              April 20, 2026
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              4 min read
            </span>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-16">
        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            Great photos can significantly increase engagement. Learn what types of images perform best.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            1. Show Your Products or Services
          </h2>
          <p className="text-gray-600 mb-4">
            High-quality photos of what you offer help potential customers understand your business. For restaurants, show your signature dishes. For contractors, show completed projects.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            2. Include Your Team
          </h2>
          <p className="text-gray-600 mb-4">
            People do business with people they know, like, and trust. Professional photos of you and your team build personal connections before customers even walk through your door.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            3. Showcase Your Space
          </h2>
          <p className="text-gray-600 mb-4">
            For retail stores, restaurants, and service businesses, photos of your location help customers know what to expect. Clean, well-lit photos of your space set the right expectations.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            4. Use High-Quality Images
          </h2>
          <p className="text-gray-600 mb-4">
            Blurry, dark, or poorly composed photos hurt your brand. Use a good camera or hire a professional photographer. The investment pays off in increased customer trust and engagement.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            5. Update Regularly
          </h2>
          <p className="text-gray-600 mb-4">
            Keep your photos current. Seasonal updates, new products, or recent renovations should be reflected in your listing photos. Fresh content shows your business is active and thriving.
          </p>

          <div className="bg-[#54afe6]/10 rounded-xl p-6 mt-8">
            <h3 className="text-xl font-bold text-[#371a5b] mb-2">
              Ready to Showcase Your Business?
            </h3>
            <p className="text-gray-600 mb-4">
              List your business on STL Business Guide and upload up to 10 photos with a Premium listing.
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
