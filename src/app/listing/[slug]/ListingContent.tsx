"use client";

import { useEffect, useState } from "react";
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
  ExternalLink,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";

interface ListingContentProps {
  business: any;
}

export default function ListingContent({ business }: ListingContentProps) {
  const planKey = business.plan_key || "free";
  const isVip = planKey === "vip";
  const isPremium = planKey === "premium";
  const mainCategory = business.categories?.[0]?.name || "Business";
  const otherCategories = business.categories?.slice(1) || [];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Track page view on mount
  useEffect(() => {
    if (business?.listing_id) {
      trackAnalytics("profile_views");
    }
  }, [business?.listing_id]);

  // Analytics tracking function
  async function trackAnalytics(metric: string) {
    try {
      // Use listing_id (business_listings.id) not id (businesses.id)
      const listingId = business.listing_id || business.id;
      console.log("Tracking:", metric, "for listing:", listingId);
      const { data, error } = await supabase.rpc("increment_analytics", {
        p_business_id: listingId,
        p_metric: metric,
      });
      if (error) {
        console.error("Analytics RPC error:", error);
      } else {
        console.log("Analytics tracked successfully:", metric);
      }
    } catch (err) {
      console.error("Analytics error:", err);
    }
  }

  // Handle click tracking
  function handleClick(metric: string) {
    trackAnalytics(metric);
  }

  // Mock gallery images - in production, these would come from business_images table
  const galleryImages = business.logo_url 
    ? [business.logo_url, business.logo_url, business.logo_url] 
    : [];

  return (
    <>
      {/* Plan Type Banner */}
      <div
        className={`${
          isVip
            ? "bg-gradient-to-r from-[#ffc107] to-[#f68712]"
            : isPremium
            ? "bg-gradient-to-r from-[#54afe6] to-[#bb7ce4]"
            : "bg-gradient-to-r from-gray-500 to-gray-600"
        } text-white py-3`}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            {isVip ? (
              <Crown className="w-5 h-5" />
            ) : isPremium ? (
              <BadgeCheck className="w-5 h-5" />
            ) : null}
            <span className="font-bold">
              {isVip ? "VIP" : isPremium ? "Premium" : "Free"} Business Listing
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section with Featured Image */}
      <div className="relative h-80 md:h-96 bg-gradient-to-br from-[#371a5b] to-[#bb7ce4]">
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={business.business_name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/30 text-9xl font-bold">
              {business.business_name[0]}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {/* Back Link */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            href="/listings"
            className="inline-flex items-center text-white/80 hover:text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Link>
        </div>

        {/* Business Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
              {mainCategory}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-3">
              {business.business_name}
            </h1>

            {/* Google Rating */}
            <div className="flex items-center">
              <Star className="w-6 h-6 text-[#ffc107] fill-current" />
              <span className="text-white font-semibold ml-2 text-xl">
                {business.google_rating || "4.5"}
              </span>
              <span className="text-white/70 ml-2">
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
            {/* Full Description */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-[#371a5b] mb-4">About</h2>
              {business.description_long ? (
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {business.description_long}
                </div>
              ) : business.description_short ? (
                <p className="text-gray-600 leading-relaxed">
                  {business.description_short}
                </p>
              ) : (
                <p className="text-gray-500 italic">No description available</p>
              )}
            </div>

            {/* Photo Gallery */}
            {galleryImages.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-[#371a5b] mb-4">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img}
                        alt={`${business.business_name} photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {business.categories && business.categories.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-[#371a5b] mb-4">
                  Categories
                </h2>
                <div className="flex flex-wrap gap-3">
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
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-[#371a5b] mb-4">
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
                        onMouseDown={() => handleClick("phone_clicks")}
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
                        onMouseDown={() => handleClick("email_clicks")}
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
                        onMouseDown={() => handleClick("website_clicks")}
                        className="text-[#54afe6] font-medium hover:underline truncate block max-w-[200px] flex items-center"
                      >
                        Visit Website
                        <ExternalLink className="w-3 h-3 ml-1" />
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
                    onMouseDown={() => handleClick("phone_clicks")}
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
                    onMouseDown={() => handleClick("website_clicks")}
                    className="flex items-center justify-center w-full py-3 border-2 border-[#371a5b] text-[#371a5b] rounded-lg font-semibold hover:bg-[#371a5b] hover:text-white transition"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>

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

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Gallery image"
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}
    </>
  );
}
