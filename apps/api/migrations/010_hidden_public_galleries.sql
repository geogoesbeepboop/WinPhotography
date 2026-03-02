ALTER TABLE galleries
ALTER COLUMN booking_id DROP NOT NULL;

ALTER TABLE galleries
ADD COLUMN IF NOT EXISTS is_hidden_public BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE galleries
ADD COLUMN IF NOT EXISTS public_access_slug VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS idx_galleries_public_access_slug
ON galleries (public_access_slug)
WHERE public_access_slug IS NOT NULL;
