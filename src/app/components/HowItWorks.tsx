"use client";

import { Search, UserPlus, Rocket, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "1. Find Your Business",
    description: "Search for your business or create a new listing. We help local customers discover your services.",
    color: "from-[#54afe6] to-[#371a5b]",
  },
  {
    icon: UserPlus,
    title: "2. Claim & Verify",
    description: "Claim your listing and verify your business ownership. This ensures accurate information for customers.",
    color: "from-[#bb7ce4] to-[#54afe6]",
  },
  {
    icon: Rocket,
    title: "3. Choose Your Plan",
    description: "Select from Free, Premium, or VIP membership. Upgrade anytime as your business grows.",
    color: "from-[#ffc107] to-[#f68712]",
  },
  {
    icon: TrendingUp,
    title: "4. Grow Your Business",
    description: "Get discovered by thousands of local customers. Track your performance and watch your business grow.",
    color: "from-[#86c540] to-[#54afe6]",
  },
];

export default function HowItWorks() {
  return (
    <section id="about" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-[#bb7ce4]/10 text-[#bb7ce4] rounded-full text-sm font-semibold mb-4">
            How It Works
          </span>
          <h2 className="text-4xl font-bold text-[#371a5b] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Get Listed in 4 Easy Steps
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Join hundreds of local businesses already growing with STL Business Guide. 
            It's simple, fast, and effective.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[#54afe6]/30 to-transparent" style={{ zIndex: 0 }}></div>
                )}
                
                <div className="relative bg-gray-50 rounded-3xl p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
                  {/* Icon */}
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-[#371a5b] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] rounded-2xl p-8 text-white">
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Ready to Get Started?
              </h3>
              <p className="text-white/80">
                Join 500+ local businesses already growing with us.
              </p>
            </div>
            <a
              href="/submit-listing?plan=free"
              className="btn-gold px-8 py-4 rounded-xl text-[#371a5b] font-bold whitespace-nowrap"
            >
              List Your Business
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
