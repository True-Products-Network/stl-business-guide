-- Create profiles table for business owners
-- This extends Supabase Auth with additional user data

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'business_owner' CHECK (role IN ('visitor', 'business_owner', 'premium_owner', 'vip_owner', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Create business_owners junction table
-- Links profiles to their businesses
CREATE TABLE IF NOT EXISTS business_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES business_listings(id) ON DELETE CASCADE,
  is_primary_owner BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT true,
  can_manage_billing BOOLEAN DEFAULT true,
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, business_id)
);

-- Indexes for business_owners
CREATE INDEX IF NOT EXISTS idx_business_owners_profile ON business_owners(profile_id);
CREATE INDEX IF NOT EXISTS idx_business_owners_business ON business_owners(business_id);

-- Enable RLS
ALTER TABLE business_owners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_owners
-- Owners can view their own business relationships
CREATE POLICY "Owners can view own business relationships"
  ON business_owners FOR SELECT
  USING (profile_id = auth.uid());

-- Owners can manage businesses they own
CREATE POLICY "Owners can manage own businesses"
  ON business_owners FOR ALL
  USING (profile_id = auth.uid());

-- Admins can manage all
CREATE POLICY "Admins can manage all business owners"
  ON business_owners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Create function to handle new user signup
-- Automatically creates a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create view for owner dashboard
CREATE OR REPLACE VIEW owner_businesses AS
SELECT 
  bo.id as ownership_id,
  bo.profile_id,
  bo.business_id,
  bo.is_primary_owner,
  bo.can_edit,
  bo.can_manage_billing,
  bo.created_at as ownership_created_at,
  bl.business_name,
  bl.slug,
  bl.description,
  bl.email as business_email,
  bl.phone as business_phone,
  bl.website,
  bl.address,
  bl.city,
  bl.state,
  bl.zip_code,
  bl.plan_tier,
  bl.plan_status,
  bl.is_featured,
  bl.logo_url,
  bl.created_at as business_created_at,
  bl.updated_at as business_updated_at,
  l.name as location_name,
  c.name as category_name
FROM business_owners bo
JOIN business_listings bl ON bo.business_id = bl.id
LEFT JOIN locations l ON bl.location_id = l.id
LEFT JOIN categories c ON bl.category_id = c.id
WHERE bo.profile_id = auth.uid();

-- Create analytics table for tracking business metrics
CREATE TABLE IF NOT EXISTS business_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_listings(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  profile_views INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  phone_clicks INTEGER DEFAULT 0,
  email_clicks INTEGER DEFAULT 0,
  direction_clicks INTEGER DEFAULT 0,
  search_impressions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, date)
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_business ON business_analytics(business_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON business_analytics(date);

-- Enable RLS
ALTER TABLE business_analytics ENABLE ROW LEVEL SECURITY;

-- RLS for analytics - owners can see their own
CREATE POLICY "Owners can view own analytics"
  ON business_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_owners
      WHERE business_id = business_analytics.business_id
      AND profile_id = auth.uid()
    )
  );

-- Function to increment analytics counters
CREATE OR REPLACE FUNCTION increment_analytics(
  p_business_id UUID,
  p_metric TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO business_analytics (business_id, date, profile_views, website_clicks, phone_clicks, email_clicks, direction_clicks)
  VALUES (p_business_id, CURRENT_DATE, 0, 0, 0, 0, 0)
  ON CONFLICT (business_id, date)
  DO UPDATE SET
    profile_views = CASE WHEN p_metric = 'profile_views' THEN business_analytics.profile_views + 1 ELSE business_analytics.profile_views END,
    website_clicks = CASE WHEN p_metric = 'website_clicks' THEN business_analytics.website_clicks + 1 ELSE business_analytics.website_clicks END,
    phone_clicks = CASE WHEN p_metric = 'phone_clicks' THEN business_analytics.phone_clicks + 1 ELSE business_analytics.phone_clicks END,
    email_clicks = CASE WHEN p_metric = 'email_clicks' THEN business_analytics.email_clicks + 1 ELSE business_analytics.email_clicks END,
    direction_clicks = CASE WHEN p_metric = 'direction_clicks' THEN business_analytics.direction_clicks + 1 ELSE business_analytics.direction_clicks END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON business_owners TO authenticated;
GRANT ALL ON business_analytics TO authenticated;
GRANT SELECT ON owner_businesses TO authenticated;

COMMENT ON TABLE profiles IS 'Extended user profiles linked to Supabase Auth';
COMMENT ON TABLE business_owners IS 'Junction table linking users to their businesses';
COMMENT ON TABLE business_analytics IS 'Daily analytics metrics for business listings';
