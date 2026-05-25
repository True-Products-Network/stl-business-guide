"use client";

import { Mail, Gift, Star, Zap } from "lucide-react";

const benefits = [
  { icon: Gift, text: "Exclusive deals & coupons" },
  { icon: Star, text: "New business announcements" },
  { icon: Zap, text: "Local event updates" },
];

export default function Newsletter() {
  return (
    <section className="section-padding bg-gradient-to-br from-[#371a5b] via-[#54afe6] to-[#bb7ce4] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#ffc107]/10 rounded-full blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white flex flex-col justify-center h-full">
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

          {/* Right Content - GHL Newsletter Form (no background) */}
          <div>
            <div className="w-full" style={{ height: '934px' }}>
              <iframe
                src="https://link.leadprospectrr.com/widget/form/5e01wgF05YFBhAevtaLC"
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '25px' }}
                id="inline-5e01wgF05YFBhAevtaLC"
                data-layout="{'id':'INLINE'}"
                data-trigger-type="alwaysShow"
                data-trigger-value=""
                data-activation-type="alwaysActivated"
                data-activation-value=""
                data-deactivation-type="neverDeactivate"
                data-deactivation-value=""
                data-form-name="Subscribe to Our Newsletter"
                data-height="934"
                data-layout-iframe-id="inline-5e01wgF05YFBhAevtaLC"
                data-form-id="5e01wgF05YFBhAevtaLC"
                title="Subscribe to Our Newsletter"
              />
            </div>
          </div>
        </div>
      </div>

      {/* GHL Form Embed Script */}
      <script src="https://link.leadprospectrr.com/js/form_embed.js" async />
    </section>
  );
}
