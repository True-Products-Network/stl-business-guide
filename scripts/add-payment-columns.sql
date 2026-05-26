-- Add payment tracking columns to business_listings
-- Run this in Supabase SQL Editor

-- Add payment status and tracking columns
ALTER TABLE business_listings 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required' 
CHECK (payment_status IN ('not_required', 'pending', 'paid', 'failed', 'refunded'));

ALTER TABLE business_listings 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

ALTER TABLE business_listings 
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

ALTER TABLE business_listings 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Update existing paid listings (Premium/VIP) to have payment_status = 'paid'
UPDATE business_listings 
SET payment_status = 'paid',
    paid_at = created_at
WHERE plan_id IN (
    SELECT id FROM listing_plans WHERE plan_key IN ('premium', 'vip')
)
AND payment_status = 'not_required';

-- Create index for payment lookups
CREATE INDEX IF NOT EXISTS idx_business_listings_payment 
ON business_listings(payment_status, stripe_payment_intent_id);

-- Verify
SELECT plan_id, payment_status, COUNT(*) 
FROM business_listings 
GROUP BY plan_id, payment_status;
