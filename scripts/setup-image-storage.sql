-- Setup image storage for business listings
-- Run this in Supabase SQL Editor

-- 1. Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('business-logos', 'business-logos', true),
    ('business-gallery', 'business-gallery', true),
    ('business-videos', 'business-videos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create business_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS business_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT NOT NULL CHECK (image_type IN ('featured', 'gallery')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on business_images
ALTER TABLE business_images ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Public can view business images"
    ON business_images FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Business owners can manage their images"
    ON business_images FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM businesses b
            WHERE b.id = business_images.business_id
            AND b.owner_profile_id = auth.uid()
        )
    );

-- 5. Create index
CREATE INDEX IF NOT EXISTS idx_business_images_business_id ON business_images(business_id);

-- 6. Storage RLS policies - allow public to view images
CREATE POLICY "Public can view business logos"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'business-logos');

CREATE POLICY "Public can view business gallery"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'business-gallery');

CREATE POLICY "Public can view business videos"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'business-videos');

-- 7. Allow authenticated users to upload
CREATE POLICY "Authenticated can upload business logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'business-logos');

CREATE POLICY "Authenticated can upload business gallery"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'business-gallery');

CREATE POLICY "Authenticated can upload business videos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'business-videos');

-- Show setup status
SELECT 'Storage buckets created' as status;
SELECT * FROM storage.buckets WHERE id IN ('business-logos', 'business-gallery', 'business-videos');
