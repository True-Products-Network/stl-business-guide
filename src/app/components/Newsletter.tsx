"use client";

import { Mail, Gift, Star, Zap } from "lucide-react";

const benefits = [
  { icon: Gift, text: "Exclusive deals & coupons" },
  { icon: Star, text: "New business announcements" },
  { icon: Zap, text: "Local event updates" },
];

export default function Newsletter() {
  return (
    <section className="py-12 bg-gradient-to-br from-[#371a5b] via-[#54afe6] to-[#bb7ce4] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#ffc107]/10 rounded-full blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-24 pt-16">
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-white/20 text-white/90 text-sm font-medium">
            Stay Updated
          </span>
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Newsletter
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Get the latest local business news and exclusive deals delivered to your inbox
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white self-start">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Join 5,000+ Subscribers</span>
            </div>

            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Stay Connected with Local Deals
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Get the best local deals, new business announcements, and exclusive offers 
              delivered straight to your inbox every week.
            </p>

            {/* Benefits */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#ffc107]" />
                    </div>
                    <span className="text-white/90">{benefit.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Content - Stats & Benefits */}
          <div className="grid grid-cols-2 gap-6">
            {/* Stat Card 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-[#ffc107] mb-2">500+</div>
              <div className="text-white/80">Local Businesses</div>
            </div>
            
            {/* Stat Card 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-[#ffc107] mb-2">5,000+</div>
              <div className="text-white/80">Happy Customers</div>
            </div>
            
            {/* Stat Card 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-[#ffc107] mb-2">50+</div>
              <div className="text-white/80">Weekly Deals</div>
            </div>
            
            {/* Stat Card 4 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-[#ffc107] mb-2">100%</div>
              <div className="text-white/80">Local Focus</div>
            </div>
            
            {/* Newsletter Preview */}
            <div className="col-span-2 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">What You'll Get</h3>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#ffc107] rounded-full mr-3"></span>
                  Weekly community updates and local news
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#ffc107] rounded-full mr-3"></span>
                  Exclusive discounts from VIP businesses
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#ffc107] rounded-full mr-3"></span>
                  New business announcements and grand openings
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#ffc107] rounded-full mr-3"></span>
                  Local events and networking opportunities
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* GHL Form Embed Script */}
      <script src="https://link.leadprospectrr.com/js/form_embed.js" async />
    </section>
  );
}
