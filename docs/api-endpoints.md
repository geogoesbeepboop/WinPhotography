# WinPhotography — API Endpoints Reference

Base URL: `/api/v1` (except health check)

## Health Check
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | Public | Server health check for Railway |

## Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register-client` | Admin | Create client account (sends Supabase invite) |
| GET | `/auth/me` | Any | Get current user profile from JWT |
| POST | `/auth/sync` | Any | Sync Supabase auth user to local users table |

## Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Admin | List all users (paginated, filterable) |
| GET | `/users/:id` | Admin | Get user by ID |
| PATCH | `/users/:id` | Admin/Self | Update user profile |
| DELETE | `/users/:id` | Admin | Deactivate user (soft delete) |

## Inquiries
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/inquiries` | **Public** | Submit new inquiry from website form |
| GET | `/inquiries` | Admin | List all inquiries (paginated, filterable) |
| GET | `/inquiries/:id` | Admin | Get inquiry detail |
| PATCH | `/inquiries/:id` | Admin | Update inquiry status / notes |
| POST | `/inquiries/:id/convert` | Admin | Convert inquiry to booking + create client |
| DELETE | `/inquiries/:id` | Admin | Archive inquiry |

## Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/bookings` | Admin | Create booking manually |
| GET | `/bookings` | Any | List bookings (admin: all, client: own) |
| GET | `/bookings/:id` | Admin/Owner | Get booking detail |
| PATCH | `/bookings/:id` | Admin | Update booking details/status |
| DELETE | `/bookings/:id` | Admin | Cancel booking |

Note: booking payloads include a derived `lifecycleStage` value:
`pending_deposit`, `upcoming`, `pending_full_payment`, `pending_delivery`, `completed`, `cancelled`.

## Galleries
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/galleries` | Admin | Create gallery for a booking |
| GET | `/galleries` | Any | List galleries (admin: all, client: own) |
| GET | `/galleries/:id` | Admin/Owner | Get gallery with photos |
| PATCH | `/galleries/:id` | Admin | Update gallery metadata |
| DELETE | `/galleries/:id` | Admin | Delete gallery |
| POST | `/galleries/:id/photos` | Admin | Request presigned upload URLs |
| POST | `/galleries/:id/photos/confirm` | Admin | Confirm photos uploaded to R2 |
| DELETE | `/galleries/:id/photos/:photoId` | Admin | Remove photo from gallery |
| PATCH | `/galleries/:id/photos/reorder` | Admin | Reorder photos |
| POST | `/galleries/:id/publish` | Admin | Publish gallery, notify client |
| GET | `/galleries/:id/photos/:photoId/download` | Admin/Owner | Get signed download URL |
| POST | `/galleries/:id/download-all` | Admin/Owner | Generate zip download URL |

## Portfolio
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/portfolio` | **Public** | List published portfolio items |
| GET | `/portfolio/:slug` | **Public** | Get portfolio item by slug with photos |
| POST | `/portfolio` | Admin | Create portfolio item |
| PATCH | `/portfolio/:id` | Admin | Update portfolio item |
| DELETE | `/portfolio/:id` | Admin | Delete portfolio item |
| POST | `/portfolio/:id/photos` | Admin | Upload portfolio photos |
| POST | `/portfolio/:id/photos/confirm` | Admin | Confirm upload |
| DELETE | `/portfolio/:id/photos/:photoId` | Admin | Remove photo |
| PATCH | `/portfolio/:id/photos/reorder` | Admin | Reorder photos |

## Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/create-checkout` | Admin | Create Stripe Checkout session |
| GET | `/payments` | Any | List payments (admin: all, client: own) |
| GET | `/payments/:id` | Admin/Owner | Get payment detail |
| POST | `/payments/webhook` | **Public** (Stripe signature) | Stripe webhook handler |
| POST | `/payments/:id/resend-link` | Admin | Resend payment link |
| POST | `/payments/:id/refund` | Admin | Initiate refund |

## Packages
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/packages` | **Public** | List active packages |
| GET | `/packages/:slug` | **Public** | Get package detail |
| POST | `/packages` | Admin | Create package |
| PATCH | `/packages/:id` | Admin | Update package |
| DELETE | `/packages/:id` | Admin | Deactivate package |

## Testimonials
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/testimonials` | **Public** | List published testimonials |
| GET | `/testimonials/published` | **Public** | Explicit published testimonials endpoint |
| GET | `/testimonials/featured` | **Public** | List featured testimonials (published only) |
| GET | `/testimonials/:id` | **Public** | Get one published testimonial by ID |
| GET | `/testimonials/admin/all` | Admin | List all testimonials including drafts |
| GET | `/testimonials/my` | Client | List testimonials tied to current client bookings |
| POST | `/testimonials/my` | Client | Submit or update testimonial for a client booking |
| PATCH | `/testimonials/my/:id` | Client | Edit a client-owned testimonial |
| POST | `/testimonials` | Admin | Create testimonial |
| PATCH | `/testimonials/:id` | Admin | Update testimonial |
| DELETE | `/testimonials/:id` | Admin | Delete testimonial |
