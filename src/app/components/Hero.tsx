"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Star, TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Location {
  city: string;
  state: string;
}

export default function Hero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  async function loadLocations() {
    try {
      const { data, error } = await supabase
        .from('public_approved_listings')
        .select('city, state')
        .not('city', 'is', null)
        .not('state', 'is', null);

      if (error) {
        console.error('Error fetching locations:', error);
        return;
      }

      // Remove duplicates and sort
      const locationsList: Location[] = (data || []);
      const uniqueLocationsMap = new Map<string, Location>();
      locationsList.forEach((l: Location) => {
        uniqueLocationsMap.set(`${l.city}, ${l.state}`, l);
      });
      const uniqueLocations = Array.from(uniqueLocationsMap.values())
        .sort((a, b) => a.city.localeCompare(b.city));

      setLocations(uniqueLocations);
    } catch (err) {
      console.error('Error loading locations:', err);
    }
  }

  const categories = [
    "Restaurants",
    "Home Repair Services",
    "Health & Wellness",
    "Beauty & Spas",
    "Fitness & Gyms",
    "Retail",
    "Automotive",
    "Professional Services",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedLocation) {
      setIsSearching(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (selectedLocation) {
        const [city, state] = selectedLocation.split(",").map(s => s.trim());
        if (city) params.set("city", city);
      }
      router.push(`/listings?${params.toString()}`);
    }
  };

  return (
    <section className="relative min-h-screen pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#bb7ce4]/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-[#54afe6]/20 to-transparent"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-40 left-10 w-20 h-20 bg-[#54afe6]/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute top-60 right-20 w-32 h-32 bg-[#bb7ce4]/20 rounded-full blur-xl animate-float" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-[#ffc107]/20 rounded-full blur-xl animate-float" style={{ animationDelay: "4s" }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <Star className="w-4 h-4 text-[#ffc107]" />
              <span className="text-white/90 text-sm font-medium">Trusted by 500+ Local Businesses</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Discover the Best{" "}
              <span className="text-gradient">Local Businesses</span>{" "}
              in St. Louis
            </h1>

            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto lg:mx-0">
              Your ultimate community resource for finding top-rated local businesses, 
              exclusive deals, and premium services. Shop Local – Buy Local – Support Local.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-2xl mb-8">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-[2] flex items-center px-4 py-3 bg-gray-50 rounded-xl">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
                <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-xl sm:w-48">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-700 cursor-pointer"
                  >
                    <option value="">All Locations</option>
                    {locations.map((loc, idx) => (
                      <option key={idx} value={`${loc.city}, ${loc.state}`}>
                        {loc.city}, {loc.state}
                      </option>
                    ))}
                  </select>
                </div>
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="btn-primary px-8 py-3 rounded-xl text-white font-semibold shadow-lg disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Categories */}
            <h3 className="text-white/90 text-sm font-medium mb-3">Quick Search Categories</h3>
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSearchQuery(category);
                    router.push(`/listings?q=${encodeURIComponent(category)}`);
                  }}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors border border-white/20"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Right Content - Stats Cards */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main Card */}
              <div className="glass-effect rounded-3xl p-8 mb-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#54afe6] to-[#bb7ce4] flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Business Growth</p>
                    <p className="text-3xl font-bold text-white">+147%</p>
                  </div>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-[#54afe6] to-[#bb7ce4] rounded-full"></div>
                </div>
                <p className="text-white/60 text-sm mt-2">Average increase in customer inquiries</p>
              </div>

              {/* Secondary Card */}
              <div className="glass-effect rounded-3xl p-8 absolute -bottom-8 -right-8 w-80">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ffc107] to-[#f68712] flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Monthly Visitors</p>
                    <p className="text-2xl font-bold text-white">25,000+</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -left-4 bg-[#ffc107] rounded-2xl px-6 py-3 shadow-xl animate-pulse-slow">
                <p className="text-[#371a5b] font-bold text-sm">Premium Members</p>
                <p className="text-[#371a5b] text-2xl font-bold">500+</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#f9fafb"
          />
        </svg>
      </div>
    </section>
  );
}
