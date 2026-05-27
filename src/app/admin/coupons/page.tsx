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
  Building2,
  Search,
} from "lucide-react";

interface Coupon {
  id: string;
  business_id: string;
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
  business_name?: string;
}

export default function AdminCouponsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin" || profile?.role === "super_admin") {
      setIsAdmin(true);
      await loadCoupons();
    } else {
      setError("You don't have permission to access this page");
    }
    setLoading(false);
  }

  async function loadCoupons() {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select(`
          *,
          business:business_id (business_name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching coupons:", error);
        setError("Failed to load coupons");
      } else {
        // Transform data to include business_name
        const transformedData = data?.map((coupon: any) => ({
          ...coupon,
          business_name: coupon.business?.business_name || "Unknown",
        })) || [];
        setCoupons(transformedData);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred");
    }
  }

  async function deleteCoupon(id: string) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) {
        console.error("Error deleting coupon:", error);
        alert("Failed to delete coupon");
      } else {
        setCoupons(coupons.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred");
    }
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

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Admin Coupon Management
          </h1>
          <p className="text-xl text-white/80">
            Manage coupons for all businesses
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
                <p className="text-gray-500 text-sm">Total STL Fees</p>
                <p className="text-3xl font-bold text-[#bb7ce4]">
                  ${coupons.reduce((sum, c) => sum + c.stl_fee_earned, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#bb7ce4]" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
            />
          </div>
          <a
            href="/admin/coupons/new"
            className="inline-flex items-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Coupon
          </a>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredCoupons.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? "No coupons found matching your search" : "No coupons yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coupon
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Redemptions
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#54afe6] to-[#bb7ce4] rounded-lg flex items-center justify-center text-white mr-3">
                            <Tag className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-[#371a5b]">{coupon.title}</p>
                            <p className="text-sm text-gray-500">{coupon.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="w-4 h-4 mr-1" />
                          {coupon.business_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-[#54afe6]">
                          {formatDiscount(coupon.discount_type, coupon.discount_value)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(coupon.status)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {coupon.total_redemptions}
                        {coupon.max_redemptions && ` / ${coupon.max_redemptions}`}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={`/admin/coupons/edit/${coupon.id}`}
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
