"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "../../../lib/supabase";
import {
  ArrowLeft,
  TrendingUp,
  Eye,
  MousePointer,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BarChart3,
  Loader2,
  AlertCircle,
  ChevronDown,
  Share2,
  Globe,
} from "lucide-react";

interface AnalyticsData {
  date: string;
  profile_views: number;
  website_clicks: number;
  phone_clicks: number;
  email_clicks: number;
  direction_clicks: number;
  facebook_clicks?: number;
  instagram_clicks?: number;
  linkedin_clicks?: number;
  youtube_clicks?: number;
}

interface Business {
  id: string;
  business_name: string;
  slug: string;
  plan_tier: string;
}

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState<"7" | "30" | "90">("30");

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      loadAnalytics(selectedBusiness);
    }
  }, [selectedBusiness, dateRange]);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUser(user);
    await loadBusinesses(user.id);
  }

  async function loadBusinesses(userId: string) {
    try {
      // Get current user's email
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData?.user?.email;

      // First get businesses owned by this user (by profile_id or email)
      let businessesQuery = supabase
        .from("businesses")
        .select("id, business_name, slug, email, owner_profile_id");
      
      // Try to match by owner_profile_id OR email
      if (userEmail) {
        businessesQuery = businessesQuery.or(`owner_profile_id.eq.${userId},email.eq.${userEmail}`);
      } else {
        businessesQuery = businessesQuery.eq("owner_profile_id", userId);
      }
      
      const { data: businessesData, error: businessesError } = await businessesQuery;

      if (businessesError) {
        console.error("Error loading businesses:", businessesError);
        setError("Failed to load your businesses");
        setLoading(false);
        return;
      }

      if (!businessesData || businessesData.length === 0) {
        setBusinesses([]);
        setLoading(false);
        return;
      }

      // Update owner_profile_id for businesses that matched by email but don't have it set
      for (const biz of businessesData) {
        if (!biz.owner_profile_id && userId) {
          await supabase
            .from("businesses")
            .update({ owner_profile_id: userId })
            .eq("id", biz.id);
        }
      }

      // Get business IDs
      const businessIds = businessesData.map((b: any) => b.id);

      // Now get the listings for these businesses with plan info
      const { data: listingsData, error: listingsError } = await supabase
        .from("business_listings")
        .select("id, business_id, listing_status, listing_plans(plan_key)")
        .in("business_id", businessIds)
        .order("created_at", { ascending: false });

      if (listingsError) {
        console.error("Error loading listings:", listingsError);
        setError("Failed to load your listings");
        setLoading(false);
        return;
      }

      // Create a map of business data
      interface BusinessData {
        id: string;
        business_name: string;
        slug: string;
      }
      const businessMap = new Map<string, BusinessData>((businessesData as BusinessData[] | null)?.map((b) => [b.id, b]) || []);

      // Transform data to match expected format - VIP ONLY
      interface ListingData {
        id: string;
        business_id: string;
        listing_status: string;
        listing_plans?: { plan_key: string };
      }
      const transformedData = ((listingsData as ListingData[] | null) || [])
        .filter((item) => item.listing_plans?.plan_key === "vip")
        .map((item) => {
          const business = businessMap.get(item.business_id);
          return {
            id: item.id,
            business_name: business?.business_name || "Unnamed Business",
            slug: business?.slug || "",
            plan_tier: item.listing_plans?.plan_key || "free",
          };
        });

      setBusinesses(transformedData);
      if (transformedData.length > 0) {
        setSelectedBusiness(transformedData[0].id);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalytics(businessId: string) {
    try {
      // Calculate cutoff date (date only, no time, to match admin behavior)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));
      // Format as YYYY-MM-DD using local date to avoid timezone issues
      const year = cutoffDate.getFullYear();
      const month = String(cutoffDate.getMonth() + 1).padStart(2, '0');
      const day = String(cutoffDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const { data, error } = await supabase
        .from("business_analytics")
        .select("*")
        .eq("business_id", businessId)
        .gte("date", dateString)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error loading analytics:", error);
        return;
      }

      setAnalytics(data || []);
    } catch (err) {
      console.error("Error:", err);
    }
  }

  // Calculate totals
  const totals = analytics.reduce(
    (acc, day) => ({
      profile_views: acc.profile_views + (day.profile_views || 0),
      website_clicks: acc.website_clicks + (day.website_clicks || 0),
      phone_clicks: acc.phone_clicks + (day.phone_clicks || 0),
      email_clicks: acc.email_clicks + (day.email_clicks || 0),
      direction_clicks: acc.direction_clicks + (day.direction_clicks || 0),
      facebook_clicks: acc.facebook_clicks + (day.facebook_clicks || 0),
      instagram_clicks: acc.instagram_clicks + (day.instagram_clicks || 0),
      linkedin_clicks: acc.linkedin_clicks + (day.linkedin_clicks || 0),
      youtube_clicks: acc.youtube_clicks + (day.youtube_clicks || 0),
    }),
    {
      profile_views: 0,
      website_clicks: 0,
      phone_clicks: 0,
      email_clicks: 0,
      direction_clicks: 0,
      facebook_clicks: 0,
      instagram_clicks: 0,
      linkedin_clicks: 0,
      youtube_clicks: 0,
    }
  );

  const totalEngagements =
    totals.website_clicks +
    totals.phone_clicks +
    totals.email_clicks +
    totals.direction_clicks +
    totals.facebook_clicks +
    totals.instagram_clicks +
    totals.linkedin_clicks +
    totals.youtube_clicks;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#54afe6]" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <a
            href="/dashboard"
            className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </a>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Analytics Dashboard
          </h1>
          <p className="text-xl text-white/80">
            Track your business listing performance
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {businesses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#371a5b] mb-2">
              Analytics is a VIP Feature
            </h2>
            <p className="text-gray-500 mb-6">
              Upgrade to VIP to access detailed analytics for your business listings
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              View VIP Plans
            </a>
          </div>
        ) : (
          <>
            {/* Business Selector & Date Range */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Business
                  </label>
                  <select
                    value={selectedBusiness}
                    onChange={(e) => setSelectedBusiness(e.target.value)}
                    className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6]"
                  >
                    {businesses.map((biz) => (
                      <option key={biz.id} value={biz.id}>
                        {biz.business_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {(["7", "30", "90"] as const).map((days) => (
                      <button
                        key={days}
                        onClick={() => setDateRange(days)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                          dateRange === days
                            ? "bg-white text-[#371a5b] shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">Last {dateRange} days</span>
                </div>
                <p className="text-3xl font-bold text-[#371a5b]">
                  {totals.profile_views.toLocaleString()}
                </p>
                <p className="text-gray-500 text-sm">Profile Views</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MousePointer className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500">Last {dateRange} days</span>
                </div>
                <p className="text-3xl font-bold text-[#371a5b]">
                  {totalEngagements.toLocaleString()}
                </p>
                <p className="text-gray-500 text-sm">Total Engagements</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-500">Conversion</span>
                </div>
                <p className="text-3xl font-bold text-[#371a5b]">
                  {totals.profile_views > 0
                    ? Math.round(
                        (totalEngagements / totals.profile_views) * 100
                      )
                    : 0}
                  %
                </p>
                <p className="text-gray-500 text-sm">Engagement Rate</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-500">Daily Avg</span>
                </div>
                <p className="text-3xl font-bold text-[#371a5b]">
                  {analytics.length > 0
                    ? Math.round(
                        totals.profile_views / analytics.length
                      ).toLocaleString()
                    : 0}
                </p>
                <p className="text-gray-500 text-sm">Views Per Day</p>
              </div>
            </div>

            {/* Engagement Breakdown */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-[#371a5b] mb-6">
                  Engagement Breakdown
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <MousePointer className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Website Clicks</p>
                        <p className="text-sm text-gray-500">
                          Visits to your website
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#371a5b]">
                      {totals.website_clicks}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Phone Clicks</p>
                        <p className="text-sm text-gray-500">
                          Calls initiated
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#371a5b]">
                      {totals.phone_clicks}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Email Clicks</p>
                        <p className="text-sm text-gray-500">
                          Emails sent
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#371a5b]">
                      {totals.email_clicks}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <MapPin className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Direction Clicks
                        </p>
                        <p className="text-sm text-gray-500">
                          Map directions requested
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#371a5b]">
                      {totals.direction_clicks}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Breakdown */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-[#371a5b] mb-6">
                  Social Media Clicks
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Share2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Facebook</p>
                        <p className="text-sm text-gray-500">
                          Profile visits
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#371a5b]">
                      {totals.facebook_clicks}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-pink-100 rounded-lg mr-3">
                        <Globe className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Instagram</p>
                        <p className="text-sm text-gray-500">
                          Profile visits
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#371a5b]">
                      {totals.instagram_clicks}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Globe className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">LinkedIn</p>
                        <p className="text-sm text-gray-500">
                          Profile visits
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#371a5b]">
                      {totals.linkedin_clicks}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg mr-3">
                        <Globe className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">YouTube</p>
                        <p className="text-sm text-gray-500">
                          Channel visits
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#371a5b]">
                      {totals.youtube_clicks}
                    </p>
                  </div>
                </div>
              </div>

              {/* Daily Breakdown Table */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-[#371a5b] mb-6">
                  Daily Activity
                </h2>
                {analytics.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No analytics data yet. Data will appear as visitors interact
                    with your listing.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                            Date
                          </th>
                          <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                            Views
                          </th>
                          <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                            Clicks
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics
                          .slice()
                          .reverse()
                          .map((day, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-gray-100 last:border-0"
                            >
                              <td className="py-3 px-2 text-sm text-gray-600">
                                {new Date(day.date).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                                {day.profile_views || 0}
                              </td>
                              <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                                {(day.website_clicks || 0) +
                                  (day.phone_clicks || 0) +
                                  (day.email_clicks || 0) +
                                  (day.direction_clicks || 0)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Upgrade CTA */}
            {selectedBusiness &&
              businesses.find((b) => b.id === selectedBusiness)?.plan_tier
                ?.toLowerCase() === "free" && (
                <div className="bg-gradient-to-r from-[#54afe6]/10 to-[#bb7ce4]/10 rounded-xl p-6 border border-[#54afe6]/20">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#371a5b] mb-2">
                        Get Detailed Analytics
                      </h3>
                      <p className="text-gray-600">
                        Upgrade to Premium or VIP for advanced analytics, export
                        reports, and more.
                      </p>
                    </div>
                    <a
                      href={`/pricing?upgrade=${selectedBusiness}`}
                      className="mt-4 md:mt-0 inline-flex items-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Upgrade Now
                    </a>
                  </div>
                </div>
              )}
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
