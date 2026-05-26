-- Update Free plan to have 0 images instead of 1
-- Run this in Supabase SQL Editor

-- Check current plan settings
SELECT plan_name, plan_key, monthly_price, max_images
FROM listing_plans
ORDER BY monthly_price;

-- Update Free plan to 0 images
UPDATE listing_plans
SET max_images = 0
WHERE plan_key = 'free';

-- Verify
SELECT plan_name, plan_key, monthly_price, max_images
FROM listing_plans
WHERE plan_key = 'free';
