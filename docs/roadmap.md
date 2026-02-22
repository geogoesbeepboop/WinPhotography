# WinPhotography — Implementation Roadmap

## Overview

Professional wedding/event photography website with client portal, admin dashboard, and payment processing. Target: <500 users, cost-effective cloud infrastructure.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, TanStack Query, Zustand, Radix UI, Lucide, Motion, Axios |
| Backend | NestJS 11, TypeScript, TypeORM |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (client) + JWT verification (backend) |
| Photo Storage | Cloudflare R2 (S3-compatible, zero egress) |
| Payments | Stripe Checkout (deposit + final payment) |
| Email | Resend |
| Image Processing | Sharp + BullMQ (async) |
| Frontend Hosting | Vercel (free tier) |
| Backend Hosting | Railway (usage-based, $5-10/mo) |
| Monorepo | Turborepo + pnpm workspaces |

**Estimated monthly cost: ~$32-37 fixed** + Stripe fees (2.9% + $0.30/txn)

---

## Current Status Summary

**All 35 frontend UI routes are built.** Supabase is connected — auth login/logout works, database schema is deployed (10 tables), and the inquiry form submits to the real API. Portal/admin pages still display mock gallery/booking data (not wired to API yet).

| Area | Status |
|------|--------|
| Monorepo + tooling | Done |
| Next.js app with 35 routes | Done |
| NestJS API with 10 modules | Done (inquiries CRUD wired, others stubbed) |
| Shared types/enums/validation | Done |
| UI component library (50+ shadcn/ui) | Done |
| Database schema (10 tables) | Done (deployed to Supabase) |
| Supabase auth integration | Done (login, logout, session, middleware, guards) |
| Inquiry form → DB | Done (public POST endpoint wired) |
| Admin auth protection | Done (role-based redirect in layout + middleware) |
| Portal user display | Done (reads from Supabase auth, no more mock "Sara") |
| Test accounts | Done (admin + client seeded) |
| Stripe payments | Not started (service scaffolded, not wired) |
| Cloudflare R2 storage | Not started (service scaffolded, not wired) |
| Email (Resend) | Not started (service scaffolded, not wired) |
| Deployment (Vercel + Railway) | Not started |

---

## Auth & Session Flow (Implemented)

1. **Login**: Supabase `signInWithPassword()` → stores session in httpOnly cookies via `@supabase/ssr`
2. **Session persistence**: `AuthListener` in providers.tsx listens to `onAuthStateChange()` → updates Zustand store
3. **Middleware**: `middleware.ts` calls `updateSession()` to refresh tokens, protects `/portal/*` and `/admin/*` routes
4. **Backend guards**: `SupabaseAuthGuard` verifies JWT via `supabase.auth.getUser(token)`, auto-creates local user on first auth
5. **Role protection**: Admin layout redirects non-admins to `/portal`; middleware redirects based on `user_metadata.role`
6. **Logout**: `supabase.auth.signOut()` clears session, redirects to `/auth/login`

### User Creation Flow (Planned)

Inquiry submitted → Admin reviews in dashboard → Admin converts to booking → Admin creates client account via `POST /auth/register-client` (uses Supabase Admin API to create user + send invite email) → Client receives invite → Client sets password → Client can log in to portal

**The inquiry form does NOT create user accounts.** It only creates an inquiry record. User accounts are created by the admin when converting an inquiry to a booking.

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@maewinphoto.com | Admin123! |
| Client | client@test.com | Client123! |

---

## Phases

### Phase 1: Foundation — COMPLETE

- [x] Initialize Turborepo monorepo with pnpm workspaces
- [x] Scaffold Next.js app (App Router, Tailwind, providers, routing)
- [x] Scaffold NestJS app (config, health check, Swagger, modules)
- [x] Create shared types/enums/validation package
- [x] Define all TypeORM entities
- [x] Create auth guards (SupabaseAuthGuard, RolesGuard)
- [x] Set up CI workflow (GitHub Actions)
- [x] Create Dockerfile for backend
- [x] Build Radix UI component library (50+ shadcn/ui components)
- [x] Migrate all UI pages from Vite/React Router prototype to Next.js App Router
- [x] Build layout components (navigation, footer, admin sidebar, portal sidebar)
- [x] Set up Supabase project + run database migrations (10 tables)
- [x] Wire auth flow (login, logout, session, middleware, guards)
- [x] Seed admin user + test client user
- [ ] Deploy to Vercel + Railway to validate pipeline

### Phase 2: Public Website — UI COMPLETE, PARTIALLY WIRED

- [x] Home page (hero, services, featured work, testimonials, CTA)
- [x] About page (photographer bio, values, quote section)
- [x] Pricing page (category tabs: weddings, elopements, proposals, etc.)
- [x] Portfolio page (category filtering, masonry grid)
- [x] Portfolio detail page (lightbox viewer)
- [x] Inquiry form (multi-step with event details)
- [x] Inquiry thank-you page
- [x] Blog listing + blog post detail pages
- [x] Legal pages (terms of service, privacy policy)
- [x] Custom 404 page
- [x] Navigation with scroll behavior + mobile menu
- [x] Footer with site links + contact info
- [x] Motion animations on all public pages
- [x] Wire inquiry form to POST /api/v1/inquiries
- [x] Replace photographer image with real asset (aboutmain.jpg)
- [ ] Wire pricing page to GET /api/v1/packages (currently hardcoded)
- [ ] Wire portfolio to GET /api/v1/portfolio (currently hardcoded)
- [ ] Wire testimonials to GET /api/v1/testimonials (currently hardcoded)
- [ ] SEO (metadata, Open Graph, sitemap, robots.txt)

### Phase 3: Admin Dashboard — UI COMPLETE, NEEDS BACKEND WIRING

- [x] Admin layout + sidebar navigation
- [x] Dashboard overview (stats cards, recent inquiries)
- [x] Inquiry management (list with status filters, detail view, notes)
- [x] Booking management (list, detail with timeline + payment tracking)
- [x] Gallery management (list, create new, detail with photo grid)
- [x] Portfolio CRUD (list, create new)
- [x] Payment management (list with status filters)
- [x] Client management (list with search)
- [x] Admin role-based auth protection
- [ ] Wire inquiry list to real API (GET /api/v1/inquiries)
- [ ] Wire all other admin pages to real API endpoints
- [ ] Inquiry → booking conversion flow (backend)
- [ ] Photo uploader component (drag-and-drop, R2 presigned URLs)
- [ ] Image processing pipeline (Sharp + BullMQ thumbnails)

### Phase 4: Payments — NOT STARTED

- [ ] Stripe service (Checkout session creation)
- [ ] Webhook handler with signature verification
- [ ] Deposit + final payment flows
- [x] Payment success/cancelled pages (UI done)
- [ ] Email notifications for payment events
- [ ] Refund capability
- [ ] End-to-end testing with Stripe test mode

### Phase 5: Client Portal — UI COMPLETE, PARTIALLY WIRED

- [x] Portal layout + sidebar (real user data from auth store)
- [x] Dashboard (real user greeting, mock gallery/booking data)
- [x] Gallery view with photo grid + download buttons (mock data)
- [x] Booking list with payment status + contract modal (real user name)
- [x] Profile settings form (pre-filled from auth store)
- [ ] Wire gallery view to real photo data + signed R2 URLs
- [ ] Single/batch photo downloads
- [ ] Wire bookings to real payment data
- [ ] Gallery publish → email notification → client access flow
- [ ] Profile update → Supabase user metadata update

### Phase 6: Email & Polish — NOT STARTED

- [ ] Email templates (inquiry, booking, gallery, payment, invite)
- [ ] Rate limiting, CORS hardening
- [ ] Error monitoring (Sentry)
- [ ] Analytics (Vercel Analytics or Plausible)
- [ ] Performance audit (Lighthouse)
- [ ] Cross-browser + mobile testing
- [ ] Custom domain + production Stripe keys

---

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-21 | Chose NestJS over Express | Decorator/DI patterns match Java background |
| 2026-02-21 | Switched from Vite to Next.js | SSR/SSG needed for SEO (photography business) |
| 2026-02-21 | Chose Supabase over raw AWS | Auth + DB bundled, simpler for small scale |
| 2026-02-21 | Chose Cloudflare R2 over S3 | Zero egress fees for photo downloads |
| 2026-02-21 | Chose Stripe over Square/PayPal | Best deposit invoice + payment plan APIs |
| 2026-02-21 | Chose Vercel + Railway over AWS | Simpler deployment, appropriate for scale |
| 2026-02-21 | Chose TypeORM over Prisma | Decorator-based entities familiar to Java devs |
| 2026-02-22 | Migrated Figma prototype (WinPhotographyUI) to Next.js | Preserved all UI from Vite/React Router SPA, deleted original |
| 2026-02-22 | Used `motion` package (not `framer-motion`) | Lighter, same API, imports from `motion/react` |
| 2026-02-22 | shadcn/ui for component library | 50+ Radix UI primitives, Tailwind-styled, copied into project |
| 2026-02-22 | Supabase JWKS-based JWT verification | New projects use asymmetric keys, verify via `supabase.auth.getUser(token)` |
| 2026-02-22 | Admin creates client accounts (not self-signup) | Photography business model: inquiry → admin review → admin creates account |

---

## Next Steps (Priority Order)

1. **Wire admin inquiry list** — show real inquiries from DB in admin dashboard
2. **Set up R2 bucket** — configure for portfolio images + gallery photos
3. **Wire portfolio + pricing pages** — fetch real data from API
4. **Set up Railway** — deploy NestJS backend
5. **Set up Vercel** — deploy Next.js frontend
6. **Create Stripe account** — get test API keys, implement checkout flow
7. **Set up Resend** — transactional email templates
8. **Wire remaining admin/portal pages** — bookings, galleries, payments
