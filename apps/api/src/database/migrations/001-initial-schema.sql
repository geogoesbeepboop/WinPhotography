-- WinPhotography Initial Schema
-- Run against Supabase PostgreSQL

-- ================================
-- Enums
-- ================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'client');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'quoted', 'converted', 'archived');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending_deposit', 'confirmed', 'in_progress', 'editing', 'delivered', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_type AS ENUM ('deposit', 'final_payment');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE event_type AS ENUM ('wedding', 'engagement', 'event', 'portrait', 'corporate', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE gallery_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE portfolio_category AS ENUM ('wedding', 'engagement', 'event', 'portrait', 'corporate', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ================================
-- Tables
-- ================================

-- users
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_id     UUID UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    role            user_role NOT NULL DEFAULT 'client',
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- bookings (create before inquiries since inquiries references bookings)
CREATE TABLE IF NOT EXISTS bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    inquiry_id      UUID,
    event_type      event_type NOT NULL,
    event_date      DATE NOT NULL,
    event_end_date  DATE,
    event_location  VARCHAR(500) NOT NULL,
    package_name    VARCHAR(100) NOT NULL,
    package_price   DECIMAL(10, 2) NOT NULL,
    deposit_amount  DECIMAL(10, 2) NOT NULL,
    status          booking_status NOT NULL DEFAULT 'pending_deposit',
    contract_url    VARCHAR(500),
    contract_signed_at TIMESTAMPTZ,
    admin_notes     TEXT,
    client_notes    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date);

-- inquiries
CREATE TABLE IF NOT EXISTS inquiries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_name    VARCHAR(255) NOT NULL,
    contact_email   VARCHAR(255) NOT NULL,
    contact_phone   VARCHAR(50),
    event_type      event_type NOT NULL,
    event_date      DATE,
    event_location  VARCHAR(500),
    guest_count     INTEGER,
    package_interest VARCHAR(100),
    message         TEXT NOT NULL,
    how_found_us    VARCHAR(255),
    status          inquiry_status NOT NULL DEFAULT 'new',
    admin_notes     TEXT,
    booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_event_date ON inquiries(event_date);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- Add inquiry_id FK on bookings now that inquiries table exists
DO $$ BEGIN
  ALTER TABLE bookings ADD CONSTRAINT fk_bookings_inquiry
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- galleries
CREATE TABLE IF NOT EXISTS galleries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    client_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    status          gallery_status NOT NULL DEFAULT 'draft',
    cover_photo_id  UUID,
    photo_count     INTEGER NOT NULL DEFAULT 0,
    total_size_bytes BIGINT NOT NULL DEFAULT 0,
    published_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_galleries_client_id ON galleries(client_id);
CREATE INDEX IF NOT EXISTS idx_galleries_booking_id ON galleries(booking_id);
CREATE INDEX IF NOT EXISTS idx_galleries_status ON galleries(status);

-- gallery_photos
CREATE TABLE IF NOT EXISTS gallery_photos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id      UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
    filename        VARCHAR(255) NOT NULL,
    r2_key          VARCHAR(500) NOT NULL,
    r2_thumbnail_key VARCHAR(500) NOT NULL,
    r2_watermarked_key VARCHAR(500),
    mime_type       VARCHAR(50) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    width           INTEGER,
    height          INTEGER,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    caption         VARCHAR(500),
    is_favorite     BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_photos_gallery_id ON gallery_photos(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_sort_order ON gallery_photos(gallery_id, sort_order);

-- Add cover_photo FK now that gallery_photos exists
DO $$ BEGIN
  ALTER TABLE galleries ADD CONSTRAINT fk_galleries_cover_photo
    FOREIGN KEY (cover_photo_id) REFERENCES gallery_photos(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- payments
CREATE TABLE IF NOT EXISTS payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    client_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    payment_type        payment_type NOT NULL,
    amount              DECIMAL(10, 2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
    status              payment_status NOT NULL DEFAULT 'pending',
    stripe_payment_intent_id    VARCHAR(255),
    stripe_checkout_session_id  VARCHAR(255),
    stripe_invoice_id           VARCHAR(255),
    stripe_receipt_url          VARCHAR(500),
    due_date            DATE,
    paid_at             TIMESTAMPTZ,
    description         VARCHAR(500),
    admin_notes         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_pi ON payments(stripe_payment_intent_id);

-- portfolio_items
CREATE TABLE IF NOT EXISTS portfolio_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT,
    category        portfolio_category NOT NULL,
    cover_image_key VARCHAR(500) NOT NULL,
    cover_thumbnail_key VARCHAR(500) NOT NULL,
    is_featured     BOOLEAN NOT NULL DEFAULT false,
    is_published    BOOLEAN NOT NULL DEFAULT true,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    meta_title      VARCHAR(255),
    meta_description VARCHAR(500),
    event_date      DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON portfolio_items(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_slug ON portfolio_items(slug);

-- portfolio_photos
CREATE TABLE IF NOT EXISTS portfolio_photos (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_item_id   UUID NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
    r2_key              VARCHAR(500) NOT NULL,
    r2_thumbnail_key    VARCHAR(500) NOT NULL,
    mime_type           VARCHAR(50) NOT NULL,
    width               INTEGER,
    height              INTEGER,
    alt_text            VARCHAR(255),
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_photos_item_id ON portfolio_photos(portfolio_item_id);

-- packages
CREATE TABLE IF NOT EXISTS packages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT,
    price           DECIMAL(10, 2) NOT NULL,
    features        JSONB NOT NULL DEFAULT '[]',
    event_type      event_type NOT NULL,
    is_popular      BOOLEAN NOT NULL DEFAULT false,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- pricing_addons
CREATE TABLE IF NOT EXISTS pricing_addons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL,
    description     VARCHAR(500),
    price           DECIMAL(10, 2) NOT NULL,
    price_suffix    VARCHAR(40),
    event_type      VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_addons_active ON pricing_addons(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_addons_event_type ON pricing_addons(event_type);
CREATE INDEX IF NOT EXISTS idx_pricing_addons_sort_order ON pricing_addons(sort_order);

-- testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name     VARCHAR(255) NOT NULL,
    event_type      event_type,
    event_date      DATE,
    content         TEXT NOT NULL,
    rating          SMALLINT CHECK (rating >= 1 AND rating <= 5),
    avatar_url      VARCHAR(500),
    is_featured     BOOLEAN NOT NULL DEFAULT false,
    is_published    BOOLEAN NOT NULL DEFAULT true,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Auto-update trigger
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER update_galleries_updated_at BEFORE UPDATE ON galleries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON portfolio_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER update_pricing_addons_updated_at BEFORE UPDATE ON pricing_addons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN null; END $$;
