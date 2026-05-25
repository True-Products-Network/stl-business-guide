"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, MapPin, Phone, ExternalLink, BadgeCheck, Crown } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FeaturedBusiness {
  id: string;
  business_name: string;
  slug: string;
  description_short: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  logo_url: string | null;
  city: string | null;
  state: string | null;
  plan_name: string | null;
  plan_key: string | null;
  is_featured: boolean | null;
  categories: { name: string; slug: string }[] | null;
}

const tierBadge: Record<string, { icon: typeof Crown; color: string; label: string }> = {
  vip: { icon: Crown, color: "bg-gradient-to-r from-[#ffc107] to-[#f68712]", label: "VIP" },
  premium: { icon: BadgeCheck, color: "bg-gradient-to-r from-[#54afe6] to-[#bb7ce4]", label: "Premium" },
};

export default function FeaturedBusinesses() {
  const [businesses, setBusinesses] = useState<FeaturedBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPremiumBusinesses();
  }, []);

  async function fetchPremiumBusinesses() {
    try {
      // Fetch only Premium and VIP businesses from the public view
      const { data, error } = await supabase
        .from('public_approved_listings')
        .select('*')
        .in('plan_key', ['premium', 'vip'])
        .order('is_featured', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching featured businesses:', error);
      } else {
        setBusinesses(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <section id="businesses" className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#54afe6]"></div>
          </div>
        </div>
      </section>
    );
  }

  // Show placeholder if no premium/vip businesses
  if (businesses.length === 0) {
    return (
      <section id="businesses" className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-[#54afe6]/10 text-[#54afe6] rounded-full text-sm font-semibold mb-4">
              Featured Listings
            </span>
            <h2 className="text-4xl font-bold text-[#371a5b] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Premium & VIP Businesses
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Premium and VIP listings will appear here. Be the first to upgrade your listing!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="businesses" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-[#54afe6]/10 text-[#54afe6] rounded-full text-sm font-semibold mb-4">
            Featured Listings
          </span>
          <h2 className="text-4xl font-bold text-[#371a5b] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Premium & VIP Businesses
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover the best local businesses in St. Louis. Our Premium and VIP members get prime visibility and exclusive benefits.
          </p>
        </div>

        {/* Business Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businesses.map((business) => {
            const tierKey = business.plan_key || 'premium';
            const tierConfig = tierBadge[tierKey] || tierBadge.premium;
            const TierIcon = tierConfig.icon;
            const firstCategory = business.categories?.[0]?.name || 'Business';
            
            return (
              <div
                key={business.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-lg card-hover border ${
                  tierKey === 'vip' ? 'border-[#ffc107]/50' : 'border-[#54afe6]/50'
                }`}
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-[#371a5b] to-[#bb7ce4]">
                  {business.logo_url ? (
                    <img 
                      src={business.logo_url} 
                      alt={business.business_name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white/30 text-6xl font-bold">{business.business_name[0]}</span>
                    </div>
                  )}
                  {/* Tier Badge */}
                  <div className={`absolute top-4 right-4 ${tierConfig.color} rounded-full px-3 py-1 flex items-center space-x-1`}>
                    <TierIcon className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-bold">{tierConfig.label}</span>
                  </div>
                  {/* Featured Badge */}
                  {business.is_featured && (
                    <div className="absolute top-4 left-4 bg-[#e36087] rounded-full px-3 py-1">
                      <span className="text-white text-xs font-bold">Featured</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#54afe6] font-medium">{firstCategory}</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#371a5b] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {business.business_name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {business.description_short || 'No description available'}
                  </p>

                  {/* Tags from categories */}
                  {business.categories && business.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {business.categories.slice(0, 3).map((cat, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {(business.city || business.state) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-[#54afe6]" />
                        {business.city}{business.city && business.state ? ', ' : ''}{business.state}
                      </div>
                    )}
                    {business.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-[#54afe6]" />
                        {business.phone}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/listing/${business.slug}`}
                    className="flex items-center justify-center w-full py-3 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    View Profile
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/businesses"
            className="inline-flex items-center px-8 py-4 bg-white border-2 border-[#371a5b] text-[#371a5b] rounded-full font-semibold hover:bg-[#371a5b] hover:text-white transition-colors"
          >
            View All Businesses
            <ExternalLink className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
