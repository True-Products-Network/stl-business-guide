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
  Tag,
  Percent,
  Gift,
  Clock,
  MessageSquare,
  Navigation,
} from "lucide-react";

interface ListingContentProps {
  business: any;
}

function formatPhoneNumber(phone: string | null): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export default function ListingContent({ business }: ListingContentProps) {
  const planKey = business.plan_key || "free";
  const isVip = planKey === "vip";
  const isPremium = planKey === "premium";
  const isPaid = isVip || isPremium;
  const mainCategory = business.categories?.[0]?.name || "Business";
  const otherCategories = business.categories?.slice(1) || [];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [redeemForm, setRedeemForm] = useState({ name: "", email: "", phone: "" });
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  
  // Modal states
  const [showContactModal, setShowContactModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  // Load coupons on mount
  useEffect(() => {
    loadCoupons();
  }, [business?.id]);

  async function loadCoupons() {
    if (!business?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("business_id", business.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Filter out expired coupons client-side
        const today = new Date().toISOString().split('T')[0];
        const activeCoupons = data.filter((coupon: any) => {
          if (!coupon.end_date) return true;
          return coupon.end_date >= today;
        });
        setCoupons(activeCoupons);
      }
    } catch (err) {
      console.error("Error loading coupons:", err);
    }
  }

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCoupon) return;
    
    setRedeeming(true);
    try {
      // Get the STL fee percentage for this business
      const { data: feeData } = await supabase
        .from('business_fees')
        .select('stl_fee_percentage')
        .eq('business_id', business.id)
        .single();
      
      const stlFeePercent = feeData?.stl_fee_percentage ?? 10; // Default 10%
      
      // Calculate discount value for STL fee
      let discountValue = 0;
      if (selectedCoupon.discount_type === 'fixed_amount' && selectedCoupon.discount_value) {
        discountValue = parseFloat(selectedCoupon.discount_value);
      } else if (selectedCoupon.discount_type === 'percentage' && selectedCoupon.discount_value) {
        // For percentage, we'd need the original value - use a default or estimate
        discountValue = 0; // Will be calculated when business provides actual value
      }
      
      const stlFeeAmount = (discountValue * stlFeePercent) / 100;
      
      const redemptionCode = `STL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from("coupon_redemptions")
        .insert({
          coupon_id: selectedCoupon.id,
          business_id: business.id,
          customer_name: redeemForm.name,
          customer_email: redeemForm.email,
          customer_phone: redeemForm.phone || null,
          redemption_code: redemptionCode,
          status: "redeemed",
          original_value: discountValue,
          discount_applied: discountValue,
          stl_fee_amount: stlFeeAmount,
        })
        .select()
        .single();

      if (error) throw error;

      // Update coupon totals
      await supabase
        .from('coupons')
        .update({
          total_redemptions: supabase.rpc('increment', { x: 1 }),
          stl_fee_earned: supabase.rpc('increment', { x: stlFeeAmount }),
        })
        .eq('id', selectedCoupon.id);

      // Send to GHL
      const { sendRedemptionToGHL, formatRedemptionForGHL } = await import('@/lib/ghl-webhook');
      const ghlPayload = formatRedemptionForGHL(
        redeemForm.name,
        redeemForm.email,
        redeemForm.phone,
        redemptionCode,
        { code: selectedCoupon.code, title: selectedCoupon.title, end_date: selectedCoupon.end_date },
        { id: business.id, business_name: business.business_name }
      );
      
      await sendRedemptionToGHL(ghlPayload);

      // Use the redemption code from the database
      setRedeemCode(data?.redemption_code || '');
      setRedeemSuccess(true);
      
      // Refresh coupons to update redemption count
      loadCoupons();
    } catch (err) {
      console.error("Error redeeming coupon:", err);
      alert("Failed to redeem coupon. Please try again.");
    }
    setRedeeming(false);
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    
    // Simulate sending (replace with actual email logic)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSending(false);
    setShowContactModal(false);
    setContactForm({ name: "", email: "", message: "" });
    alert("Message sent successfully!");
  }

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

  // Get gallery images from business data
  const galleryImages = business.gallery_images || [];
  const featuredImage = business.featured_image_url || business.logo_url;
  const videoUrl = business.video_url;
  
  // Add featured image to gallery if not already included
  const allImages = featuredImage && !galleryImages.includes(featuredImage) 
    ? [featuredImage, ...galleryImages] 
    : galleryImages;

  // Get address for map
  const hasLocation = business.address_line_1 || business.city || business.state;
  const mapAddress = [
    business.address_line_1,
    business.city,
    business.state,
    business.zip_code
  ].filter(Boolean).join(", ");

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
        {(business.featured_image_url || business.logo_url) ? (
          <img
            src={business.featured_image_url || business.logo_url || ''}
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

            {/* Plan Badge */}
            <div className="mt-4">
              {planKey === 'vip' ? (
                <span className="inline-flex items-center bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 px-4 py-2 rounded-full font-bold shadow-lg">
                  <Crown className="w-5 h-5 mr-2" />
                  VIP Business
                </span>
              ) : planKey === 'premium' ? (
                <span className="inline-flex items-center bg-gradient-to-r from-[#54afe6] to-[#371a5b] text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  <BadgeCheck className="w-5 h-5 mr-2" />
                  Premium Business
                </span>
              ) : (
                <span className="inline-flex items-center bg-gray-400 text-white px-4 py-2 rounded-full font-semibold">
                  Free Listing
                </span>
              )}
            </div>

            {/* Google Rating */}
            <div className="flex items-center mt-4">
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

      {/* Video Section (VIP only) */}
      {isVip && videoUrl && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">Business Video</h2>
            <div className="aspect-video rounded-lg overflow-hidden">
              {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                <iframe
                  src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title="Business Video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Full Description - Premium/VIP only, Free gets short */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-[#371a5b] mb-4">About</h2>
              {isPaid && business.description_long ? (
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
              {!isPaid && business.description_long && (
                <p className="text-sm text-gray-400 mt-4 italic">
                  Upgrade to Premium or VIP to see the full business description.
                </p>
              )}
            </div>

            {/* Photo Gallery */}
            {allImages.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-[#371a5b] mb-4">Photo Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allImages.map((img: string, idx: number) => (
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

            {/* Coupons Section */}
            {coupons.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-[#371a5b] mb-4 flex items-center">
                  <Tag className="w-6 h-6 mr-2 text-[#54afe6]" />
                  Special Offers
                </h2>
                <div className="space-y-4">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="border-2 border-dashed border-[#54afe6] rounded-xl p-6 bg-[#54afe6]/5"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-[#371a5b]">
                              {coupon.title}
                            </h3>
                            {coupon.discount_type === "percentage" && <Percent className="w-5 h-5 text-[#54afe6]" />}
                            {coupon.discount_type === "fixed_amount" && <span className="text-[#54afe6] font-bold">$</span>}
                            {coupon.discount_type === "free_service" && <Gift className="w-5 h-5 text-[#54afe6]" />}
                          </div>
                          {coupon.description && (
                            <p className="text-gray-600 mb-3">{coupon.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="bg-[#371a5b] text-white px-3 py-1 rounded-lg font-mono font-bold">
                              {coupon.code}
                            </span>
                            {coupon.end_date && (
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Expires {new Date(coupon.end_date).toLocaleDateString()}
                              </span>
                            )}
                            {coupon.max_redemptions && (
                              <span>
                                {coupon.max_redemptions - coupon.total_redemptions} left
                              </span>
                            )}
                          </div>
                          {coupon.terms_conditions && (
                            <p className="text-xs text-gray-400 mt-2">
                              * {coupon.terms_conditions}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setShowRedeemModal(true);
                          }}
                          className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition whitespace-nowrap"
                        >
                          Redeem Offer
                        </button>
                      </div>
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
                        onClick={(e) => {
                          e.preventDefault();
                          trackAnalytics("phone_clicks").then(() => {
                            window.location.href = `tel:${business.phone}`;
                          });
                        }}
                        className="text-gray-800 font-medium hover:text-[#54afe6]"
                      >
                        {formatPhoneNumber(business.phone)}
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
                        onClick={(e) => {
                          e.preventDefault();
                          trackAnalytics("email_clicks").then(() => {
                            window.location.href = `mailto:${business.email}`;
                          });
                        }}
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
                        onClick={(e) => {
                          e.preventDefault();
                          trackAnalytics("website_clicks").then(() => {
                            window.open(business.website_url, '_blank');
                          });
                        }}
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
                {/* Contact Business - Premium/VIP only */}
                {isPaid && (
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex items-center justify-center w-full py-3 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact This Business
                  </button>
                )}
                
                {/* Map Location - Only when location exists */}
                {hasLocation && (
                  <button
                    onClick={() => setShowMapModal(true)}
                    className="flex items-center justify-center w-full py-3 border-2 border-[#54afe6] text-[#54afe6] rounded-lg font-semibold hover:bg-[#54afe6] hover:text-white transition"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Map Location
                  </button>
                )}
                
                {/* Call Now - Only when phone exists */}
                {business.phone && (
                  <button
                    onClick={() => {
                      trackAnalytics("phone_clicks").then(() => {
                        window.location.href = `tel:${business.phone}`;
                      });
                    }}
                    className="flex items-center justify-center w-full py-3 border-2 border-[#371a5b] text-[#371a5b] rounded-lg font-semibold hover:bg-[#371a5b] hover:text-white transition"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </button>
                )}
                
                {business.website_url && (
                  <button
                    onClick={() => {
                      trackAnalytics("website_clicks").then(() => {
                        window.open(business.website_url, '_blank');
                      });
                    }}
                    className="flex items-center justify-center w-full py-3 border-2 border-gray-400 text-gray-600 rounded-lg font-semibold hover:bg-gray-100 transition"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </button>
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

      {/* Contact Modal - Premium/VIP only */}
      {showContactModal && isPaid && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#371a5b]">Contact {business.business_name}</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                  placeholder="How can we help you?"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && hasLocation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#371a5b]">Location</h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(mapAddress)}`}
                allowFullScreen
              />
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-[#371a5b]">{business.business_name}</p>
              <p className="text-gray-600">{mapAddress}</p>
            </div>
            
            <div className="mt-4 flex gap-3">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition text-center"
              >
                Get Directions
              </a>
              <button
                onClick={() => setShowMapModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Redemption Modal */}
      {showRedeemModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            {!redeemSuccess ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#54afe6] to-[#bb7ce4] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#371a5b]">
                    {selectedCoupon.title}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Redeem this offer at {business.business_name}
                  </p>
                </div>

                <form onSubmit={handleRedeem} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={redeemForm.name}
                      onChange={(e) => setRedeemForm({ ...redeemForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={redeemForm.email}
                      onChange={(e) => setRedeemForm({ ...redeemForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      value={redeemForm.phone}
                      onChange={(e) => setRedeemForm({ ...redeemForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  {selectedCoupon.terms_conditions && (
                    <p className="text-xs text-gray-500">
                      * {selectedCoupon.terms_conditions}
                    </p>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowRedeemModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={redeeming}
                      className="flex-1 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                    >
                      {redeeming ? "Processing..." : "Redeem Now"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#371a5b] mb-2">
                  Coupon Redeemed!
                </h3>
                <p className="text-gray-600 mb-4">
                  Show this code to {business.business_name}
                </p>
                <div className="bg-[#371a5b] text-white text-2xl font-mono font-bold py-4 px-6 rounded-xl mb-4">
                  {redeemCode}
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  A confirmation email has been sent to {redeemForm.email}
                </p>
                <button
                  onClick={() => {
                    setShowRedeemModal(false);
                    setRedeemSuccess(false);
                    setRedeemForm({ name: "", email: "", phone: "" });
                  }}
                  className="w-full bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
