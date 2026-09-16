import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n";

const intlMiddleware = createMiddleware({ locales, defaultLocale });

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect old UK paths to home page
  if (pathname.includes('/uk')) {
    const locale = pathname.split('/')[1] || 'en';
    const newPath = locale === 'en' ? '/' : `/${locale}`;
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
