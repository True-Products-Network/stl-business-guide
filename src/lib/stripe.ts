import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia', // Latest API version
});

// Price IDs for your products - you'll create these in Stripe Dashboard
export const STRIPE_PRICE_IDS = {
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || '',
  vip: process.env.STRIPE_VIP_PRICE_ID || '',
};

// Product IDs
export const STRIPE_PRODUCT_IDS = {
  premium: process.env.STRIPE_PREMIUM_PRODUCT_ID || '',
  vip: process.env.STRIPE_VIP_PRODUCT_ID || '',
};

// Create a checkout session for subscription
export async function createCheckoutSession(
  priceId: string,
  businessId: string,
  businessName: string,
  customerEmail?: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        businessId,
        businessName,
      },
      customer_email: customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
    });

    return { success: true, sessionId: session.id, url: session.url };
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return { success: false, error: error.message };
  }
}

// Create Stripe products for Premium and VIP
export async function createProducts() {
  try {
    // Create Premium Product
    const premiumProduct = await stripe.products.create({
      name: 'Premium Business Listing',
      description: 'Enhanced visibility with priority placement, 5 photos, and featured status',
    });

    const premiumPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 9700, // $97.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    // Create VIP Product
    const vipProduct = await stripe.products.create({
      name: 'VIP Business Listing',
      description: 'Maximum exposure with top placement, unlimited photos, videos, and homepage features',
    });

    const vipPrice = await stripe.prices.create({
      product: vipProduct.id,
      unit_amount: 49700, // $497.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    return {
      success: true,
      premium: {
        productId: premiumProduct.id,
        priceId: premiumPrice.id,
      },
      vip: {
        productId: vipProduct.id,
        priceId: vipPrice.id,
      },
    };
  } catch (error: any) {
    console.error('Stripe product creation error:', error);
    return { success: false, error: error.message };
  }
}

// Verify webhook signature
export function verifyWebhookSignature(payload: string, signature: string) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
    return { success: true, event };
  } catch (error: any) {
    console.error('Webhook verification error:', error);
    return { success: false, error: error.message };
  }
}

// Handle subscription created webhook
export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const businessId = subscription.metadata?.businessId;
  const status = subscription.status;
  
  // Update your database here
  console.log(`Subscription ${status} for business ${businessId}`);
  
  return { success: true };
}
