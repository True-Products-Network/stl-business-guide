"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Tag,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number | null;
  max_redemptions: number | null;
  total_redemptions: number;
  status: string;
  start_date: string;
  end_date: string | null;
  image_url: string | null;
  stl_fee_earned: number;
}

interface Business {
  id: string;
  business_name: string;
  plan_key: string;
}

export default function CouponsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
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
    await loadData(user.id);
  }

  async function loadData(userId: string) {
    try {
      // Get user's email
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email;
      
      if (!userEmail) {
        setError("User email not found");
        setLoading(false);
        return;
      }
      
      // Get user's businesses (linked by email)
      const { data: businessesData, error: businessesError } = await supabase
        .from("businesses")
        .select("id, business_name")
        .eq("email", userEmail);

      if (businessesError) throw businessesError;
      
      if (!businessesData || businessesData.length === 0) {
        setBusinesses([]);
        setCoupons([]);
        setLoading(false);
        return;
      }
      
      // Get plan info for each business separately
      const businessIds = businessesData.map((b: any) => b.id);
      const { data: listingsData, error: listingsError } = await supabase
        .from("business_listings")
        .select("business_id, plan_id, listing_plans(plan_key)")
        .in("business_id", businessIds);
      
      // Create a map of business_id to plan_key
      const planMap = new Map();
      if (listingsData) {
        listingsData.forEach((listing: any) => {
          const planKey = listing.listing_plans?.plan_key || 'free';
          planMap.set(listing.business_id, planKey);
        });
      }
      
      // Transform data to include plan_key
      const transformedData = businessesData.map((b: any) => ({
        id: b.id,
        business_name: b.business_name,
        plan_key: planMap.get(b.id) || 'free'
      }));
      
      setBusinesses(transformedData);

      // Get coupons for all user's businesses
      const { data: couponsData, error: couponsError } = await supabase
        .from("coupons")
        .select("*")
        .in("business_id", businessIds)
        .order("created_at", { ascending: false });

      if (couponsError) throw couponsError;
      setCoupons(couponsData || []);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load coupons");
    }
    setLoading(false);
  }

  async function deleteCoupon(id: string) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting coupon:", err);
      alert("Failed to delete coupon");
    }
  }

  function canCreateCoupon(planKey: string) {
    return planKey === "premium" || planKey === "vip";
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Draft
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Paused
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Expired
          </span>
        );
      case "redeemed_out":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            All Redeemed
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

  function formatDiscount(type: string, value: number | null) {
    if (!value) return "Free";
    if (type === "percentage") return `${value}% off`;
    if (type === "fixed_amount") return `$${value} off`;
    return "Free service";
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
            Coupon Management
          </h1>
          <p className="text-xl text-white/80">
            Create and manage special offers for your customers
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Coupons</p>
                <p className="text-3xl font-bold text-[#371a5b]">
                  {coupons.length}
                </p>
              </div>
              <Tag className="w-8 h-8 text-[#54afe6]" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {coupons.filter((c) => c.status === "active").length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Redemptions</p>
                <p className="text-3xl font-bold text-[#371a5b]">
                  {coupons.reduce((sum, c) => sum + c.total_redemptions, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">STL Fees Earned</p>
                <p className="text-3xl font-bold text-[#bb7ce4]">
                  ${coupons.reduce((sum, c) => sum + c.stl_fee_earned, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#bb7ce4]" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#371a5b]">Your Coupons</h2>
          {businesses.some((b) => canCreateCoupon(b.plan_key)) ? (
            <a
              href="/dashboard/coupons/new"
              className="inline-flex items-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Coupon
            </a>
          ) : (
            <div className="text-gray-600">
              Upgrade to Premium or VIP to create coupons{" "}
              <a
                href="/pricing"
                className="text-[#54afe6] hover:underline font-medium"
              >
                View Plans
              </a>
            </div>
          )}
        </div>

        {/* Coupons List */}
        {coupons.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No coupons yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first coupon to attract more customers
            </p>
            {businesses.some((b) => canCreateCoupon(b.plan_key)) && (
              <a
                href="/dashboard/coupons/new"
                className="inline-flex items-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Coupon
              </a>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {/* Coupon Image */}
                <div className="h-48 bg-gradient-to-br from-[#54afe6] to-[#bb7ce4] relative">
                  {coupon.image_url ? (
                    <img
                      src={coupon.image_url}
                      alt={coupon.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Tag className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(coupon.status)}
                  </div>
                </div>

                <div className="p-6">
                  {/* Code */}
                  <div className="bg-gray-100 rounded-lg px-4 py-2 mb-4 text-center">
                    <span className="text-2xl font-bold text-[#371a5b] tracking-wider">
                      {coupon.code}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-[#371a5b] mb-2">
                    {coupon.title}
                  </h3>

                  {/* Description */}
                  {coupon.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {coupon.description}
                    </p>
                  )}

                  {/* Discount */}
                  <div className="flex items-center text-lg font-semibold text-[#54afe6] mb-4">
                    <Tag className="w-5 h-5 mr-2" />
                    {formatDiscount(coupon.discount_type, coupon.discount_value)}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      {coupon.total_redemptions} redeemed
                      {coupon.max_redemptions &&
                        ` / ${coupon.max_redemptions}`}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {coupon.end_date
                        ? `Until ${new Date(coupon.end_date).toLocaleDateString()}`
                        : "No expiration"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                    <a
                      href={`/dashboard/coupons/edit/${coupon.id}`}
                      className="p-2 text-gray-400 hover:text-[#371a5b] transition"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => deleteCoupon(coupon.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
