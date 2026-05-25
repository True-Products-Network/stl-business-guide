import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Newspaper, Download, Mail, ExternalLink } from "lucide-react";

const pressReleases = [
  {
    date: "May 15, 2026",
    title: "STL Business Guide Reaches 500 Business Listings Milestone",
    excerpt: "Local business directory celebrates growth and announces new Premium features for members."
  },
  {
    date: "April 22, 2026",
    title: "STL Business Guide Partners with Local Chamber of Commerce",
    excerpt: "Strategic partnership aims to support small business growth in the St. Louis metropolitan area."
  },
  {
    date: "March 10, 2026",
    title: "New VIP Membership Tier Launches for Maximum Business Visibility",
    excerpt: "Enhanced features include dedicated account management and priority placement for serious business growth."
  }
];

const mediaKit = [
  { name: "Company Logo Pack", format: "ZIP", size: "2.4 MB" },
  { name: "Brand Guidelines", format: "PDF", size: "1.8 MB" },
  { name: "Executive Headshots", format: "ZIP", size: "5.2 MB" },
  { name: "Fact Sheet 2026", format: "PDF", size: "850 KB" }
];

export default function PressPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Press & Media
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            News, press releases, and media resources for STL Business Guide
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-4xl font-bold text-[#54afe6] mb-2">500+</p>
            <p className="text-gray-600">Business Listings</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-4xl font-bold text-[#54afe6] mb-2">25K+</p>
            <p className="text-gray-600">Monthly Visitors</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-4xl font-bold text-[#54afe6] mb-2">50+</p>
            <p className="text-gray-600">Business Categories</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-4xl font-bold text-[#54afe6] mb-2">2024</p>
            <p className="text-gray-600">Founded</p>
          </div>
        </div>

        {/* Press Releases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#371a5b] mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Press Releases
          </h2>
          <div className="space-y-6">
            {pressReleases.map((release, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#54afe6]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Newspaper className="w-6 h-6 text-[#54afe6]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">{release.date}</p>
                    <h3 className="text-xl font-bold text-[#371a5b] mb-2">{release.title}</h3>
                    <p className="text-gray-600">{release.excerpt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Kit */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#371a5b] mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Media Kit
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-gray-600 mb-6">
              Download official logos, brand guidelines, and press materials for media use.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {mediaKit.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-[#54afe6]" />
                    <span className="font-medium text-[#371a5b]">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{item.format} • {item.size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#371a5b] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Media Inquiries
          </h2>
          <p className="text-gray-600 mb-6">
            For press inquiries, interview requests, or additional information, please contact our media relations team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:press@stlbusinessguide.com"
              className="inline-flex items-center justify-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              <Mail className="w-5 h-5 mr-2" />
              press@stlbusinessguide.com
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Contact Form
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
