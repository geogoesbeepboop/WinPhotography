import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const protectedRoutes = ['/portal', '/admin'];
const adminRoutes = ['/admin'];
const authRoutes = ['/auth/login', '/auth/forgot-password', '/auth/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const { user, supabaseResponse } = await updateSession(request);

  // Redirect authenticated users away from auth pages (role-aware)
  if (isAuthRoute && user) {
    const role = user.user_metadata?.role;
    return NextResponse.redirect(new URL(role === 'admin' ? '/admin' : '/portal', request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtected && !user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection is handled by checking role in the layout
  // since we need to fetch the user's role from our database
  // (Supabase auth user doesn't have our custom role)

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
