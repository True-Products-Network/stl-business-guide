import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  console.log('Stripe webhook received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const business_id = session.metadata?.business_id;
        const user_id = session.metadata?.user_id;
        const plan_key = session.metadata?.plan_key;

        if (!business_id) {
          console.error('No business_id in session metadata');
          break;
        }

        // Update business listing as paid
        const { error } = await supabase
          .from('business_listings')
          .update({
            payment_status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string,
            stripe_checkout_session_id: session.id,
            paid_at: new Date().toISOString(),
            listing_status: 'approved', // Auto-approve after payment
          })
          .eq('id', business_id);

        if (error) {
          console.error('Error updating business listing:', error);
        } else {
          console.log('Business listing updated as paid:', business_id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const business_id = subscription.metadata?.business_id;

        if (business_id) {
          // Mark listing as payment failed
          await supabase
            .from('business_listings')
            .update({
              payment_status: 'failed',
              listing_status: 'pending', // Revert to pending
            })
            .eq('id', business_id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const business_id = subscription.metadata?.business_id;

        if (business_id) {
          // Downgrade to free plan or mark as expired
          const { data: freePlan } = await supabase
            .from('listing_plans')
            .select('id')
            .eq('plan_key', 'free')
            .single();

          if (freePlan) {
            await supabase
              .from('business_listings')
              .update({
                plan_id: freePlan.id,
                payment_status: 'not_required',
                listing_status: 'approved',
              })
              .eq('id', business_id);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
