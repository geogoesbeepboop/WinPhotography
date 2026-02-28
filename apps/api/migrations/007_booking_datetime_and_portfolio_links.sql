-- Add booking time + timezone fields and optional portfolio->booking links.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS event_time TIME;

UPDATE bookings
SET event_time = '12:00:00'
WHERE event_time IS NULL;

ALTER TABLE bookings
  ALTER COLUMN event_time SET DEFAULT '12:00:00';

ALTER TABLE bookings
  ALTER COLUMN event_time SET NOT NULL;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS event_timezone VARCHAR(64);

UPDATE bookings
SET event_timezone = 'America/New_York'
WHERE event_timezone IS NULL OR btrim(event_timezone) = '';

ALTER TABLE bookings
  ALTER COLUMN event_timezone SET DEFAULT 'America/New_York';

ALTER TABLE bookings
  ALTER COLUMN event_timezone SET NOT NULL;

ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS booking_id UUID;

DO $$
BEGIN
  ALTER TABLE portfolio_items
    ADD CONSTRAINT fk_portfolio_items_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_portfolio_items_booking_id
  ON portfolio_items (booking_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_items_booking_unique
  ON portfolio_items (booking_id)
  WHERE booking_id IS NOT NULL;
