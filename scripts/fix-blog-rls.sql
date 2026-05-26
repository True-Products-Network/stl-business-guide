-- Fix RLS policies for blog_posts to allow public read
-- Run this in Supabase SQL Editor

-- First, check current policies
SELECT * FROM pg_policies WHERE tablename = 'blog_posts';

-- Drop existing policies if needed and recreate
DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;

-- Public can view published posts
CREATE POLICY "Public can view published blog posts"
    ON blog_posts FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

-- Authenticated users can view all posts (for admin checking)
CREATE POLICY "Authenticated can view all blog posts"
    ON blog_posts FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can create/update/delete posts
CREATE POLICY "Admins can manage blog posts"
    ON blog_posts FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'super_admin')
        )
    );

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'blog_posts';
