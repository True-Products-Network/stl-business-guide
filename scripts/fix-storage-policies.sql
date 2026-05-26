-- Fix storage RLS policies for image uploads
-- Run this in Supabase SQL Editor

-- 1. Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated can upload business logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload business gallery" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload business videos" ON storage.objects;

-- 2. Create new policies that allow authenticated users to upload
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

-- 3. Also allow users to update and delete their own files
CREATE POLICY "Authenticated can update business gallery"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'business-gallery');

CREATE POLICY "Authenticated can delete business gallery"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'business-gallery');

-- 4. Verify policies
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
