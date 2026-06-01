import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// This endpoint should be called by a cron job every day
// Vercel Cron: 0 9 * * * (daily at 9 AM)

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = {
      expiredGracePeriods: 0,
      notified3Days: 0,
      notified1Day: 0,
      errors: [] as string[],
    };

    // 1. Process expired grace periods (downgrade to free)
    const { data: expiredSubscriptions, error: expiredError } = await supabase
      .from('subscriptions')
      .select('id, business_id, businesses!inner(id, business_name, email)')
      .lt('grace_period_ends_at', new Date().toISOString())
      .neq('status', 'canceled')
      .neq('status', 'downgraded');

    if (expiredError) {
      throw new Error(`Failed to fetch expired subscriptions: ${expiredError.message}`);
    }

    for (const subscription of expiredSubscriptions || []) {
      try {
        // Downgrade subscription
        await supabase
          .from('subscriptions')
          .update({
            status: 'downgraded',
            grace_period_ends_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        // Downgrade business to free plan
        await supabase
          .from('businesses')
          .update({
            plan_key: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.business_id);

        // Send downgrade notification
        await sendDowngradeNotification(
          (subscription.businesses as any).email,
          (subscription.businesses as any).business_name
        );

        results.expiredGracePeriods++;
      } catch (error) {
        results.errors.push(`Failed to downgrade ${(subscription.businesses as any).business_name}: ${error}`);
      }
    }

    // 2. Send 3-day warning notifications
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const { data: threeDayWarnings, error: threeDayError } = await supabase
      .from('subscriptions')
      .select('id, businesses!inner(email, business_name), grace_period_ends_at')
      .gte('grace_period_ends_at', threeDaysFromNow.toISOString())
      .lt('grace_period_ends_at', new Date(threeDaysFromNow.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .neq('status', 'canceled')
      .neq('status', 'downgraded');

    if (threeDayError) {
      throw new Error(`Failed to fetch 3-day warnings: ${threeDayError.message}`);
    }

    for (const subscription of threeDayWarnings || []) {
      try {
        await sendGracePeriodWarning(
          (subscription.businesses as any).email,
          (subscription.businesses as any).business_name,
          subscription.grace_period_ends_at,
          3
        );
        results.notified3Days++;
      } catch (error) {
        results.errors.push(`Failed to send 3-day warning to ${(subscription.businesses as any).business_name}: ${error}`);
      }
    }

    // 3. Send 1-day warning notifications
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    
    const { data: oneDayWarnings, error: oneDayError } = await supabase
      .from('subscriptions')
      .select('id, businesses!inner(email, business_name), grace_period_ends_at')
      .gte('grace_period_ends_at', oneDayFromNow.toISOString())
      .lt('grace_period_ends_at', new Date(oneDayFromNow.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .neq('status', 'canceled')
      .neq('status', 'downgraded');

    if (oneDayError) {
      throw new Error(`Failed to fetch 1-day warnings: ${oneDayError.message}`);
    }

    for (const subscription of oneDayWarnings || []) {
      try {
        await sendGracePeriodWarning(
          (subscription.businesses as any).email,
          (subscription.businesses as any).business_name,
          subscription.grace_period_ends_at,
          1
        );
        results.notified1Day++;
      } catch (error) {
        results.errors.push(`Failed to send 1-day warning to ${(subscription.businesses as any).business_name}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });

  } catch (error) {
    console.error('Error processing grace periods:', error);
    return NextResponse.json(
      { error: 'Processing failed', details: error },
      { status: 500 }
    );
  }
}

async function sendDowngradeNotification(email: string, businessName: string) {
  // TODO: Implement email sending
  console.log(`[EMAIL] DOWNGRADE NOTICE to ${email}`);
  console.log(`  Business: ${businessName}`);
  console.log(`  Your listing has been downgraded to Free plan due to non-payment.`);
  console.log(`  You can re-upgrade anytime at stlbusinessguide.com/pricing`);
}

async function sendGracePeriodWarning(
  email: string, 
  businessName: string, 
  gracePeriodEndsAt: string,
  daysRemaining: number
) {
  // TODO: Implement email sending
  console.log(`[EMAIL] ${daysRemaining}-DAY WARNING to ${email}`);
  console.log(`  Business: ${businessName}`);
  console.log(`  Your grace period ends on ${new Date(gracePeriodEndsAt).toLocaleDateString()}`);
  console.log(`  Please update your payment method to avoid downgrade to Free plan.`);
}
