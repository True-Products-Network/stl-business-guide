"use client";

import { useState } from "react";
import { Copy, Check, Database, ArrowLeft } from "lucide-react";
import Link from "next/link";

const sqlSchema = `-- ============================================
-- BUSINESS LISTING PLATFORM SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Profiles table (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'business_owner' CHECK (role IN ('visitor', 'business_owner', 'premium_owner', 'vip_owner', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_category_id UUID REFERENCES categories(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listing Plans table (Free, Premium, VIP)
CREATE TABLE listing_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_key TEXT UNIQUE NOT NULL CHECK (plan_key IN ('free', 'premium', 'vip')),
  plan_name TEXT NOT NULL,
  monthly_price DECIMAL(10,2) DEFAULT 0,
  yearly_price DECIMAL(10,2),
  max_images INTEGER DEFAULT 1,
  allows_coupon BOOLEAN DEFAULT false,
  allows_video BOOLEAN DEFAULT false,
  allows_banner_ads BOOLEAN DEFAULT false,
  featured_priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_profile_id UUID REFERENCES profiles(id),
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_short TEXT,
  description_long TEXT,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'active', 'paused', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Locations table
CREATE TABLE business_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  service_area TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Listings table (links business to plan)
CREATE TABLE business_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES listing_plans(id),
  listing_status TEXT DEFAULT 'pending' CHECK (listing_status IN ('draft', 'pending', 'active', 'paused', 'expired', 'archived')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT false,
  sort_priority INTEGER DEFAULT 0,
  cta_label TEXT,
  cta_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Categories join table
CREATE TABLE business_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(business_id, category_id)
);

-- Listing Submissions table (approval workflow)
CREATE TABLE listing_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id),
  submitted_by_user_id UUID REFERENCES profiles(id),
  requested_plan_id UUID REFERENCES listing_plans(id),
  submission_status TEXT DEFAULT 'started' CHECK (submission_status IN ('started', 'submitted', 'under_review', 'needs_edits', 'approved', 'rejected', 'abandoned')),
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by_user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VIEWS FOR PUBLIC ACCESS
-- ============================================

-- Public approved listings view
CREATE VIEW public_approved_listings AS
SELECT 
  b.id,
  b.business_name,
  b.slug,
  b.description_short,
  b.description_long,
  b.phone,
  b.email,
  b.website_url,
  b.logo_url,
  bl.city,
  bl.state,
  lp.plan_name,
  lp.plan_key,
  bls.is_featured,
  bls.sort_priority,
  COALESCE(
    jsonb_agg(
      jsonb_build_object('name', c.name, 'slug', c.slug)
      ORDER BY c.name
    ) FILTER (WHERE c.id IS NOT NULL),
    '[]'::jsonb
  ) as categories
FROM businesses b
JOIN business_listings bls ON b.id = bls.business_id
JOIN listing_plans lp ON bls.plan_id = lp.id
LEFT JOIN business_locations bl ON b.id = bl.business_id AND bl.is_primary = true
LEFT JOIN business_categories bc ON b.id = bc.business_id
LEFT JOIN categories c ON bc.category_id = c.id
WHERE b.status = 'approved' 
  AND bls.listing_status = 'active'
GROUP BY b.id, b.business_name, b.slug, b.description_short, b.description_long,
         b.phone, b.email, b.website_url, b.logo_url, bl.city, bl.state,
         lp.plan_name, lp.plan_key, bls.is_featured, bls.sort_priority;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_business_listings_status ON business_listings(listing_status);
CREATE INDEX idx_business_listings_featured ON business_listings(is_featured) WHERE is_featured = true;
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert listing plans
INSERT INTO listing_plans (plan_key, plan_name, monthly_price, max_images, allows_coupon, allows_video, allows_banner_ads, featured_priority) VALUES
('free', 'Free', 0, 1, false, false, false, 0),
('premium', 'Premium', 29.99, 5, true, false, false, 1),
('vip', 'VIP', 99.99, 10, true, true, true, 2);

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Marketing & Advertising', 'marketing-advertising', 'Marketing agencies and advertising services'),
('Business Services', 'business-services', 'Business consulting and professional services'),
('Home Services', 'home-services', 'Home improvement and maintenance services'),
('Health & Wellness', 'health-wellness', 'Healthcare and wellness providers'),
('Restaurants & Food', 'restaurants-food', 'Restaurants, cafes, and food services'),
('Retail & Shopping', 'retail-shopping', 'Retail stores and shopping destinations'),
('Automotive', 'automotive', 'Auto repair and automotive services'),
('Education & Training', 'education-training', 'Schools, tutors, and training centers'),
('Technology', 'technology', 'IT services and technology companies'),
('Real Estate', 'real-estate', 'Real estate agents and property services');

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public can read approved businesses
CREATE POLICY "Public can view approved businesses" ON businesses
  FOR SELECT USING (status = 'approved');

-- Public can read active listings
CREATE POLICY "Public can view active listings" ON business_listings
  FOR SELECT USING (listing_status = 'active');

-- Public can read locations
CREATE POLICY "Public can view locations" ON business_locations
  FOR SELECT USING (true);

-- Public can read categories
CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (is_active = true);

-- Public can read business categories
CREATE POLICY "Public can view business categories" ON business_categories
  FOR SELECT USING (true);

-- Users can manage their own profile
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Admin policies (for admin dashboard)
CREATE POLICY "Admins can manage all businesses" ON businesses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage all listings" ON business_listings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );`;

export default function SchemaPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#371a5b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 text-[#54afe6]" />
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Database Schema
              </h1>
              <p className="text-white/70 text-sm">
                Current database structure for the Business Listing Platform
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#371a5b] mb-4">Schema Overview</h2>
          <p className="text-gray-600 mb-4">
            This is the current database schema used by both the STL Business Guide (frontend) 
            and Business Listing Admin (backend). Both applications share the same Supabase database.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#54afe6]/10 rounded-lg p-4">
              <h3 className="font-semibold text-[#371a5b] mb-2">Core Tables</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• profiles - User accounts</li>
                <li>• businesses - Business info</li>
                <li>• business_listings - Plan/status</li>
                <li>• business_locations - Addresses</li>
                <li>• categories - Business categories</li>
                <li>• listing_plans - Free/Premium/VIP</li>
              </ul>
            </div>
            <div className="bg-[#bb7ce4]/10 rounded-lg p-4">
              <h3 className="font-semibold text-[#371a5b] mb-2">Key Views</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• public_approved_listings - Public display</li>
                <li>• Used by homepage & directory</li>
                <li>• Filters for active/approved only</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SQL Code Block */}
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
            <span className="text-gray-400 text-sm font-mono">schema.sql</span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <pre className="p-6 text-sm font-mono text-gray-300 leading-relaxed">
              <code>{sqlSchema}</code>
            </pre>
          </div>
        </div>

        {/* Database Connection Info */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#371a5b] mb-4">Shared Database Connection</h3>
          <div className="space-y-2 text-gray-700">
            <p><strong>Supabase URL:</strong> https://eceuqewlneufisussofc.supabase.co</p>
            <p><strong>Project:</strong> STL Business Guide + Business Listing Admin</p>
            <p><strong>Shared Tables:</strong> All tables above are shared between both applications</p>
          </div>
        </div>
      </div>
    </main>
  );
}
