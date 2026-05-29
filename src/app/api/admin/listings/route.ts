import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { handleListingApprovalForGHL } from '@/lib/ghl';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create admin client with service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/admin/listings/approve
 * Approve a pending listing and send to GHL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, adminNotes } = body;

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Get business details with owner info
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select(`
        *,
        owner:owner_id(email, full_name),
        business_listings:listings!inner(*),
        locations:location_id(city, state)
      `)
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      console.error('Error fetching business:', businessError);
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Update business status to approved
    const { error: updateError } = await supabaseAdmin
      .from('businesses')
      .update({
        status: 'approved',
        admin_notes: adminNotes || null,
        approved_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (updateError) {
      console.error('Error approving business:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve business' },
        { status: 500 }
      );
    }

    // Update listing status to active
    const { error: listingError } = await supabaseAdmin
      .from('listings')
      .update({
        listing_status: 'active',
        admin_notes: adminNotes || null,
      })
      .eq('business_id', businessId);

    if (listingError) {
      console.error('Error updating listing:', listingError);
      // Don't fail the approval if listing update fails
    }

    // Send to GHL
    try {
      await handleListingApprovalForGHL(
        business.email || business.owner?.email,
        business.business_name,
        business.owner?.full_name || business.contact_name || business.business_name,
        business.phone,
        business.business_listings?.[0]?.plan_name || 'Free',
        business.website_url
      );
    } catch (ghlError) {
      console.error('GHL integration error:', ghlError);
      // Don't fail the approval if GHL fails
    }

    return NextResponse.json({
      success: true,
      message: 'Listing approved successfully',
      businessId,
    });
  } catch (error: any) {
    console.error('Approve listing error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/listings
 * Get all pending listings for approval
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const { data: businesses, error } = await supabaseAdmin
      .from('businesses')
      .select(`
        *,
        owner:owner_id(email, full_name),
        business_listings:listings!inner(*),
        locations:location_id(city, state)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch listings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      listings: businesses || [],
    });
  } catch (error: any) {
    console.error('Get listings error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
