import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
    hasPremiumPrice: !!process.env.STRIPE_PREMIUM_PRICE_ID,
    hasVIPPrice: !!process.env.STRIPE_VIP_PRICE_ID,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
  });
}
