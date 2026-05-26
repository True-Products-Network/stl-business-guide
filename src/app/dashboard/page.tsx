"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "../../lib/supabase";
import {
  Building2,
  TrendingUp,
  Settings,
  Plus,
  ExternalLink,
  Edit,
  Crown,
  Star,
  Loader2,
  AlertCircle,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

interface Business {
  id: string;
  business_name: string;
  slug: string;
  description_short: string | null;
  plan_tier: string;
  plan_status: string;
  status: string;
  is_featured: boolean;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
  location_name: string | null;
  category_name: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "rejected">("all");

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [statusFilter, businesses]);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUser(user);
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (profile?.role === "admin" || profile?.role === "super_admin") {
      setIsAdmin(true);
    }
    
    await loadBusinesses(user.email || '');
  }

  async function loadBusinesses(userEmail: string) {
    try {
      console.log("Loading businesses for user email:", userEmail);
      
      if (!userEmail) {
        setError("No email found for user");
        setLoading(false);
        return;
      }
      
      // First try a simple query without joins to see if email matching works
      console.log("Trying simple query first...");
      const { data: simpleData, error: simpleError } = await supabase
        .from("businesses")
        .select("id, business_name, email, status")
        .eq("email", userEmail);
      
      console.log("Simple query result:", { simpleData, simpleError, count: simpleData?.length });
      
      if (simpleError) {
        console.error("Simple query error:", simpleError);
        setError("Database error: " + simpleError.message);
        setLoading(false);
        return;
      }
      
      if (!simpleData || simpleData.length === 0) {
        console.log("No businesses found for email:", userEmail);
        // Try case-insensitive search
        const { data: caseData } = await supabase
          .from("businesses")
          .select("id, business_name, email, status")
          .ilike("email", userEmail);
        console.log("Case-insensitive search:", caseData);
        setBusinesses([]);
        setFilteredBusinesses([]);
        setLoading(false);
        return;
      }
      
      // Now get full data with joins
      console.log("Fetching full data with joins...");
      const { data, error } = await supabase
        .from("businesses")
        .select(`
          id,
          business_name,
          slug,
          description_short,
          logo_url,
          status,
          created_at,
          updated_at,
          business_listings!left(
            plan_id,
            listing_status,
            is_featured,
            plan:listing_plans!left(plan_key)
          ),
          business_locations!left(
            city,
            state
          ),
          business_categories!left(
            category:categories!left(name)
          )
        `)
        .eq("email", userEmail)
        .order("created_at", { ascending: false });

      console.log("Full query result:", { data, error, count: data?.length });

      if (error) {
        console.error("Error loading businesses:", error);
        setError("Failed to load your businesses: " + error.message);
      } else if (!data || data.length === 0) {
        console.log("No full data found, using simple data");
        // Fallback to simple data
        const transformed = simpleData?.map((item: any) => ({
          id: item.id,
          business_name: item.business_name,
          slug: item.slug || '',
          description_short: item.description_short || null,
          plan_tier: "free",
          plan_status: "pending",
          status: item.status,
          is_featured: false,
          logo_url: null,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          location_name: null,
          category_name: null,
        }));
        setBusinesses(transformed || []);
        setFilteredBusinesses(transformed || []);
      } else {
        // Transform data to match Business interface
        const transformed = data?.map((item: any) => {
          const listing = item.business_listings?.[0];
          const location = item.business_locations?.[0];
          const categoryLink = item.business_categories?.[0];
          
          return {
            id: item.id,
            business_name: item.business_name,
            slug: item.slug,
            description_short: item.description_short,
            plan_tier: listing?.plan?.plan_key || "free",
            plan_status: listing?.listing_status || "pending",
            status: item.status,
            is_featured: listing?.is_featured || false,
            logo_url: item.logo_url,
            created_at: item.created_at,
            updated_at: item.updated_at,
            location_name: location ? `${location.city}, ${location.state}` : null,
            category_name: categoryLink?.category?.name || null,
          };
        });
        console.log("Transformed businesses:", transformed);
        setBusinesses(transformed || []);
        setFilteredBusinesses(transformed || []);
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError("An error occurred: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function filterBusinesses() {
    if (statusFilter === "all") {
      setFilteredBusinesses(businesses);
    } else {
      // Only filter by the main status column, not plan_status
      setFilteredBusinesses(
        businesses.filter((b) => b.status === statusFilter)
      );
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "active":
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Approval
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  }

  function canEditListing(status: string) {
    return status === "active" || status === "approved";
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

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

  const statusCounts = {
    all: businesses.length,
    active: businesses.filter((b) => b.status === "active").length,
    pending: businesses.filter((b) => b.status === "pending").length,
    rejected: businesses.filter((b) => b.status === "rejected").length,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Business Dashboard
              </h1>
              <p className="text-xl text-white/80">
                Welcome back, {user?.user_metadata?.first_name || "Business Owner"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Listings</p>
                <p className="text-3xl font-bold text-[#371a5b]">
                  {statusCounts.all}
                </p>
              </div>
              <Building2 className="w-10 h-10 text-[#54afe6]" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {statusCounts.active}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {statusCounts.pending}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Featured</p>
                <p className="text-3xl font-bold text-[#371a5b]">
                  {businesses.filter((b) => b.is_featured).length}
                </p>
              </div>
              <Star className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <a
            href="/submit-listing"
            className="inline-flex items-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Listing
          </a>

          <a
            href="/dashboard/analytics"
            className="inline-flex items-center bg-white text-[#371a5b] border-2 border-[#371a5b] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            View Analytics
          </a>

          <a
            href="/dashboard/images"
            className="inline-flex items-center bg-white text-[#371a5b] border-2 border-[#371a5b] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            <ImageIcon className="w-5 h-5 mr-2" />
            Images & Video
          </a>

          <a
            href="/dashboard/settings"
            className="inline-flex items-center bg-white text-[#371a5b] border-2 border-[#371a5b] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            <Settings className="w-5 h-5 mr-2" />
            Account Settings
          </a>

          {isAdmin && (
            <a
              href="/admin/blog"
              className="inline-flex items-center bg-gradient-to-r from-[#54afe6] to-[#371a5b] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              <FileText className="w-5 h-5 mr-2" />
              Blog Management
            </a>
          )}
        </div>

        {/* Debug Info */}
        {user?.email && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-8">
            <p className="text-sm">Logged in as: {user.email}</p>
            <p className="text-sm">Total listings found: {businesses.length}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Status Filter Tabs */}
        {businesses.length > 0 && (
          <div className="bg-white rounded-t-xl shadow-md border-b border-gray-200">
            <div className="flex flex-wrap">
              {[
                { key: "all", label: "All Listings", count: statusCounts.all },
                { key: "active", label: "Active", count: statusCounts.active },
                { key: "pending", label: "Pending", count: statusCounts.pending },
                { key: "rejected", label: "Rejected", count: statusCounts.rejected },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key as any)}
                  className={`px-6 py-4 font-medium text-sm transition border-b-2 ${
                    statusFilter === tab.key
                      ? "border-[#371a5b] text-[#371a5b] bg-[#371a5b]/5"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Businesses List */}
        <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
          {businesses.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No businesses yet
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by submitting your first business listing
              </p>
              <a
                href="/submit-listing"
                className="inline-flex items-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                <Plus className="w-5 h-5 mr-2" />
                Submit Your First Listing
              </a>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">
                No {statusFilter} listings found.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredBusinesses.map((business) => (
                <div
                  key={business.id}
                  className="p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Logo */}
                      <div className="w-16 h-16 bg-gradient-to-br from-[#54afe6] to-[#bb7ce4] rounded-lg flex items-center justify-center text-white text-xl font-bold">
                        {business.logo_url ? (
                          <img
                            src={business.logo_url}
                            alt={business.business_name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          business.business_name.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-[#371a5b]">
                          {business.business_name}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {business.location_name} • {business.category_name}
                        </p>
                        <div className="flex items-center space-x-3 mt-2">
                          {getStatusBadge(business.status)}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {business.plan_tier || "Free"}
                          </span>
                          {business.is_featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </span>
                          )}
                        </div>
                        
                        {/* Status Message */}
                        {business.status === "pending" && (
                          <p className="text-yellow-600 text-sm mt-2">
                            Your listing is under review. You&apos;ll be notified once it&apos;s approved.
                          </p>
                        )}
                        {business.status === "rejected" && (
                          <p className="text-red-600 text-sm mt-2">
                            This listing was not approved. Contact support for more information.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {canEditListing(business.status) ? (
                        <a
                          href={`/listing/${business.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-[#54afe6] transition"
                          title="View Listing"
                        >
                          <Eye className="w-5 h-5" />
                        </a>
                      ) : (
                        <span
                          className="p-2 text-gray-300 cursor-not-allowed"
                          title="View disabled - listing not approved"
                        >
                          <Eye className="w-5 h-5" />
                        </span>
                      )}
                      {canEditListing(business.status) ? (
                        <a
                          href={`/dashboard/edit/${business.id}`}
                          className="p-2 text-gray-400 hover:text-[#371a5b] transition"
                          title="Edit Listing"
                        >
                          <Edit className="w-5 h-5" />
                        </a>
                      ) : (
                        <span
                          className="p-2 text-gray-300 cursor-not-allowed"
                          title="Editing disabled - listing not approved"
                        >
                          <Edit className="w-5 h-5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Upgrade CTA for Free and Premium listings */}
                  {canEditListing(business.status) &&
                    business.plan_tier?.toLowerCase() !== "vip" && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-[#54afe6]/10 to-[#bb7ce4]/10 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#371a5b]">
                            {business.plan_tier?.toLowerCase() === "premium" 
                              ? "Upgrade to VIP" 
                              : "Upgrade to Premium"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {business.plan_tier?.toLowerCase() === "premium"
                              ? "Get top placement, unlimited categories, and video"
                              : "Get priority placement, more categories, and photos"}
                          </p>
                        </div>
                        <a
                          href={`/pricing?upgrade=${business.id}&current=${business.plan_tier || 'free'}`}
                          className="inline-flex items-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition text-sm"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
