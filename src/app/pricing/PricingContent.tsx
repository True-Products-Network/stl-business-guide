'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Check, Crown, Star, Zap, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    icon: Star,
    price: "$0",
    period: "/month",
    description: "Get started with a basic listing",
    features: [
      "Business name and contact info",
      "1 category",
      "Basic description",
      "Standard search placement",
      "Phone & email display",
    ],
    cta: "Get Started Free",
    href: "/submit-listing?plan=free",
    popular: false,
    color: "gray",
  },
  {
    name: "Premium",
    icon: Zap,
    price: "$47",
    regularPrice: "$97",
    period: "/month",
    description: "Enhanced visibility & features",
    features: [
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
    cta: "Start Premium Trial",
    href: "/submit-listing?plan=premium",
    popular: true,
    color: "blue",
    foundingMember: true,
  },
  {
    name: "VIP",
    icon: Crown,
    price: "$97",
    regularPrice: "$497",
    period: "/month",
    description: "Maximum exposure & leads",
    features: [
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
    ],
    cta: "Go VIP",
    href: "/submit-listing?plan=vip",
    popular: false,
    color: "gold",
    foundingMember: true,
  },
];

export default function PricingContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);
  const [upgradeBusinessId, setUpgradeBusinessId] = useState<string | null>(null);

  // Handle initial load and URL changes
  useEffect(() => {
    console.log('Pricing page loaded, searchParams:', window.location.search);
    
    const canceledParam = searchParams.get('canceled');
    if (canceledParam === 'true') {
      console.log('Payment was canceled');
      setCanceled(true);
    }
    
    // Store upgrade parameter in state and localStorage so it persists after cancellation
    const upgradeParam = searchParams.get('upgrade');
    console.log('upgradeParam from URL:', upgradeParam);
    
    if (upgradeParam) {
      console.log('Setting upgradeBusinessId:', upgradeParam);
      setUpgradeBusinessId(upgradeParam);
      localStorage.setItem('upgradeBusinessId', upgradeParam);
      console.log('Stored in localStorage');
    } else {
      // Try to get from localStorage if not in URL (e.g., after Stripe cancellation)
      const storedId = localStorage.getItem('upgradeBusinessId');
      console.log('storedId from localStorage:', storedId);
      if (storedId) {
        console.log('Using stored upgradeBusinessId:', storedId);
        setUpgradeBusinessId(storedId);
      }
    }
  }, []); // Run once on mount

  const handleCheckout = async (planKey: string, planName: string) => {
    if (upgradeBusinessId) {
      // This is an upgrade - go straight to Stripe checkout
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
      // New listing - redirect to submit listing page
      window.location.href = `/submit-listing?plan=${planKey}`;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Choose Your Plan
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Get your business in front of thousands of local customers. 
            Upgrade anytime to unlock more features.
          </p>
        </div>
      </div>

      {/* Canceled Banner */}
      {canceled && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800">Payment Canceled</p>
              <p className="text-yellow-700 text-sm">No worries! You can try again anytime or choose a different plan.</p>
            </div>
            <button 
              onClick={() => setCanceled(false)}
              className="ml-auto text-yellow-600 hover:text-yellow-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 pb-20 pt-6">
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
                {/* Plan Header */}
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

                {/* Price */}
                <div className="p-6 border-b">
                  {plan.foundingMember ? (
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-[#371a5b]">{plan.price}</span>
                        <span className="text-gray-500 ml-1">{plan.period}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-400 line-through text-sm">{plan.regularPrice}{plan.period}</span>
                        <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">Founding Member</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-[#371a5b]">{plan.price}</span>
                      <span className="text-gray-500 ml-1">{plan.period}</span>
                    </div>
                  )}
                </div>

                {/* Features */}
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

                  {/* CTA */}
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

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-[#371a5b] text-center mb-12" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: "Can I upgrade or downgrade anytime?",
                a: "Yes! You can upgrade to Premium or VIP at any time. Your new features will be activated immediately.",
              },
              {
                q: "How do I get featured on the homepage?",
                a: "VIP listings automatically get featured placement on the homepage. Premium listings may also be featured based on availability.",
              },
              {
                q: "Is there a setup fee?",
                a: "No setup fees! Just choose your plan and start listing your business right away.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards. Monthly billing is automatic.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-[#371a5b] mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
