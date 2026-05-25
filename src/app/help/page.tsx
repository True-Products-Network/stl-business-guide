import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Search, MessageCircle, FileText, Phone, Mail, ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do I create a business listing?",
    answer: "Click 'List Your Business' and follow the simple 3-step process. You'll need to provide your business name, contact information, description, and select a plan (Free, Premium, or VIP)."
  },
  {
    question: "What's the difference between Free, Premium, and VIP plans?",
    answer: "Free plans include basic listing with 1 category and standard placement. Premium ($97/month) adds featured placement, up to 10 photos, and 3 categories. VIP ($497/month) includes top priority placement, unlimited photos, videos, and a dedicated account manager."
  },
  {
    question: "How long does it take for my listing to be approved?",
    answer: "Most listings are reviewed and approved within 24-48 hours. You'll receive an email notification once your listing is live."
  },
  {
    question: "Can I edit my listing after it's published?",
    answer: "Yes! You can log into your account anytime to update your business information, photos, hours, and other details. Changes are typically reflected within a few hours."
  },
  {
    question: "How do I get more visibility for my business?",
    answer: "Upgrade to Premium or VIP for better placement. Also, complete your full profile, add high-quality photos, encourage customer reviews, and keep your information up to date."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover) for Premium and VIP subscriptions."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your Premium or VIP subscription at any time. Your listing will remain active until the end of your current billing period, then revert to a Free plan."
  },
  {
    question: "How do customer reviews work?",
    answer: "Customers can leave reviews on your listing page. We moderate all reviews to ensure authenticity. You can respond to reviews from your business dashboard."
  }
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Help Center
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Find answers to common questions or contact our support team
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-3xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-2 flex items-center">
          <Search className="w-6 h-6 text-gray-400 ml-4" />
          <input
            type="text"
            placeholder="Search for answers..."
            className="flex-1 px-4 py-3 outline-none text-gray-700"
          />
          <button className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-xl font-semibold">
            Search
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <a href="#faq" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition text-center">
            <MessageCircle className="w-12 h-12 text-[#54afe6] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#371a5b] mb-2">FAQs</h3>
            <p className="text-gray-600">Browse common questions and answers</p>
          </a>
          <a href="#contact" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition text-center">
            <Phone className="w-12 h-12 text-[#54afe6] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#371a5b] mb-2">Contact Us</h3>
            <p className="text-gray-600">Get in touch with our support team</p>
          </a>
          <a href="#guides" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition text-center">
            <FileText className="w-12 h-12 text-[#54afe6] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#371a5b] mb-2">Guides</h3>
            <p className="text-gray-600">Step-by-step tutorials and resources</p>
          </a>
        </div>

        {/* FAQs */}
        <div id="faq" className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#371a5b] mb-8 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition">
                    <span className="font-semibold text-[#371a5b]">{faq.question}</span>
                    <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition" />
                  </summary>
                  <div className="px-6 pb-6 text-gray-600">
                    {faq.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="mt-16 bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#371a5b] mb-6 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Still Need Help?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#54afe6]/10 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-[#54afe6]" />
              </div>
              <div>
                <p className="font-semibold text-[#371a5b]">Phone Support</p>
                <p className="text-gray-600">(314) 886-8084</p>
                <p className="text-sm text-gray-500">Mon-Fri, 9am-5pm CST</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#54afe6]/10 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#54afe6]" />
              </div>
              <div>
                <p className="font-semibold text-[#371a5b]">Email Support</p>
                <p className="text-gray-600">support@stlbusinessguide.com</p>
                <p className="text-sm text-gray-500">24-48 hour response</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
