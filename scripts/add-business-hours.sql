-- Add business hours field to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT NULL;

-- Add comment to document the field
COMMENT ON COLUMN businesses.business_hours IS 'Business hours stored as JSON: {"monday": {"open": "09:00", "close": "17:00", "closed": false}, ...}';

-- Example structure:
-- {
--   "monday": {"open": "09:00", "close": "17:00", "closed": false},
--   "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
--   "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
--   "thursday": {"open": "09:00", "close": "17:00", "closed": false},
--   "friday": {"open": "09:00", "close": "17:00", "closed": false},
--   "saturday": {"open": "10:00", "close": "14:00", "closed": false},
--   "sunday": {"closed": true}
-- }

SELECT 'Business hours field added successfully' as status;
