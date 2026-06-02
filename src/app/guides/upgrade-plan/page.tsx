'use client'

import { useEffect, useState } from 'react'
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { ArrowLeft, CheckCircle, Star, DollarSign, Crown, ArrowRight, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface PlanData {
  id: string
  plan_key: string
  plan_name: string
  monthly_price: number
  yearly_price: number
  max_images: number
  allows_coupon: boolean
  allows_video: boolean
  allows_banner_ads: boolean
  allows_social_links: boolean
  allows_priority_placement: boolean
}

interface PricingSettings {
  premium_monthly_price: number
  vip_monthly_price: number
  premium_regular_price: number
  vip_regular_price: number
  founding_member_discount_percent: number
  founding_member_end_date: string | null
  founding_member_enabled: boolean
}

const planFeatures: Record<string, string[]> = {
  free: [
    "Basic business listing",
    "1 category",
    "Contact information",
    "Standard search placement",
    "Basic analytics"
  ],
  premium: [
    "Everything in Free, plus:",
    "Priority search placement",
    "Up to 5 categories",
    "Social media links",
    "Business hours display",
    "Photo gallery (10 photos)",
    "Review management",
    "Enhanced analytics"
  ],
  vip: [
    "Everything in Premium, plus:",
    "Top search placement",
    "Unlimited categories",
    "Unlimited photos",
    "Featured listing badge",
    "Priority support",
    "Custom branding options",
    "Advanced analytics dashboard",
    "Coupon management"
  ]
}

const planNotIncluded: Record<string, string[]> = {
  free: [
    "Priority placement",
    "Social media links",
    "Business hours display",
    "Photo gallery",
    "Review management"
  ]
}

const steps = [
  "Log into your Business Owner Dashboard",
  "Click 'Upgrade Plan' or 'Billing' in the menu",
  "Review the plan comparison",
  "Select your preferred plan",
  "Enter payment information",
  "Confirm your upgrade",
  "Start enjoying premium features immediately!"
]

export default function UpgradePlanGuide() {
  const [plans, setPlans] = useState<PlanData[]>([])
  const [pricingSettings, setPricingSettings] = useState<PricingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFoundingMember, setIsFoundingMember] = useState(false)

  useEffect(() => {
    fetchPlansAndPricing()
  }, [])

  const fetchPlansAndPricing = async () => {
    try {
      // Fetch listing plans from database
      const { data: plansData, error: plansError } = await supabase
        .from('listing_plans')
        .select('*')
        .eq('is_active', true)
        .order('featured_priority', { ascending: true })

      if (plansError) {
        console.error('Error fetching plans:', plansError)
      } else {
        setPlans(plansData || [])
      }

      // Fetch pricing settings from system_settings table
      const { data: settingsData, error: settingsError } = await supabase
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

      if (settingsError) {
        console.error('Error fetching settings:', settingsError)
      } else {
        const settings: Record<string, any> = {}
        settingsData?.forEach((s: any) => {
          settings[s.setting_key] = s.setting_value
        })

        const isEnabled = settings.founding_member_enabled === 'true' || settings.founding_member_enabled === 'enabled'
        const endDate = settings.founding_member_end_date ? new Date(settings.founding_member_end_date) : null
        const isActive = isEnabled && endDate ? endDate > new Date() : false
        
        setPricingSettings({
          premium_monthly_price: parseFloat(settings.premium_monthly_price) || 47,
          vip_monthly_price: parseFloat(settings.vip_monthly_price) || 97,
          premium_regular_price: parseFloat(settings.premium_regular_price) || 97,
          vip_regular_price: parseFloat(settings.vip_regular_price) || 497,
          founding_member_discount_percent: parseInt(settings.founding_member_discount_percent) || 50,
          founding_member_end_date: settings.founding_member_end_date,
          founding_member_enabled: isEnabled
        })

        setIsFoundingMember(isActive)
      }
    } catch (err) {
      console.error('Exception fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate display price based on whether founding member pricing is active
  const getDisplayPrice = (planKey: string) => {
    if (!pricingSettings) return planKey === 'premium' ? 47 : 97
    
    // If founding member is active, use the discounted price
    if (isFoundingMember && pricingSettings.founding_member_enabled) {
      return planKey === 'premium' ? pricingSettings.premium_monthly_price : pricingSettings.vip_monthly_price
    }
    
    // Otherwise use regular price
    return planKey === 'premium' ? pricingSettings.premium_regular_price : pricingSettings.vip_regular_price
  }

  // Get the "regular" price for strikethrough display (only shown when founding member is active)
  const getRegularPrice = (planKey: string) => {
    if (!isFoundingMember || !pricingSettings || !pricingSettings.founding_member_enabled) {
      return null
    }
    return planKey === 'premium' ? pricingSettings.premium_regular_price : pricingSettings.vip_regular_price
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return null
    return price === 0 ? '$0' : `$${price}`
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-[#54afe6]" />
        </div>
      </main>
    )
  }

  // Build plan display data from database
  const planDisplayData = [
    {
      name: "Free",
      planKey: "free",
      price: "$0",
      displayPrice: "$0",
      regularPrice: null as string | null,
      period: "forever",
      color: "from-gray-400 to-gray-500",
      features: planFeatures.free,
      notIncluded: planNotIncluded.free,
      popular: false,
      foundingMember: false
    },
    {
      name: "Premium",
      planKey: "premium",
      price: formatPrice(getDisplayPrice('premium')),
      displayPrice: formatPrice(getDisplayPrice('premium')),
      regularPrice: formatPrice(getRegularPrice('premium')),
      period: "per month",
      color: "from-[#54afe6] to-[#371a5b]",
      features: planFeatures.premium,
      popular: true,
      foundingMember: isFoundingMember
    },
    {
      name: "VIP",
      planKey: "vip",
      price: formatPrice(getDisplayPrice('vip')),
      displayPrice: formatPrice(getDisplayPrice('vip')),
      regularPrice: formatPrice(getRegularPrice('vip')),
      period: "per month",
      color: "from-[#ffc107] to-[#f68712]",
      features: planFeatures.vip,
      popular: false,
      foundingMember: isFoundingMember
    }
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#f68712] to-[#ffc107] text-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/guides" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Guides
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Upgrading Your Plan
          </h1>
          <p className="text-xl text-white/80">
            Compare plans and learn how to upgrade for more features and visibility
          </p>
          <div className="flex items-center gap-4 mt-6 text-white/60">
            <span>Plan comparison</span>
            <span>•</span>
            <span>5 min read</span>
          </div>
          
          {isFoundingMember && pricingSettings && (
            <div className="mt-6 bg-white/20 rounded-xl p-4 inline-block">
              <p className="font-semibold">🎉 Founding Member Special!</p>
              <p className="text-sm">Save {pricingSettings.founding_member_discount_percent}% on Premium & VIP plans</p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Plan Comparison */}
        <h2 className="text-3xl font-bold text-[#371a5b] mb-8 text-center">Plan Comparison</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {planDisplayData.map((plan) => (
            <div key={plan.name} className={`bg-white rounded-2xl shadow-lg overflow-hidden ${plan.popular ? 'ring-4 ring-[#54afe6]' : ''}`}>
              {plan.popular && (
                <div className="bg-gradient-to-r from-[#54afe6] to-[#371a5b] text-white text-center py-2 text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}
              <div className={`bg-gradient-to-br ${plan.color} p-6 text-white text-center`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.displayPrice}</span>
                  <span className="text-white/80">/{plan.period}</span>
                </div>
                {plan.foundingMember && plan.regularPrice && (
                  <div className="mt-2">
                    <span className="text-sm line-through opacity-70">{plan.regularPrice}/{plan.period}</span>
                    <span className="ml-2 bg-white/30 px-2 py-0.5 rounded-full text-xs font-semibold">Founding Member</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#86c540] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded?.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 opacity-50">
                      <span className="w-5 h-5 flex-shrink-0 text-gray-400 text-center">×</span>
                      <span className="text-gray-500 text-sm line-through">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* How to Upgrade */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-[#371a5b] mb-6 flex items-center gap-3">
            <Crown className="w-8 h-8 text-[#ffc107]" />
            How to Upgrade
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f68712] to-[#ffc107] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700 pt-1">{step}</p>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-[#371a5b]/5 to-[#bb7ce4]/5 rounded-xl p-6">
              <h3 className="font-semibold text-[#371a5b] mb-4">Why Upgrade?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-[#ffc107] flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Get seen first in search results</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-[#ffc107] flex-shrink-0" />
                  <span className="text-gray-700 text-sm">More photos = more engagement</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-[#ffc107] flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Social proof with reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-[#ffc107] flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Detailed analytics to track growth</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-[#ffc107] flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Stand out with featured badges</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#371a5b] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-[#371a5b] mb-2">Can I downgrade later?</h3>
              <p className="text-gray-600">Yes, you can downgrade at any time. Your premium features will remain active until the end of your billing period.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-[#371a5b] mb-2">Is there a contract?</h3>
              <p className="text-gray-600">No contracts! All plans are month-to-month. Cancel anytime.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-[#371a5b] mb-2">What payment methods are accepted?</h3>
              <p className="text-gray-600">We accept all major credit cards (Visa, Mastercard, American Express, Discover).</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#371a5b] mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">We offer a 14-day money-back guarantee if you're not satisfied with your upgrade.</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link href="/guides/understanding-analytics">
            <button className="text-gray-600 hover:text-[#371a5b] font-medium inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </button>
          </Link>
          <Link href="/guides">
            <button className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition inline-flex items-center">
              Back to All Guides <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
