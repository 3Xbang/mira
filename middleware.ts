import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n'

const intlMiddleware = createMiddleware({ locales, defaultLocale })

const SESSION_COOKIE = 'mira_admin_session'

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Protect /admin routes ──────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Login page and API routes are always accessible
    if (!pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/api')) {
      const session = request.cookies.get(SESSION_COOKIE)?.value
      if (!session) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/admin/login'
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
    // Admin routes bypass i18n middleware
    return NextResponse.next()
  }

  // ── 2. Redirect legacy UK paths ───────────────────────────────────────────
  if (pathname.includes('/uk')) {
    const locale = pathname.split('/')[1] || 'en'
    const newPath = locale === 'en' ? '/' : `/${locale}`
    const url = request.nextUrl.clone()
    url.pathname = newPath
    return NextResponse.redirect(url)
  }

  // ── 3. i18n routing for all other pages ──────────────────────────────────
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
