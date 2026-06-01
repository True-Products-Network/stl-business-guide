-- Add allows_analytics column to listing_plans table
-- This controls which plans have access to the analytics dashboard

-- Add the new column
ALTER TABLE listing_plans 
ADD COLUMN IF NOT EXISTS allows_analytics BOOLEAN NOT NULL DEFAULT false;

-- Update existing plans with correct analytics permissions
UPDATE listing_plans 
SET allows_analytics = false 
WHERE plan_name = 'Free';

UPDATE listing_plans 
SET allows_analytics = true 
WHERE plan_name = 'Premium';

UPDATE listing_plans 
SET allows_analytics = true 
WHERE plan_name = 'VIP';

-- Show updated plans
SELECT 
    plan_name,
    monthly_price,
    yearly_price,
    max_images,
    allows_analytics,
    allows_coupon,
    allows_video,
    allows_banner_ads,
    featured_priority,
    is_active
FROM listing_plans
ORDER BY monthly_price ASC;