'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { supabase } from '../../../../lib/supabase';
import { Loader2, AlertCircle, Save, ArrowLeft, Trash2 } from 'lucide-react';

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

  useEffect(() => {
    checkAuthAndLoadBusiness();
  }, []);

  async function checkAuthAndLoadBusiness() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    await loadBusiness(businessId, user.email || '');
  }

  async function loadBusiness(id: string, userEmail: string) {
    try {
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
      const { error } = await supabase
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
      
      if (error) {
        setError('Failed to save changes: ' + error.message);
      } else {
        setSuccess(true);
      }
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
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
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

            {/* Social Media Links - Paid listings only */}
            <div className="border-t border-gray-200 pt-6 mt-6">
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
            <div className="border-t border-gray-200 pt-6 mt-6">
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
