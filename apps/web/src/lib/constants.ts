export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
export const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL || '';

export const ROUTES = {
  home: '/',
  about: '/about',
  pricing: '/pricing',
  portfolio: '/portfolio',
  inquire: '/inquire',
  inquireThankYou: '/inquire/thank-you',
  terms: '/terms',
  privacy: '/privacy',

  // Auth
  login: '/auth/login',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',

  // Portal
  portal: '/portal',
  portalGallery: (id: string) => `/portal/galleries/${id}`,
  portalBookings: '/portal/bookings',
  portalSettings: '/portal/settings',

  // Admin
  admin: '/admin',
  adminInquiries: '/admin/inquiries',
  adminInquiry: (id: string) => `/admin/inquiries/${id}`,
  adminBookings: '/admin/bookings',
  adminBooking: (id: string) => `/admin/bookings/${id}`,
  adminGalleries: '/admin/galleries',
  adminGalleryNew: '/admin/galleries/new',
  adminGallery: (id: string) => `/admin/galleries/${id}`,
  adminPortfolio: '/admin/portfolio',
  adminPortfolioNew: '/admin/portfolio/new',
  adminPayments: '/admin/payments',
  adminClients: '/admin/clients',
  adminClient: (id: string) => `/admin/clients/${id}`,

  // Payment
  paymentSuccess: '/payment/success',
  paymentCancelled: '/payment/cancelled',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: ROUTES.home },
  { label: 'About', href: ROUTES.about },
  { label: 'Portfolio', href: ROUTES.portfolio },
  { label: 'Pricing', href: ROUTES.pricing },
  { label: 'Inquire', href: ROUTES.inquire },
] as const;
