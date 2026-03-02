-- Add optional preferred event time for inquiries submitted from the public form.

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS event_time TIME;
