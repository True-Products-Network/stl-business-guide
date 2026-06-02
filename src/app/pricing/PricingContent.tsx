'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Check, Crown, Star, Zap, Loader2, XCircle } from "lucide-react";
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

const planFeatures = {
  free: [
    "Business name and contact info",
    "1 category",
    "Basic description",
    "Standard search placement",
    "Phone & email display",
  ],
  premium: [
    "Everything in Free, plus:",
    "Up to 5 categories",
    "5 photos/images",
    "Priority search placement",
    "Website link",
    "Social media links",
    "Business hours",
    "Customer reviews",
    "Analytics Dashboard",
    "Weekly performance report",
    "Email Support",
  ],
  vip: [
    "Everything in Premium, plus:",
    "VIP badge & branding",
    "Unlimited categories",
    "10 photos + 1 video",
    "Top search placement",
    "Featured on homepage",
    "Banner ad placement",
    "Enhanced Analytics dashboard",
    "Coupon/Deal listing (10% revenue share)",
    "Featured in Weekly Newsletter",
    "Social media promotion",
    "Priority support",
    "Dedicated Account Manager",
  ]
};

export default function PricingContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);
  const [upgradeBusinessId, setUpgradeBusinessId] = useState<string | null>(null);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [isFoundingMember, setIsFoundingMember] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const canceledParam = searchParams.get('canceled');
    if (canceledParam === 'true') {
      setCanceled(true);
    }
    
    const upgradeParam = searchParams.get('upgrade');
    if (upgradeParam) {
      setUpgradeBusinessId(upgradeParam);
    }

    fetchPricingData();
  }, [searchParams]);

  const fetchPricingData = async () => {
    try {
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
        ]);

      if (error) {
        console.error('Error fetching pricing:', error);
        return;
      }

      const settings: Record<string, any> = {};
      settingsData?.forEach((s: any) => {
        settings[s.setting_key] = s.setting_value;
      });

      const isEnabled = settings.founding_member_enabled === 'true' || settings.founding_member_enabled === 'enabled';
      const endDate = settings.founding_member_end_date ? new Date(settings.founding_member_end_date) : null;
      const isActive = isEnabled && endDate ? endDate > new Date() : false;
      
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
      setDataLoading(false);
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

  const handleCheckout = async (planKey: string, planName: string) => {
    if (upgradeBusinessId) {
      setLoading(planKey);
      try {
        const response = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: planKey,
            planName: planName,
            businessId: upgradeBusinessId,
            businessName: 'Business Upgrade',
          }),
        });

        const data = await response.json();

        if (data.success && data.url) {
          window.location.href = data.url;
        } else {
          alert(`Failed to start checkout: ${data.error || 'Unknown error'}`);
          setLoading(null);
        }
      } catch (error) {
        console.error('Checkout error:', error);
        alert('Failed to start checkout. Please try again.');
        setLoading(null);
      }
    } else {
      window.location.href = `/submit-listing?plan=${planKey}`;
    }
  };

  if (dataLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-[#54afe6]" />
        </div>
        <Footer />
      </main>
    );
  }

  const premiumDisplayPrice = getDisplayPrice('premium');
  const vipDisplayPrice = getDisplayPrice('vip');
  const premiumRegularPrice = getRegularPrice('premium');
  const vipRegularPrice = getRegularPrice('vip');

  // Calculate savings percentages
  const premiumSavings = pricingData && isFoundingMember
    ? Math.round(((pricingData.premium_regular_price - pricingData.premium_monthly_price) / pricingData.premium_regular_price) * 100)
    : 0;
  const vipSavings = pricingData && isFoundingMember
    ? Math.round(((pricingData.vip_regular_price - pricingData.vip_monthly_price) / pricingData.vip_regular_price) * 100)
    : 0;

  const plans = [
    {
      name: "Free",
      icon: Star,
      price: "$0",
      displayPrice: "$0",
      period: "/month",
      description: "Get started with a basic listing",
      features: planFeatures.free,
      cta: "Get Started Free",
      href: "/submit-listing?plan=free",
      popular: false,
      color: "gray",
      foundingMember: false,
    },
    {
      name: "Premium",
      icon: Zap,
      price: `$${premiumDisplayPrice}`,
      regularPrice: premiumRegularPrice ? `$${premiumRegularPrice}` : null,
      period: "/month",
      description: "Enhanced visibility & features",
      features: planFeatures.premium,
      cta: "Start Premium Trial",
      href: "/submit-listing?plan=premium",
      popular: true,
      color: "blue",
      foundingMember: isFoundingMember,
    },
    {
      name: "VIP",
      icon: Crown,
      price: `$${vipDisplayPrice}`,
      regularPrice: vipRegularPrice ? `$${vipRegularPrice}` : null,
      period: "/month",
      description: "Maximum exposure & leads",
      features: planFeatures.vip,
      cta: "Go VIP",
      href: "/submit-listing?plan=vip",
      popular: false,
      color: "gold",
      foundingMember: isFoundingMember,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Choose Your Plan
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Get your business in front of thousands of local customers. 
            Upgrade anytime to unlock more features.
          </p>
          {isFoundingMember && pricingData && (
            <div className="mt-6 bg-white/20 rounded-xl p-4 inline-block">
              <p className="font-semibold">🎉 Founding Member Special!</p>
              <p className="text-sm">Save up to {vipSavings}% on VIP - Best Value!</p>
            </div>
          )}
        </div>
      </div>

      {canceled && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#371a5b] mb-2">Payment Canceled</h3>
              <p className="text-gray-600 mb-6">
                No worries! Click the button below to return to your dashboard and try again.
              </p>
              <a 
                href="/dashboard"
                className="block w-full bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition text-center"
              >
                Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 pb-20 pt-6">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden ${
                  plan.popular ? 'ring-4 ring-[#54afe6] transform md:-translate-y-4' : ''
                }`}
              >
                <div
                  className={`p-6 ${
                    plan.color === 'gold'
                      ? 'bg-gradient-to-r from-[#ffc107] to-[#f68712]'
                      : plan.color === 'blue'
                      ? 'bg-gradient-to-r from-[#54afe6] to-[#bb7ce4]'
                      : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon
                      className={`w-8 h-8 ${
                        plan.color === 'gray' ? 'text-gray-600' : 'text-white'
                      }`}
                    />
                    {plan.popular && (
                      <span className="bg-white text-[#54afe6] px-3 py-1 rounded-full text-sm font-bold">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <h2
                    className={`text-2xl font-bold mb-1 ${
                      plan.color === 'gray' ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    {plan.name}
                  </h2>
                  <p
                    className={`text-sm ${
                      plan.color === 'gray' ? 'text-gray-600' : 'text-white/80'
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="p-6 border-b">
                  {plan.foundingMember && plan.regularPrice ? (
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-[#371a5b]">{plan.price}</span>
                        <span className="text-gray-500 ml-1">{plan.period}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-400 line-through text-sm">{plan.regularPrice}{plan.period}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${plan.name === 'VIP' ? 'bg-gradient-to-r from-[#ffc107] to-[#f68712] text-white' : 'bg-green-100 text-green-700'}`}>{plan.name === 'VIP' ? `⭐ BEST VALUE - Save ${vipSavings}%` : `Save ${premiumSavings}%`}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-[#371a5b]">{plan.price}</span>
                      <span className="text-gray-500 ml-1">{plan.period}</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check
                          className={`w-5 h-5 mr-3 flex-shrink-0 ${
                            plan.color === 'gold'
                              ? 'text-[#ffc107]'
                              : plan.color === 'blue'
                              ? 'text-[#54afe6]'
                              : 'text-gray-500'
                          }`}
                        />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.name === 'Free' ? (
                    <Link
                      href={plan.href}
                      className="block w-full text-center py-3 rounded-xl font-semibold mt-6 bg-gray-100 text-gray-900 hover:bg-gray-200 transition"
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleCheckout(plan.name.toLowerCase(), plan.name)}
                      disabled={loading === plan.name.toLowerCase()}
                      className={`block w-full text-center py-3 rounded-xl font-semibold mt-6 transition ${
                        plan.popular
                          ? 'bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white hover:opacity-90'
                          : plan.color === 'gold'
                          ? 'bg-gradient-to-r from-[#ffc107] to-[#f68712] text-white hover:opacity-90'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading === plan.name.toLowerCase() ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        plan.cta
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </main>
  );
}
