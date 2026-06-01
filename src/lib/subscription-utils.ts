import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FOUNDING_MEMBER_LIMIT = 100;
const FOUNDING_MEMBER_DEADLINE = new Date('2026-11-30T23:59:59-06:00');

export interface FoundingMemberStatus {
  isAvailable: boolean;
  spotsRemaining: number;
  deadline: Date;
  reason?: string;
}

/**
 * Check if founding member pricing is still available
 */
export async function checkFoundingMemberAvailability(): Promise<FoundingMemberStatus> {
  const now = new Date();
  
  // Check if deadline has passed
  if (now > FOUNDING_MEMBER_DEADLINE) {
    return {
      isAvailable: false,
      spotsRemaining: 0,
      deadline: FOUNDING_MEMBER_DEADLINE,
      reason: 'Founding Member period has ended (Nov 30, 2026)',
    };
  }

  // Count current founding members
  const { count, error } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('is_founding_member', true)
    .in('status', ['active', 'past_due', 'trialing']);

  if (error) {
    console.error('Error counting founding members:', error);
    throw new Error('Failed to check founding member availability');
  }

  const currentFoundingMembers = count || 0;
  const spotsRemaining = Math.max(0, FOUNDING_MEMBER_LIMIT - currentFoundingMembers);

  if (spotsRemaining <= 0) {
    return {
      isAvailable: false,
      spotsRemaining: 0,
      deadline: FOUNDING_MEMBER_DEADLINE,
      reason: 'Founding Member limit reached (100 businesses)',
    };
  }

  return {
    isAvailable: true,
    spotsRemaining,
    deadline: FOUNDING_MEMBER_DEADLINE,
  };
}

/**
 * Mark a subscription as founding member
 */
export async function markAsFoundingMember(subscriptionId: string): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      is_founding_member: true,
      promotion_expires_at: FOUNDING_MEMBER_DEADLINE.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  if (error) {
    console.error('Error marking as founding member:', error);
    throw new Error('Failed to mark subscription as founding member');
  }
}

/**
 * Get grace period days for a subscription
 */
export async function getGracePeriodDays(subscriptionId: string): Promise<number> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('is_founding_member')
    .eq('id', subscriptionId)
    .single();

  if (error || !data) {
    console.error('Error fetching subscription:', error);
    return 7; // Default to regular grace period
  }

  return data.is_founding_member ? 14 : 7;
}

/**
 * Get subscription status with grace period info
 */
export async function getSubscriptionStatus(businessId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      id,
      status,
      is_founding_member,
      grace_period_ends_at,
      payment_failure_count,
      last_payment_failure_at,
      current_period_end
    `)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching subscription status:', error);
    return null;
  }

  const now = new Date();
  const gracePeriodEndsAt = data.grace_period_ends_at 
    ? new Date(data.grace_period_ends_at) 
    : null;
  
  const isInGracePeriod = gracePeriodEndsAt && gracePeriodEndsAt > now;
  const daysRemaining = isInGracePeriod 
    ? Math.ceil((gracePeriodEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    ...data,
    isInGracePeriod,
    daysRemaining,
    gracePeriodDays: data.is_founding_member ? 14 : 7,
  };
}

/**
 * Format founding member info for display
 */
export function formatFoundingMemberInfo(status: FoundingMemberStatus): string {
  if (!status.isAvailable) {
    return status.reason || 'Founding Member pricing no longer available';
  }

  const daysUntilDeadline = Math.ceil(
    (status.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return `${status.spotsRemaining} spots remaining • ${daysUntilDeadline} days left`;
}
