-- Create event_types table
CREATE TABLE IF NOT EXISTS event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_types_slug ON event_types (slug);

-- Seed default event types
INSERT INTO event_types (name, slug, is_active, sort_order)
VALUES
  ('Wedding', 'wedding', true, 0),
  ('Engagement', 'engagement', true, 1),
  ('Portrait', 'portrait', true, 2),
  ('Event', 'event', true, 3),
  ('Other', 'other', true, 4)
ON CONFLICT (slug) DO NOTHING;
