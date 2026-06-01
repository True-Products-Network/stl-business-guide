-- Check RLS policies for business_locations table
-- Run this in Supabase SQL Editor to diagnose the issue

-- First, check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'business_locations';

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'business_locations';

-- If no policies exist or they're too restrictive, add these:

-- Enable RLS if not already enabled
ALTER TABLE business_locations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Allow users to update their own business locations" ON business_locations;
DROP POLICY IF EXISTS "Allow users to insert their own business locations" ON business_locations;
DROP POLICY IF EXISTS "Allow public to view business locations" ON business_locations;

-- Create policy to allow users to update locations for businesses they own
CREATE POLICY "Allow users to update their own business locations"
ON business_locations
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM businesses 
        WHERE businesses.id = business_locations.business_id 
        AND businesses.email = auth.email()
    )
);

-- Create policy to allow users to insert locations for businesses they own
CREATE POLICY "Allow users to insert their own business locations"
ON business_locations
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM businesses 
        WHERE businesses.id = business_locations.business_id 
        AND businesses.email = auth.email()
    )
);

-- Create policy to allow public to view locations
CREATE POLICY "Allow public to view business locations"
ON business_locations
FOR SELECT
TO anon, authenticated
USING (true);
