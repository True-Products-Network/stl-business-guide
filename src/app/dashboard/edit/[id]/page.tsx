'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { supabase } from '../../../../lib/supabase';
import { Loader2, AlertCircle, Save, ArrowLeft, Trash2, Check } from 'lucide-react';

interface Business {
  id: string;
  business_name: string;
  slug: string;
  description_short: string | null;
  description_long: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  logo_url: string | null;
  status: string;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  business_hours: Record<string, { open: string; close: string; closed: boolean }> | null;
  plan_key?: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BusinessLocation {
  id: string;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  service_area: string | null;
}

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    business_name: '',
    description_short: '',
    description_long: '',
    phone: '',
    email: '',
    website_url: '',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
  });

  const [businessHours, setBusinessHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '10:00', close: '14:00', closed: false },
    sunday: { open: '09:00', close: '17:00', closed: true },
  });

  // Location and Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [location, setLocation] = useState<{ 
    address_line_1: string;
    address_line_2: string;
    city: string; 
    state: string;
    zip_code: string;
  }>({ 
    address_line_1: '',
    address_line_2: '',
    city: '', 
    state: 'MO',
    zip_code: ''
  });
  const [serviceArea, setServiceArea] = useState('');
  const [locationId, setLocationId] = useState<string | null>(null);
  const [planKey, setPlanKey] = useState<string>('free');

  // Category limits by plan
  const getCategoryLimit = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'vip': return Infinity;
      case 'premium': return 5;
      case 'free':
      default: return 1;
    }
  };

  const categoryLimit = getCategoryLimit(planKey);
  const canSelectMoreCategories = selectedCategories.length < categoryLimit;

  // Predefined St. Louis area cities
  const stLouisCities = [
    'St. Louis', 'Clayton', 'University City', 'Maplewood', 'Richmond Heights',
    'Brentwood', 'Ladue', 'Webster Groves', 'Kirkwood', 'Ferguson',
    'Florissant', 'Hazelwood', 'Bridgeton', 'Maryland Heights', 'Creve Coeur',
    'Olivette', 'Overland', 'St. Ann', 'St. John', 'Jennings',
    'Bellefontaine Neighbors', 'Normandy', 'Chesterfield', 'Ballwin', 'Ellisville',
    'Wildwood', 'Manchester', 'Town and Country', 'Des Peres', 'Sunset Hills',
    'Crestwood', 'Fenton', 'Arnold', 'Imperial', 'Festus',
    'Crystal City', 'Eureka', 'Pacific', 'Valley Park', 'St. Charles',
    'St. Peters', 'O\'Fallon', 'Cottleville', 'Lake Saint Louis', 'Wentzville',
    'East St. Louis', 'Belleville', 'Fairview Heights', 'Collinsville', 'Edwardsville'
  ];

  // All US states with 2-letter codes (51 including DC)
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

  useEffect(() => {
    checkAuthAndLoadBusiness();
    loadCategories();
  }, []);

  async function checkAuthAndLoadBusiness() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    await loadBusiness(businessId, user.email || '');
  }

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (!error && data) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  async function loadBusiness(id: string, userEmail: string) {
    try {
      // Fetch business data
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .eq('email', userEmail)
        .single();
      
      if (error || !data) {
        setError('Business not found or you do not have permission to edit it.');
        setLoading(false);
        return;
      }
      
      // Only allow editing if status is active/approved
      if (data.status !== 'active') {
        setError('You can only edit approved listings.');
        setLoading(false);
        return;
      }
      
      setBusiness(data);
      setFormData({
        business_name: data.business_name || '',
        description_short: data.description_short || '',
        description_long: data.description_long || '',
        phone: data.phone || '',
        email: data.email || '',
        website_url: data.website_url || '',
        facebook_url: data.facebook_url || '',
        instagram_url: data.instagram_url || '',
        linkedin_url: data.linkedin_url || '',
        youtube_url: data.youtube_url || '',
      });
      
      // Load business hours if they exist
      if (data.business_hours) {
        setBusinessHours(data.business_hours);
      }

      // Fetch location data
      const { data: locationData } = await supabase
        .from('business_locations')
        .select('*')
        .eq('business_id', id)
        .single();
      
      if (locationData) {
        setLocationId(locationData.id);
        setLocation({
          address_line_1: locationData.address_line_1 || '',
          address_line_2: locationData.address_line_2 || '',
          city: locationData.city || '',
          state: locationData.state || 'MO',
          zip_code: locationData.zip_code || ''
        });
        setServiceArea(locationData.service_area || '');
      }

      // Fetch business categories
      const { data: categoryData } = await supabase
        .from('business_categories')
        .select('category_id')
        .eq('business_id', id);
      
      if (categoryData) {
        // Deduplicate categories from database
        const uniqueCategoryIds = [...new Set(categoryData.map((c: { category_id: string }) => c.category_id))];
        setSelectedCategories(uniqueCategoryIds);
      }

      // Fetch plan info from business_listings
      const { data: listingData } = await supabase
        .from('business_listings')
        .select('plan_id')
        .eq('business_id', id)
        .single();
      
      if (listingData?.plan_id) {
        // Fetch plan key separately
        const { data: planData } = await supabase
          .from('listing_plans')
          .select('plan_key')
          .eq('id', listingData.plan_id)
          .single();
        
        if (planData) {
          setPlanKey(planData.plan_key || 'free');
        }
      }
    } catch (err) {
      setError('An error occurred while loading the business.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    
    try {
      // Update business data
      const { error: businessError } = await supabase
        .from('businesses')
        .update({
          business_name: formData.business_name,
          description_short: formData.description_short,
          description_long: formData.description_long,
          phone: formData.phone,
          email: formData.email,
          website_url: formData.website_url,
          facebook_url: formData.facebook_url,
          instagram_url: formData.instagram_url,
          linkedin_url: formData.linkedin_url,
          youtube_url: formData.youtube_url,
          business_hours: businessHours,
          updated_at: new Date().toISOString(),
        })
        .eq('id', businessId);
      
      if (businessError) {
        setError('Failed to save changes: ' + businessError.message);
        setSaving(false);
        return;
      }

      // Update or insert location
      console.log('Saving location:', location, 'locationId:', locationId);
      if (location.city) {
        if (locationId) {
          // Update existing location
          console.log('Updating existing location with ID:', locationId);
          const { error: locationError } = await supabase
            .from('business_locations')
            .update({
              address_line_1: location.address_line_1 || null,
              address_line_2: location.address_line_2 || null,
              city: location.city,
              state: location.state,
              zip_code: location.zip_code || null,
              service_area: serviceArea || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', locationId);
          
          if (locationError) {
            console.error('Error updating location:', locationError);
            setError('Failed to update location: ' + locationError.message);
          } else {
            console.log('Location updated successfully');
          }
        } else {
          // Insert new location
          console.log('Inserting new location for business:', businessId);
          const { data: newLocation, error: locationError } = await supabase
            .from('business_locations')
            .insert({
              business_id: businessId,
              address_line_1: location.address_line_1 || null,
              address_line_2: location.address_line_2 || null,
              city: location.city,
              state: location.state,
              zip_code: location.zip_code || null,
              service_area: serviceArea || null,
              is_primary: true,
            })
            .select()
            .single();
          
          if (locationError) {
            console.error('Error inserting location:', locationError);
            setError('Failed to save location: ' + locationError.message);
          } else {
            console.log('Location inserted successfully:', newLocation);
            setLocationId(newLocation.id);
          }
        }
      } else {
        console.log('No city provided, skipping location save');
      }

      // Update categories - delete existing and insert new
      console.log('Deleting existing categories for business:', businessId);
      const { error: deleteCatError } = await supabase
        .from('business_categories')
        .delete()
        .eq('business_id', businessId);
      
      if (deleteCatError) {
        console.error('Error deleting categories:', deleteCatError);
      } else {
        console.log('Successfully deleted existing categories');
      }

      if (selectedCategories.length > 0) {
        // Remove any duplicates from selected categories
        const uniqueCategories = [...new Set(selectedCategories)];
        console.log('Inserting categories:', uniqueCategories);
        
        const categoryInserts = uniqueCategories.map(catId => ({
          business_id: businessId,
          category_id: catId,
        }));
        
        const { error: catError } = await supabase
          .from('business_categories')
          .insert(categoryInserts);
        
        if (catError) {
          console.error('Error inserting categories:', catError);
          // Don't throw error, just log it - the business data was saved
        } else {
          console.log('Successfully inserted categories');
        }
      }
      
      setSuccess(true);
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError('');
    
    try {
      // Delete related records first (analytics, coupons, etc.)
      await supabase.from('business_analytics').delete().eq('business_id', businessId);
      await supabase.from('business_listings').delete().eq('business_id', businessId);
      await supabase.from('business_categories').delete().eq('business_id', businessId);
      await supabase.from('business_locations').delete().eq('business_id', businessId);
      
      // Finally delete the business
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);
      
      if (error) {
        setError('Failed to delete listing: ' + error.message);
        setDeleting(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred while deleting.');
      setDeleting(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  if (error && !business) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-32 pb-20">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
          <div className="mt-6">
            <a href="/dashboard" className="text-[#371a5b] hover:underline flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
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
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <a href="/dashboard" className="text-white/80 hover:text-white flex items-center mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </a>
          <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Edit Business Listing
          </h1>
          <p className="text-white/80 mt-2">{business?.business_name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        
        {/* Success Modal */}
        {success && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center transform transition-all scale-100">
              <div className="w-20 h-20 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Changes Saved!
              </h3>
              <p className="text-gray-600 mb-6">
                Your business listing has been updated successfully.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Quick Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Navigation</h3>
          <div className="flex flex-wrap gap-2">
            <a href="#basic-info" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition">
              Basic Info
            </a>
            <a href="#location-section" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition">
              Location & Service Area
            </a>
            <a href="#categories-section" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition">
              Categories
            </a>
            <a href="#social-media-section" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition">
              Social Media
            </a>
            <a href="#business-hours-section" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition">
              Business Hours
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Basic Info Section */}
            <div id="basic-info">
              <h3 className="text-lg font-semibold text-[#371a5b] mb-4">Basic Information</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <input
                type="text"
                name="description_short"
                value={formData.description_short}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description
              </label>
              <textarea
                name="description_long"
                value={formData.description_long}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
              />
            </div>

            {/* Location & Service Area */}
            <div id="location-section" className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-[#371a5b] mb-4">Location & Service Area</h3>
              <p className="text-sm text-gray-500 mb-4">Select your primary location and describe your service area.</p>
              
              {/* Street Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={location.address_line_1}
                  onChange={(e) => setLocation({ ...location, address_line_1: e.target.value })}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent mb-2"
                />
                <input
                  type="text"
                  value={location.address_line_2}
                  onChange={(e) => setLocation({ ...location, address_line_2: e.target.value })}
                  placeholder="Suite 100 (optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <select
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
                    required
                  >
                    <option value="">Select a city</option>
                    {stLouisCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={location.state}
                    onChange={(e) => setLocation({ ...location, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
                    required
                  >
                    <option value="">Select a state</option>
                    {usStates.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.code} - {state.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">2-letter state code</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={location.zip_code}
                    onChange={(e) => setLocation({ ...location, zip_code: e.target.value })}
                    placeholder="63101"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Area
                </label>
                <textarea
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="Describe your service area (e.g., 'We serve the greater St. Louis area including St. Charles and Jefferson County')"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe the geographic area you serve beyond your primary location.
                </p>
              </div>
            </div>

            {/* Categories */}
            <div id="categories-section" className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-[#371a5b] mb-4">Business Categories</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Your Plan:</strong> {planKey?.toUpperCase() || 'FREE'} | 
                  <strong> Categories:</strong> {selectedCategories.length} of {categoryLimit === Infinity ? 'Unlimited' : categoryLimit} selected
                  {planKey === 'free' && (
                    <span className="block mt-1 text-xs">
                      Free listings can select 1 category. <Link href="/pricing" className="underline hover:text-blue-600">Upgrade to select more</Link>.
                    </span>
                  )}
                  {planKey === 'premium' && (
                    <span className="block mt-1 text-xs">
                      Premium listings can select up to 5 categories. <Link href="/pricing" className="underline hover:text-blue-600">Upgrade to VIP for unlimited</Link>.
                    </span>
                  )}
                </p>
              </div>
              <p className="text-sm text-gray-500 mb-4">Select categories that apply to your business.</p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  const isDisabled = !isSelected && !canSelectMoreCategories;
                  
                  return (
                    <label 
                      key={category.id} 
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                        isDisabled 
                          ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (canSelectMoreCategories && !selectedCategories.includes(category.id)) {
                              setSelectedCategories([...selectedCategories, category.id]);
                            }
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                          }
                        }}
                        className="mr-3 rounded border-gray-300 text-[#54afe6] focus:ring-[#54afe6] disabled:opacity-50"
                      />
                      <span className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                        {category.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Social Media Links - Paid listings only */}
            <div id="social-media-section" className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-[#371a5b] mb-4">Social Media Links</h3>
              <p className="text-sm text-gray-500 mb-4">Add your social media profiles to help customers connect with you.</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    name="facebook_url"
                    value={formData.facebook_url}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/yourbusiness"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    name="instagram_url"
                    value={formData.instagram_url}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/yourbusiness"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/company/yourbusiness"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    name="youtube_url"
                    value={formData.youtube_url}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/@yourbusiness"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Business Hours - Paid listings only */}
            <div id="business-hours-section" className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-[#371a5b] mb-4">Business Hours</h3>
              <p className="text-sm text-gray-500 mb-4">Set your operating hours so customers know when you're open.</p>
              
              <div className="space-y-3">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
                  const hours = businessHours[day] || { open: '09:00', close: '17:00', closed: false };
                  
                  return (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-24">
                        <span className="text-sm font-medium text-gray-700">{dayLabel}</span>
                      </div>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hours.closed}
                          onChange={(e) => {
                            setBusinessHours(prev => ({
                              ...prev,
                              [day]: { ...hours, closed: e.target.checked }
                            }));
                          }}
                          className="mr-2 rounded border-gray-300 text-[#54afe6] focus:ring-[#54afe6]"
                        />
                        <span className="text-sm text-gray-600">Closed</span>
                      </label>
                      
                      {!hours.closed && (
                        <>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => {
                              setBusinessHours(prev => ({
                                ...prev,
                                [day]: { ...hours, open: e.target.value }
                              }));
                            }}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => {
                              setBusinessHours(prev => ({
                                ...prev,
                                [day]: { ...hours, close: e.target.value }
                              }));
                            }}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#54afe6] focus:border-transparent"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </a>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-800 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Listing
              </button>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Listing?</h3>
                <p className="text-gray-600 mb-6">
                  This will permanently delete <strong>{business?.business_name}</strong> and all associated data. This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Yes, Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      <Footer />
    </main>
  );
}
