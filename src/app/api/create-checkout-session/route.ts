import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: Request) {
  try {
    const { plan_key, business_id, user_id, success_url, cancel_url } = await request.json();

    // Get plan details from database or environment
    let price_id: string;
    let plan_name: string;

    if (plan_key === 'premium') {
      price_id = process.env.STRIPE_PREMIUM_PRICE_ID!;
      plan_name = 'Premium Listing';
    } else if (plan_key === 'vip') {
      price_id = process.env.STRIPE_VIP_PRICE_ID!;
      plan_name = 'VIP Listing';
    } else {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
      metadata: {
        business_id,
        user_id,
        plan_key,
      },
      subscription_data: {
        metadata: {
          business_id,
          user_id,
          plan_key,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
