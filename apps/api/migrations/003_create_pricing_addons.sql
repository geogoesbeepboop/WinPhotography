-- Create pricing add-ons table for dynamic "Add-Ons & Extras" management.
CREATE TABLE IF NOT EXISTS pricing_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  description VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  price_suffix VARCHAR(40),
  event_type VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pricing_addons_active ON pricing_addons (is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_addons_event_type ON pricing_addons (event_type);
CREATE INDEX IF NOT EXISTS idx_pricing_addons_sort_order ON pricing_addons (sort_order);

-- Seed baseline add-ons (global across event types).
INSERT INTO pricing_addons (name, description, price, price_suffix, event_type, is_active, sort_order)
SELECT
  'Additional Hour',
  'Extend coverage for your session.',
  400,
  '/hr',
  NULL,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM pricing_addons
  WHERE name = 'Additional Hour' AND event_type IS NULL
);

INSERT INTO pricing_addons (name, description, price, price_suffix, event_type, is_active, sort_order)
SELECT
  'Second Photographer',
  'Additional angle coverage for larger sessions.',
  600,
  NULL,
  NULL,
  true,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM pricing_addons
  WHERE name = 'Second Photographer' AND event_type IS NULL
);

INSERT INTO pricing_addons (name, description, price, price_suffix, event_type, is_active, sort_order)
SELECT
  'Rush Delivery (1 week)',
  'Expedited final gallery delivery.',
  500,
  NULL,
  NULL,
  true,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM pricing_addons
  WHERE name = 'Rush Delivery (1 week)' AND event_type IS NULL
);

INSERT INTO pricing_addons (name, description, price, price_suffix, event_type, is_active, sort_order)
SELECT
  'Fine Art Album (30 pages)',
  'Heirloom album with custom design.',
  1200,
  NULL,
  NULL,
  true,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM pricing_addons
  WHERE name = 'Fine Art Album (30 pages)' AND event_type IS NULL
);

INSERT INTO pricing_addons (name, description, price, price_suffix, event_type, is_active, sort_order)
SELECT
  'Canvas Gallery Wrap (16x24)',
  'Large wall print for display.',
  350,
  NULL,
  NULL,
  true,
  4
WHERE NOT EXISTS (
  SELECT 1 FROM pricing_addons
  WHERE name = 'Canvas Gallery Wrap (16x24)' AND event_type IS NULL
);

INSERT INTO pricing_addons (name, description, price, price_suffix, event_type, is_active, sort_order)
SELECT
  'Print Collection (10 prints)',
  'Curated print set from your session.',
  450,
  NULL,
  NULL,
  true,
  5
WHERE NOT EXISTS (
  SELECT 1 FROM pricing_addons
  WHERE name = 'Print Collection (10 prints)' AND event_type IS NULL
);
