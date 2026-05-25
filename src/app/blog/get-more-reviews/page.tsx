import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

export default function GetMoreReviewsPage() {
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
            Reviews
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            How to Get More Customer Reviews
          </h1>
          <div className="flex items-center text-white/80 space-x-6">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Nigel Lear
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              May 10, 2026
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
            Customer reviews can make or break your business. Here&apos;s how to encourage satisfied customers to leave positive feedback.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            1. Ask at the Right Time
          </h2>
          <p className="text-gray-600 mb-4">
            Timing is everything. Ask for reviews when customers are most satisfied - right after a successful purchase, completion of a service, or when they&apos;ve expressed happiness with your business.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            2. Make It Easy
          </h2>
          <p className="text-gray-600 mb-4">
            Remove friction from the review process. Provide direct links to your review profiles on Google, Yelp, and STL Business Guide. The easier you make it, the more likely customers will follow through.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            3. Follow Up
          </h2>
          <p className="text-gray-600 mb-4">
            Send a follow-up email 3-5 days after a purchase or service. Include a thank you message and a gentle reminder to leave a review if they&apos;re satisfied with their experience.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            4. Respond to All Reviews
          </h2>
          <p className="text-gray-600 mb-4">
            Show that you value feedback by responding to every review - positive and negative. Thank customers for positive reviews and address concerns raised in negative reviews professionally.
          </p>

          <h2 className="text-2xl font-bold text-[#371a5b] mt-8 mb-4">
            5. Incentivize (Carefully)
          </h2>
          <p className="text-gray-600 mb-4">
            While you can&apos;t pay for positive reviews, you can offer small incentives for leaving honest feedback. Consider entry into a monthly drawing or a small discount on future purchases.
          </p>

          <div className="bg-[#54afe6]/10 rounded-xl p-6 mt-8">
            <h3 className="text-xl font-bold text-[#371a5b] mb-2">
              Ready to Grow Your Business?
            </h3>
            <p className="text-gray-600 mb-4">
              List your business on STL Business Guide and start collecting reviews from local customers.
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
