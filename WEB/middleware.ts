import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_PREFIXES = ['/', '/stations', '/map', '/quality', '/alerts', '/reports', '/settings']

// Auth pages — redirect to / if already logged in
const AUTH_PAGES = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email']

// Routes that are always public
const PUBLIC_PREFIXES = ['/reset-password', '/verify-email', '/unauthorized', '/_next', '/favicon', '/logo', '/api']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow public/static paths
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check session token from cookie (we store it as a cookie-backed value)
  // The actual session lives in sessionStorage (client-only), so middleware
  // uses a lightweight auth cookie set on login.
  const authCookie = req.cookies.get('hp_auth')
  const isLoggedIn = !!authCookie?.value

  // If on an auth page and already logged in → redirect to dashboard
  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // If on a protected route and not logged in → redirect to login
  const isProtected = PROTECTED_PREFIXES.some((prefix) => {
    if (prefix === '/') return pathname === '/'
    return pathname.startsWith(prefix)
  })

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (logo.png etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
