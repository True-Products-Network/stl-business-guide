import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// TYPES (based on new schema)
// ============================================

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'business_owner' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_category_id: string | null;
  description: string | null;
  is_active: boolean;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ListingPlan {
  id: string;
  plan_name: 'Free' | 'Premium' | 'VIP';
  monthly_price: number;
  yearly_price: number | null;
  max_images: number;
  allows_coupon: boolean;
  allows_video: boolean;
  allows_banner_ads: boolean;
  featured_priority: number;
}

export interface BusinessCategoryJoin {
  category: Category;
}

export interface Business {
  id: string;
  owner_user_id: string | null;
  business_name: string;
  slug: string;
  description_short: string | null;
  description_long: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  logo_url: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  created_at: string;
  updated_at: string;
  // Joined fields
  categories?: BusinessCategoryJoin[];
  location?: BusinessLocation;
  listing?: BusinessListing;
  images?: BusinessImage[];
}

export interface BusinessLocation {
  id: string;
  business_id: string;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  service_area: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface BusinessListing {
  id: string;
  business_id: string;
  plan_id: string;
  listing_status: 'pending' | 'active' | 'paused' | 'expired' | 'archived';
  start_date: string | null;
  end_date: string | null;
  is_featured: boolean;
  sort_priority: number;
  cta_label: string | null;
  cta_url: string | null;
  plan?: ListingPlan;
}

export interface BusinessImage {
  id: string;
  business_id: string;
  image_url: string;
  image_type: 'logo' | 'gallery' | 'cover' | 'coupon';
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

export interface ListingSubmission {
  id: string;
  business_id: string | null;
  submitted_by_user_id: string | null;
  requested_plan_id: string | null;
  submission_status: 'draft' | 'submitted' | 'needs_edits' | 'approved' | 'rejected';
  admin_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by_user_id: string | null;
}

export interface Coupon {
  id: string;
  business_id: string;
  coupon_title: string;
  coupon_description: string | null;
  coupon_code: string | null;
  image_url: string | null;
  destination_url: string | null;
  start_date: string | null;
  expiration_date: string | null;
  status: 'pending' | 'active' | 'expired' | 'paused' | 'rejected';
}

export interface SearchFilters {
  query?: string;
  category?: string;
  city?: string;
  state?: string;
  plan?: 'Free' | 'Premium' | 'VIP';
  is_featured?: boolean;
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

// Search businesses with filters
export async function searchBusinesses(filters: SearchFilters) {
  let query = supabase
    .from('businesses')
    .select(`
      *,
      location:business_locations(*),
      listing:business_listings(*, plan:listing_plans(*)),
      categories:business_categories(category:categories(*))
    `)
    .eq('status', 'approved');

  // Text search
  if (filters.query) {
    query = query.or(
      `business_name.ilike.%${filters.query}%,description_short.ilike.%${filters.query}%,description_long.ilike.%${filters.query}%`
    );
  }

  // Filter by city
  if (filters.city) {
    query = query.filter('business_locations.city', 'ilike', `%${filters.city}%`);
  }

  // Filter by state
  if (filters.state) {
    query = query.filter('business_locations.state', 'eq', filters.state);
  }

  // Filter featured
  if (filters.is_featured) {
    query = query.filter('business_listings.is_featured', 'eq', true);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Search error:', error);
    return [];
  }

  return data as Business[];
}

// Get featured businesses
export async function getFeaturedBusinesses(limit: number = 6) {
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      location:business_locations(*),
      listing:business_listings!inner(*, plan:listing_plans(*))
    `)
    .eq('status', 'approved')
    .filter('business_listings.is_featured', 'eq', true)
    .filter('business_listings.listing_status', 'eq', 'active')
    .order('business_listings.sort_priority', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured:', error);
    return [];
  }

  return data as Business[];
}

// Get business by slug from public view
export async function getBusinessBySlug(slug: string) {
  const { data, error } = await supabase
    .from('public_approved_listings')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching business:', error);
    return null;
  }

  return data;
}

// Get all categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data as Category[];
}

// ============================================
// LOCATIONS FUNCTIONS
// ============================================

// Get all active locations
export async function getLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching locations:', error);
    return [];
  }

  return data as Location[];
}

// Admin: Create new location
export async function createLocation(locationData: Partial<Location>) {
  const { data, error } = await supabase
    .from('locations')
    .insert(locationData)
    .select()
    .single();

  if (error) {
    console.error('Error creating location:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

// Admin: Update location
export async function updateLocation(id: string, locationData: Partial<Location>) {
  const { data, error } = await supabase
    .from('locations')
    .update(locationData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating location:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

// Admin: Delete location (soft delete)
export async function deleteLocation(id: string) {
  const { error } = await supabase
    .from('locations')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Error deleting location:', error);
    return { success: false, error };
  }

  return { success: true };
}

// Admin: Create new category
export async function createCategory(categoryData: Partial<Category>) {
  const { data, error } = await supabase
    .from('categories')
    .insert(categoryData)
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

// Admin: Update category
export async function updateCategory(id: string, categoryData: Partial<Category>) {
  const { data, error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

// Admin: Delete category (soft delete)
export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    return { success: false, error };
  }

  return { success: true };
}

// Get all cities
export async function getCities() {
  const { data, error } = await supabase
    .from('business_locations')
    .select('city, state')
    .order('city');

  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }

  // Extract unique city/state combinations
  const uniqueCities = [...new Map(data.map(item => [`${item.city}, ${item.state}`, item])).values()];
  return uniqueCities;
}

// Get listing plans
export async function getListingPlans() {
  const { data, error } = await supabase
    .from('listing_plans')
    .select('*')
    .eq('is_active', true)
    .order('monthly_price');

  if (error) {
    console.error('Error fetching plans:', error);
    return [];
  }

  return data as ListingPlan[];
}

// ============================================
// LISTING SUBMISSION FUNCTIONS
// ============================================

// Check if business name already exists
export async function checkBusinessNameExists(businessName: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, business_name')
    .ilike('business_name', businessName.trim())
    .limit(1);

  if (error) {
    console.error('Error checking business name:', error);
    return { exists: false, error };
  }

  return { exists: data && data.length > 0, business: data?.[0] || null };
}

// Submit a new listing (Free, Premium, or VIP)
export async function submitListing(formData: {
  business_name: string;
  slug: string;
  description_short: string;
  description_long?: string;
  phone: string;
  email: string;
  website_url?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  service_area?: string;
  category_ids: string[];
  plan_id: string;
  user_id?: string | null;
}) {
  // Check if business name already exists
  const { exists, business: existingBusiness } = await checkBusinessNameExists(formData.business_name);
  
  if (exists) {
    return { 
      success: false, 
      error: { 
        message: `A business listing for "${formData.business_name}" already exists. Please use a different business name or contact us if this is your business.`,
        code: 'BUSINESS_NAME_EXISTS'
      } 
    };
  }

  // Start a transaction by using RPC or multiple inserts
  
  // 1. Create the business (without owner_profile_id for public submissions)
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      business_name: formData.business_name,
      slug: formData.slug,
      description_short: formData.description_short,
      description_long: formData.description_long || null,
      phone: formData.phone,
      email: formData.email,
      website_url: formData.website_url || null,
      status: 'pending'
    })
    .select()
    .single();

  if (businessError) {
    console.error('Error creating business:', businessError);
    return { success: false, error: businessError };
  }

  // 2. Create the location
  const { error: locationError } = await supabase
    .from('business_locations')
    .insert({
      business_id: business.id,
      address_line_1: formData.address_line_1,
      address_line_2: formData.address_line_2 || null,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code,
      service_area: formData.service_area || null
    });

  if (locationError) {
    console.error('Error creating location:', locationError);
    return { success: false, error: locationError };
  }

  // 3. Link categories
  const categoryLinks = formData.category_ids.map(catId => ({
    business_id: business.id,
    category_id: catId
  }));

  const { error: categoryError } = await supabase
    .from('business_categories')
    .insert(categoryLinks);

  if (categoryError) {
    console.error('Error linking categories:', categoryError);
    return { success: false, error: categoryError };
  }

  // 4. Create the listing
  const { data: listing, error: listingError } = await supabase
    .from('business_listings')
    .insert({
      business_id: business.id,
      plan_id: formData.plan_id,
      listing_status: 'pending'
    })
    .select()
    .single();

  if (listingError) {
    console.error('Error creating listing:', listingError);
    return { success: false, error: listingError };
  }

  // 5. Create the submission record (optional - may not have requested_plan_id column yet)
  try {
    const { error: submissionError } = await supabase
      .from('listing_submissions')
      .insert({
        business_id: business.id,
        submitted_by_user_id: formData.user_id || null,
        requested_plan_id: formData.plan_id,
        submission_status: 'submitted',
        submitted_at: new Date().toISOString()
      });

    if (submissionError) {
      console.warn('Error creating submission record (non-critical):', submissionError);
      // Don't fail the whole submission if this step fails
    }
  } catch (err) {
    console.warn('Submission record creation failed (non-critical):', err);
  }

  return { success: true, business, listing };
}

// ============================================
// AUTH FUNCTIONS
// ============================================

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { success: !error, error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as Profile;
}
