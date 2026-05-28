"use client";

import { Check, Star, Crown, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Free Listing",
    price: "$0",
    period: "forever",
    description: "Perfect for businesses just getting started",
    icon: Star,
    color: "from-gray-400 to-gray-500",
    features: [
      "Basic business listing",
      "Contact information display",
      "1 category inclusion",
      "Standard search placement",
      "Monthly performance report",
    ],
    notIncluded: [
      "Featured placement",
      "Photo gallery",
      "Customer reviews highlight",
      "Social media integration",
      "Priority support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Premium",
    price: "$97",
    period: "per month",
    description: "Great for growing businesses seeking more visibility",
    icon: Zap,
    color: "from-[#54afe6] to-[#bb7ce4]",
    features: [
      "Everything in Free, plus:",
      "Featured placement on homepage",
      "Photo gallery (up to 5 photos)",
      "3 category inclusions",
      "Customer reviews showcase",
      "Social media integration",
      "Weekly performance report",
      "Email support",
    ],
    notIncluded: [
      "VIP badge",
      "Top search priority",
      "Dedicated account manager",
    ],
    cta: "Upgrade to Premium",
    popular: true,
  },
  {
    name: "VIP",
    price: "$497",
    period: "per month",
    description: "Maximum exposure for serious business growth",
    icon: Crown,
    color: "from-[#ffc107] to-[#f68712]",
    features: [
      "Everything in Premium, plus:",
      "VIP badge & branding",
      "Top priority in all searches",
      "Up to 10 photos + 1 brand video",
      "Unlimited categories",
      "Featured in newsletter",
      "Social media promotion",
      "Dedicated account manager",
      "Priority phone support",
      "Custom marketing materials",
    ],
    notIncluded: [],
    cta: "Become VIP",
    popular: false,
  },
];

export default function MembershipTiers() {
  return (
    <section id="pricing" className="section-padding bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-[#ffc107]/10 text-[#f68712] rounded-full text-sm font-semibold mb-4">
            Membership Plans
          </span>
          <h2 className="text-4xl font-bold text-[#371a5b] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Choose Your Plan
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            From free listings to VIP treatment, we have a plan that fits every business. 
            Upgrade anytime as your business grows.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`relative bg-white rounded-3xl p-8 shadow-xl card-hover ${
                  tier.popular ? 'ring-4 ring-[#54afe6]/30 scale-105' : ''
                }`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#54afe6] to-[#bb7ce4] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Name & Description */}
                <h3 className="text-2xl font-bold text-center text-[#371a5b] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {tier.name}
                </h3>
                <p className="text-gray-600 text-center text-sm mb-6">{tier.description}</p>

                {/* Price */}
                <div className="text-center mb-8">
                  <span className="text-5xl font-bold text-[#371a5b]">{tier.price}</span>
                  <span className="text-gray-500 ml-2">/{tier.period}</span>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#86c540]/20 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-[#86c540]" />
                      </div>
                      <span className="ml-3 text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                  {tier.notIncluded.map((feature, index) => (
                    <div key={`not-${index}`} className="flex items-start opacity-50">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center mt-0.5">
                        <span className="text-gray-400 text-xs">×</span>
                      </div>
                      <span className="ml-3 text-gray-500 text-sm line-through">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={tier.name === 'Free Listing' ? '/submit-listing?plan=free' : '/pricing'}
                  className={`flex items-center justify-center w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                    tier.popular
                      ? 'btn-primary text-white'
                      : tier.name === 'VIP'
                      ? 'btn-gold text-[#371a5b]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            All plans include: Secure hosting, SSL certificate, mobile optimization, and SEO-friendly structure.
          </p>
          <p className="text-sm text-gray-500">
            Need a custom plan?{" "}
            <Link href="/contact" className="text-[#54afe6] hover:underline font-medium">
              Contact us
            </Link>{" "}
            for enterprise solutions.
          </p>
        </div>
      </div>
    </section>
  );
}
