'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestCategoriesPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('public_approved_listings')
        .select('*')
        .limit(5);
      
      console.log('Sample listings:', data);
      setListings(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Categories</h1>
      {listings.map((listing) => (
        <div key={listing.id} className="mb-4 p-4 border rounded">
          <h2 className="font-bold">{listing.business_name}</h2>
          <p>Category field: {JSON.stringify(listing.category)}</p>
          <p>Categories field: {JSON.stringify(listing.categories)}</p>
          <p>City: {listing.city}</p>
          <p>State: {listing.state}</p>
        </div>
      ))}
    </div>
  );
}
