# WinPhotography — Database Schema

Full SQL schema for Supabase PostgreSQL. Run as a migration or directly in the Supabase SQL editor.

## Enums

```sql
CREATE TYPE user_role AS ENUM ('admin', 'client');
CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'quoted', 'converted', 'archived');
CREATE TYPE booking_status AS ENUM ('pending_deposit', 'upcoming', 'pending_full_payment', 'pending_delivery', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded');
CREATE TYPE payment_type AS ENUM ('deposit', 'final_payment');
CREATE TYPE event_type AS ENUM ('wedding', 'engagement', 'event', 'portrait', 'corporate', 'other');
CREATE TYPE gallery_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE portfolio_category AS ENUM ('wedding', 'engagement', 'event', 'portrait', 'corporate', 'other');
```

## Tables

### users
```sql
CREATE TABLE users (
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

CREATE INDEX idx_users_supabase_id ON users(supabase_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### inquiries
```sql
CREATE TABLE inquiries (
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

CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_event_date ON inquiries(event_date);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
```

### bookings
```sql
CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    inquiry_id      UUID REFERENCES inquiries(id) ON DELETE SET NULL,
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

CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);
```

### galleries
```sql
CREATE TABLE galleries (
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

CREATE INDEX idx_galleries_client_id ON galleries(client_id);
CREATE INDEX idx_galleries_booking_id ON galleries(booking_id);
CREATE INDEX idx_galleries_status ON galleries(status);
```

### gallery_photos
```sql
CREATE TABLE gallery_photos (
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

CREATE INDEX idx_gallery_photos_gallery_id ON gallery_photos(gallery_id);
CREATE INDEX idx_gallery_photos_sort_order ON gallery_photos(gallery_id, sort_order);

ALTER TABLE galleries
    ADD CONSTRAINT fk_galleries_cover_photo
    FOREIGN KEY (cover_photo_id) REFERENCES gallery_photos(id)
    ON DELETE SET NULL;
```

### payments
```sql
CREATE TABLE payments (
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

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_pi ON payments(stripe_payment_intent_id);
```

### portfolio_items
```sql
CREATE TABLE portfolio_items (
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

CREATE INDEX idx_portfolio_items_category ON portfolio_items(category);
CREATE INDEX idx_portfolio_items_featured ON portfolio_items(is_featured) WHERE is_featured = true;
CREATE INDEX idx_portfolio_items_published ON portfolio_items(is_published) WHERE is_published = true;
CREATE INDEX idx_portfolio_items_slug ON portfolio_items(slug);
```

### portfolio_photos
```sql
CREATE TABLE portfolio_photos (
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

CREATE INDEX idx_portfolio_photos_item_id ON portfolio_photos(portfolio_item_id);
```

### packages
```sql
CREATE TABLE packages (
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
```

### testimonials
```sql
CREATE TABLE testimonials (
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
```

## Auto-Update Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_galleries_updated_at BEFORE UPDATE ON galleries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON portfolio_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
