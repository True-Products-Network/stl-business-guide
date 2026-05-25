import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Target, Heart, Users, TrendingUp } from "lucide-react";

const stats = [
  { number: "500+", label: "Local Businesses" },
  { number: "25K+", label: "Monthly Visitors" },
  { number: "50+", label: "Categories" },
  { number: "98%", label: "Satisfaction Rate" },
];

const values = [
  {
    icon: Target,
    title: "Shop Local",
    description: "We believe in the power of local businesses to strengthen our community and economy.",
  },
  {
    icon: Heart,
    title: "Community First",
    description: "Every business we feature is vetted to ensure quality service for our community.",
  },
  {
    icon: Users,
    title: "Support Growth",
    description: "We help local businesses grow by connecting them with qualified local customers.",
  },
  {
    icon: TrendingUp,
    title: "Drive Results",
    description: "Our platform is designed to generate real leads and measurable growth for businesses.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            About STL Business Guide
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Your trusted resource for discovering the best local businesses in the St. Louis area.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#371a5b] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Our Mission
              </h2>
              <p className="text-gray-600 mb-4">
                STL Business Guide was created with a simple mission: to connect local businesses 
                with local customers. In an age of big box stores and online giants, we believe 
                in the power of community and the importance of supporting local entrepreneurs.
              </p>
              <p className="text-gray-600">
                Whether you&apos;re looking for a trusted plumber, a cozy café, or a professional 
                marketing agency, we&apos;ve got you covered. Every business in our directory is 
                carefully vetted to ensure quality and reliability.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#54afe6]/10 to-[#bb7ce4]/10 rounded-xl p-8">
              <blockquote className="text-xl text-[#371a5b] font-medium italic">
                &ldquo;When you shop local, you invest in your community. You create jobs, 
                support families, and build a stronger St. Louis.&rdquo;
              </blockquote>
              <p className="text-gray-600 mt-4">— The STL Business Guide Team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#371a5b] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</p>
                <p className="text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-[#371a5b] text-center mb-12" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Our Values
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, idx) => {
            const Icon = value.icon;
            return (
              <div key={idx} className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-[#54afe6] to-[#bb7ce4] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#371a5b] mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-[#54afe6] to-[#bb7ce4] rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Join Our Community
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Whether you&apos;re a business owner looking to grow or a customer seeking quality 
            local services, we&apos;d love to have you as part of the STL Business Guide family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/submit-listing"
              className="bg-white text-[#371a5b] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
            >
              List Your Business
            </a>
            <a
              href="/listings"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition"
            >
              Browse Listings
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
