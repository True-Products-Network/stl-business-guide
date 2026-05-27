"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Tag,
  Percent,
  DollarSign,
  Gift,
} from "lucide-react";

export default function NewCouponPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    business_id: "",
    code: "",
    title: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    max_redemptions: "",
    max_redemptions_per_customer: "1",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    terms_conditions: "",
    redemption_instructions: "",
    image_url: "",
  });

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

    // Get user's email
    const userEmail = user?.email;
    
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

    if (businessesError) {
      setError("Failed to load businesses");
    } else if (businessesData && businessesData.length > 0) {
      // Get plan info for each business
      const businessIds = businessesData.map((b: any) => b.id);
      const { data: listingsData } = await supabase
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
      if (transformedData.length > 0) {
        setFormData((prev) => ({ ...prev, business_id: transformedData[0].id }));
      }
    }
    setLoading(false);
  }

  function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("coupon-images")
        .upload(fileName, file);

      if (uploadError) {
        alert("Failed to upload image");
      } else {
        const { data } = supabase.storage
          .from("coupon-images")
          .getPublicUrl(fileName);
        setFormData({ ...formData, image_url: data.publicUrl });
      }
    } catch (err) {
      alert("An error occurred");
    }
    setUploadingImage(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const { error } = await supabase.from("coupons").insert({
        ...formData,
        end_date: formData.end_date || null,
        discount_value: formData.discount_value
          ? parseFloat(formData.discount_value)
          : null,
        max_redemptions: formData.max_redemptions
          ? parseInt(formData.max_redemptions)
          : null,
        max_redemptions_per_customer: parseInt(
          formData.max_redemptions_per_customer
        ),
        created_by: user.id,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard/coupons");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
    setSaving(false);
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

  if (businesses.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#371a5b] mb-4">
            No Business Found
          </h1>
          <p className="text-gray-600 mb-6">
            You need to create a business listing before you can create coupons.
          </p>
          <a
            href="/submit-listing"
            className="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Create Business Listing
          </a>
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
          <a
            href="/dashboard/coupons"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Coupons
          </a>
          <h1
            className="text-4xl md:text-5xl font-bold"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Create New Coupon
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Selection */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Business *
            </label>
            <select
              value={formData.business_id}
              onChange={(e) =>
                setFormData({ ...formData, business_id: e.target.value })
              }
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.business_name}
                </option>
              ))}
            </select>
          </div>

          {/* Coupon Image */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coupon Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 bg-gradient-to-br from-[#54afe6] to-[#bb7ce4] rounded-lg flex items-center justify-center text-white">
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="Coupon"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="coupon-image"
                />
                <label
                  htmlFor="coupon-image"
                  className="inline-flex items-center bg-[#54afe6] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#54afe6]/90 transition"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <ImageIcon className="w-5 h-5 mr-2" />
                  )}
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </label>
              </div>
            </div>
          </div>

          {/* Coupon Code */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coupon Code *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                placeholder="SUMMER2024"
              />
              <button
                type="button"
                onClick={generateCode}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Generate
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Customers will enter this code to redeem the offer
            </p>
          </div>

          {/* Title & Description */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                  placeholder="20% Off Your First Visit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                  placeholder="Describe what the coupon offers..."
                />
              </div>
            </div>
          </div>

          {/* Discount Type & Value */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-[#371a5b] mb-4">Discount Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, discount_type: "percentage" })
                    }
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition ${
                      formData.discount_type === "percentage"
                        ? "border-[#54afe6] bg-[#54afe6]/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Percent className="w-6 h-6 mb-2" />
                    <span className="text-sm">Percentage</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, discount_type: "fixed_amount" })
                    }
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition ${
                      formData.discount_type === "fixed_amount"
                        ? "border-[#54afe6] bg-[#54afe6]/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <DollarSign className="w-6 h-6 mb-2" />
                    <span className="text-sm">Fixed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, discount_type: "free_service" })
                    }
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition ${
                      formData.discount_type === "free_service"
                        ? "border-[#54afe6] bg-[#54afe6]/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Gift className="w-6 h-6 mb-2" />
                    <span className="text-sm">Free</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value
                </label>
                <div className="relative">
                  {formData.discount_type === "percentage" && (
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  )}
                  {formData.discount_type === "fixed_amount" && (
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  )}
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_value: e.target.value })
                    }
                    disabled={formData.discount_type === "free_service"}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6] disabled:bg-gray-100"
                    placeholder={
                      formData.discount_type === "percentage" ? "20" : "10"
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Limits & Dates */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-[#371a5b] mb-4">Limits & Availability</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Redemptions (leave empty for unlimited)
                </label>
                <input
                  type="number"
                  value={formData.max_redemptions}
                  onChange={(e) =>
                    setFormData({ ...formData, max_redemptions: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Per Customer
                </label>
                <input
                  type="number"
                  value={formData.max_redemptions_per_customer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_redemptions_per_customer: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (leave empty for no expiration)
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                />
              </div>
            </div>
          </div>

          {/* Terms & Instructions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-[#371a5b] mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  value={formData.terms_conditions}
                  onChange={(e) =>
                    setFormData({ ...formData, terms_conditions: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                  placeholder="Any restrictions or conditions..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redemption Instructions
                </label>
                <textarea
                  value={formData.redemption_instructions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      redemption_instructions: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-[#54afe6]"
                  placeholder="How customers redeem this coupon..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <a
              href="/dashboard/coupons"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {saving ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}
