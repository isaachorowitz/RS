-- Add new fields to rides table for events and payment
ALTER TABLE rides ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS event_name TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS is_event BOOLEAN DEFAULT FALSE;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add index for event queries
CREATE INDEX IF NOT EXISTS idx_rides_is_event ON rides(is_event) WHERE is_event = true;
