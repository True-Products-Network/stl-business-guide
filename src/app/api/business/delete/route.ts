import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, userEmail } = body;

    if (!businessId || !userEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    console.log('Delete request for business:', businessId, 'by user:', userEmail);

    // Verify the user owns this business
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id, email')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      console.error('Business not found:', businessError);
      return NextResponse.json({ 
        success: false, 
        error: 'Business not found' 
      }, { status: 404 });
    }

    if (business.email !== userEmail) {
      console.error('Not authorized:', business.email, '!=', userEmail);
      return NextResponse.json({ 
        success: false, 
        error: 'Not authorized to delete this business' 
      }, { status: 403 });
    }

    // Delete related records first (order matters for foreign keys)
    console.log('Deleting related records...');
    
    // 1. Delete analytics
    const { error: analyticsError } = await supabaseAdmin
      .from('business_analytics')
      .delete()
      .eq('business_id', businessId);
    if (analyticsError) console.error('Analytics delete error:', analyticsError);
    else console.log('Deleted analytics');

    // 2. Delete coupon redemptions (first get coupon IDs)
    const { data: coupons } = await supabaseAdmin
      .from('coupons')
      .select('id')
      .eq('business_id', businessId);
    
    if (coupons && coupons.length > 0) {
      const couponIds = coupons.map(c => c.id);
      const { error: redemptionError } = await supabaseAdmin
        .from('coupon_redemptions')
        .delete()
        .in('coupon_id', couponIds);
      if (redemptionError) console.error('Redemption delete error:', redemptionError);
      else console.log('Deleted redemptions');
    }

    // 3. Delete coupons
    const { error: couponsError } = await supabaseAdmin
      .from('coupons')
      .delete()
      .eq('business_id', businessId);
    if (couponsError) console.error('Coupons delete error:', couponsError);
    else console.log('Deleted coupons');

    // 4. Delete images
    const { error: imagesError } = await supabaseAdmin
      .from('business_images')
      .delete()
      .eq('business_id', businessId);
    if (imagesError) console.error('Images delete error:', imagesError);
    else console.log('Deleted images');

    // 5. Delete business listings
    const { error: listingError } = await supabaseAdmin
      .from('business_listings')
      .delete()
      .eq('business_id', businessId);
    if (listingError) console.error('Listing delete error:', listingError);
    else console.log('Deleted business_listings');

    // 6. Delete categories
    const { error: categoriesError } = await supabaseAdmin
      .from('business_categories')
      .delete()
      .eq('business_id', businessId);
    if (categoriesError) console.error('Categories delete error:', categoriesError);
    else console.log('Deleted categories');

    // 7. Delete locations
    const { error: locationsError } = await supabaseAdmin
      .from('business_locations')
      .delete()
      .eq('business_id', businessId);
    if (locationsError) console.error('Locations delete error:', locationsError);
    else console.log('Deleted locations');

    // 8. Finally delete the business
    console.log('Deleting business...');
    const { error: deleteError } = await supabaseAdmin
      .from('businesses')
      .delete()
      .eq('id', businessId);

    if (deleteError) {
      console.error('Business delete error:', deleteError);
      return NextResponse.json({ 
        success: false, 
        error: deleteError.message 
      }, { status: 500 });
    }

    console.log('Business deleted successfully');
    return NextResponse.json({ 
      success: true 
    });

  } catch (error: any) {
    console.error('Error in delete API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
