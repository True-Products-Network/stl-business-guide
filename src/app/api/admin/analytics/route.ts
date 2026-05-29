import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization - only create client when needed
let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }
    
    supabaseAdmin = createClient(url, key);
  }
  return supabaseAdmin;
}

export async function GET(request: Request) {
  try {
    // Get the current user from the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the user and check if they're an admin
    const { data: { user }, error: authError } = await getSupabaseAdmin().auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await getSupabaseAdmin()
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
    }

    if (profile.role !== 'admin' && profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Fetch all businesses with their listing info using service role (bypasses RLS)
    const { data: businesses, error: businessesError } = await getSupabaseAdmin()
      .from('businesses')
      .select(`
        id, 
        business_name, 
        slug,
        status,
        business_listings!left (
          id,
          is_featured,
          listing_status,
          listing_plans!left (
            plan_key
          )
        )
      `);

    if (businessesError) {
      console.error('Error fetching businesses:', businessesError);
      return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
    }

    // Fetch all analytics records
    const { data: analytics, error: analyticsError } = await getSupabaseAdmin()
      .from('business_analytics')
      .select('business_id, date, profile_views, website_clicks, phone_clicks, email_clicks, direction_clicks');

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    return NextResponse.json({
      businesses: businesses || [],
      analytics: analytics || []
    });

  } catch (error) {
    console.error('Admin analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}