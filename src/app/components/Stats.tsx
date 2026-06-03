"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, Building2, Star, MapPin, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface StatsData {
  businessCount: number;
  totalViews: number;
  uniqueLocations: number;
  premiumCount: number;
  avgRating: number;
  growthRate: number;
}

export default function Stats() {
  const [stats, setStats] = useState<StatsData>({
    businessCount: 0,
    totalViews: 0,
    uniqueLocations: 0,
    premiumCount: 0,
    avgRating: 0,
    growthRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get approved businesses count from business_listings
      const { count: businessCount } = await supabase
        .from("business_listings")
        .select("*", { count: "exact", head: true })
        .in("listing_status", ["approved", "active"]);

      // Get total profile views from analytics
      const { data: analyticsData } = await supabase
        .from("business_analytics")
        .select("profile_views");

      const totalViews =
        analyticsData?.reduce((sum: number, item: any) => sum + (item.profile_views || 0), 0) ||
        0;

      // Get unique locations (cities)
      const { data: locationsData } = await supabase
        .from("business_locations")
        .select("city")
        .not("city", "is", null);

      const uniqueCities = new Set(
        locationsData?.map((loc: any) => loc.city).filter(Boolean) || []
      );

      // Get premium/VIP paid customers count
      const { count: premiumCount } = await supabase
        .from("business_listings")
        .select("*", { count: "exact", head: true })
        .not("plan_id", "is", null)
        .in("listing_status", ["approved", "active"]);

      // Calculate average rating from testimonials
      const { data: testimonialsData } = await supabase
        .from("testimonials")
        .select("rating");

      const avgRating =
        testimonialsData && testimonialsData.length > 0
          ? testimonialsData.reduce((sum: number, t: any) => sum + (t.rating || 5), 0) /
            testimonialsData.length
          : 5;

      // Calculate growth rate (new listings this month vs last month)
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const { count: thisMonthCount } = await supabase
        .from("business_listings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thisMonthStart.toISOString())
        .in("listing_status", ["approved", "active"]);

      const { count: lastMonthCount } = await supabase
        .from("business_listings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", lastMonthStart.toISOString())
        .lt("created_at", thisMonthStart.toISOString())
        .in("listing_status", ["approved", "active"]);

      // For first week/month, show 100% growth if there are new listings
      const growthRate =
        lastMonthCount && lastMonthCount > 0
          ? Math.round(
              (((thisMonthCount || 0) - lastMonthCount) / lastMonthCount) * 100
            )
          : thisMonthCount && thisMonthCount > 0
          ? 100
          : 0;

      setStats({
        businessCount: businessCount || 0,
        totalViews: totalViews,
        uniqueLocations: uniqueCities.size,
        premiumCount: premiumCount || 0,
        avgRating: Math.round(avgRating * 10) / 10,
        growthRate: growthRate,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const statsConfig = [
    {
      icon: Building2,
      value: stats.businessCount,
      label: "Local Businesses",
      color: "from-[#54afe6] to-[#371a5b]",
      format: (v: number) => v.toString(),
    },
    {
      icon: Users,
      value: stats.totalViews,
      label: "Monthly Views",
      color: "from-[#bb7ce4] to-[#54afe6]",
      format: formatNumber,
    },
    {
      icon: MapPin,
      value: stats.uniqueLocations,
      label: "STL Area Locations",
      color: "from-[#ffc107] to-[#f68712]",
      format: (v: number) => v.toString(),
    },
    {
      icon: Star,
      value: stats.avgRating,
      label: "Average Rating",
      color: "from-[#86c540] to-[#54afe6]",
      format: (v: number) => v.toFixed(1),
    },
    {
      icon: Award,
      value: stats.premiumCount,
      label: "Premium Partners",
      color: "from-[#e36087] to-[#bb7ce4]",
      format: (v: number) => v.toString(),
    },
    {
      icon: TrendingUp,
      value: stats.growthRate,
      label: "Growth Rate",
      color: "from-[#f68712] to-[#ffc107]",
      format: (v: number) => (v > 0 ? "+" : "") + v + "%",
    },
  ];

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 text-center shadow-lg animate-pulse"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-200"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {statsConfig.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div
                className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p
                className="text-3xl font-bold text-[#371a5b] mb-1"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {stat.format(stat.value)}
              </p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
