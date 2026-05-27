// GHL Webhook Integration for Coupon Redemptions

const GHL_WEBHOOK_URL = process.env.NEXT_PUBLIC_GHL_WEBHOOK_URL || 
  'https://services.leadconnectorhq.com/hooks/Y75D8z0j5aPHXtDyWr3y/webhook-trigger/gE9SUk2vCZhDPRq3p4H3';

interface GHLRedemptionPayload {
  name: string;
  email: string;
  phone?: string;
  redemptionCode: string;
  couponCode: string;
  couponTitle: string;
  couponExpiryDate?: string;
  businessName: string;
  businessId: string;
  tags: string[];
}

export async function sendRedemptionToGHL(payload: GHLRedemptionPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        source: 'STL Business Guide',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GHL webhook failed:', response.status, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    console.log('GHL webhook sent successfully for redemption:', payload.redemptionCode);
    return { success: true };
  } catch (error: any) {
    console.error('GHL webhook error:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to format redemption data for GHL
export function formatRedemptionForGHL(
  customerName: string,
  customerEmail: string,
  customerPhone: string | null,
  redemptionCode: string,
  coupon: { code: string; title: string; end_date?: string | null },
  business: { id: string; business_name: string }
): GHLRedemptionPayload {
  return {
    name: customerName,
    email: customerEmail,
    phone: customerPhone || undefined,
    redemptionCode,
    couponCode: coupon.code,
    couponTitle: coupon.title,
    couponExpiryDate: coupon.end_date || undefined,
    businessName: business.business_name,
    businessId: business.id,
    tags: ['conv | businesscouponredeemed'],
  };
}
