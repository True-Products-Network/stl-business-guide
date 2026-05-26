'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { supabase } from '../../../../lib/supabase';
import { Loader2, AlertCircle, Save, ArrowLeft } from 'lucide-react';

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
}

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    business_name: '',
    description_short: '',
    description_long: '',
    phone: '',
    email: '',
    website_url: '',
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
    
    await loadBusiness(businessId, user.email);
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
      });
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
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Changes saved successfully!
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
          </div>

          <div className="mt-8 flex items-center justify-between">
            <a
              href="/dashboard"
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </a>
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
        </form>
      </div>

      <Footer />
    </main>
  );
}
