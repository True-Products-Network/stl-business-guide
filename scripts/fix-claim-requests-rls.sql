-- Fix RLS policies for claim_requests to allow public submissions
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Allow claim submissions" ON claim_requests;
DROP POLICY IF EXISTS "Users can view own claims" ON claim_requests;
DROP POLICY IF EXISTS "Admins can manage all claims" ON claim_requests;

-- Enable RLS (if not already enabled)
ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to insert (for claim submissions)
CREATE POLICY "Allow public claim submissions"
  ON claim_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 2: Allow anyone to view (for checking claim status)
CREATE POLICY "Allow public to view claims"
  ON claim_requests FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 3: Allow admins to update/delete
CREATE POLICY "Admins can manage all claims"
  ON claim_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Grant permissions
GRANT ALL ON claim_requests TO authenticated;
GRANT ALL ON claim_requests TO anon;

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies 
WHERE 
    tablename = 'claim_requests';
