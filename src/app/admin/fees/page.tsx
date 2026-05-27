"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  AlertCircle,
  Save,
  Percent,
  Building2,
  Search,
  DollarSign,
} from "lucide-react";

interface BusinessFee {
  id: string;
  business_id: string;
  business_name: string;
  stl_fee_percentage: number;
  notes: string | null;
  updated_at: string;
}

export default function AdminFeesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [fees, setFees] = useState<BusinessFee[]>([]);
  const [filteredFees, setFilteredFees] = useState<BusinessFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredFees(
        fees.filter((f) =>
          f.business_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredFees(fees);
    }
  }, [searchQuery, fees]);

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
      await loadFees();
    } else {
      setError("You don't have permission to access this page");
      setLoading(false);
    }
  }

  async function loadFees() {
    try {
      // Get all businesses with their fee info
      const { data: businesses, error: businessError } = await supabase
        .from("businesses")
        .select("id, business_name")
        .order("business_name");

      if (businessError) throw businessError;

      // Get fee settings for all businesses
      const { data: feesData, error: feesError } = await supabase
        .from("business_fees")
        .select("*");

      if (feesError) throw feesError;

      // Create a map of business_id to fee data
      interface FeeData {
        id: string;
        business_id: string;
        stl_fee_percentage: number;
        notes: string | null;
        updated_at: string;
      }
      const feeMap = new Map<string, FeeData>();
      (feesData as FeeData[] | null)?.forEach((fee) => {
        feeMap.set(fee.business_id, fee);
      });

      // Combine data
      interface BusinessData {
        id: string;
        business_name: string;
      }
      const combined = (businesses as BusinessData[] | null)?.map((b) => {
        const fee = feeMap.get(b.id);
        return {
          id: fee?.id || "",
          business_id: b.id,
          business_name: b.business_name,
          stl_fee_percentage: fee?.stl_fee_percentage ?? 10.0,
          notes: fee?.notes || "",
          updated_at: fee?.updated_at || new Date().toISOString(),
        };
      }) || [];

      setFees(combined);
      setFilteredFees(combined);
    } catch (err) {
      console.error("Error loading fees:", err);
      setError("Failed to load fee settings");
    }
    setLoading(false);
  }

  async function updateFee(
    businessId: string,
    percentage: number,
    notes: string
  ) {
    setSaving(businessId);
    setSuccessMessage("");

    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from("business_fees")
        .select("id")
        .eq("business_id", businessId)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("business_fees")
          .update({
            stl_fee_percentage: percentage,
            notes: notes || null,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq("business_id", businessId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase.from("business_fees").insert({
          business_id: businessId,
          stl_fee_percentage: percentage,
          notes: notes || null,
          created_by: user.id,
        });

        if (error) throw error;
      }

      // Update local state
      setFees((prev) =>
        prev.map((f) =>
          f.business_id === businessId
            ? { ...f, stl_fee_percentage: percentage, notes: notes || null }
            : f
        )
      );

      setSuccessMessage(`Fee updated for ${fees.find((f) => f.business_id === businessId)?.business_name}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update fee");
    }
    setSaving(null);
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

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#371a5b] mb-4">Access Denied</h1>
          <p className="text-gray-600">{error || "You don't have permission to access this page"}</p>
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
        <div className="max-w-7xl mx-auto px-4">
          <h1
            className="text-4xl md:text-5xl font-bold"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            STL Fee Management
          </h1>
          <p className="text-xl text-white/80 mt-4">
            Manage commission percentages for each business
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-8 flex items-center">
            <DollarSign className="w-6 h-6 mr-3" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center">
            <AlertCircle className="w-6 h-6 mr-3" />
            {error}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
            />
          </div>
        </div>

        {/* Fees Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Business
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <Percent className="w-4 h-4 inline mr-1" />
                    STL Fee %
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Notes
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFees.map((fee) => (
                  <FeeRow
                    key={fee.business_id}
                    fee={fee}
                    onSave={updateFee}
                    saving={saving === fee.business_id}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredFees.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No businesses found</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

interface FeeRowProps {
  fee: BusinessFee;
  onSave: (businessId: string, percentage: number, notes: string) => void;
  saving: boolean;
}

function FeeRow({ fee, onSave, saving }: FeeRowProps) {
  const [percentage, setPercentage] = useState(fee.stl_fee_percentage.toString());
  const [notes, setNotes] = useState(fee.notes || "");

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="font-medium text-[#371a5b]">{fee.business_name}</div>
        <div className="text-sm text-gray-500">ID: {fee.business_id.slice(0, 8)}...</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
          />
          <span className="text-gray-500">%</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
        />
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onSave(fee.business_id, parseFloat(percentage) || 0, notes)}
          disabled={saving}
          className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save
        </button>
      </td>
    </tr>
  );
}
