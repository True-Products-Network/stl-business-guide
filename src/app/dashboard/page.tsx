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
} from "lucide-react";

interface Business {
  id: string;
  business_name: string;
  slug: string;
  description_short: string | null;
  plan_tier: string;
  plan_status: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

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
      // For now, query business_listings directly
      // In future, use the owner_businesses view when profiles table exists
      const { data, error } = await supabase
        .from("business_listings")
        .select(
          `
          id,
          business_name,
          slug,
          description_short,
          plan_tier,
          plan_status,
          is_featured,
          logo_url,
          created_at,
          updated_at,
          location:location_id(name),
          category:category_id(name)
        `
        )
        .eq("email", user?.email)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading businesses:", error);
        setError("Failed to load your businesses");
      } else {
        // Transform data to match Business interface
        const transformed = data?.map((item: any) => ({
          ...item,
          location_name: item.location?.name || null,
          category_name: item.category?.name || null,
        }));
        setBusinesses(transformed || []);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
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
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Your Listings</p>
                <p className="text-3xl font-bold text-[#371a5b]">
                  {businesses.length}
                </p>
              </div>
              <Building2 className="w-10 h-10 text-[#54afe6]" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Plans</p>
                <p className="text-3xl font-bold text-[#371a5b]">
                  {businesses.filter((b) => b.plan_status === "active").length}
                </p>
              </div>
              <Crown className="w-10 h-10 text-[#bb7ce4]" />
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
            href="/dashboard/settings"
            className="inline-flex items-center bg-white text-[#371a5b] border-2 border-[#371a5b] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            <Settings className="w-5 h-5 mr-2" />
            Account Settings
          </a>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Businesses List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#371a5b]">Your Businesses</h2>
          </div>

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
          ) : (
            <div className="divide-y divide-gray-200">
              {businesses.map((business) => (
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
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              business.plan_status === "active"
                                ? "bg-green-100 text-green-800"
                                : business.plan_status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {business.plan_status === "active"
                              ? "Active"
                              : business.plan_status === "pending"
                              ? "Pending Approval"
                              : business.plan_status}
                          </span>
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
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <a
                        href={`/listing/${business.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-[#54afe6] transition"
                        title="View Listing"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      <a
                        href={`/dashboard/edit/${business.id}`}
                        className="p-2 text-gray-400 hover:text-[#371a5b] transition"
                        title="Edit Listing"
                      >
                        <Edit className="w-5 h-5" />
                      </a>
                    </div>
                  </div>

                  {/* Upgrade CTA for Free listings */}
                  {(!business.plan_tier ||
                    business.plan_tier.toLowerCase() === "free") && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-[#54afe6]/10 to-[#bb7ce4]/10 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#371a5b]">
                            Upgrade to Premium
                          </p>
                          <p className="text-sm text-gray-600">
                            Get priority placement, more categories, and photos
                          </p>
                        </div>
                        <a
                          href={`/pricing?upgrade=${business.id}`}
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
