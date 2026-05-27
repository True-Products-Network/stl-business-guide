'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '@/lib/supabase';
import { Building2, CheckCircle, Loader2, AlertCircle, ArrowLeft, User, Mail, Phone } from 'lucide-react';

function ClaimListingForm() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get('business');
  
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    message: '',
  });

  useEffect(() => {
    if (businessId) {
      loadBusiness();
    } else {
      setLoading(false);
    }
  }, [businessId]);

  async function loadBusiness() {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, business_name, email')
        .eq('id', businessId)
        .single();
      
      if (error) {
        console.error('Error loading business:', error);
        setError('Business not found');
      } else {
        setBusiness(data);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load business');
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      console.log('Submitting claim for business:', businessId);
      console.log('Form data:', formData);
      
      // Create claim request - only include fields that exist in the table
      const insertData: any = {
        business_id: businessId,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        message: formData.message,
        status: 'pending',
      };
      
      const { data, error: submitError } = await supabase
        .from('claim_requests')
        .insert(insertData)
        .select();

      if (submitError) {
        console.error('Supabase error:', submitError);
        setError(`Failed to submit: ${submitError.message}`);
      } else {
        console.log('Claim submitted successfully:', data);
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(`An unexpected error occurred: ${err.message}`);
    }

    setSubmitting(false);
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

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Hero */}
        <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Claim Submitted!
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#371a5b] mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your claim request for <strong>{business?.business_name}</strong> has been submitted. 
              Our team will review your request and contact you within 24-48 hours to verify your ownership.
            </p>
            <a
              href="/"
              className="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Return to Home
            </a>
          </div>
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
          <a href="/" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </a>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Claim Your Business Listing
          </h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Verify your ownership and take control of your business profile
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {business ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Business Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#54afe6] to-[#bb7ce4] rounded-lg flex items-center justify-center text-white text-2xl font-bold mr-4">
                  {business.business_name?.[0]?.toUpperCase() || 'B'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#371a5b]">{business.business_name}</h2>
                  <p className="text-gray-500">{business.city}, {business.state}</p>
                </div>
              </div>
              
              <div className="space-y-4 text-gray-600">
                <p>{business.description_short}</p>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-[#371a5b] mb-2">Why Claim?</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      Update your business information
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      Add photos and logos
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      Respond to reviews
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      View analytics and insights
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      Upgrade to Premium or VIP
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Claim Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#371a5b] mb-6">Submit Claim Request</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6]"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6]"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6]"
                    placeholder="(314) 555-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Your Position *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6]"
                    placeholder="Owner, Manager, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6]"
                    placeholder="Any additional information to help verify your ownership..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Claim Request'
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting this request, you confirm that you are authorized to claim this business listing.
                </p>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#371a5b] mb-2">Business Not Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t find the business you&apos;re looking for. Please check the URL or browse our directory.
            </p>
            <a
              href="/listings"
              className="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Browse Directory
            </a>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default function ClaimListingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#54afe6]" />
        </div>
        <Footer />
      </main>
    }>
      <ClaimListingForm />
    </Suspense>
  );
}
