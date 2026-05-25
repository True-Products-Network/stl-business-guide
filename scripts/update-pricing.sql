-- Update listing plans to correct pricing
-- Premium: $97/month
-- VIP: $497/month

UPDATE listing_plans 
SET monthly_price = 97.00,
    plan_name = 'Premium'
WHERE plan_key = 'premium';

UPDATE listing_plans 
SET monthly_price = 497.00,
    plan_name = 'VIP'
WHERE plan_key = 'vip';

-- Verify the updates
SELECT plan_key, plan_name, monthly_price FROM listing_plans ORDER BY monthly_price;
