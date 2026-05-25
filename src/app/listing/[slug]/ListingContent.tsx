"use client";

import { useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Mail,
  Crown,
  BadgeCheck,
} from "lucide-react";

interface ListingContentProps {
  business: any;
}

export default function ListingContent({ business }: ListingContentProps) {
  const planKey = business.plan_key || "premium";
  const isVip = planKey === "vip";
  const isPremium = planKey === "premium";
  const mainCategory = business.categories?.[0]?.name || "Business";
  const otherCategories = business.categories?.slice(1) || [];

  // Track page view on mount
  useEffect(() => {
    if (business?.id) {
      trackAnalytics("profile_views");
    }
  }, [business?.id]);

  // Analytics tracking function
  async function trackAnalytics(metric: string) {
    try {
      await supabase.rpc("increment_analytics", {
        p_business_id: business.id,
        p_metric: metric,
      });
    } catch (err) {
      console.error("Analytics error:", err);
    }
  }

  // Handle click tracking
  function handleClick(metric: string, href: string) {
    trackAnalytics(metric);
    // Allow default navigation
  }

  return (
    <>
      {/* Plan Type Banner */}
      <div
        className={`${
          isVip
            ? "bg-gradient-to-r from-[#ffc107] to-[#f68712]"
            : "bg-gradient-to-r from-[#54afe6] to-[#bb7ce4]"
        } text-white py-3`}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            {isVip ? (
              <Crown className="w-5 h-5" />
            ) : (
              <BadgeCheck className="w-5 h-5" />
            )}
            <span className="font-bold">
              {isVip ? "VIP" : "Premium"} Business Listing
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section with Image */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-[#371a5b] to-[#bb7ce4]">
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={business.business_name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/30 text-8xl font-bold">
              {business.business_name[0]}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        {/* Business Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <span className="text-white/80 text-sm font-medium mb-2 block">
              {mainCategory}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              {business.business_name}
            </h1>

            {/* Google Rating */}
            <div className="flex items-center">
              <Star className="w-5 h-5 text-[#ffc107] fill-current" />
              <span className="text-white font-semibold ml-1">
                {business.google_rating || "4.5"}
              </span>
              <span className="text-white/70 ml-1">
                ({business.google_reviews_count || "0"} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Short Description */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#371a5b] mb-4">About</h2>
              {business.description_short ? (
                <p className="text-gray-600 leading-relaxed">
                  {business.description_short}
                </p>
              ) : (
                <p className="text-gray-500 italic">No description available</p>
              )}
            </div>

            {/* Long Description if available */}
            {business.description_long && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-[#371a5b] mb-4">
                  Details
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {business.description_long}
                </p>
              </div>
            )}

            {/* Categories */}
            {business.categories && business.categories.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-[#371a5b] mb-4">
                  Categories
                </h2>
                <div className="flex flex-wrap gap-2">
                  {business.categories.map(
                    (cat: { name: string }, idx: number) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-[#54afe6]/10 text-[#54afe6] rounded-lg font-medium"
                      >
                        {cat.name}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#371a5b] mb-4">
                Contact This Business
              </h2>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#371a5b] mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                {/* Telephone */}
                {business.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-[#54afe6] mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <a
                        href={`tel:${business.phone}`}
                        onClick={() => handleClick("phone_clicks", "")}
                        className="text-gray-800 font-medium hover:text-[#54afe6]"
                      >
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {business.email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-[#54afe6] mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <a
                        href={`mailto:${business.email}`}
                        onClick={() => handleClick("email_clicks", "")}
                        className="text-gray-800 font-medium hover:text-[#54afe6] truncate block max-w-[200px]"
                      >
                        {business.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Website */}
                {business.website_url && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-[#54afe6] mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <a
                        href={business.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleClick("website_clicks", "")}
                        className="text-[#54afe6] font-medium hover:underline truncate block max-w-[200px]"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}

                {/* Location */}
                {(business.city || business.state) && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-[#54afe6] mr-3 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-gray-800 font-medium">
                        {business.city}
                        {business.city && business.state ? ", " : ""}
                        {business.state}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#371a5b] mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    onClick={() => handleClick("phone_clicks", "")}
                    className="flex items-center justify-center w-full py-3 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </a>
                )}
                {business.website_url && (
                  <a
                    href={business.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleClick("website_clicks", "")}
                    className="flex items-center justify-center w-full py-3 border-2 border-[#371a5b] text-[#371a5b] rounded-lg font-semibold hover:bg-[#371a5b] hover:text-white transition"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>

            {/* Other Categories */}
            {otherCategories.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-[#371a5b] mb-4">
                  Also Listed In
                </h2>
                <div className="flex flex-wrap gap-2">
                  {otherCategories.map(
                    (cat: { name: string }, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        {cat.name}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Claim Listing */}
            <div className="bg-gradient-to-r from-[#54afe6]/10 to-[#bb7ce4]/10 rounded-xl p-6 border border-[#54afe6]/20">
              <h3 className="font-bold text-[#371a5b] mb-2">
                Own this business?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Claim your listing to update information, add photos, and
                respond to reviews.
              </p>
              <Link
                href={`/claim-listing?business=${business.id}`}
                className="block text-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Claim Listing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
