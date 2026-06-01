#!/usr/bin/env node

/**
 * Stripe Product Setup Script
 * 
 * This script creates the Premium and VIP products in your Stripe account.
 * 
 * Usage:
 *   node scripts/setup-stripe.js
 * 
 * Required environment variable:
 *   STRIPE_SECRET_KEY=*** (your Stripe secret key)
 */

const Stripe = require('stripe');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY environment variable is required');
  console.error('   Set it with: export STRIPE_SECRET_KEY=***');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

async function createProducts() {
  console.log('🚀 Creating Stripe products...\n');

  try {
    // Create Premium Product
    console.log('Creating Premium Product...');
    const premiumProduct = await stripe.products.create({
      name: 'Premium Business Listing',
      description: 'Enhanced visibility with priority placement, 5 photos, website link, and featured status on STL Business Guide',
    });
    console.log('✅ Premium Product created:', premiumProduct.id);

    const premiumPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 9700, // $97.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: 'Premium Monthly',
    });
    console.log('✅ Premium Price created:', premiumPrice.id);

    // Create VIP Product
    console.log('\nCreating VIP Product...');
    const vipProduct = await stripe.products.create({
      name: 'VIP Business Listing',
      description: 'Maximum exposure with top placement, unlimited photos, videos, homepage features, and dedicated support on STL Business Guide',
    });
    console.log('✅ VIP Product created:', vipProduct.id);

    const vipPrice = await stripe.prices.create({
      product: vipProduct.id,
      unit_amount: 49700, // $497.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: 'VIP Monthly',
    });
    console.log('✅ VIP Price created:', vipPrice.id);

    console.log('\n🎉 Success! Products created in Stripe.');
    console.log('\n📋 Add these to your Vercel environment variables:');
    console.log('-------------------------------------------');
    console.log(`STRIPE_PREMIUM_PRODUCT_ID=${premiumProduct.id}`);
    console.log(`STRIPE_PREMIUM_PRICE_ID=${premiumPrice.id}`);
    console.log(`STRIPE_VIP_PRODUCT_ID=${vipProduct.id}`);
    console.log(`STRIPE_VIP_PRICE_ID=${vipPrice.id}`);
    console.log('-------------------------------------------');

    return {
      premium: {
        productId: premiumProduct.id,
        priceId: premiumPrice.id,
      },
      vip: {
        productId: vipProduct.id,
        priceId: vipPrice.id,
      },
    };
  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createProducts();
}

module.exports = { createProducts };
