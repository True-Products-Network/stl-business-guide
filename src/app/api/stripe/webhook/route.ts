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
        
        // Update business plan in database
        const businessId = session.metadata?.businessId;
        const planName = session.metadata?.planName;
        
        if (businessId && businessId !== 'temp-business-id' && planName) {
          try {
            const { supabase } = await import('@/lib/supabase');
            
            // Get plan ID from plan name
            const planKey = planName.toLowerCase().includes('vip') ? 'vip' : 'premium';
            const { data: planData } = await supabase
              .from('listing_plans')
              .select('id')
              .eq('plan_key', planKey)
              .single();
            
            if (planData) {
              // Update the business listing with new plan
              const { error: updateError } = await supabase
                .from('business_listings')
                .update({
                  plan_id: planData.id,
                  listing_status: 'approved',
                  payment_status: 'paid',
                  updated_at: new Date().toISOString(),
                })
                .eq('business_id', businessId);
              
              if (updateError) {
                console.error('Error updating business plan:', updateError);
              } else {
                console.log(`✅ Updated business ${businessId} to ${planKey} plan`);
              }
              
              // Also update owner_profile_id if we have customer email
              if (session.customer_email) {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('email', session.customer_email)
                  .single();
                
                if (profile) {
                  const { error: ownerError } = await supabase
                    .from('businesses')
                    .update({
                      owner_profile_id: profile.id,
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', businessId);
                  
                  if (ownerError) {
                    console.error('Error updating owner:', ownerError);
                  } else {
                    console.log(`✅ Updated owner for business ${businessId}`);
                  }
                }
              }
            }
          } catch (err) {
            console.error('Error in plan update:', err);
          }
        }
        
        // Send buyer to GHL for follow-up and nurture
        if (session.customer_email && session.customer_details?.name) {
          const amount = session.amount_total ? session.amount_total / 100 : 0;
          
          await handleStripeCheckoutForGHL(
            session.customer_email,
            session.customer_details.name,
            planName || 'Unknown',
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
