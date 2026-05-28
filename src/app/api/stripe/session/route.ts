import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'No session ID provided' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get business details from metadata
    const businessId = session.metadata?.businessId;
    const businessName = session.metadata?.businessName || 'Your Business';
    const planName = session.metadata?.planName || 'Premium';

    // Fetch the business slug from database
    let slug = null;
    if (businessId && businessId !== 'temp-business-id') {
      const { data: business } = await supabase
        .from('businesses')
        .select('slug')
        .eq('id', businessId)
        .single();
      
      if (business) {
        slug = business.slug;
      }
    }

    return NextResponse.json({
      success: true,
      businessId,
      businessName,
      planName,
      slug,
      status: session.payment_status,
    });
  } catch (error: any) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
