-- STL Business Guide Complete Schema
-- Based on OpenClaw Build Package v2

-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (User accounts linked to Supabase Auth)
-- ============================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  phone text,
  role text not null default 'business_owner' check (role in ('business_owner', 'admin', 'super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- CATEGORIES (Business taxonomy)
-- ============================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_category_id uuid references categories(id),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- LISTING PLANS (Free, Premium, VIP tiers)
-- ============================================
create table if not exists listing_plans (
  id uuid primary key default gen_random_uuid(),
  plan_name text not null unique,
  monthly_price numeric not null default 0,
  yearly_price numeric,
  max_images integer not null default 1,
  allows_coupon boolean not null default false,
  allows_video boolean not null default false,
  allows_banner_ads boolean not null default false,
  featured_priority integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insert default plans
insert into listing_plans (plan_name, monthly_price, yearly_price, max_images, allows_coupon, allows_video, allows_banner_ads, featured_priority)
values
  ('Free', 0, 0, 1, false, false, false, 0),
  ('Premium', 47, 97, 5, true, false, false, 50),
  ('VIP', 97, 497, 10, true, true, true, 100)
on conflict (plan_name) do nothing;

-- ============================================
-- BUSINESSES (Core business records)
-- ============================================
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references profiles(id),
  business_name text not null,
  slug text not null unique,
  description_short text,
  description_long text,
  phone text,
  email text,
  website_url text,
  logo_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- BUSINESS LOCATIONS
-- ============================================
create table if not exists business_locations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  address_line_1 text,
  address_line_2 text,
  city text not null,
  state text default 'MO',
  zip_code text,
  service_area text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- BUSINESS CATEGORIES (Many-to-many)
-- ============================================
create table if not exists business_categories (
  business_id uuid not null references businesses(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (business_id, category_id)
);

-- ============================================
-- BUSINESS LISTINGS (Active listing instances)
-- ============================================
create table if not exists business_listings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  plan_id uuid not null references listing_plans(id),
  listing_status text not null default 'pending' check (listing_status in ('pending', 'active', 'paused', 'expired', 'archived')),
  start_date date default current_date,
  end_date date,
  is_featured boolean not null default false,
  sort_priority integer not null default 0,
  cta_label text,
  cta_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- LISTING SUBMISSIONS (Approval workflow)
-- ============================================
create table if not exists listing_submissions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  submitted_by_user_id uuid references profiles(id),
  requested_plan_id uuid references listing_plans(id),
  submission_status text not null default 'draft' check (submission_status in ('draft', 'submitted', 'needs_edits', 'approved', 'rejected')),
  admin_notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by_user_id uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- BUSINESS IMAGES (Logos, gallery, media)
-- ============================================
create table if not exists business_images (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  image_url text not null,
  image_type text not null default 'gallery' check (image_type in ('logo', 'gallery', 'cover', 'coupon')),
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================
-- COUPONS (Coupon Mania / public coupons)
-- ============================================
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  coupon_title text not null,
  coupon_description text,
  coupon_code text,
  image_url text,
  destination_url text,
  start_date date default current_date,
  expiration_date date,
  status text not null default 'pending' check (status in ('pending', 'active', 'expired', 'paused', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- BANNER ADS (VIP banner advertising)
-- ============================================
create table if not exists banner_ads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  ad_title text,
  image_url text not null,
  destination_url text not null,
  placement_area text not null,
  start_date date default current_date,
  end_date date,
  status text not null default 'pending' check (status in ('pending', 'active', 'expired', 'paused', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- CONTACT INQUIRIES (General contact form)
-- ============================================
create table if not exists contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_type text not null default 'contact',
  name text not null,
  email text not null,
  phone text,
  message text,
  related_business_id uuid references businesses(id),
  ghl_contact_id text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now()
);

-- ============================================
-- ADVERTISING INQUIRIES (Coupon Mania, VIP interest)
-- ============================================
create table if not exists advertising_inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_type text not null check (inquiry_type in ('coupon_mania', 'vip_listing', 'premium_listing', 'banner_ad', 'marketing_services')),
  business_name text,
  contact_name text not null,
  email text not null,
  phone text,
  interest_area text,
  preferred_plan text,
  notes text,
  ghl_contact_id text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now()
);

-- ============================================
-- PAYMENTS (Subscription tracking)
-- ============================================
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  plan_id uuid references listing_plans(id),
  amount numeric,
  billing_frequency text check (billing_frequency in ('monthly', 'yearly', 'one_time')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'past_due')),
  stripe_customer_id text,
  stripe_subscription_id text,
  start_date date,
  renewal_date date,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- ADMIN ACTIVITY LOG (Audit trail)
-- ============================================
create table if not exists admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references profiles(id),
  action_type text not null,
  target_table text,
  target_record_id uuid,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================
-- REVIEWS (Business reviews)
-- ============================================
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  reviewer_name text not null,
  reviewer_email text,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  is_approved boolean default false,
  created_at timestamptz not null default now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
create index if not exists idx_businesses_slug on businesses(slug);
create index if not exists idx_businesses_status on businesses(status);
create index if not exists idx_businesses_owner on businesses(owner_user_id);
create index if not exists idx_business_locations_city on business_locations(city);
create index if not exists idx_business_locations_zip on business_locations(zip_code);
create index if not exists idx_categories_slug on categories(slug);
create index if not exists idx_business_listings_status on business_listings(listing_status);
create index if not exists idx_business_listings_business on business_listings(business_id);
create index if not exists idx_coupons_status on coupons(status);
create index if not exists idx_coupons_business on coupons(business_id);
create index if not exists idx_reviews_business on reviews(business_id);

-- ============================================
-- FULL-TEXT SEARCH
-- ============================================
alter table businesses drop column if exists search_vector;
alter table businesses add column search_vector tsvector generated always as (
  setweight(to_tsvector('english', coalesce(business_name,'')), 'A') ||
  setweight(to_tsvector('english', coalesce(description_short,'')), 'B') ||
  setweight(to_tsvector('english', coalesce(description_long,'')), 'B')
) stored;

create index if not exists idx_businesses_search_vector on businesses using gin(search_vector);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at_column();
create trigger businesses_updated_at before update on businesses
  for each row execute function update_updated_at_column();
create trigger business_locations_updated_at before update on business_locations
  for each row execute function update_updated_at_column();
create trigger categories_updated_at before update on categories
  for each row execute function update_updated_at_column();
create trigger listing_plans_updated_at before update on listing_plans
  for each row execute function update_updated_at_column();
create trigger business_listings_updated_at before update on business_listings
  for each row execute function update_updated_at_column();
create trigger listing_submissions_updated_at before update on listing_submissions
  for each row execute function update_updated_at_column();
create trigger coupons_updated_at before update on coupons
  for each row execute function update_updated_at_column();
create trigger banner_ads_updated_at before update on banner_ads
  for each row execute function update_updated_at_column();
create trigger payments_updated_at before update on payments
  for each row execute function update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table businesses enable row level security;
alter table business_locations enable row level security;
alter table categories enable row level security;
alter table business_categories enable row level security;
alter table listing_plans enable row level security;
alter table business_listings enable row level security;
alter table listing_submissions enable row level security;
alter table business_images enable row level security;
alter table coupons enable row level security;
alter table banner_ads enable row level security;
alter table contact_inquiries enable row level security;
alter table advertising_inquiries enable row level security;
alter table payments enable row level security;
alter table admin_activity_log enable row level security;
alter table reviews enable row level security;

-- Public read policies (approved/active listings only)
create policy "Public can read approved businesses" on businesses
  for select using (status = 'approved');

create policy "Public can read categories" on categories
  for select using (is_active = true);

create policy "Public can read business locations" on business_locations
  for select using (
    exists (select 1 from businesses where id = business_locations.business_id and status = 'approved')
  );

create policy "Public can read business categories" on business_categories
  for select using (
    exists (select 1 from businesses where id = business_categories.business_id and status = 'approved')
  );

create policy "Public can read active listings" on business_listings
  for select using (listing_status = 'active');

create policy "Public can read listing plans" on listing_plans
  for select using (is_active = true);

create policy "Public can read approved business images" on business_images
  for select using (
    exists (select 1 from businesses where id = business_images.business_id and status = 'approved')
  );

create policy "Public can read active coupons" on coupons
  for select using (status = 'active' and (expiration_date is null or expiration_date >= current_date));

create policy "Public can read active banner ads" on banner_ads
  for select using (status = 'active' and (end_date is null or end_date >= current_date));

create policy "Public can read approved reviews" on reviews
  for select using (is_approved = true);

-- Business owner policies (can manage own data)
create policy "Business owners can read own profile" on profiles
  for select using (id = auth.uid());

create policy "Business owners can update own profile" on profiles
  for update using (id = auth.uid());

create policy "Business owners can read own businesses" on businesses
  for select using (owner_user_id = auth.uid());

create policy "Business owners can insert own businesses" on businesses
  for insert with check (owner_user_id = auth.uid());

create policy "Business owners can update own businesses" on businesses
  for update using (owner_user_id = auth.uid());

create policy "Business owners can read own locations" on business_locations
  for select using (
    exists (select 1 from businesses where id = business_locations.business_id and owner_user_id = auth.uid())
  );

create policy "Business owners can manage own locations" on business_locations
  for all using (
    exists (select 1 from businesses where id = business_locations.business_id and owner_user_id = auth.uid())
  );

create policy "Business owners can read own listings" on business_listings
  for select using (
    exists (select 1 from businesses where id = business_listings.business_id and owner_user_id = auth.uid())
  );

create policy "Business owners can read own submissions" on listing_submissions
  for select using (
    exists (select 1 from businesses where id = listing_submissions.business_id and owner_user_id = auth.uid())
    or submitted_by_user_id = auth.uid()
  );

create policy "Business owners can insert submissions" on listing_submissions
  for insert with check (submitted_by_user_id = auth.uid());

create policy "Business owners can read own images" on business_images
  for select using (
    exists (select 1 from businesses where id = business_images.business_id and owner_user_id = auth.uid())
  );

create policy "Business owners can manage own images" on business_images
  for all using (
    exists (select 1 from businesses where id = business_images.business_id and owner_user_id = auth.uid())
  );

create policy "Business owners can read own coupons" on coupons
  for select using (
    exists (select 1 from businesses where id = coupons.business_id and owner_user_id = auth.uid())
  );

create policy "Business owners can insert own coupons" on coupons
  for insert with check (
    exists (select 1 from businesses where id = coupons.business_id and owner_user_id = auth.uid())
  );

-- Admin policies (full access)
create policy "Admins have full access to profiles" on profiles
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins have full access to businesses" on businesses
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins have full access to locations" on business_locations
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins have full access to categories" on categories
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins have full access to business categories" on business_categories
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins have full access to listings" on business_listings
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins have full access to submissions" on listing_submissions
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins have full access to images" on business_images
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins have full access to coupons" on coupons
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins have full access to banner ads" on banner_ads
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins have full access to inquiries" on contact_inquiries
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins have full access to advertising inquiries" on advertising_inquiries
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins have full access to payments" on payments
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins have full access to admin log" on admin_activity_log
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins have full access to reviews" on reviews
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Allow public to submit inquiries
create policy "Public can submit contact inquiries" on contact_inquiries
  for insert with check (true);

create policy "Public can submit advertising inquiries" on advertising_inquiries
  for insert with check (true);

-- ============================================
-- SAMPLE DATA (St. Louis Area Businesses)
-- ============================================

-- Insert sample categories
insert into categories (name, slug, description) values
  ('Restaurants', 'restaurants', 'Local restaurants and dining establishments'),
  ('Home Services', 'home-services', 'Plumbers, electricians, HVAC, and home repair'),
  ('Professional Services', 'professional-services', 'Legal, accounting, consulting, and professional services'),
  ('Health & Wellness', 'health-wellness', 'Doctors, dentists, fitness, and wellness services'),
  ('Marketing & Advertising', 'marketing-advertising', 'Marketing agencies, SEO, and advertising services'),
  ('Automotive', 'automotive', 'Auto repair, sales, and services'),
  ('Retail', 'retail', 'Local retail shops and stores'),
  ('Education & Training', 'education-training', 'Schools, tutors, and training centers')
on conflict (slug) do nothing;

-- Insert sample businesses (will be linked to listings after profile creation)
insert into businesses (business_name, slug, description_short, description_long, phone, email, website_url, status) values
  (
    'True Products Network',
    'true-products-network',
    'Digital marketing and business systems for local businesses',
    'True Products Network helps businesses put the right systems in place so conversations turn into clients. We specialize in CRM setup, automation, lead follow-up, and practical business growth systems.',
    '(314) 886-8084',
    'nigel@trueproductsnetwork.com',
    'https://trueproductsnetwork.com',
    'approved'
  ),
  (
    'Schneider Roofing',
    'schneider-roofing',
    'Family-owned roofing company serving St. Louis for over 30 years',
    'Schneider Roofing provides residential and commercial roofing services including repairs, replacements, and inspections. Family-owned and operated since 1992.',
    '(314) 555-0321',
    'info@schneiderroofing.com',
    'https://schneiderroofing.com',
    'approved'
  ),
  (
    'Chesterfield Dental Care',
    'chesterfield-dental-care',
    'Comprehensive dental care with state-of-the-art technology',
    'Chesterfield Dental Care offers comprehensive dental services including cosmetic dentistry, family dentistry, and emergency dental care.',
    '(636) 555-0654',
    'info@chesterfielddental.com',
    'https://chesterfielddental.com',
    'approved'
  ),
  (
    'St. Louis Auto Repair',
    'st-louis-auto-repair',
    'Full-service auto repair and maintenance',
    'St. Louis Auto Repair provides complete automotive services including oil changes, brake repair, engine diagnostics, and transmission service.',
    '(314) 555-0199',
    'service@stlautorepair.com',
    'https://stlautorepair.com',
    'approved'
  )
on conflict (slug) do nothing;

-- Insert sample locations
insert into business_locations (business_id, address_line_1, city, state, zip_code)
select 
  b.id,
  case 
    when b.slug = 'true-products-network' then '123 Main St'
    when b.slug = 'schneider-roofing' then '456 Oak Ave'
    when b.slug = 'chesterfield-dental-care' then '789 Chesterfield Pkwy'
    when b.slug = 'st-louis-auto-repair' then '321 Market St'
  end,
  case 
    when b.slug = 'true-products-network' then 'Chesterfield'
    when b.slug = 'schneider-roofing' then 'St. Louis'
    when b.slug = 'chesterfield-dental-care' then 'Chesterfield'
    when b.slug = 'st-louis-auto-repair' then 'St. Louis'
  end,
  'MO',
  case 
    when b.slug = 'true-products-network' then '63017'
    when b.slug = 'schneider-roofing' then '63101'
    when b.slug = 'chesterfield-dental-care' then '63017'
    when b.slug = 'st-louis-auto-repair' then '63103'
  end
from businesses b
where b.slug in ('true-products-network', 'schneider-roofing', 'chesterfield-dental-care', 'st-louis-auto-repair')
on conflict do nothing;

-- Link businesses to categories
insert into business_categories (business_id, category_id)
select b.id, c.id
from businesses b, categories c
where b.slug = 'true-products-network' and c.slug = 'marketing-advertising'
   or b.slug = 'schneider-roofing' and c.slug = 'home-services'
   or b.slug = 'chesterfield-dental-care' and c.slug = 'health-wellness'
   or b.slug = 'st-louis-auto-repair' and c.slug = 'automotive'
on conflict do nothing;

-- Create active listings for sample businesses
insert into business_listings (business_id, plan_id, listing_status, is_featured, sort_priority)
select 
  b.id,
  lp.id,
  'active',
  case when b.slug in ('true-products-network', 'schneider-roofing') then true else false end,
  case 
    when b.slug = 'true-products-network' then 100
    when b.slug = 'schneider-roofing' then 50
    else 0
  end
from businesses b
cross join listing_plans lp
where b.slug in ('true-products-network', 'schneider-roofing', 'chesterfield-dental-care', 'st-louis-auto-repair')
  and (
    (b.slug = 'true-products-network' and lp.plan_name = 'VIP')
    or (b.slug = 'schneider-roofing' and lp.plan_name = 'Premium')
    or (b.slug in ('chesterfield-dental-care', 'st-louis-auto-repair') and lp.plan_name = 'Free')
  )
on conflict do nothing;
