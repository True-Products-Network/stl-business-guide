'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '@/lib/supabase';
import { Star, MapPin, Phone, Crown, BadgeCheck, Mail, Globe, ExternalLink } from 'lucide-react';

interface PublicListing {
  id: string;
  business_name: string;
  slug: string;
  description_short: string | null;
  description_long: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  logo_url: string | null;
  featured_image_url: string | null;
  city: string | null;
  state: string | null;
  plan_name: string | null;
  plan_key: string | null;
  is_featured: boolean | null;
  category: string | null;
  categories: { name: string; slug: string }[] | null;
  google_rating?: number | null;
  google_reviews_count?: number | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [businesses, setBusinesses] = useState<PublicListing[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<PublicListing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  // Track listing click analytics
  async function trackListingClick(listingId: string, businessName: string) {
    try {
      await supabase.rpc("increment_analytics", {
        p_business_id: listingId,
        p_metric: "profile_views",
      });
      console.log("Tracked profile view for:", businessName);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  }

  useEffect(() => {
    loadData();
  }, [query, categoryParam]);

  async function loadData() {
    setLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      setCategories(categoriesData || []);

      // Fetch businesses from public view
      const { data, error } = await supabase
        .from('public_approved_listings')
        .select('*')
        .order('business_name', { ascending: true });

      if (error) {
        console.error('Search error:', error);
        setBusinesses([]);
        setAllBusinesses([]);
      } else {
        setAllBusinesses(data || []);
        
        // Filter results
        let results = data || [];
        
        // Text search
        if (query) {
          const lowerQuery = query.toLowerCase();
          results = results.filter((b: PublicListing) =>
            b.business_name?.toLowerCase().includes(lowerQuery) ||
            b.description_short?.toLowerCase().includes(lowerQuery) ||
            b.description_long?.toLowerCase().includes(lowerQuery) ||
            b.category?.toLowerCase().includes(lowerQuery)
          );
        }
        
        // Category filter
        if (categoryParam && categoryParam !== '') {
          results = results.filter((b: PublicListing) => {
            // Check simple category field
            if (b.category === categoryParam) return true;
            
            // Check categories array
            if (b.categories && Array.isArray(b.categories)) {
              return b.categories.some((c: any) => {
                if (typeof c === 'string') return c === categoryParam;
                return c.name === categoryParam || c.slug === categoryParam;
              });
            }
            return false;
          });
        }
        
        // Sort by plan: VIP first, then Premium, then Free
        // Within each plan level, shuffle randomly
        results.sort((a: PublicListing, b: PublicListing) => {
          const planOrder: { [key: string]: number } = { 'vip': 0, 'premium': 1, 'free': 2 };
          const planA = planOrder[a.plan_key || 'free'] || 2;
          const planB = planOrder[b.plan_key || 'free'] || 2;
          
          // If different plans, sort by plan
          if (planA !== planB) {
            return planA - planB;
          }
          
          // Same plan level - shuffle randomly
          return Math.random() - 0.5;
        });
        
        setBusinesses(results);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setBusinesses([]);
    }
    setLoading(false);
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    window.location.href = `/search?${params.toString()}`;
  }

  function clearFilters() {
    setSearchQuery('');
    setSelectedCategory('');
    window.location.href = '/search';
  }

  function getPlanBadge(planKey?: string | null) {
    if (planKey === 'vip') {
      return (
        <span className="flex items-center px-2 py-1 bg-gradient-to-r from-[#ffc107] to-[#f68712] text-white text-xs font-bold rounded-full">
          <Crown className="w-3 h-3 mr-1" /> VIP
        </span>
      );
    } else if (planKey === 'premium') {
      return (
        <span className="flex items-center px-2 py-1 bg-gradient-to-r from-[#54afe6] to-[#bb7ce4] text-white text-xs font-bold rounded-full">
          <BadgeCheck className="w-3 h-3 mr-1" /> Premium
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
        Free
      </span>
    );
  }

  return (
    <>
      {/* Search Header */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {query ? `Search Results for "${query}"` : 'Search Businesses'}
          </h1>
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl">
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-lg text-gray-900"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              className="bg-white text-[#371a5b] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#54afe6]"></div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Found <span className="font-semibold">{businesses.length}</span> business{businesses.length !== 1 ? 'es' : ''}
                {query && ` matching "${query}"`}
                {categoryParam && ` in ${categories.find(c => c.slug === categoryParam)?.name || categoryParam}`}
              </p>
              {(query || categoryParam) && (
                <button
                  onClick={clearFilters}
                  className="text-[#54afe6] hover:text-[#371a5b] font-medium text-sm underline"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {businesses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No businesses found</h2>
                <p className="text-gray-500 mb-4">Try adjusting your search terms or browse all listings</p>
                <Link
                  href="/listings"
                  className="inline-block bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Browse All Listings
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
                  >
                    {/* Featured Image */}
                    <div className="h-48 bg-gradient-to-br from-[#371a5b] to-[#bb7ce4] relative">
                      {(business.featured_image_url || business.logo_url) ? (
                        <img
                          src={business.featured_image_url || business.logo_url || ''}
                          alt={business.business_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white/30 text-6xl font-bold">
                            {business.business_name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* Plan Badge */}
                      <div className="absolute top-4 right-4">
                        {getPlanBadge(business.plan_key)}
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Header */}
                      <div className="mb-4">
                        <Link href={`/listing/${business.slug}`}>
                          <h3 className="text-xl font-bold text-[#371a5b] group-hover:text-[#54afe6] transition">
                            {business.business_name}
                          </h3>
                        </Link>
                        {business.city && (
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {business.city}, {business.state}
                          </div>
                        )}
                      </div>

                      {/* Google Rating */}
                      <div className="flex items-center mb-3">
                        <Star className="w-4 h-4 text-[#ffc107] fill-current" />
                        <span className="font-semibold ml-1">{business.google_rating || '4.5'}</span>
                        <span className="text-gray-500 text-sm ml-1">
                          ({business.google_reviews_count || '0'} reviews)
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {business.description_short || 'No description available'}
                      </p>

                      {/* Categories */}
                      {((business.categories && business.categories.length > 0) || business.category) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {business.categories && business.categories.length > 0 ? (
                            // Use categories array if available
                            business.categories.slice(0, 3).map((cat: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-[#54afe6]/10 text-[#54afe6] text-xs rounded-full font-medium"
                              >
                                {typeof cat === 'string' ? cat : cat.name}
                              </span>
                            ))
                          ) : (
                            // Fallback to single category field
                            business.category && (
                              <span className="px-2 py-1 bg-[#54afe6]/10 text-[#54afe6] text-xs rounded-full font-medium">
                                {business.category}
                              </span>
                            )
                          )}
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-2 text-sm">
                        {business.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-[#54afe6]" />
                            <a href={`tel:${business.phone}`} className="hover:text-[#371a5b]">
                              {business.phone}
                            </a>
                          </div>
                        )}
                        {business.email && (
                          <div className="flex items-center text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-[#54afe6]" />
                            <a href={`mailto:${business.email}`} className="hover:text-[#371a5b] truncate">
                              {business.email}
                            </a>
                          </div>
                        )}
                        {business.website_url && (
                          <div className="flex items-center text-gray-600">
                            <Globe className="w-4 h-4 mr-2 text-[#54afe6]" />
                            <a 
                              href={business.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#54afe6] hover:text-[#371a5b] truncate flex items-center"
                            >
                              Visit Website
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="mt-4 pt-4 border-t">
                        <Link
                          href={`/listing/${business.slug}`}
                          onClick={() => trackListingClick(business.id, business.business_name)}
                          className="block text-center bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
                        >
                          View Listing
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#54afe6]"></div>
        </div>
      }>
        <SearchResults />
      </Suspense>
      <Footer />
    </main>
  );
}
