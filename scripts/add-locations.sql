-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default locations
INSERT INTO locations (name, slug, description, sort_order) VALUES
  ('Chesterfield Area', 'chesterfield-area', 'Businesses in Chesterfield and surrounding areas', 1),
  ('St. Louis Area', 'st-louis-area', 'Businesses in St. Louis city and county', 2),
  ('St. Charles Area', 'st-charles-area', 'Businesses in St. Charles and surrounding areas', 3),
  ('Illinois Area', 'illinois-area', 'Businesses in Illinois near St. Louis', 4)
ON CONFLICT (name) DO NOTHING;

-- Add location_id to businesses table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'location_id'
  ) THEN
    ALTER TABLE businesses ADD COLUMN location_id UUID REFERENCES locations(id);
  END IF;
END $$;

-- Create RLS policies for locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active locations" ON locations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage locations" ON locations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
