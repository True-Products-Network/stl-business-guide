"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "@/lib/supabase";
import {
  BarChart3,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Eye,
  MousePointer,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Building2,
  Search,
  Calendar,
} from "lucide-react";

interface BusinessAnalytics {
  business_id: string;
  business_name: string;
  slug: string;
  plan_key: string;
  is_featured: boolean;
  profile_views: number;
  website_clicks: number;
  phone_clicks: number;
  email_clicks: number;
  direction_clicks: number;
  total_engagement: number;
}

interface AnalyticsRecord {
  business_id: string;
  date: string;
  profile_views: number | null;
  website_clicks: number | null;
  phone_clicks: number | null;
  email_clicks: number | null;
  direction_clicks: number | null;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<BusinessAnalytics[]>([]);
  const [allAnalytics, setAllAnalytics] = useState<AnalyticsRecord[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("30"); // days

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (businesses.length > 0 && allAnalytics.length > 0) {
      processAnalytics();
    }
  }, [dateRange, businesses, allAnalytics]);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUser(user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin" || profile?.role === "super_admin") {
      setIsAdmin(true);
      await loadData();
    } else {
      setError("You don't have permission to access this page");
      setLoading(false);
    }
  }

  async function loadData() {
    try {
      // Get the current session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No access token available');
      }

      // Fetch data from admin API endpoint (bypasses RLS using service role)
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analytics');
      }

      const data = await response.json();
      setBusinesses(data.businesses || []);
      setAllAnalytics(data.analytics || []);

    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  function processAnalytics() {
    // Calculate date cutoff based on selected range
    let cutoffDate: Date | null = null;
    if (dateRange !== "all") {
      cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));
    }
    
    console.log("Admin - Date range:", dateRange, "days");
    console.log("Admin - Cutoff date:", cutoffDate?.toISOString());
    console.log("Admin - Total analytics records:", allAnalytics.length);

    // Build a map of business_id to listing_ids for analytics matching
    // A business can have multiple listings over time
    const businessToListingsMap = new Map<string, string[]>();
    const listingToBusinessMap = new Map<string, string>();
    businesses.forEach((business: any) => {
      const listings = business.business_listings || [];
      const listingIds: string[] = [];
      listings.forEach((listing: any) => {
        if (listing?.id) {
          listingIds.push(listing.id);
          listingToBusinessMap.set(listing.id, business.id);
        }
      });
      if (listingIds.length > 0) {
        businessToListingsMap.set(business.id, listingIds);
      }
    });

    // Filter analytics by date range
    // Compare dates using UTC to avoid timezone issues
    const filteredAnalytics = allAnalytics.filter((record: AnalyticsRecord) => {
      if (!cutoffDate) return true; // "all" selected
      // Parse record date as UTC (database stores YYYY-MM-DD)
      const [year, month, day] = record.date.split('-').map(Number);
      const recordDateUTC = Date.UTC(year, month - 1, day); // month is 0-indexed in UTC
      // Create cutoff date as UTC midnight
      const cutoffDateUTC = Date.UTC(cutoffDate.getFullYear(), cutoffDate.getMonth(), cutoffDate.getDate());
      return recordDateUTC >= cutoffDateUTC;
    });
    
    console.log("Admin - Filtered analytics records:", filteredAnalytics.length);

    // Group analytics by business_id
    const analyticsByBusiness = new Map<string, AnalyticsRecord[]>();
    
    filteredAnalytics.forEach((record: AnalyticsRecord) => {
      let businessId = record.business_id;
      
      // If this is a listing_id, convert to business_id
      if (listingToBusinessMap.has(businessId)) {
        businessId = listingToBusinessMap.get(businessId)!;
      }
      
      if (!analyticsByBusiness.has(businessId)) {
        analyticsByBusiness.set(businessId, []);
      }
      analyticsByBusiness.get(businessId)!.push(record);
    });

    // Combine data for all businesses
    const combined = businesses.map((business: any) => {
      // Extract plan_key and is_featured from joined data
      const listing = business.business_listings?.[0];
      const planKey = listing?.listing_plans?.plan_key || "free";
      const isFeatured = listing?.is_featured || false;

      // Get analytics for this business
      const businessAnalytics = analyticsByBusiness.get(business.id) || [];

      const totals = businessAnalytics.reduce(
        (acc, curr) => ({
          profile_views: acc.profile_views + (curr.profile_views || 0),
          website_clicks: acc.website_clicks + (curr.website_clicks || 0),
          phone_clicks: acc.phone_clicks + (curr.phone_clicks || 0),
          email_clicks: acc.email_clicks + (curr.email_clicks || 0),
          direction_clicks: acc.direction_clicks + (curr.direction_clicks || 0),
        }),
        {
          profile_views: 0,
          website_clicks: 0,
          phone_clicks: 0,
          email_clicks: 0,
          direction_clicks: 0,
        }
      );

      return {
        business_id: business.id,
        business_name: business.business_name,
        slug: business.slug,
        plan_key: planKey,
        is_featured: isFeatured,
        ...totals,
        total_engagement:
          totals.website_clicks +
          totals.phone_clicks +
          totals.email_clicks +
          totals.direction_clicks,
      };
    });

    // Sort by total engagement
    combined.sort((a: BusinessAnalytics, b: BusinessAnalytics) => b.total_engagement - a.total_engagement);

    setAnalytics(combined);
  }

  const filteredAnalytics = analytics.filter(
    (item) =>
      item.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totals = analytics.reduce(
    (acc, curr) => ({
      profile_views: acc.profile_views + curr.profile_views,
      website_clicks: acc.website_clicks + curr.website_clicks,
      phone_clicks: acc.phone_clicks + curr.phone_clicks,
      email_clicks: acc.email_clicks + curr.email_clicks,
      direction_clicks: acc.direction_clicks + curr.direction_clicks,
      total_engagement: acc.total_engagement + curr.total_engagement,
    }),
    {
      profile_views: 0,
      website_clicks: 0,
      phone_clicks: 0,
      email_clicks: 0,
      direction_clicks: 0,
      total_engagement: 0,
    }
  );

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

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#371a5b] mb-4">Access Denied</h1>
          <p className="text-gray-600">{error}</p>
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
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </a>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Admin Analytics
          </h1>
          <p className="text-xl text-white/80">
            View analytics for all business listings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Listings</p>
                <p className="text-2xl font-bold text-[#371a5b]">{analytics.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-[#54afe6]" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Profile Views</p>
                <p className="text-2xl font-bold text-[#371a5b]">{totals.profile_views.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-[#54afe6]" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Website Clicks</p>
                <p className="text-2xl font-bold text-[#371a5b]">{totals.website_clicks.toLocaleString()}</p>
              </div>
              <MousePointer className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Phone Clicks</p>
                <p className="text-2xl font-bold text-[#371a5b]">{totals.phone_clicks.toLocaleString()}</p>
              </div>
              <Phone className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Email Clicks</p>
                <p className="text-2xl font-bold text-[#371a5b]">{totals.email_clicks.toLocaleString()}</p>
              </div>
              <Mail className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Engagement</p>
                <p className="text-2xl font-bold text-[#371a5b]">{totals.total_engagement.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#bb7ce4]" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analytics Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredAnalytics.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">
                {searchQuery ? "No businesses found matching your search" : "No analytics data yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Eye className="w-4 h-4 inline mr-1" />
                      Views
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <MousePointer className="w-4 h-4 inline mr-1" />
                      Web
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Directions
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAnalytics.map((item) => (
                    <tr key={item.business_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#371a5b]">{item.business_name}</p>
                          <a
                            href={`/listing/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#54afe6] hover:underline"
                          >
                            /{item.slug}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              item.plan_key === "vip"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.plan_key === "premium"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.plan_key}
                          </span>
                          {item.is_featured && (
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {item.profile_views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {item.website_clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {item.phone_clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {item.email_clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {item.direction_clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-[#371a5b]">
                          {item.total_engagement.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
