'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      // Verify the session with your backend
      verifySession(sessionId);
    } else {
      setLoading(false);
      setError('No session ID found');
    }
  }, [sessionId]);

  async function verifySession(id: string) {
    try {
      // You can add session verification here if needed
      // For now, we'll just show the success page
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Failed to verify payment');
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-[#54afe6]" />
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/pricing"
              className="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold"
            >
              Back to Pricing
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-[#371a5b] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for your subscription! Your business listing has been upgraded and will be activated shortly.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-semibold text-[#371a5b] mb-2">What happens next?</h2>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>✓ Your payment has been processed</li>
              <li>✓ Your listing will be upgraded within 24 hours</li>
              <li>✓ You&apos;ll receive a confirmation email</li>
              <li>✓ Your premium features will be activated</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listings"
              className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              View Your Listing
            </Link>
            <Link
              href="/"
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
