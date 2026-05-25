'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '@/lib/supabase';
import { Star, MapPin, Phone, Crown, BadgeCheck } from 'lucide-react';

interface PublicListing {
  id: string;
  business_name: string;
  slug: string;
  description_short: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  plan_name: string | null;
  plan_key: string | null;
  is_featured: boolean | null;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

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
      let dbQuery = supabase
        .from('public_approved_listings')
        .select('*');

      // Text search
      if (query) {
        dbQuery = dbQuery.or(`business_name.ilike.%${query}%,description_short.ilike.%${query}%,description_long.ilike.%${query}%`);
      }

      const { data, error } = await dbQuery.order('business_name', { ascending: true });

      if (error) {
        console.error('Search error:', error);
        setBusinesses([]);
      } else {
        // Filter by category client-side
        let results = data || [];
        if (categoryParam) {
          results = results.filter((b: PublicListing) => 
            b.categories?.some((c: { name: string }) => c.name === categoryParam)
          );
        }
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
    return null;
  }

  return (
    <>
      {/* Search Header */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white py-12">
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
                <option key={cat.id} value={cat.name}>{cat.name}</option>
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
            <div className="mb-6">
              <p className="text-gray-600">
                Found <span className="font-semibold">{businesses.length}</span> business{businesses.length !== 1 ? 'es' : ''}
                {query && ` matching "${query}"`}
                {categoryParam && ` in ${categoryParam}`}
              </p>
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
                  <Link
                    key={business.id}
                    href={`/listing/${business.slug}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#54afe6] transition">
                            {business.business_name}
                          </h3>
                          {business.city && (
                            <p className="text-gray-500 text-sm">
                              {business.city}, {business.state}
                            </p>
                          )}
                        </div>
                        {getPlanBadge(business.plan_key)}
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {business.description_short || 'No description available'}
                      </p>

                      {/* Categories */}
                      {business.categories && business.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {business.categories.slice(0, 3).map((cat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        <Star className="w-4 h-4 text-[#ffc107] fill-current" />
                        <span className="text-sm font-semibold text-gray-700 ml-1">
                          {business.google_rating || '4.5'}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({business.google_reviews_count || '0'} reviews)
                        </span>
                      </div>

                      {/* Contact */}
                      {business.phone && (
                        <div className="space-y-1 text-sm mb-4">
                          <p className="text-gray-600 flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-[#54afe6]" />
                            {business.phone}
                          </p>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="mt-4 pt-4 border-t">
                        <span className="text-[#54afe6] font-medium group-hover:underline">
                          View Profile →
                        </span>
                      </div>
                    </div>
                  </Link>
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
