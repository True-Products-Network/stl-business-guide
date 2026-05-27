"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  Search,
  Filter,
} from "lucide-react";

interface ClaimRequest {
  id: string;
  business_id: string;
  business_name: string;
  claimant_name: string;
  claimant_email: string;
  claimant_phone: string;
  proof_notes: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export default function AdminClaimsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<ClaimRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    filterClaims();
  }, [statusFilter, searchQuery, claims]);

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
      await loadClaims();
    } else {
      setError("You don't have permission to access this page");
      setLoading(false);
    }
  }

  async function loadClaims() {
    try {
      const { data, error } = await supabase
        .from("claim_requests")
        .select(`
          *,
          business:businesses(business_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to include business_name
      const transformed = data?.map((claim: any) => ({
        ...claim,
        business_name: claim.business?.business_name || "Unknown Business",
      })) || [];

      setClaims(transformed);
      setFilteredClaims(transformed);
    } catch (err) {
      console.error("Error loading claims:", err);
      setError("Failed to load claim requests");
    }
    setLoading(false);
  }

  function filterClaims() {
    let filtered = claims;

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.business_name.toLowerCase().includes(query) ||
          c.claimant_name.toLowerCase().includes(query) ||
          c.claimant_email.toLowerCase().includes(query)
      );
    }

    setFilteredClaims(filtered);
  }

  async function updateClaimStatus(claimId: string, status: "approved" | "rejected") {
    setProcessing(true);
    try {
      // Get the claim details first
      const { data: claim, error: claimError } = await supabase
        .from("claim_requests")
        .select("*")
        .eq("id", claimId)
        .single();

      if (claimError) throw claimError;

      // Update claim status
      const { error } = await supabase
        .from("claim_requests")
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", claimId);

      if (error) throw error;

      // If approved, update the business with new owner info
      if (status === "approved" && claim) {
        const updateData: any = {
          email: claim.claimant_email,
          phone: claim.claimant_phone || null,
        };
        
        // Add website_url if it exists in the claim
        if (claim.website_url) {
          updateData.website_url = claim.website_url;
        }
        
        const { error: businessError } = await supabase
          .from("businesses")
          .update(updateData)
          .eq("id", claim.business_id);

        if (businessError) {
          console.error("Error updating business:", businessError);
          alert("Claim approved but failed to update business details. Please update manually.");
        } else {
          console.log("Business updated with new owner info");
        }
      }

      // Update local state
      setClaims((prev) =>
        prev.map((c) =>
          c.id === claimId
            ? { ...c, status, admin_notes: adminNotes, updated_at: new Date().toISOString() }
            : c
        )
      );

      setSelectedClaim(null);
      setAdminNotes("");
      alert(`Claim ${status} successfully!`);
    } catch (err) {
      console.error("Error updating claim:", err);
      alert("Failed to update claim status");
    }
    setProcessing(false);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
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
        return null;
    }
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

  const statusCounts = {
    all: claims.length,
    pending: claims.filter((c) => c.status === "pending").length,
    approved: claims.filter((c) => c.status === "approved").length,
    rejected: claims.filter((c) => c.status === "rejected").length,
  };

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
            Claim Requests
          </h1>
          <p className="text-xl text-white/80 mt-4">
            Review and manage business listing claims
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center">
            <AlertCircle className="w-6 h-6 mr-3" />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Claims</p>
                <p className="text-3xl font-bold text-[#371a5b]">{statusCounts.all}</p>
              </div>
              <FileText className="w-10 h-10 text-[#54afe6]" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Approved</p>
                <p className="text-3xl font-bold text-green-600">{statusCounts.approved}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{statusCounts.rejected}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by business, name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                    statusFilter === status
                      ? "bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Business</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Claimant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Submitted</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#371a5b]">{claim.business_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        {claim.claimant_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-3 h-3 mr-1" />
                          {claim.claimant_email}
                        </div>
                        <div className="flex items-center text-gray-600 mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {claim.claimant_phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(claim.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {claim.status === "pending" ? (
                        <button
                          onClick={() => {
                            setSelectedClaim(claim);
                            setAdminNotes(claim.admin_notes || "");
                          }}
                          className="text-[#54afe6] hover:text-[#371a5b] font-medium"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-gray-400">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClaims.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No claim requests found</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#371a5b] mb-6">Review Claim Request</h2>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Business</h3>
                <p className="text-[#371a5b] font-medium">{selectedClaim.business_name}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Claimant Information</h3>
                <p><span className="text-gray-500">Name:</span> {selectedClaim.claimant_name}</p>
                <p><span className="text-gray-500">Email:</span> {selectedClaim.claimant_email}</p>
                <p><span className="text-gray-500">Phone:</span> {selectedClaim.claimant_phone}</p>
              </div>

              {selectedClaim.proof_notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Proof / Notes</h3>
                  <p className="text-gray-600">{selectedClaim.proof_notes}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                  placeholder="Add notes about this claim decision..."
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateClaimStatus(selectedClaim.id, "rejected")}
                  disabled={processing}
                  className="px-4 py-3 rounded-lg font-bold text-lg transition disabled:opacity-50 shadow-lg border-2"
                  style={{ background: 'linear-gradient(to right, #dc2626, #b91c1c)', color: 'white', borderColor: '#991b1b' }}
                >
                  {processing ? "Processing..." : "✗ Reject"}
                </button>
                <button
                  onClick={() => updateClaimStatus(selectedClaim.id, "approved")}
                  disabled={processing}
                  className="px-4 py-3 rounded-lg font-bold text-lg transition disabled:opacity-50 shadow-lg border-2"
                  style={{ background: 'linear-gradient(to right, #16a34a, #15803d)', color: 'white', borderColor: '#166534' }}
                >
                  {processing ? "Processing..." : "✓ Approve"}
                </button>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
