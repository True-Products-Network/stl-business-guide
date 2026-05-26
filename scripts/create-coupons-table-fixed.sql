-- Create coupon system tables - FIXED VERSION
-- Run this in Supabase SQL Editor

-- First, drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS coupon_redemptions CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;

-- Coupons table
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES business_listings(id) ON DELETE CASCADE,
    
    -- Coupon details
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Discount type
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_service')),
    discount_value DECIMAL(10, 2),
    
    -- Limits
    max_redemptions INTEGER DEFAULT NULL,
    max_redemptions_per_customer INTEGER DEFAULT 1,
    
    -- Validity
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT NULL,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'expired', 'redeemed_out')),
    
    -- Tracking
    total_redemptions INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    
    -- STL Business Guide tracking
    stl_fee_percentage DECIMAL(5, 2) DEFAULT 10.00,
    stl_fee_earned DECIMAL(10, 2) DEFAULT 0,
    
    -- Media
    image_url TEXT,
    
    -- Metadata
    terms_conditions TEXT,
    redemption_instructions TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Redemptions table
CREATE TABLE coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Customer info
    customer_email TEXT,
    customer_phone TEXT,
    
    -- Redemption details
    redemption_code TEXT UNIQUE,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Value tracking
    original_value DECIMAL(10, 2),
    discount_applied DECIMAL(10, 2),
    final_value DECIMAL(10, 2),
    
    -- STL fee tracking
    stl_fee_amount DECIMAL(10, 2),
    
    -- Status
    status TEXT DEFAULT 'redeemed' CHECK (status IN ('redeemed', 'used', 'expired', 'cancelled')),
    used_at TIMESTAMPTZ,
    
    -- Verification
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes AFTER tables are created
CREATE INDEX idx_coupons_business ON coupons(business_id);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupon_redemptions_coupon ON coupon_redemptions(coupon_id);
CREATE INDEX idx_coupon_redemptions_code ON coupon_redemptions(redemption_code);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupons
CREATE POLICY "Public can view active coupons"
    ON coupons FOR SELECT
    TO anon, authenticated
    USING (status = 'active' AND (end_date IS NULL OR end_date >= CURRENT_DATE));

CREATE POLICY "Business owners can manage their coupons"
    ON coupons FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM businesses b
            WHERE b.id = coupons.business_id
            AND b.email = auth.email()
        )
    );

CREATE POLICY "Admins can manage all coupons"
    ON coupons FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'super_admin')
        )
    );

-- RLS Policies for redemptions
CREATE POLICY "Business owners can view their redemptions"
    ON coupon_redemptions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM businesses b
            WHERE b.id = coupon_redemptions.business_id
            AND b.email = auth.email()
        )
    );

CREATE POLICY "Public can create redemptions"
    ON coupon_redemptions FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Admins can manage all redemptions"
    ON coupon_redemptions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'super_admin')
        )
    );

-- Storage bucket for coupon images
INSERT INTO storage.buckets (id, name, public)
VALUES ('coupon-images', 'coupon-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view coupon images"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'coupon-images');

CREATE POLICY "Business owners can upload coupon images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'coupon-images' AND
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('business_owner', 'admin', 'super_admin')
        )
    );

-- Verify creation
SELECT 'Coupons table created successfully' as status;
