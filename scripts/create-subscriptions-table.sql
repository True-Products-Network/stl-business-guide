-- Create subscriptions table for managing paid plans
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    plan_key VARCHAR(50) NOT NULL REFERENCES listing_plans(plan_key),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    -- Founding member fields
    is_founding_member BOOLEAN DEFAULT FALSE,
    promotion_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Grace period fields
    grace_period_ends_at TIMESTAMP WITH TIME ZONE,
    payment_failure_count INTEGER DEFAULT 0,
    last_payment_failure_at TIMESTAMP WITH TIME ZONE,
    downgrade_to_plan_key VARCHAR(50) DEFAULT 'free',
    
    -- Billing fields
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_business_id ON subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_grace_period ON subscriptions(grace_period_ends_at) WHERE grace_period_ends_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_founding_member ON subscriptions(is_founding_member) WHERE is_founding_member = TRUE;

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses b
            JOIN profiles p ON b.owner_profile_id = p.id
            WHERE b.id = subscriptions.business_id AND p.id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM businesses b
            JOIN profiles p ON b.owner_profile_id = p.id
            WHERE b.id = subscriptions.business_id AND p.id = auth.uid()
        )
    );

CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM businesses b
            JOIN profiles p ON b.owner_profile_id = p.id
            WHERE b.id = subscriptions.business_id AND p.id = auth.uid()
        )
    );

-- Grant access
GRANT ALL ON subscriptions TO authenticated;
GRANT ALL ON subscriptions TO anon;

-- Add founding member deadline to listing_plans
ALTER TABLE listing_plans 
ADD COLUMN IF NOT EXISTS founding_member_deadline TIMESTAMP WITH TIME ZONE;

-- Set founding member deadline to November 30, 2026
UPDATE listing_plans 
SET founding_member_deadline = '2026-11-30 23:59:59-06'::TIMESTAMPTZ
WHERE plan_key IN ('premium', 'vip');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the changes
SELECT 
    plan_key, 
    plan_name, 
    monthly_price,
    founding_member_deadline
FROM listing_plans 
ORDER BY monthly_price;
