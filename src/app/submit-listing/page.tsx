'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getListingPlans, getCategories, getLocations, submitListing, signUp, signIn } from '@/lib/supabase';
import { handleFreePlanSignupForGHL } from '@/lib/ghl';
import type { ListingPlan, Category, Location } from '@/lib/supabase';
import { Building2, User, MapPin, Send } from 'lucide-react';

// All US states with 2-letter codes
const usStates = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

function SubmitListingForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');

  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<ListingPlan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    // Account
    email: '',
    password: '',
    full_name: '',
    // Business
    business_name: '',
    description_short: '',
    description_long: '',
    phone: '',
    business_email: '',
    website_url: '',
    // Location
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: 'MO',
    zip_code: '',
    service_area: '',
    location_id: '',
    // Categories
    category_ids: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [plansData, categoriesData, locationsData] = await Promise.all([
      getListingPlans(),
      getCategories(),
      getLocations()
    ]);
    setPlans(plansData);
    setCategories(categoriesData);
    setLocations(locationsData);
    
    // If planParam is provided (e.g., 'free', 'premium', 'vip'), find matching plan ID
    if (planParam && plansData.length > 0) {
      const matchingPlan = plansData.find(p => p.plan_key === planParam);
      if (matchingPlan) {
        setSelectedPlan(matchingPlan.id);
      } else {
        // Default to free plan if no match found
        const freePlan = plansData.find(p => p.plan_key === 'free');
        if (freePlan) setSelectedPlan(freePlan.id);
      }
    } else if (plansData.length > 0) {
      // Default to free plan if no planParam
      const freePlan = plansData.find(p => p.plan_key === 'free');
      if (freePlan) setSelectedPlan(freePlan.id);
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Apply phone formatting
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }));
  };

  // Get selected plan details
  const selectedPlanObj = plans.find(p => p.id === selectedPlan);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let userId = null;

      // Step 1: Create account if needed
      if (!hasAccount) {
        const { success: signupSuccess, error: signupError, data: signupData } = await signUp(
          formData.email,
          formData.password,
          formData.full_name
        );
        if (!signupSuccess) {
          throw signupError;
        }
        userId = signupData?.user?.id;
      } else {
        const { success: loginSuccess, error: loginError, data: loginData } = await signIn(
          formData.email,
          formData.password
        );
        if (!loginSuccess) {
          throw loginError;
        }
        userId = loginData?.user?.id;
      }

      // Step 2: Submit listing - use user's account email for linking
      const submitResult = await submitListing({
        business_name: formData.business_name,
        slug: generateSlug(formData.business_name),
        description_short: formData.description_short,
        description_long: formData.description_long,
        phone: formData.phone,
        email: formData.email, // Use user's account email for linking to dashboard
        website_url: formData.website_url,
        address_line_1: formData.address_line_1,
        address_line_2: formData.address_line_2,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        service_area: formData.service_area,
        category_ids: formData.category_ids,
        plan_id: selectedPlan!,
        user_id: userId || null
      });

      if (!submitResult.success) {
        // Handle specific error for duplicate business name
        if (submitResult.error?.code === 'BUSINESS_NAME_EXISTS') {
          setError(submitResult.error.message);
          setLoading(false);
          return;
        }
        throw submitResult.error;
      }

      // Send Free Plan signups to GHL for nurturing
      console.log('Checking plan:', { selectedPlan, plans });
      const selectedPlanObj = plans.find(p => p.id === selectedPlan);
      console.log('Selected plan object:', selectedPlanObj);
      const planKey = selectedPlanObj?.plan_key;
      console.log('Plan key:', planKey);
      
      if (planKey === 'free') {
        await handleFreePlanSignupForGHL(
          formData.email,
          formData.business_name,
          formData.full_name
        );
        setSuccess(true);
      } else if (planKey === 'premium' || planKey === 'vip') {
        // For paid plans, redirect to Stripe checkout
        console.log('Redirecting to payment for plan:', planKey);
          // Create checkout session
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              plan_key: planKey,
              business_id: submitResult.listing?.id, // Use listing ID
              user_id: userId,
              success_url: `${window.location.origin}/payment/success`,
              cancel_url: `${window.location.origin}/payment/cancel?business_id=${submitResult.listing?.id}`,
            }),
          });

          const data = await response.json();
          
          if (!response.ok) {
            console.error('Checkout API error:', data);
            throw new Error(data.error || 'Payment setup failed');
          }
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          if (data.url) {
            window.location.href = data.url;
            return;
          } else {
            console.error('No URL in response:', data);
            throw new Error('Payment URL not received');
          }
        } else {
          console.log('Unknown plan or no plan key, showing success:', planKey);
          setSuccess(true);
        }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Submission Received!
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Thank you for listing your business with STL Business Guide
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#371a5b] mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your business listing has been submitted successfully. Our team will review it within 24-48 hours.
              You will receive an email notification once your listing is approved.
            </p>
            <div className="space-y-3">
              <a
                href="/"
                className="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Return to Home
              </a>
              <div>
                <a
                  href="/dashboard"
                  className="inline-block text-[#54afe6] hover:text-[#371a5b] font-medium mt-2"
                >
                  Go to Dashboard →
                </a>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            List Your Business
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Join the St. Louis area's premier business directory and get discovered by thousands of local customers
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>1</div>
            <span className="ml-2 font-medium hidden sm:inline">Select Plan</span>
          </div>
          <div className={`w-16 h-0.5 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>2</div>
            <span className="ml-2 font-medium hidden sm:inline">Account</span>
          </div>
          <div className={`w-16 h-0.5 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>3</div>
            <span className="ml-2 font-medium hidden sm:inline">Business Info</span>
          </div>
        </div>

        {error && (
          <div className={`border px-4 py-4 rounded-lg mb-6 ${
            error.includes('already exists') 
              ? 'bg-amber-50 border-amber-200 text-amber-800' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-start">
              <svg className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                error.includes('already exists') ? 'text-amber-500' : 'text-red-500'
              }`} fill="currentColor" viewBox="0 0 20 20">
                {error.includes('already exists') ? (
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                )}
              </svg>
              <div>
                <p className="font-semibold">
                  {error.includes('already exists') ? 'Business Name Already Exists' : 'Error'}
                </p>
                <p className="mt-1">{error}</p>
                {error.includes('already exists') && (
                  <p className="mt-2 text-sm">
                    Please use a different business name or{' '}
                    <a href="/contact" className="underline hover:text-amber-900">contact us</a>
                    {' '}if you need help.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Select Plan */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Listing Plan</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{plan.plan_name}</h3>
                    {selectedPlan === plan.id && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${plan.monthly_price}
                    </span>
                    <span className="text-gray-500">/month</span>
                  </div>

                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <svg className={`w-4 h-4 mr-2 ${plan.max_images > 0 ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        {plan.max_images > 0 ? (
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                      <span className={plan.max_images === 0 ? 'text-gray-400' : ''}>
                        {plan.max_images} image{plan.max_images !== 1 ? 's' : ''}
                      </span>
                    </li>
                    <li className="flex items-center">
                      {plan.allows_coupon ? (
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={plan.allows_coupon ? '' : 'text-gray-400'}>
                        {plan.allows_coupon ? 'Coupons allowed' : 'No coupons'}
                      </span>
                    </li>
                    <li className="flex items-center">
                      {plan.allows_video ? (
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={plan.allows_video ? '' : 'text-gray-400'}>
                        {plan.allows_video ? 'Video support' : 'No video'}
                      </span>
                    </li>
                    <li className="flex items-center">
                      {plan.allows_banner_ads ? (
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={plan.allows_banner_ads ? '' : 'text-gray-400'}>
                        {plan.allows_banner_ads ? 'Banner ads' : 'No banner ads'}
                      </span>
                    </li>
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => selectedPlan && setStep(2)}
                disabled={!selectedPlan}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Account */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Account</h2>

            {hasAccount === null && (
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setHasAccount(false)}
                  className="flex-1 border-2 border-blue-600 text-blue-600 py-4 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  I need to create an account
                </button>
                <button
                  onClick={() => setHasAccount(true)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  I already have an account
                </button>
              </div>
            )}

            {hasAccount !== null && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>

                  {!hasAccount && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Smith"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={() => { setHasAccount(null); setStep(1); }}
                    className="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Step 3: Business Information */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
            
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <span className="text-red-500 font-bold">*</span> indicates a required field. Please fill out all required fields to submit your listing.
              </p>
            </div>

            <div className="space-y-8">
              {/* Section 1: Business Details */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Business Details</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Business Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your business name"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2 font-normal">
                        (Limit: {selectedPlanObj?.plan_name === 'Free' ? '1' : selectedPlanObj?.plan_name === 'Premium' ? '5' : 'Unlimited'})
                      </span>
                    </label>
                    <select
                      name="category_ids"
                      value={formData.category_ids[0] || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          const maxCategories = selectedPlanObj?.plan_name === 'Free' ? 1 : selectedPlanObj?.plan_name === 'Premium' ? 5 : 999;
                          setFormData(prev => ({
                            ...prev,
                            category_ids: prev.category_ids.length < maxCategories 
                              ? [...prev.category_ids, value]
                              : [value] // Replace if at max
                          }));
                        }
                      }}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    
                    {/* Show selected categories */}
                    {formData.category_ids.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.category_ids.map((catId) => {
                          const cat = categories.find(c => c.id === catId);
                          return cat ? (
                            <span key={catId} className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {cat.name}
                              <button
                                type="button"
                                onClick={() => handleCategoryChange(catId)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="description_short"
                      value={formData.description_short}
                      onChange={handleInputChange}
                      required
                      maxLength={200}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of your business (max 200 characters)"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.description_short.length}/200 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                    <textarea
                      name="description_long"
                      value={formData.description_long}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Detailed description of your products/services"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="(314) 555-0123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="business_email"
                        value={formData.business_email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="contact@yourbusiness.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      name="website_url"
                      value={formData.website_url}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://www.yourbusiness.com"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Business Address */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Business Address</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address_line_1"
                      value={formData.address_line_1}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apt, Suite, etc.</label>
                    <input
                      type="text"
                      name="address_line_2"
                      value={formData.address_line_2}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Suite 100"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="St. Louis"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {usStates.map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{5}(-[0-9]{4})?"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="63101"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Area</label>
                    <input
                      type="text"
                      name="service_area"
                      value={formData.service_area}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., St. Louis County, St. Charles County"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-700">
              <p>
                <strong>Please Note:</strong> All listings are subject to review and approval before being published. 
                We reserve the right to reject listings that do not meet our guidelines. 
                You will receive an email notification once your listing has been reviewed.
              </p>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || formData.category_ids.length === 0}
                className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Submitting...' : 'Submit Listing'}
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default function SubmitListingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </main>
    }>
      <SubmitListingForm />
    </Suspense>
  );
}
