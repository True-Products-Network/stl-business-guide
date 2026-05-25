import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, handleSubscriptionCreated } from '@/lib/stripe';
import { handleStripeCheckoutForGHL } from '@/lib/ghl';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    const verification = verifyWebhookSignature(payload, signature);

    if (!verification.success) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = verification.event;

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('✅ Checkout completed:', session.id);
        
        // Send buyer to GHL for follow-up and nurture
        if (session.customer_email && session.customer_details?.name) {
          const planName = session.metadata?.planName || 'Unknown';
          const amount = session.amount_total ? session.amount_total / 100 : 0;
          
          await handleStripeCheckoutForGHL(
            session.customer_email,
            session.customer_details.name,
            planName,
            amount
          );
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('💰 Payment succeeded:', invoice.id);
        
        // Handle recurring payments - could update GHL with payment history
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('❌ Payment failed:', invoice.id);
        
        // Could tag in GHL as "Payment Issue" for follow-up
        break;
      }

      case 'customer.subscription.created': {
        await handleSubscriptionCreated(event.data.object);
        break;
      }

      case 'customer.subscription.updated': {
        console.log('📝 Subscription updated:', event.data.object.id);
        break;
      }

      case 'customer.subscription.deleted': {
        console.log('🚫 Subscription cancelled:', event.data.object.id);
        
        // Could tag in GHL as "Cancelled" for win-back campaign
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
