"use client";

import { useEffect, useState } from "react";
import { Check, Star, Crown, Zap, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface PricingData {
  premium_monthly_price: number;
  vip_monthly_price: number;
  premium_regular_price: number;
  vip_regular_price: number;
  founding_member_discount_percent: number;
  founding_member_end_date: string | null;
  founding_member_enabled: boolean;
}

const tierFeatures = {
  free: {
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
  },
  premium: {
    features: [
      "Everything in Free, plus:",
      "Featured placement on homepage",
      "Photo gallery (up to 5 photos)",
      "5 category inclusions",
      "Customer reviews showcase",
      "Social media integration",
      "Analytics Dashboard",
      "Weekly performance report",
      "Email support",
    ],
    notIncluded: [
      "VIP badge",
      "Top search priority",
      "Dedicated account manager",
    ],
  },
  vip: {
    features: [
      "Everything in Premium, plus:",
      "VIP badge & branding",
      "Top priority in all searches",
      "Up to 10 photos + 1 video",
      "Unlimited categories",
      "Featured in newsletter",
      "Social media promotion",
      "Enhanced Analytics dashboard",
      "Coupon/Deal listing (10% revenue share)",
      "Priority support",
      "Dedicated Account Manager",
    ],
    notIncluded: [],
  },
};

export default function MembershipTiers() {
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [isFoundingMember, setIsFoundingMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      // Add cache-busting timestamp
      const timestamp = new Date().getTime();
      const { data: settingsData, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'premium_monthly_price',
          'vip_monthly_price',
          'premium_regular_price',
          'vip_regular_price',
          'founding_member_discount_percent',
          'founding_member_end_date',
          'founding_member_enabled'
        ])
        .limit(100); // Force fresh query

      if (error) {
        console.error('Error fetching pricing:', error);
        return;
      }

      const settings: Record<string, any> = {};
      settingsData?.forEach((s: any) => {
        settings[s.setting_key] = s.setting_value;
      });

      // Check if founding member is enabled - handle various formats
      const enabledValue = settings.founding_member_enabled?.toString().toLowerCase().trim();
      const isEnabled = enabledValue === 'true' || enabledValue === 'enabled' || enabledValue === 'yes' || enabledValue === '1';
      
      console.log('Founding member enabled value:', settings.founding_member_enabled, '-> isEnabled:', isEnabled);
      
      const endDate = settings.founding_member_end_date ? new Date(settings.founding_member_end_date) : null;
      const now = new Date();
      const isActive = isEnabled && endDate ? endDate > now : false;
      
      console.log('End date:', settings.founding_member_end_date, '-> isActive:', isActive);
      console.log('Final isFoundingMember:', isActive);
      
      setPricingData({
        premium_monthly_price: parseFloat(settings.premium_monthly_price) || 47,
        vip_monthly_price: parseFloat(settings.vip_monthly_price) || 97,
        premium_regular_price: parseFloat(settings.premium_regular_price) || 97,
        vip_regular_price: parseFloat(settings.vip_regular_price) || 497,
        founding_member_discount_percent: parseInt(settings.founding_member_discount_percent) || 50,
        founding_member_end_date: settings.founding_member_end_date,
        founding_member_enabled: isEnabled
      });

      setIsFoundingMember(isActive);
    } catch (err) {
      console.error('Exception fetching pricing:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate display price based on whether founding member pricing is active
  const getDisplayPrice = (planKey: 'premium' | 'vip') => {
    if (!pricingData) return planKey === 'premium' ? 47 : 97;
    
    // If founding member is active, use the discounted price
    if (isFoundingMember && pricingData.founding_member_enabled) {
      return planKey === 'premium' ? pricingData.premium_monthly_price : pricingData.vip_monthly_price;
    }
    
    // Otherwise use regular price
    return planKey === 'premium' ? pricingData.premium_regular_price : pricingData.vip_regular_price;
  };

  // Get the "regular" price for strikethrough display (only shown when founding member is active)
  const getRegularPrice = (planKey: 'premium' | 'vip') => {
    if (!isFoundingMember || !pricingData || !pricingData.founding_member_enabled) {
      return null;
    }
    return planKey === 'premium' ? pricingData.premium_regular_price : pricingData.vip_regular_price;
  };

  // Calculate savings percentage for each plan
  const getSavingsPercent = (planKey: 'premium' | 'vip') => {
    if (!isFoundingMember || !pricingData || !pricingData.founding_member_enabled) {
      return null;
    }
    const regularPrice = planKey === 'premium' ? pricingData.premium_regular_price : pricingData.vip_regular_price;
    const currentPrice = planKey === 'premium' ? pricingData.premium_monthly_price : pricingData.vip_monthly_price;
    const savings = Math.round(((regularPrice - currentPrice) / regularPrice) * 100);
    return savings;
  };

  if (loading) {
    return (
      <section id="pricing" className="section-padding bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 animate-spin text-[#54afe6]" />
        </div>
      </section>
    );
  }

  const premiumDisplayPrice = getDisplayPrice('premium');
  const vipDisplayPrice = getDisplayPrice('vip');
  const premiumRegularPrice = getRegularPrice('premium');
  const vipRegularPrice = getRegularPrice('vip');
  const premiumSavings = getSavingsPercent('premium');
  const vipSavings = getSavingsPercent('vip');

  const tiers = [
    {
      name: "Free Listing",
      price: "$0",
      displayPrice: "$0",
      regularPrice: null,
      period: "forever",
      description: "Perfect for businesses just getting started",
      icon: Star,
      color: "from-gray-400 to-gray-500",
      features: tierFeatures.free.features,
      notIncluded: tierFeatures.free.notIncluded,
      cta: "Get Started Free",
      popular: false,
      planKey: "free",
      foundingMember: false,
    },
    {
      name: "Premium",
      price: `$${premiumDisplayPrice}`,
      displayPrice: `$${premiumDisplayPrice}`,
      regularPrice: premiumRegularPrice ? `$${premiumRegularPrice}` : null,
      period: "per month",
      description: "Great for growing businesses seeking more visibility",
      icon: Zap,
      color: "from-[#54afe6] to-[#bb7ce4]",
      features: tierFeatures.premium.features,
      notIncluded: tierFeatures.premium.notIncluded,
      cta: "Upgrade to Premium",
      popular: true,
      planKey: "premium",
      foundingMember: isFoundingMember,
    },
    {
      name: "VIP",
      price: `$${vipDisplayPrice}`,
      displayPrice: `$${vipDisplayPrice}`,
      regularPrice: vipRegularPrice ? `$${vipRegularPrice}` : null,
      period: "per month",
      description: "Maximum exposure for serious business growth",
      icon: Crown,
      color: "from-[#ffc107] to-[#f68712]",
      features: tierFeatures.vip.features,
      notIncluded: tierFeatures.vip.notIncluded,
      cta: "Become VIP",
      popular: false,
      planKey: "vip",
      foundingMember: isFoundingMember,
    },
  ];

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
          {isFoundingMember && pricingData && (
            <div className="mt-6 bg-gradient-to-r from-[#ffc107]/20 to-[#f68712]/20 rounded-xl p-4 inline-block">
              <p className="font-semibold text-[#371a5b]">🎉 Founding Member Special!</p>
              <p className="text-sm text-gray-700">Save up to {vipSavings}% on VIP - Best Value!</p>
            </div>
          )}
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
                  {tier.foundingMember && tier.regularPrice ? (
                    <div>
                      <div>
                        <span className="text-5xl font-bold text-[#371a5b]">{tier.price}</span>
                        <span className="text-gray-500 ml-2">/{tier.period}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-400 line-through">{tier.regularPrice}/{tier.period}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${tier.name === 'VIP' ? 'bg-gradient-to-r from-[#ffc107] to-[#f68712] text-white' : 'bg-green-100 text-green-700'}`}>{tier.name === 'VIP' ? `⭐ BEST VALUE - Save ${vipSavings}%` : `Save ${premiumSavings}%`}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-5xl font-bold text-[#371a5b]">{tier.price}</span>
                      <span className="text-gray-500 ml-2">/{tier.period}</span>
                    </div>
                  )}
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
                  href={`/submit-listing?plan=${tier.planKey}`}
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
