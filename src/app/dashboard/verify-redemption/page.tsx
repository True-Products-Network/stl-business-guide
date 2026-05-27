"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  QrCode,
} from "lucide-react";

interface Redemption {
  id: string;
  redemption_code: string;
  coupon: {
    title: string;
    code: string;
    discount_type: string;
    discount_value: number | null;
  };
  customer_email: string;
  customer_phone: string | null;
  redeemed_at: string;
  status: string;
  used_at: string | null;
}

export default function VerifyRedemptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchCode, setSearchCode] = useState("");
  const [redemption, setRedemption] = useState<Redemption | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [businesses, setBusinesses] = useState<string[]>([]);

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
    await loadBusinesses(user.email);
  }

  async function loadBusinesses(userEmail: string | undefined) {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("id")
        .eq("email", userEmail);

      if (error) throw error;

      const ids = data?.map((b) => b.id) || [];
      setBusinesses(ids);
    } catch (err) {
      console.error("Error loading businesses:", err);
    }
    setLoading(false);
  }

  async function searchRedemption(e: React.FormEvent) {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setVerifying(true);
    setError("");
    setSuccess("");
    setRedemption(null);

    try {
      const { data, error } = await supabase
        .from("coupon_redemptions")
        .select(`
          *,
          coupon:coupons(title, code, discount_type, discount_value)
        `)
        .eq("redemption_code", searchCode.trim().toUpperCase())
        .in("business_id", businesses)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setError("Redemption code not found or does not belong to your business");
        } else {
          throw error;
        }
      } else if (data) {
        setRedemption(data as Redemption);
      }
    } catch (err: any) {
      setError(err.message || "Failed to search for redemption");
    }
    setVerifying(false);
  }

  async function markAsUsed() {
    if (!redemption) return;

    setVerifying(true);
    try {
      const { error } = await supabase
        .from("coupon_redemptions")
        .update({
          status: "used",
          used_at: new Date().toISOString(),
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq("id", redemption.id);

      if (error) throw error;

      setSuccess("Redemption marked as used successfully!");
      setRedemption({ ...redemption, status: "used", used_at: new Date().toISOString() });
    } catch (err: any) {
      setError(err.message || "Failed to mark as used");
    }
    setVerifying(false);
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

      {/* Header */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1
            className="text-4xl md:text-5xl font-bold"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Verify Redemption
          </h1>
          <p className="text-xl text-white/80 mt-4">
            Enter the redemption code to verify and mark coupons as used
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <form onSubmit={searchRedemption} className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redemption Code
              </label>
              <div className="relative">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Enter code (e.g., STL-ABC123)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6] uppercase"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={verifying || !searchCode.trim()}
                className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
              >
                {verifying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Verify
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center">
            <XCircle className="w-6 h-6 mr-3" />
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-8 flex items-center">
            <CheckCircle className="w-6 h-6 mr-3" />
            {success}
          </div>
        )}

        {/* Redemption Details */}
        {redemption && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#371a5b]">Redemption Details</h2>
              <span
                className={`px-4 py-2 rounded-full font-semibold ${
                  redemption.status === "used"
                    ? "bg-gray-100 text-gray-600"
                    : redemption.status === "redeemed"
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {redemption.status === "used"
                  ? "Already Used"
                  : redemption.status === "redeemed"
                  ? "Valid - Ready to Use"
                  : redemption.status}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm text-gray-500">Coupon</label>
                <p className="text-lg font-semibold text-[#371a5b]">
                  {redemption.coupon?.title}
                </p>
                <p className="text-sm text-gray-600">
                  Code: {redemption.coupon?.code}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Redemption Code</label>
                <p className="text-2xl font-mono font-bold text-[#54afe6]">
                  {redemption.redemption_code}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Customer Email</label>
                <p className="text-gray-800">{redemption.customer_email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Customer Phone</label>
                <p className="text-gray-800">{redemption.customer_phone || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Redeemed At</label>
                <p className="text-gray-800">
                  {new Date(redemption.redeemed_at).toLocaleString()}
                </p>
              </div>
              {redemption.used_at && (
                <div>
                  <label className="text-sm text-gray-500">Used At</label>
                  <p className="text-gray-800">
                    {new Date(redemption.used_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {redemption.status === "redeemed" && (
              <button
                onClick={markAsUsed}
                disabled={verifying}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                Mark as Used
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
