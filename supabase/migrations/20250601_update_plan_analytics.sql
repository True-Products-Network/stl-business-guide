-- Update existing listing_plans to set allows_analytics correctly
-- And verify the column exists

-- First, ensure the column exists (idempotent)
ALTER TABLE listing_plans 
ADD COLUMN IF NOT EXISTS allows_analytics BOOLEAN NOT NULL DEFAULT false;

-- Update Free plan
UPDATE listing_plans 
SET 
  allows_analytics = false,
  allows_coupon = false,
  allows_video = false,
  allows_banner_ads = false,
  max_images = 1
WHERE plan_key = 'free' OR plan_name = 'Free';

-- Update Premium plan  
UPDATE listing_plans 
SET 
  allows_analytics = true,
  allows_coupon = false,
  allows_video = false,
  allows_banner_ads = false,
  max_images = 5,
  monthly_price = 47,
  yearly_price = 97
WHERE plan_key = 'premium' OR plan_name = 'Premium';

-- Update VIP plan
UPDATE listing_plans 
SET 
  allows_analytics = true,
  allows_coupon = true,
  allows_video = true,
  allows_banner_ads = true,
  max_images = 10,
  monthly_price = 97,
  yearly_price = 497
WHERE plan_key = 'vip' OR plan_name = 'VIP';

-- Show current state of all plans
SELECT 
  id,
  plan_name,
  plan_key,
  monthly_price,
  yearly_price,
  max_images,
  allows_analytics,
  allows_coupon,
  allows_video,
  allows_banner_ads,
  is_active
FROM listing_plans
ORDER BY monthly_price ASC;