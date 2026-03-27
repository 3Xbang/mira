import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n";

const intlMiddleware = createMiddleware({ locales, defaultLocale, localePrefix: 'as-needed' });

// Detect market from IP country header (set by Cloudflare or similar)
// Falls back to Accept-Language or defaults to 'uk' market for non-TH visitors
function detectMarket(request: NextRequest): "th" | "uk" {
  // Cloudflare sets CF-IPCountry header
  const country =
    request.headers.get("CF-IPCountry") ||
    request.headers.get("X-Vercel-IP-Country") ||
    request.headers.get("X-Country-Code") ||
    "";

  return country.toUpperCase() === "TH" ? "th" : "uk";
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only redirect the root path, and only if there's no explicit market preference cookie
  if (pathname === "/") {
    const marketCookie = request.cookies.get('mira-market')?.value;
    if (!marketCookie) {
      const market = detectMarket(request);
      const url = request.nextUrl.clone();
      if (market === "th") {
        url.pathname = "/en";
      } else {
        url.pathname = "/en/uk";
      }
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
