"use client";

import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Testimonial {
  id: string;
  author_name: string;
  author_title: string | null;
  author_company: string | null;
  content: string;
  rating: number;
  is_featured: boolean;
}

interface StatsData {
  businessCount: number;
  totalViews: number;
  avgRating: number;
  totalEngagement: number;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<StatsData>({
    businessCount: 0,
    totalViews: 0,
    avgRating: 0,
    totalEngagement: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
    fetchStats();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .limit(4);

      if (error) {
        console.error("Error fetching testimonials:", error);
        return;
      }

      setTestimonials(data || []);
    } catch (err) {
      console.error("Exception fetching testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get approved businesses count
      const { count: businessCount } = await supabase
        .from("businesses")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      // Get total profile views from analytics
      const { data: analyticsData } = await supabase
        .from("business_analytics")
        .select("profile_views, website_clicks, phone_clicks, email_clicks, direction_clicks");

      const totalViews =
        analyticsData?.reduce((sum: number, item: any) => sum + (item.profile_views || 0), 0) || 0;

      const totalEngagement =
        analyticsData?.reduce(
          (sum: number, item: any) =>
            sum +
            (item.website_clicks || 0) +
            (item.phone_clicks || 0) +
            (item.email_clicks || 0) +
            (item.direction_clicks || 0),
          0
        ) || 0;

      // Calculate average rating from testimonials
      const { data: testimonialsData } = await supabase
        .from("testimonials")
        .select("rating");

      const avgRating =
        testimonialsData && testimonialsData.length > 0
          ? testimonialsData.reduce((sum: number, t: any) => sum + (t.rating || 5), 0) /
            testimonialsData.length
          : 5;

      setStats({
        businessCount: businessCount || 0,
        totalViews: totalViews,
        avgRating: Math.round(avgRating * 10) / 10,
        totalEngagement: totalEngagement,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? "text-[#ffc107] fill-current" : "text-gray-300"}`}
      />
    ));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  if (loading) {
    return (
      <section className="section-padding bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Always Show */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-[#86c540]/10 text-[#86c540] rounded-full text-sm font-semibold mb-4">
            Success Stories
          </span>
          <h2 className="text-4xl font-bold text-[#371a5b] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            What Business Owners Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Join hundreds of satisfied business owners who have grown their customer base with STL Business Guide.
          </p>
        </div>

        {/* Testimonials Grid - Show if we have testimonials */}
        {testimonials.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                {/* Quote Icon */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#54afe6] to-[#bb7ce4] flex items-center justify-center mb-6">
                  <Quote className="w-6 h-6 text-white" />
                </div>

                {/* Rating */}
                <div className="flex space-x-1 mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Quote */}
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#371a5b] to-[#bb7ce4] flex items-center justify-center text-white text-xl font-bold">
                    {testimonial.author_name[0]}
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-[#371a5b]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {testimonial.author_name}
                    </p>
                    <p className="text-sm text-gray-600">{testimonial.author_title || 'Business Owner'}</p>
                    <p className="text-sm text-[#54afe6] font-medium">{testimonial.author_company || 'Local Business'}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#ffc107] to-[#f68712] text-white">
                      Featured
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Show message if no testimonials */
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Success stories coming soon! Check back for testimonials from our business partners.</p>
          </div>
        )}

        {/* Stats Banner - Always Show */}
        <div className="mt-16 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] rounded-3xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">{stats.businessCount}</p>
              <p className="text-white/80">Local Businesses</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">{formatNumber(stats.totalViews)}</p>
              <p className="text-white/80">Monthly Views</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">{stats.avgRating.toFixed(1)}</p>
              <p className="text-white/80">Average Rating</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">{formatNumber(stats.totalEngagement)}</p>
              <p className="text-white/80">Total Engagements</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
