"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Info, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get("business_id");
  const [loading, setLoading] = useState(true);
  const [downgraded, setDowngraded] = useState(false);

  useEffect(() => {
    if (businessId) {
      downgradeToFree();
    } else {
      setLoading(false);
    }
  }, [businessId]);

  async function downgradeToFree() {
    try {
      // Get free plan ID
      const { data: freePlan } = await supabase
        .from("listing_plans")
        .select("id")
        .eq("plan_key", "free")
        .single();

      if (freePlan) {
        // Downgrade listing to free plan
        await supabase
          .from("business_listings")
          .update({
            plan_id: freePlan.id,
            payment_status: "not_required",
            listing_status: "pending",
          })
          .eq("id", businessId);

        setDowngraded(true);
      }
    } catch (err) {
      console.error("Error downgrading:", err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="py-12">
        <Loader2 className="w-12 h-12 animate-spin text-[#54afe6] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#371a5b] mb-2">
          Processing...
        </h1>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Info className="w-10 h-10 text-blue-500" />
      </div>
      <h1
        className="text-3xl font-bold text-[#371a5b] mb-4"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        Payment Cancelled
      </h1>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <p className="text-gray-700 mb-4">
          Your listing has been saved but is pending review as a <strong>Free plan</strong>.
        </p>
        <p className="text-gray-600">
          You can upgrade to Premium or VIP anytime from your dashboard to get immediate approval and unlock all features.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center bg-white text-[#371a5b] border-2 border-[#371a5b] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          View Pricing Plans
        </Link>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-32">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Suspense
            fallback={
              <div className="py-12">
                <Loader2 className="w-12 h-12 animate-spin text-[#54afe6] mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-[#371a5b] mb-2">
                  Processing...
                </h1>
              </div>
            }
          >
            <PaymentCancelContent />
          </Suspense>
        </div>
      </div>

      <Footer />
    </main>
  );
}
