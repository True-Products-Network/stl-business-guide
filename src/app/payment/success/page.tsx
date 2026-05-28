"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { CheckCircle, Loader2, Eye } from "lucide-react";

interface PaymentDetails {
  businessId: string;
  businessName: string;
  planName: string;
  slug?: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setLoading(false);
      setError("No session ID found");
    }
  }, [sessionId]);

  async function verifyPayment() {
    try {
      // Fetch session details from Stripe to get business info
      const response = await fetch(`/api/stripe/session?session_id=${sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        setPaymentDetails({
          businessId: data.businessId,
          businessName: data.businessName,
          planName: data.planName,
          slug: data.slug,
        });
      }
      
      // Wait a moment for webhook to process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-32">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {loading ? (
            <div className="py-12">
              <Loader2 className="w-12 h-12 animate-spin text-[#54afe6] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-[#371a5b] mb-2">
                Processing Payment...
              </h1>
              <p className="text-gray-600">
                Please wait while we confirm your payment.
              </p>
            </div>
          ) : error ? (
            <div className="py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-3xl">✕</span>
              </div>
              <h1 className="text-2xl font-bold text-[#371a5b] mb-2">
                Payment Verification Failed
              </h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                href="/dashboard"
                className="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1
                className="text-3xl font-bold text-[#371a5b] mb-4"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-2">
                Thank you for your payment. Your listing has been upgraded to{" "}
                <strong>{paymentDetails?.planName || "Premium"}</strong>.
              </p>
              <p className="text-gray-600 mb-8">
                You can now manage your listing from your dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Go to Dashboard
                </Link>
                {paymentDetails?.slug ? (
                  <Link
                    href={`/listing/${paymentDetails.slug}`}
                    className="inline-flex items-center justify-center bg-white text-[#371a5b] border-2 border-[#371a5b] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Listing
                  </Link>
                ) : (
                  <Link
                    href="/listings"
                    className="inline-flex items-center justify-center bg-white text-[#371a5b] border-2 border-[#371a5b] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Browse Listings
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-[#54afe6]" />
          </div>
          <Footer />
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
