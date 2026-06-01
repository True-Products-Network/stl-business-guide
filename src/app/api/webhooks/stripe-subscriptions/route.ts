import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Grace period days based on founding member status
const REGULAR_GRACE_PERIOD_DAYS = 7;
const FOUNDING_MEMBER_GRACE_PERIOD_DAYS = 14;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailure(invoice);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSuccess(invoice);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function handlePaymentFailure(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;

  // Get subscription details from database
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, businesses!inner(id, business_name, email)')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!subscription) {
    console.error('Subscription not found:', subscriptionId);
    return;
  }

  // Calculate grace period
  const isFoundingMember = subscription.is_founding_member;
  const gracePeriodDays = isFoundingMember 
    ? FOUNDING_MEMBER_GRACE_PERIOD_DAYS 
    : REGULAR_GRACE_PERIOD_DAYS;
  
  const gracePeriodEndsAt = new Date();
  gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + gracePeriodDays);

  // Update subscription with grace period
  await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      grace_period_ends_at: gracePeriodEndsAt.toISOString(),
      payment_failure_count: (subscription.payment_failure_count || 0) + 1,
      last_payment_failure_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id);

  // Send notification email
  await sendPaymentFailureNotification(
    (subscription.businesses as any).email,
    (subscription.businesses as any).business_name,
    gracePeriodEndsAt,
    isFoundingMember,
    invoice.amount_due / 100
  );

  console.log(`Payment failed for ${(subscription.businesses as any).business_name}. Grace period until ${gracePeriodEndsAt}`);
}

async function handlePaymentSuccess(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;

  // Clear grace period and reset failure count
  const { data: subscription } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      grace_period_ends_at: null,
      payment_failure_count: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId)
    .select('*, businesses!inner(email, business_name)')
    .single();

  if (subscription) {
    // Send payment recovered notification
    await sendPaymentRecoveredNotification(
      (subscription.businesses as any).email,
      (subscription.businesses as any).business_name
    );
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  // Downgrade to free plan
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      grace_period_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Update business to free plan
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('business_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (sub) {
    await supabase
      .from('businesses')
      .update({
        plan_key: 'free',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.business_id);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

// Notification functions
async function sendPaymentFailureNotification(
  email: string,
  businessName: string,
  gracePeriodEndsAt: Date,
  isFoundingMember: boolean,
  amountDue: number
) {
  const graceDays = isFoundingMember ? 14 : 7;
  
  // TODO: Implement email sending via your email provider
  console.log(`[EMAIL] Payment failure notification to ${email}`);
  console.log(`  Business: ${businessName}`);
  console.log(`  Amount Due: $${amountDue}`);
  console.log(`  Grace Period: ${graceDays} days (until ${gracePeriodEndsAt.toLocaleDateString()})`);
  console.log(`  Founding Member: ${isFoundingMember ? 'Yes (14 days)' : 'No (7 days)'}`);
}

async function sendPaymentRecoveredNotification(email: string, businessName: string) {
  console.log(`[EMAIL] Payment recovered notification to ${email}`);
  console.log(`  Business: ${businessName}`);
}

async function sendDowngradeNotification(email: string, businessName: string) {
  console.log(`[EMAIL] Downgrade notification to ${email}`);
  console.log(`  Business: ${businessName}`);
  console.log(`  Downgraded to: Free plan`);
}
