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

// Business hours helpers
const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
};

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function isCurrentlyOpen(businessHours: Record<string, any>): boolean {
  const now = new Date();
  const dayName = DAYS_OF_WEEK[now.getDay()];
  const dayHours = businessHours?.[dayName];
  
  if (!dayHours || dayHours.closed) return false;
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMin] = dayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  return currentTime >= openTime && currentTime < closeTime;
}

function getTodaysHours(businessHours: Record<string, any>): string {
  const now = new Date();
  const dayName = DAYS_OF_WEEK[now.getDay()];
  const dayHours = businessHours?.[dayName];
  
  if (!dayHours || dayHours.closed) return 'Closed today';
  return `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`;
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
  const [showSocialModal, setShowSocialModal] = useState(false);
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

                {/* Location - Public view shows City, State only */}
                {(business.city || business.state) && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-[#54afe6] mr-3 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <button
                        onClick={() => {
                          // Build full address for Google Maps (hidden from public view)
                          const addressParts = [
                            business.business_name,
                            business.address_line_1,
                            business.address_line_2,
                            business.city,
                            business.state,
                            business.zip_code
                          ].filter(Boolean);
                          
                          const locationQuery = encodeURIComponent(
                            addressParts.length > 0 
                              ? addressParts.join(', ')
                              : `${business.business_name}, ${business.city}, ${business.state}`
                          );
                          
                          trackAnalytics("direction_clicks").then(() => {
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${locationQuery}`, '_blank');
                          });
                        }}
                        className="text-gray-800 font-medium hover:text-[#54afe6] hover:underline text-left"
                      >
                        {business.city}
                        {business.city && business.state ? ", " : ""}
                        {business.state}
                      </button>
                    </div>
                  </div>
                )}

                {/* Business Hours - Paid listings only */}
                {isPaid && business.business_hours && (
                  <div className="flex items-start mt-4">
                    <Clock className="w-5 h-5 text-[#54afe6] mr-3 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Hours</p>
                      <div className="flex items-center">
                        <p className="text-gray-800 font-medium">
                          {getTodaysHours(business.business_hours)}
                        </p>
                        {isCurrentlyOpen(business.business_hours) ? (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Open Now
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Closed
                          </span>
                        )}
                      </div>
                      <details className="mt-2">
                        <summary className="text-sm text-[#54afe6] cursor-pointer hover:underline">
                          See all hours
                        </summary>
                        <div className="mt-2 space-y-1 text-sm">
                          {DAYS_OF_WEEK.slice(1).concat(DAYS_OF_WEEK[0]).map((day) => {
                            const dayHours = business.business_hours?.[day];
                            const isToday = day === DAYS_OF_WEEK[new Date().getDay()];
                            return (
                              <div key={day} className={`flex justify-between ${isToday ? 'font-semibold text-[#371a5b]' : 'text-gray-600'}`}>
                                <span>{DAY_LABELS[day]}</span>
                                <span>
                                  {dayHours?.closed 
                                    ? 'Closed' 
                                    : `${formatTime(dayHours?.open)} - ${formatTime(dayHours?.close)}`
                                  }
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media - Paid listings only */}
              {isPaid && (business.facebook_url || business.instagram_url || business.linkedin_url || business.youtube_url) && (
                <div id="social-media-section" className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-3">Follow Us</p>
                  <div className="flex space-x-3">
                    {business.facebook_url && (
                      <a
                        href={business.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          trackAnalytics("facebook_clicks").then(() => {
                            window.open(business.facebook_url, '_blank');
                          });
                        }}
                        className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80 transition"
                        aria-label="Facebook"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {business.instagram_url && (
                      <a
                        href={business.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          trackAnalytics("instagram_clicks").then(() => {
                            window.open(business.instagram_url, '_blank');
                          });
                        }}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center hover:opacity-80 transition"
                        aria-label="Instagram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                    {business.linkedin_url && (
                      <a
                        href={business.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          trackAnalytics("linkedin_clicks").then(() => {
                            window.open(business.linkedin_url, '_blank');
                          });
                        }}
                        className="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:opacity-80 transition"
                        aria-label="LinkedIn"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                    {business.youtube_url && (
                      <a
                        href={business.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          trackAnalytics("youtube_clicks").then(() => {
                            window.open(business.youtube_url, '_blank');
                          });
                        }}
                        className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:opacity-80 transition"
                        aria-label="YouTube"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
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
                
                {/* Get Directions - Only when location exists */}
                {hasLocation && (
                  <button
                    onClick={() => {
                      // Build full address for Google Maps (includes business name + full address)
                      const addressParts = [
                        business.business_name,
                        business.address_line_1,
                        business.address_line_2,
                        business.city,
                        business.state,
                        business.zip_code
                      ].filter(Boolean);
                      
                      const locationQuery = encodeURIComponent(
                        addressParts.length > 0 
                          ? addressParts.join(', ')
                          : `${business.business_name}, ${business.city}, ${business.state}`
                      );
                      
                      trackAnalytics("direction_clicks").then(() => {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${locationQuery}`, '_blank');
                      });
                    }}
                    className="flex items-center justify-center w-full py-3 border-2 border-[#54afe6] text-[#54afe6] rounded-lg font-semibold hover:bg-[#54afe6] hover:text-white transition"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
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
                
                {/* Social Media - Paid listings only */}
                {isPaid && (business.facebook_url || business.instagram_url || business.linkedin_url || business.youtube_url) && (
                  <button
                    onClick={() => setShowSocialModal(true)}
                    className="flex items-center justify-center w-full py-3 border-2 border-pink-500 text-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Connect With Us
                  </button>
                )}
              </div>
            </div>

            {/* Claim Listing - Only for Free listings */}
            <div className="bg-gradient-to-r from-[#54afe6]/10 to-[#bb7ce4]/10 rounded-xl p-6 border border-[#54afe6]/20">
              {isPaid ? (
                <>
                  <h3 className="font-bold text-[#371a5b] mb-2">
                    Need to update ownership?
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    This is a {isVip ? 'VIP' : 'Premium'} listing. Contact support to request ownership changes.
                  </p>
                  <a
                    href="mailto:support@trueproductsnetwork.com?subject=Ownership Change Request"
                    className="block text-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Contact Support
                  </a>
                </>
              ) : (
                <>
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
                </>
              )}
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
                onClick={() => trackAnalytics("direction_clicks")}
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

      {/* Social Media Connect Modal */}
      {showSocialModal && isPaid && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all scale-100">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#54afe6] to-[#bb7ce4] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#371a5b] mb-2">
                Connect With Us
              </h3>
              <p className="text-gray-600">
                Follow {business.business_name} on social media
              </p>
            </div>

            {/* Social Links */}
            <div className="space-y-4 mb-8">
              {business.facebook_url && (
                <a
                  href={business.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    trackAnalytics("facebook_clicks").then(() => {
                      window.open(business.facebook_url, '_blank');
                    });
                  }}
                  className="flex items-center p-4 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 rounded-xl transition group"
                >
                  <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1877F2]">Facebook</p>
                    <p className="text-sm text-gray-500">Get updates and news</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#1877F2] transition" />
                </a>
              )}

              {business.instagram_url && (
                <a
                  href={business.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    trackAnalytics("instagram_clicks").then(() => {
                      window.open(business.instagram_url, '_blank');
                    });
                  }}
                  className="flex items-center p-4 bg-gradient-to-r from-[#F58529]/10 via-[#DD2A7B]/10 to-[#8134AF]/10 hover:from-[#F58529]/20 hover:via-[#DD2A7B]/20 hover:to-[#8134AF]/20 rounded-xl transition group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#DD2A7B]">Instagram</p>
                    <p className="text-sm text-gray-500">See our latest photos</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#DD2A7B] transition" />
                </a>
              )}

              {business.linkedin_url && (
                <a
                  href={business.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    trackAnalytics("linkedin_clicks").then(() => {
                      window.open(business.linkedin_url, '_blank');
                    });
                  }}
                  className="flex items-center p-4 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 rounded-xl transition group"
                >
                  <div className="w-12 h-12 bg-[#0A66C2] rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#0A66C2]">LinkedIn</p>
                    <p className="text-sm text-gray-500">Connect professionally</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#0A66C2] transition" />
                </a>
              )}

              {business.youtube_url && (
                <a
                  href={business.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    trackAnalytics("youtube_clicks").then(() => {
                      window.open(business.youtube_url, '_blank');
                    });
                  }}
                  className="flex items-center p-4 bg-[#FF0000]/10 hover:bg-[#FF0000]/20 rounded-xl transition group"
                >
                  <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#FF0000]">YouTube</p>
                    <p className="text-sm text-gray-500">Watch our videos</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#FF0000] transition" />
                </a>
              )}
            </div>

            {/* Share This Business Section */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <p className="text-center text-sm font-medium text-gray-600 mb-4">
                Share This Business
              </p>
              <div className="flex justify-center space-x-4">
                {/* Copy Link */}
                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    trackAnalytics("share_copy_link");
                    alert("Link copied to clipboard!");
                  }}
                  className="flex flex-col items-center group"
                >
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-gray-200 rounded-full flex items-center justify-center mb-2 transition">
                    <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500">Copy Link</span>
                </button>

                {/* Share on Facebook */}
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent(`Check out ${business.business_name} on STL Business Guide!`);
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank', 'width=600,height=400');
                    trackAnalytics("share_facebook");
                  }}
                  className="flex flex-col items-center group"
                >
                  <div className="w-12 h-12 bg-[#1877F2]/10 group-hover:bg-[#1877F2]/20 rounded-full flex items-center justify-center mb-2 transition">
                    <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500">Facebook</span>
                </button>

                {/* Share on Twitter/X */}
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent(`Check out ${business.business_name} on STL Business Guide!`);
                    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
                    trackAnalytics("share_twitter");
                  }}
                  className="flex flex-col items-center group"
                >
                  <div className="w-12 h-12 bg-black/10 group-hover:bg-black/20 rounded-full flex items-center justify-center mb-2 transition">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500">X / Twitter</span>
                </button>

                {/* Share on LinkedIn */}
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
                    trackAnalytics("share_linkedin");
                  }}
                  className="flex flex-col items-center group"
                >
                  <div className="w-12 h-12 bg-[#0A66C2]/10 group-hover:bg-[#0A66C2]/20 rounded-full flex items-center justify-center mb-2 transition">
                    <svg className="w-6 h-6 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500">LinkedIn</span>
                </button>

                {/* Email */}
                <button
                  onClick={() => {
                    const subject = encodeURIComponent(`Check out ${business.business_name}`);
                    const body = encodeURIComponent(`I found this business on STL Business Guide and thought you might be interested:\n\n${business.business_name}\n\n${window.location.href}`);
                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                    trackAnalytics("share_email");
                  }}
                  className="flex flex-col items-center group"
                >
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-gray-200 rounded-full flex items-center justify-center mb-2 transition">
                    <Mail className="w-6 h-6 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-500">Email</span>
                </button>
              </div>
            </div>

            {/* Follow All Button */}
            <button
              onClick={() => {
                // Open all social media links
                const urls = [
                  business.facebook_url,
                  business.instagram_url,
                  business.linkedin_url,
                  business.youtube_url
                ].filter(Boolean);
                
                urls.forEach((url, index) => {
                  setTimeout(() => {
                    window.open(url, '_blank');
                  }, index * 200);
                });
                
                // Track analytics for each
                if (business.facebook_url) trackAnalytics("facebook_clicks");
                if (business.instagram_url) trackAnalytics("instagram_clicks");
                if (business.linkedin_url) trackAnalytics("linkedin_clicks");
                if (business.youtube_url) trackAnalytics("youtube_clicks");
              }}
              className="w-full bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg hover:shadow-xl mb-4"
            >
              Follow All
            </button>

            {/* Close Button */}
            <button
              onClick={() => setShowSocialModal(false)}
              className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </>
  );
}
