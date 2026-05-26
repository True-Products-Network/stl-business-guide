-- Create claim_requests table
CREATE TABLE IF NOT EXISTS claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_listings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for claim submissions)
CREATE POLICY "Allow claim submissions"
  ON claim_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to view their own claims
CREATE POLICY "Users can view own claims"
  ON claim_requests FOR SELECT
  USING (email = auth.jwt() ->> 'email');

-- Allow admins to manage all claims
CREATE POLICY "Admins can manage all claims"
  ON claim_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_claim_requests_business ON claim_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_status ON claim_requests(status);
CREATE INDEX IF NOT EXISTS idx_claim_requests_email ON claim_requests(email);

-- Grant permissions
GRANT ALL ON claim_requests TO authenticated;
GRANT ALL ON claim_requests TO anon;

SELECT 'claim_requests table created successfully' as status;
