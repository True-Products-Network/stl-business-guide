import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessName = searchParams.get('name');

    if (!businessName) {
      return NextResponse.json({ error: 'Business name required' }, { status: 400 });
    }

    // Find the business
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id, business_name, slug')
      .ilike('business_name', `%${businessName}%`)
      .single();

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Get all listings for this business
    const { data: listings, error: listingsError } = await supabaseAdmin
      .from('business_listings')
      .select('id, plan_id, listing_status, listing_plans(plan_key)')
      .eq('business_id', business.id);

    // Get analytics for all listings
    const listingIds = listings?.map(l => l.id) || [];
    const { data: analytics, error: analyticsError } = await supabaseAdmin
      .from('business_analytics')
      .select('*')
      .in('business_id', listingIds)
      .order('date', { ascending: false })
      .limit(30);

    // Calculate totals
    const totals = analytics?.reduce((acc, curr) => ({
      profile_views: acc.profile_views + (curr.profile_views || 0),
      website_clicks: acc.website_clicks + (curr.website_clicks || 0),
      phone_clicks: acc.phone_clicks + (curr.phone_clicks || 0),
      email_clicks: acc.email_clicks + (curr.email_clicks || 0),
      direction_clicks: acc.direction_clicks + (curr.direction_clicks || 0),
    }), {
      profile_views: 0,
      website_clicks: 0,
      phone_clicks: 0,
      email_clicks: 0,
      direction_clicks: 0,
    });

    return NextResponse.json({
      business,
      listings: listings || [],
      analytics: analytics || [],
      totals,
      listingIds
    });

  } catch (error) {
    console.error('Debug analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
