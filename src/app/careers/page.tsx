import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Briefcase, MapPin, DollarSign, ArrowRight } from "lucide-react";

const openPositions = [
  {
    title: "Sales Representative",
    department: "Sales",
    location: "Chesterfield, MO (Hybrid)",
    type: "Full-time",
    salary: "$50,000 - $80,000 + Commission",
    description: "Help local businesses grow by introducing them to STL Business Guide's marketing solutions."
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Chesterfield, MO",
    type: "Full-time",
    salary: "$55,000 - $75,000",
    description: "Ensure our business members get the most value from their listings and subscriptions."
  },
  {
    title: "Content Marketing Specialist",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    salary: "$50,000 - $65,000",
    description: "Create engaging content that helps local businesses succeed and promotes our platform."
  },
  {
    title: "Web Developer",
    department: "Engineering",
    location: "Chesterfield, MO (Hybrid)",
    type: "Full-time",
    salary: "$70,000 - $95,000",
    description: "Build and maintain features for our business directory platform."
  }
];

const benefits = [
  "Competitive salary and commission structure",
  "Health, dental, and vision insurance",
  "401(k) with company match",
  "Flexible PTO and paid holidays",
  "Professional development budget",
  "Remote work options for most roles",
  "Team events and company outings",
  "Free Premium business listing for your side hustle"
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Join Our Team
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Help local businesses thrive while building your career
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Mission */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#371a5b] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Our Mission
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            At STL Business Guide, we're passionate about helping local businesses succeed. 
            We believe that when local businesses thrive, entire communities benefit. Join us 
            in making a real difference for entrepreneurs and business owners across the St. Louis area.
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-[#371a5b] mb-8 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Why Work With Us?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-[#86c540] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-3xl font-bold text-[#371a5b] mb-8 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Open Positions
          </h2>
          <div className="space-y-4">
            {openPositions.map((position, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-[#371a5b] mb-2">{position.title}</h3>
                    <p className="text-gray-600 mb-3">{position.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {position.department}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {position.location}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {position.salary}
                      </span>
                    </div>
                  </div>
                  <a
                    href="/contact"
                    className="inline-flex items-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Don&apos;t see a position that fits? We&apos;re always looking for talented people.
          </p>
          <a
            href="/contact"
            className="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Send Us Your Resume
          </a>
        </div>
      </div>

      <Footer />
    </main>
  );
}
