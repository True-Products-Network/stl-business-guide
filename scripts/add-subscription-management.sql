-- Add subscription management fields for grace periods and founding members

-- Add columns to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS is_founding_member BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS promotion_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_failure_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_payment_failure_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS downgrade_to_plan_key VARCHAR(50) DEFAULT 'free';

-- Add founding member deadline to listing_plans
ALTER TABLE listing_plans 
ADD COLUMN IF NOT EXISTS founding_member_deadline TIMESTAMP WITH TIME ZONE;

-- Set founding member deadline to November 30, 2026
UPDATE listing_plans 
SET founding_member_deadline = '2026-11-30 23:59:59-06'::TIMESTAMPTZ
WHERE plan_key IN ('premium', 'vip');

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_grace_period 
ON subscriptions(grace_period_ends_at) 
WHERE grace_period_ends_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_founding_member 
ON subscriptions(is_founding_member) 
WHERE is_founding_member = TRUE;

-- Verify the changes
SELECT 
    plan_key, 
    plan_name, 
    monthly_price,
    founding_member_deadline
FROM listing_plans 
ORDER BY monthly_price;
