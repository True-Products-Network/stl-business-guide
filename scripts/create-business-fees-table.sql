-- Create business fees table for variable STL fee percentages
-- Run this in Supabase SQL Editor

-- Drop if exists (for clean slate)
DROP TABLE IF EXISTS business_fees CASCADE;

-- Create business fees table
CREATE TABLE business_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    stl_fee_percentage DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(business_id)
);

-- Create index
CREATE INDEX idx_business_fees_business ON business_fees(business_id);

-- Enable RLS
ALTER TABLE business_fees ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all business fees"
    ON business_fees FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Business owners can view their own fees"
    ON business_fees FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM businesses b
            WHERE b.id = business_fees.business_id
            AND b.email = auth.email()
        )
    );

-- Function to get or create business fee record
CREATE OR REPLACE FUNCTION get_or_create_business_fee(p_business_id UUID)
RETURNS business_fees AS $$
DECLARE
    fee_record business_fees;
BEGIN
    -- Try to get existing record
    SELECT * INTO fee_record
    FROM business_fees
    WHERE business_id = p_business_id;
    
    -- If not found, create default
    IF fee_record.id IS NULL THEN
        INSERT INTO business_fees (business_id, stl_fee_percentage)
        VALUES (p_business_id, 10.00)
        RETURNING * INTO fee_record;
    END IF;
    
    RETURN fee_record;
END;
$$ LANGUAGE plpgsql;

-- Insert default fees for existing businesses
INSERT INTO business_fees (business_id, stl_fee_percentage)
SELECT id, 10.00
FROM businesses
WHERE id NOT IN (SELECT business_id FROM business_fees)
ON CONFLICT (business_id) DO NOTHING;

-- Verify creation
SELECT 'Business fees table created successfully' as status;
