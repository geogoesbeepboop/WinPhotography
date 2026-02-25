-- Persist client notification preferences in users table.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notify_gallery_ready BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notify_payment_reminders BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notify_session_reminders BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notify_promotions BOOLEAN NOT NULL DEFAULT false;
