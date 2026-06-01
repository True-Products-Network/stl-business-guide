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
    const { locationId, businessId, location, userEmail } = body;

    if (!locationId || !businessId || !location || !userEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Verify the user owns this business
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id, email')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      return NextResponse.json({ 
        success: false, 
        error: 'Business not found' 
      }, { status: 404 });
    }

    if (business.email !== userEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authorized to update this business' 
      }, { status: 403 });
    }

    // Update the location
    const { error: updateError } = await supabaseAdmin
      .from('business_locations')
      .update({
        address_line_1: location.address_line_1 || null,
        address_line_2: location.address_line_2 || null,
        city: location.city,
        state: location.state,
        zip_code: location.zip_code || null,
        service_area: location.service_area || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', locationId);

    if (updateError) {
      console.error('Error updating location:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: updateError.message 
      }, { status: 500 });
    }

    // Verify the update
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('business_locations')
      .select('city, state')
      .eq('id', locationId)
      .single();

    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    } else {
      console.log('Verified location data after update:', verifyData);
    }

    return NextResponse.json({ 
      success: true, 
      data: verifyData 
    });

  } catch (error: any) {
    console.error('Error in update-location API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
