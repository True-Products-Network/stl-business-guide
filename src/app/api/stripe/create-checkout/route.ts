import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { checkFoundingMemberAvailability, markAsFoundingMember } from '@/lib/subscription-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, planName, businessId, businessName, customerEmail } = body;

    if (!plan || !businessId || !businessName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if founding member pricing is available
    const foundingMemberStatus = await checkFoundingMemberAvailability();
    const isFoundingMember = foundingMemberStatus.isAvailable;

    let priceId: string;
    if (plan === 'premium') {
      priceId = STRIPE_PRICE_IDS.premium;
    } else if (plan === 'vip') {
      priceId = STRIPE_PRICE_IDS.vip;
    } else {
      return NextResponse.json(
        { error: `Invalid plan: ${plan}` },
        { status: 400 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: `Price not configured for plan: ${plan}` },
        { status: 400 }
      );
    }

    const result = await createCheckoutSession(
      priceId,
      businessId,
      businessName,
      customerEmail,
      planName,
      isFoundingMember
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      url: result.url,
      isFoundingMember,
      foundingMemberInfo: isFoundingMember ? {
        spotsRemaining: foundingMemberStatus.spotsRemaining,
        deadline: foundingMemberStatus.deadline,
      } : null,
    });
  } catch (error: any) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
