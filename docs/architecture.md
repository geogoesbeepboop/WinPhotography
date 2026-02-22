# WinPhotography — Architecture Reference

## Project Structure

```
WinPhotography/                           Turborepo monorepo (pnpm workspaces)
├── turbo.json                            Build orchestration
├── pnpm-workspace.yaml                   Workspace definition
├── tsconfig.base.json                    Shared TypeScript config
├── .env.example                          Environment variable template
├── .prettierrc                           Code formatting
├── .github/workflows/ci.yml             CI pipeline (lint + type-check + build)
│
├── apps/
│   ├── web/                              Next.js 15 frontend (Vercel)
│   └── api/                              NestJS 11 backend (Railway)
│
├── packages/
│   └── shared/                           Shared types, enums, Zod schemas
│
└── docs/                                 Project documentation
    ├── roadmap.md                        Implementation progress tracker
    ├── architecture.md                   This file
    ├── database-schema.md                Full SQL schema
    └── api-endpoints.md                  REST API reference
```

## Frontend — `apps/web/`

Next.js 15 with App Router, React 19, TypeScript, Tailwind CSS v4.

### File Structure

```
apps/web/src/
├── app/                                  Next.js App Router
│   ├── layout.tsx                        Root layout (fonts, providers, metadata)
│   ├── globals.css                       Global styles + Tailwind + brand tokens
│   ├── not-found.tsx                     Custom 404 page
│   ├── middleware.ts                     Auth route protection (/admin/*, /portal/*)
│   │
│   ├── (public)/                         Route group — shared nav + footer layout
│   │   ├── layout.tsx                    Navigation + Footer wrapper
│   │   ├── page.tsx                      / — Home (hero, services, work, testimonials)
│   │   ├── about/page.tsx               /about
│   │   ├── pricing/page.tsx             /pricing (category tabs)
│   │   ├── portfolio/page.tsx           /portfolio (filterable grid)
│   │   ├── portfolio/[slug]/page.tsx    /portfolio/:slug (detail + lightbox)
│   │   ├── inquire/page.tsx             /inquire (multi-step form)
│   │   ├── inquire/thank-you/page.tsx   /inquire/thank-you
│   │   ├── blog/page.tsx               /blog (listing)
│   │   ├── blog/[slug]/page.tsx        /blog/:slug (post detail)
│   │   ├── terms/page.tsx              /terms
│   │   └── privacy/page.tsx            /privacy
│   │
│   ├── admin/                            Admin dashboard (role: admin)
│   │   ├── layout.tsx                    Sidebar + topbar layout
│   │   ├── page.tsx                      /admin — Overview dashboard
│   │   ├── inquiries/page.tsx           List with status filters
│   │   ├── inquiries/[id]/page.tsx      Detail + notes + conversion
│   │   ├── bookings/page.tsx            List
│   │   ├── bookings/[id]/page.tsx       Detail + timeline + payments
│   │   ├── galleries/page.tsx           List
│   │   ├── galleries/new/page.tsx       Create gallery (linked to booking)
│   │   ├── galleries/[id]/page.tsx      Detail + photo grid
│   │   ├── portfolio/page.tsx           List
│   │   ├── portfolio/new/page.tsx       Create portfolio item
│   │   ├── payments/page.tsx            List with status filters
│   │   ├── clients/page.tsx             List with search
│   │   └── clients/[id]/page.tsx        Client detail
│   │
│   ├── portal/                           Client portal (role: client)
│   │   ├── layout.tsx                    Sidebar layout
│   │   ├── page.tsx                      /portal — Dashboard
│   │   ├── galleries/[galleryId]/page.tsx  Gallery viewer + downloads
│   │   ├── bookings/page.tsx            Booking list + payment status
│   │   └── settings/page.tsx            Profile settings
│   │
│   ├── auth/                             Authentication
│   │   ├── login/page.tsx               Email/password login
│   │   ├── forgot-password/page.tsx     Password reset request
│   │   ├── reset-password/page.tsx      Set new password
│   │   └── callback/route.ts            Supabase auth code exchange (server)
│   │
│   └── payment/                          Post-payment pages
│       ├── success/page.tsx             Payment confirmation
│       └── cancelled/page.tsx           Payment abandoned + retry
│
├── components/
│   ├── ui/                               50+ shadcn/ui (Radix + Tailwind) components
│   │   ├── button.tsx, input.tsx, dialog.tsx, table.tsx, tabs.tsx ...
│   │   └── utils.ts                     cn() helper for class merging
│   ├── layout/
│   │   ├── navigation.tsx               Public site nav (scroll-aware, mobile menu)
│   │   └── footer.tsx                   Public site footer
│   ├── portal/
│   │   └── contract-modal.tsx           Contract viewer modal
│   └── shared/
│       ├── providers.tsx                React Query + theme providers
│       └── image-with-fallback.tsx      Image component with error fallback
│
├── hooks/                                (placeholder — no custom hooks yet)
├── services/                             (placeholder — TanStack Query hooks will go here)
│
├── stores/                               Zustand state management
│   ├── auth-store.ts                    Auth state (user, session, role)
│   ├── ui-store.ts                      UI state (sidebar, modals)
│   └── upload-store.ts                  Photo upload progress state
│
├── lib/
│   ├── constants.ts                     Route paths + API URL + nav links
│   ├── api-client.ts                    Axios instance with auth interceptor
│   ├── query-client.ts                  TanStack Query client config
│   ├── utils.ts                         General utilities
│   ├── mock-data/
│   │   └── admin-data.ts               Mock data for all admin/portal pages
│   └── supabase/
│       ├── client.ts                    Browser Supabase client
│       ├── server.ts                    Server-side Supabase client
│       └── middleware.ts                Supabase session refresh middleware
│
├── middleware.ts                          Route protection for /admin/* and /portal/*
└── types/                                (placeholder — frontend-specific types)
```

### Key Patterns

- **Route groups**: `(public)/` groups public pages under a shared layout (nav + footer) without affecting URLs
- **"use client"** directive on all interactive pages (forms, animations, client-side state)
- **Mock data layer**: All pages render with `admin-data.ts` mock data — will be replaced with TanStack Query hooks
- **Motion animations**: Using `motion/react` (not framer-motion) for page transitions and scroll-triggered reveals
- **Auth middleware**: `middleware.ts` checks Supabase session for `/admin/*` and `/portal/*` routes

## Backend — `apps/api/`

NestJS 11 with TypeORM, TypeScript. Runs on port 3001.

### File Structure

```
apps/api/src/
├── main.ts                               Bootstrap (CORS, validation pipes, Swagger)
├── app.module.ts                         Root module importing all feature modules
├── config/
│   └── configuration.ts                  Typed env config with validation
│
├── common/
│   ├── guards/
│   │   ├── supabase-auth.guard.ts        JWT verification via Supabase
│   │   └── roles.guard.ts               Role-based access (@Roles decorator)
│   ├── decorators/
│   │   ├── current-user.decorator.ts     @CurrentUser() parameter decorator
│   │   └── roles.decorator.ts           @Roles('admin') metadata decorator
│   ├── dto/
│   │   └── pagination.dto.ts            Shared pagination query params
│   ├── interceptors/
│   │   └── transform.interceptor.ts     Standardized API response format
│   └── filters/
│       └── http-exception.filter.ts     Consistent error responses
│
├── database/
│   └── data-source.ts                    TypeORM data source config
│
└── modules/
    ├── auth/                             Auth sync (Supabase → local users)
    │   ├── auth.module.ts
    │   ├── auth.controller.ts            POST /register-client, GET /me, POST /sync
    │   └── auth.service.ts
    ├── users/                            User CRUD
    │   ├── users.module.ts
    │   ├── users.controller.ts
    │   ├── users.service.ts
    │   └── entities/user.entity.ts
    ├── inquiries/                         Public form + admin management
    │   ├── inquiries.module.ts
    │   ├── inquiries.controller.ts
    │   ├── inquiries.service.ts
    │   └── entities/inquiry.entity.ts
    ├── bookings/                          Booking lifecycle
    │   ├── bookings.module.ts
    │   ├── bookings.controller.ts
    │   ├── bookings.service.ts
    │   └── entities/booking.entity.ts
    ├── galleries/                         Gallery + photo management
    │   ├── galleries.module.ts
    │   ├── galleries.controller.ts
    │   ├── galleries.service.ts
    │   └── entities/
    │       ├── gallery.entity.ts
    │       └── gallery-photo.entity.ts
    ├── portfolio/                         Public portfolio CRUD
    │   ├── portfolio.module.ts
    │   ├── portfolio.controller.ts
    │   ├── portfolio.service.ts
    │   └── entities/
    │       ├── portfolio-item.entity.ts
    │       └── portfolio-photo.entity.ts
    ├── payments/                          Stripe integration
    │   ├── payments.module.ts
    │   ├── payments.controller.ts
    │   ├── payments.service.ts
    │   ├── stripe.service.ts
    │   └── entities/payment.entity.ts
    ├── storage/                           Cloudflare R2 + image processing
    │   ├── storage.module.ts
    │   ├── storage.service.ts            R2 presigned URLs, bucket ops
    │   └── image-processor.service.ts    Sharp thumbnail generation
    ├── email/                             Resend transactional emails
    │   ├── email.module.ts
    │   └── email.service.ts
    └── health/                            Health check for Railway
        ├── health.module.ts
        └── health.controller.ts
```

### Backend Status

All modules are **scaffolded** (controller + service + module + entity files exist) but service methods are mostly stubs. The TypeORM entities define the full schema. Guards and decorators are implemented. No database connection has been established yet.

## Shared Package — `packages/shared/`

Consumed by both `apps/web` and `apps/api` as `@winphotography/shared`.

```
packages/shared/src/
├── index.ts                              Re-exports everything
├── enums/
│   ├── roles.enum.ts                    UserRole: admin | client
│   ├── inquiry-status.enum.ts           new → contacted → quoted → converted → archived
│   ├── booking-status.enum.ts           pending_deposit → confirmed → ... → completed
│   ├── gallery-status.enum.ts           draft → published → archived
│   ├── payment-status.enum.ts           pending → processing → succeeded → failed → refunded
│   └── event-type.enum.ts              wedding | engagement | event | portrait | corporate | other
├── types/
│   ├── user.types.ts
│   ├── inquiry.types.ts
│   ├── booking.types.ts
│   ├── gallery.types.ts
│   ├── payment.types.ts
│   ├── portfolio.types.ts
│   └── package.types.ts
└── validation/
    ├── inquiry.schema.ts                Zod schema for inquiry form
    └── booking.schema.ts               Zod schema for booking creation
```

## Database Schema

10 tables in Supabase PostgreSQL. See [database-schema.md](./database-schema.md) for full SQL.

### Entity Relationships
```
users 1:N bookings
bookings 1:1 inquiries (optional, via conversion)
bookings 1:N galleries
bookings 1:N payments
galleries 1:N gallery_photos
portfolio_items 1:N portfolio_photos
packages (standalone — pricing tiers)
testimonials (standalone)
```

## Auth Architecture

```
Client-side (Supabase SDK) ──→ Supabase Auth ──→ JWT issued
                                                     │
Frontend (Axios interceptor) ──→ Authorization: Bearer <JWT>
                                                     │
NestJS SupabaseAuthGuard ──→ supabase.auth.getUser(token)
         │                         │
         └── Look up local user by supabase_id
                  │
         RolesGuard ──→ Check @Roles('admin') decorator
```

- Supabase handles: login, signup, password reset, email verification
- NestJS handles: JWT verification, role-based access, local user records
- Next.js middleware: route protection for /portal/* and /admin/*

## Image Pipeline (Planned)

```
Upload:
  Admin selects files ──→ API returns presigned URLs ──→
  Browser uploads directly to R2 ──→ Confirm upload ──→
  BullMQ job: Sharp generates thumbnail (400px WebP) ──→ Upload to R2

Delivery:
  Client views gallery ──→ Thumbnails via signed URLs (1hr) ──→
  Download single ──→ Signed URL for original (15min) ──→
  Download all ──→ Server creates zip via archiver ──→ Signed URL

Portfolio (public):
  Served via Cloudflare CDN URL ──→ Aggressive caching
```

### R2 Bucket Structure (Planned)
```
winphotography-media/
├── galleries/{galleryId}/original/       Full-res edited photos
├── galleries/{galleryId}/thumbnails/     400px WebP thumbnails
├── portfolio/{itemId}/original/          Portfolio originals
├── portfolio/{itemId}/thumbnails/        Portfolio thumbnails
├── contracts/{bookingId}/                Signed contracts (PDF)
└── misc/avatars/                         User avatars
```

## Payment Flow (Planned)

```
Inquiry ──→ Admin converts to Booking ──→ Deposit payment created
  │
  └──→ Stripe Checkout session ──→ Client pays via Stripe UI
         │
         └──→ Webhook: checkout.session.completed
                │
                └──→ Update payment status + booking confirmed

Gallery delivered ──→ Final payment created ──→ Same Stripe flow
  │
  └──→ Webhook: payment succeeded ──→ Booking marked completed
```

## API Endpoints

See [api-endpoints.md](./api-endpoints.md) for the full reference. All prefixed with `/api/v1`.

## Frontend Routes (35 total)

| Group | Routes | Layout |
|-------|--------|--------|
| Public (12) | `/`, `/about`, `/pricing`, `/portfolio`, `/portfolio/[slug]`, `/inquire`, `/inquire/thank-you`, `/blog`, `/blog/[slug]`, `/terms`, `/privacy`, `/not-found` | Navigation + Footer |
| Admin (14) | `/admin`, `/admin/inquiries`, `/admin/inquiries/[id]`, `/admin/bookings`, `/admin/bookings/[id]`, `/admin/galleries`, `/admin/galleries/new`, `/admin/galleries/[id]`, `/admin/portfolio`, `/admin/portfolio/new`, `/admin/payments`, `/admin/clients`, `/admin/clients/[id]` | Admin sidebar |
| Portal (4) | `/portal`, `/portal/galleries/[galleryId]`, `/portal/bookings`, `/portal/settings` | Portal sidebar |
| Auth (3+1) | `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/callback` (route handler) | None |
| Payment (2) | `/payment/success`, `/payment/cancelled` | None |

## Environment Variables

See `.env.example` in the project root for the complete list. Key groups:

- **Supabase**: URL, anon key, service role key, JWT secret
- **Database**: PostgreSQL connection string
- **Storage**: R2 account ID, access keys, bucket name
- **Payments**: Stripe secret key, webhook secret, publishable key
- **Email**: Resend API key, from address
- **Infrastructure**: Redis URL, frontend URL, API port

## Deployment (Planned)

- **Frontend**: Vercel (auto-deploy from main branch, root: `apps/web`)
- **Backend**: Railway (Docker, root: `apps/api`, health check: `/health`)
- **CI**: GitHub Actions (lint + type-check + build on PRs)

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `brand-main` | `#032616` (dark green) | Primary text, admin sidebar, nav background |
| `brand-secondary` | `#FFFFFF` (white) | Page backgrounds, text on dark |
| `brand-tertiary` | `#d18b8f` (dusty rose) | Accents, CTAs, active states |
| `brand-warm` | `#f8ede1` (warm cream) | Section backgrounds, cards |
| Serif font | Cormorant Garamond | Headings |
| Sans font | Montserrat | Body text, UI elements |
