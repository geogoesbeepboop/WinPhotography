-- Support client-submitted testimonials tied to bookings and admin moderation.

ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS booking_id UUID;

DO $$ BEGIN
  ALTER TABLE testimonials
    ADD CONSTRAINT fk_testimonials_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonials_booking_unique
  ON testimonials (booking_id)
  WHERE booking_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_testimonials_published_featured
  ON testimonials (is_published, is_featured);

-- Keep testimonials event type flexible for dynamic event types.
DO $$
DECLARE
  current_type TEXT;
BEGIN
  SELECT data_type
  INTO current_type
  FROM information_schema.columns
  WHERE table_name = 'testimonials'
    AND column_name = 'event_type';

  IF current_type IS NOT NULL AND current_type <> 'character varying' THEN
    ALTER TABLE testimonials
      ALTER COLUMN event_type TYPE VARCHAR(100)
      USING event_type::text;
  END IF;
END $$;
