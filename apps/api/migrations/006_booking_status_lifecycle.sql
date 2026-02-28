-- Align booking_status enum values with lifecycle stages used in portal/admin.
-- Maps legacy beta statuses:
-- confirmed -> upcoming
-- in_progress -> pending_full_payment
-- editing -> pending_delivery
-- delivered -> completed

DO $$
DECLARE
  has_legacy_values BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'booking_status'
      AND e.enumlabel IN ('confirmed', 'in_progress', 'editing', 'delivered')
  )
  INTO has_legacy_values;

  IF NOT has_legacy_values THEN
    RETURN;
  END IF;

  ALTER TYPE booking_status RENAME TO booking_status_legacy;

  CREATE TYPE booking_status AS ENUM (
    'pending_deposit',
    'upcoming',
    'pending_full_payment',
    'pending_delivery',
    'completed',
    'cancelled'
  );

  ALTER TABLE bookings
    ALTER COLUMN status DROP DEFAULT;

  ALTER TABLE bookings
    ALTER COLUMN status TYPE booking_status
    USING (
      CASE status::text
        WHEN 'pending_deposit' THEN 'pending_deposit'
        WHEN 'confirmed' THEN 'upcoming'
        WHEN 'in_progress' THEN 'pending_full_payment'
        WHEN 'editing' THEN 'pending_delivery'
        WHEN 'delivered' THEN 'completed'
        WHEN 'completed' THEN 'completed'
        WHEN 'cancelled' THEN 'cancelled'
        ELSE 'pending_deposit'
      END
    )::booking_status;

  ALTER TABLE bookings
    ALTER COLUMN status SET DEFAULT 'pending_deposit';

  DROP TYPE booking_status_legacy;
END $$;
