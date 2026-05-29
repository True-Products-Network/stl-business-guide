'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '@/lib/supabase';
import { Star, MapPin, Phone, Mail, Globe, Crown, BadgeCheck, ExternalLink } from 'lucide-react';
import type { Category } from '@/lib/supabase';

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
  location: string | null;
  categories: { name: string; slug: string }[] | null;
  google_rating?: number | null;
  google_reviews_count?: number | null;
}

function ListingsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  const [businesses, setBusinesses] = useState<PublicListing[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<PublicListing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<{ city: string; state: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      // Fetch from public_approved_listings view
      const { data: listingsData, error: listingsError } = await supabase
        .from('public_approved_listings')
        .select('*')
        .order('business_name', { ascending: true });

      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
      } else {
        console.log('Raw listings data:', listingsData);
        console.log('First listing categories:', listingsData?.[0]?.categories);
        console.log('First listing category:', listingsData?.[0]?.category);
        
        setAllBusinesses(listingsData || []);
        let results = listingsData || [];
        
        // Apply initial query filter
        if (initialQuery) {
          results = filterByQuery(results, initialQuery);
        }

        // Apply initial category filter
        if (initialCategory) {
          results = filterByCategory(results, initialCategory);
        }

        // Sort by plan: VIP first, then Premium, then Free
        // Within each plan level, shuffle randomly
        // First, separate by plan
        const vipListings = results.filter((b: PublicListing) => (b.plan_key || 'free').toLowerCase() === 'vip');
        const premiumListings = results.filter((b: PublicListing) => (b.plan_key || 'free').toLowerCase() === 'premium');
        const freeListings = results.filter((b: PublicListing) => {
          const key = (b.plan_key || 'free').toLowerCase();
          return key !== 'vip' && key !== 'premium';
        });
        
        // Shuffle each group
        const shuffle = (arr: PublicListing[]) => arr.sort(() => Math.random() - 0.5);
        
        // Combine: VIP first, then Premium, then Free
        results = [...shuffle(vipListings), ...shuffle(premiumListings), ...shuffle(freeListings)];

        setBusinesses(results);
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      } else {
        setCategories(categoriesData || []);
      }

      // Extract unique cities from business_locations that have active businesses
      const uniqueCitiesMap = new Map((listingsData || [])
        .filter((l: PublicListing) => l.city && l.state)
        .map((l: PublicListing) => [`${l.city}, ${l.state}`, { city: l.city, state: l.state }]));
      
      const uniqueCities = Array.from(uniqueCitiesMap.values())
        .sort((a, b) => (a.city || '').localeCompare(b.city || ''));
      
      setCities(uniqueCities as { city: string; state: string }[]);
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  }

  function filterByQuery(data: PublicListing[], query: string) {
    const lowerQuery = query.toLowerCase();
    return data.filter((b: PublicListing) =>
      b.business_name?.toLowerCase().includes(lowerQuery) ||
      b.description_short?.toLowerCase().includes(lowerQuery) ||
      b.description_long?.toLowerCase().includes(lowerQuery) ||
      b.category?.toLowerCase().includes(lowerQuery)
    );
  }

  function filterByCategory(data: PublicListing[], categoryName: string) {
    console.log('Filtering by category:', categoryName);
    console.log('Total businesses:', data.length);
    
    const lowerCategoryName = categoryName.toLowerCase();
    
    const filtered = data.filter((b: PublicListing) => {
      // Check if category matches the simple category field (case insensitive)
      if (b.category && b.category.toLowerCase() === lowerCategoryName) {
        console.log('Matched by category field:', b.business_name, b.category);
        return true;
      }
      
      // Check if category matches in categories array
      if (b.categories && Array.isArray(b.categories) && b.categories.length > 0) {
        const match = b.categories.some((c: any) => {
          if (typeof c === 'string') {
            return c.toLowerCase() === lowerCategoryName;
          }
          return c.name?.toLowerCase() === lowerCategoryName || c.slug?.toLowerCase() === lowerCategoryName;
        });
        if (match) {
          console.log('Matched by categories array:', b.business_name);
        }
        return match;
      }
      
      // Also check if the category is in the description or business name
      const inDescription = b.description_short?.toLowerCase().includes(lowerCategoryName);
      const inName = b.business_name?.toLowerCase().includes(lowerCategoryName);
      
      if (inDescription || inName) {
        console.log('Matched by text content:', b.business_name);
      }
      
      return false;
    });
    
    console.log('Filtered results:', filtered.length);
    return filtered;
  }

  async function handleSearch() {
    setLoading(true);
    
    let results = [...allBusinesses];
    
    // Text search
    if (searchQuery) {
      results = filterByQuery(results, searchQuery);
    }
    
    // Filter by category
    if (selectedCategory) {
      results = filterByCategory(results, selectedCategory);
    }
    
    // Filter by city
    if (selectedCity) {
      results = results.filter((b: PublicListing) => b.city === selectedCity);
    }
    
    // Sort by plan: VIP first, then Premium, then Free
    // Within each plan level, shuffle randomly
    // First, separate by plan
    const vipListings = results.filter((b: PublicListing) => (b.plan_key || 'free').toLowerCase() === 'vip');
    const premiumListings = results.filter((b: PublicListing) => (b.plan_key || 'free').toLowerCase() === 'premium');
    const freeListings = results.filter((b: PublicListing) => {
      const key = (b.plan_key || 'free').toLowerCase();
      return key !== 'vip' && key !== 'premium';
    });
    
    // Shuffle each group
    const shuffle = (arr: PublicListing[]) => arr.sort(() => Math.random() - 0.5);
    
    // Combine: VIP first, then Premium, then Free
    results = [...shuffle(vipListings), ...shuffle(premiumListings), ...shuffle(freeListings)];
    
    setBusinesses(results);
    setLoading(false);
  }

  function handleCategoryClick(categoryName: string) {
    console.log('Category clicked:', categoryName);
    setSelectedCategory(categoryName);
    setLoading(true);
    
    const results = filterByCategory(allBusinesses, categoryName);
    setBusinesses(results);
    setLoading(false);
  }

  function clearFilters() {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCity('');
    setBusinesses(allBusinesses);
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
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Business Directory
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Discover the best local businesses in the St. Louis area. 
            From restaurants to home services, find exactly what you need.
          </p>

          {/* Category Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={clearFilters}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === '' 
                  ? 'bg-white text-[#371a5b]' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === cat.name 
                    ? 'bg-white text-[#371a5b]' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Locations</option>
              {cities.map((city, idx) => (
                <option key={idx} value={city.city}>{city.city}, {city.state}</option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Found <span className="font-semibold">{businesses.length}</span> business{businesses.length !== 1 ? 'es' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
                {selectedCategory && ` in ${selectedCategory}`}
              </p>
              {(searchQuery || selectedCategory || selectedCity) && (
                <button
                  onClick={clearFilters}
                  className="text-[#54afe6] hover:text-[#371a5b] font-medium text-sm underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            {businesses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No businesses found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear filters
                </button>
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
                        {(business.city || business.state) && (
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {business.city}, {business.state}
                          </div>
                        )}
                      </div>

                      {/* Google Reviews */}
                      {(business.google_rating || business.google_reviews_count) && (
                        <div className="flex items-center mb-3">
                          <Star className="w-4 h-4 text-[#ffc107] fill-current" />
                          <span className="font-semibold ml-1">{business.google_rating || '4.5'}</span>
                          <span className="text-gray-500 text-sm ml-1">
                            ({business.google_reviews_count || '0'} reviews)
                          </span>
                        </div>
                      )}

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

      <Footer />
    </main>
  );
}

export default function ListingsPage() {
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
      <ListingsContent />
    </Suspense>
  );
}
