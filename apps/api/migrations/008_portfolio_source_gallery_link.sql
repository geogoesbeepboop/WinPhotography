-- Link portfolio items directly to a source gallery so duplicated portfolio collections
-- can reuse existing gallery photo keys instead of creating duplicate portfolio photo rows.

ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS source_gallery_id UUID;

DO $$
BEGIN
  ALTER TABLE portfolio_items
    ADD CONSTRAINT fk_portfolio_items_source_gallery
    FOREIGN KEY (source_gallery_id) REFERENCES galleries(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_items_source_gallery_unique
  ON portfolio_items (source_gallery_id)
  WHERE source_gallery_id IS NOT NULL;
