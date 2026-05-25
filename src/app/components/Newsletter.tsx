"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle, Gift, Star, Zap } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail("");
      }, 3000);
    }
  };

  const benefits = [
    { icon: Gift, text: "Exclusive deals & coupons" },
    { icon: Star, text: "New business announcements" },
    { icon: Zap, text: "Local event updates" },
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-[#371a5b] via-[#54afe6] to-[#bb7ce4] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#ffc107]/10 rounded-full blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
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

          {/* Right Content - Form */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-[#371a5b] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Subscribe to Our Newsletter
            </h3>
            <p className="text-gray-600 mb-6">
              Join our community and never miss out on local deals!
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#54afe6] focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="consent"
                  className="mt-1 w-4 h-4 text-[#54afe6] rounded border-gray-300 focus:ring-[#54afe6]"
                  required
                />
                <label htmlFor="consent" className="ml-3 text-sm text-gray-600">
                  I agree to receive marketing emails and accept the{" "}
                  <a href="/privacy" className="text-[#54afe6] hover:underline">Privacy Policy</a>
                  .
                </label>
              </div>

              <a
                href="/contact"
                className="w-full btn-primary py-4 rounded-xl text-white font-semibold flex items-center justify-center space-x-2"
              >
                <span>Subscribe Now</span>
                <Send className="w-5 h-5" />
              </a>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
