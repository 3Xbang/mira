# Implementation Plan: Mira Real Estate Website

## Overview

Incremental build of the Mira Next.js 14 App Router site: project scaffolding → data layer → layout/shared components → homepage → property detail → contact & tracking → i18n → SEO → deployment config. Each step integrates into the running app before moving on.

## Tasks

- [x] 1. Project scaffolding and configuration
  - Bootstrap Next.js 14 App Router project with TypeScript and Tailwind CSS
  - Configure `next.config.ts`: `output: 'export'`, image domains for CloudFront, i18n locales
  - Configure `tailwind.config.ts` with Tropical Luxury theme colors (`ocean-blue`, `sand-gold`, `off-white`, `light-gray`, `dark-gray`) and Inter/Poppins font stack
  - Install dependencies: `next-intl`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, `jest`, `jest-environment-jsdom`
  - Configure `jest.config.ts` with `jsdom` environment, `@testing-library/jest-dom` setup, and `@/` path alias
  - Create directory structure: `app/[locale]/`, `components/`, `data/`, `messages/`, `lib/`, `public/`
  - _Requirements: 10.1, 10.3_

- [x] 2. Property data layer
  - [x] 2.1 Create `data/properties.json` with at least 3 sample property entries (including 1 with `panorama_url` and hotspots, mix of `featured: true/false`)
    - Each entry must include all required fields: `id`, `title`, `price`, `currency`, `area_sqm`, `land_sqm`, `bedrooms`, `bathrooms`, `location`, `description`, `images` (≥3 URLs), `featured`
    - _Requirements: 8.1, 8.2_

  - [x] 2.2 Implement `lib/properties.ts` with helper functions: `getAllProperties()`, `getFeaturedProperties()`, `getPropertyById(id)`
    - `getFeaturedProperties()` filters by `featured === true`
    - `getPropertyById` returns `undefined` for unknown ids
    - _Requirements: 8.1, 8.4_

  - [ ]* 2.3 Write property test for `getFeaturedProperties` — Property 15
    - **Property 15: Featured filter excludes non-featured properties**
    - **Validates: Requirements 8.4**

  - [ ]* 2.4 Write property test for `getFeaturedProperties` count bounds — Property 1
    - **Property 1: Featured property count is within bounds**
    - **Validates: Requirements 1.2**

  - [ ]* 2.5 Write property test for `properties.json` schema — Property 17
    - **Property 17: Property schema contains all required fields**
    - **Validates: Requirements 8.2**

- [x] 3. i18n setup
  - [x] 3.1 Create `i18n.ts` with `getRequestConfig`, export `locales` array and `defaultLocale = 'en'`
    - _Requirements: 6.1, 6.5_

  - [x] 3.2 Create `middleware.ts` using next-intl for locale detection and redirect from `/` to `/{defaultLocale}`
    - _Requirements: 6.1_

  - [x] 3.3 Create all 6 message files (`messages/en.json`, `ru.json`, `fr.json`, `de.json`, `es.json`, `it.json`) with keys: `nav`, `hero`, `property`, `contact`, `footer`, `errors`
    - _Requirements: 6.1, 6.3_

  - [ ]* 3.4 Write property test for locale switching — Property 13
    - **Property 13: Locale switching updates rendered text**
    - **Validates: Requirements 6.3**

  - [ ]* 3.5 Write property test for localStorage locale round-trip — Property 14
    - **Property 14: Locale preference round-trip via localStorage**
    - **Validates: Requirements 6.4**

- [x] 4. Root layout and shared components
  - [x] 4.1 Implement `app/[locale]/layout.tsx` — wraps children with next-intl `NextIntlClientProvider`, sets `<html lang={locale}>`, includes `TrackingScripts`
    - _Requirements: 6.1, 5.1, 5.2_

  - [x] 4.2 Implement `components/layout/Navbar.tsx` — brand logo, nav links (Home, Properties, Contact), `LanguageSwitcher` on the right
    - _Requirements: 1.6_

  - [x] 4.3 Implement `components/common/LanguageSwitcher.tsx` — dropdown listing all 6 locales, reads/writes locale preference to `localStorage`, navigates to new locale path on change
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 4.4 Implement `components/layout/Footer.tsx` — copyright text and contact details from translations
    - _Requirements: 1.7_

  - [x] 4.5 Implement `components/tracking/TrackingScripts.tsx` — injects GA4 and Facebook Pixel `<Script>` tags only when `NODE_ENV === 'production'`
    - _Requirements: 5.1, 5.2, 5.5_

  - [ ]* 4.6 Write unit tests for Navbar, Footer, and LanguageSwitcher
    - Navbar renders logo and language switcher
    - Footer renders copyright text
    - Default locale is `'en'` when localStorage has no preference
    - _Requirements: 1.6, 1.7, 6.5_

  - [ ]* 4.7 Write property test for tracking scripts absent outside production — Property 11
    - **Property 11: Tracking scripts absent outside production**
    - **Validates: Requirements 5.5**

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. ContactButton component
  - [x] 6.1 Implement `components/common/ContactButton.tsx` — fixed bottom-right floating button with WhatsApp and Line links, `target="_blank"`, touch target ≥ 44×44px, fires tracking events via `lib/tracking.ts`
    - _Requirements: 1.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 7.5_

  - [x] 6.2 Implement `lib/tracking.ts` — `trackContactClick(channel)` calls `window.gtag('event', 'contact_click', { channel })` and `window.fbq('track', 'Contact')`, wrapped in try/catch with guard for undefined globals
    - _Requirements: 5.3, 5.4_

  - [ ]* 6.3 Write unit tests for ContactButton
    - Renders WhatsApp and Line links with correct `href` and `target="_blank"`
    - Has fixed positioning CSS classes
    - _Requirements: 3.1, 3.3, 3.4_

  - [ ]* 6.4 Write property test for contact button URL format — Property 8
    - **Property 8: Contact button link URLs are correctly formatted**
    - **Validates: Requirements 3.3, 3.4**

  - [ ]* 6.5 Write property test for contact click tracking events — Property 12
    - **Property 12: Contact click fires correct tracking events**
    - **Validates: Requirements 5.3, 5.4**

- [x] 7. Homepage
  - [x] 7.1 Implement `components/home/HeroSection.tsx` — full-screen section with Next.js `Image` (priority, object-cover), brand tagline and subtitle from translations, responsive crop on mobile
    - _Requirements: 1.1, 7.3, 9.1, 9.2_

  - [x] 7.2 Implement `components/property/PropertyCard.tsx` — thumbnail (Next.js `Image`, lazy), price, area, bedrooms, bathrooms, location; wraps in `<Link href="/[locale]/properties/[id]">`
    - _Requirements: 1.3, 1.4, 9.1, 9.3_

  - [x] 7.3 Implement `components/home/FeaturedProperties.tsx` — responsive grid (1 col mobile / 2 col tablet / 3 col desktop) of `PropertyCard` components using `getFeaturedProperties()`
    - _Requirements: 1.2, 7.2_

  - [x] 7.4 Implement `app/[locale]/page.tsx` — homepage assembling `HeroSection`, `FeaturedProperties`, `ContactButton`
    - _Requirements: 1.1, 1.2, 1.5_

  - [ ]* 7.5 Write property test for PropertyCard required fields — Property 2
    - **Property 2: PropertyCard renders all required fields**
    - **Validates: Requirements 1.3**

  - [ ]* 7.6 Write property test for PropertyCard link href — Property 3
    - **Property 3: PropertyCard links to correct detail page**
    - **Validates: Requirements 1.4**

  - [ ]* 7.7 Write unit test for HeroSection
    - Renders with `priority={true}` image prop
    - _Requirements: 9.2_

  - [ ]* 7.8 Write unit test for FeaturedProperties grid
    - Grid container has correct responsive Tailwind classes
    - _Requirements: 7.2_

- [x] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Property detail page
  - [x] 9.1 Implement `components/property/ImageCarousel.tsx` — renders all N images (N ≥ 3) with prev/next controls, uses Next.js `Image` with lazy loading for non-first images
    - _Requirements: 2.1, 9.1, 9.3_

  - [x] 9.2 Implement `components/property/PanoramaViewer.tsx` — dynamic import (`ssr: false`) of Pannellum, renders only when `panorama_url` is provided, passes hotspots as props, supports mouse-drag and touch-swipe
    - _Requirements: 2.3, 2.4, 2.5, 7.4_

  - [x] 9.3 Implement `app/[locale]/properties/[id]/page.tsx` — calls `getPropertyById`, renders `ImageCarousel`, property fields (price, area_sqm, land_sqm, bedrooms, bathrooms, location), conditionally renders `PanoramaViewer`, includes `ContactButton`
    - Implement `generateStaticParams` returning a params entry for every property id × locale combination
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 8.3_

  - [x] 9.4 Implement `app/[locale]/not-found.tsx` — displays translated "Property not found" message and a link back to `/{locale}`
    - _Requirements: 2.7_

  - [ ]* 9.5 Write property test for property detail page required fields — Property 4
    - **Property 4: Property detail page renders all required fields**
    - **Validates: Requirements 2.2**

  - [ ]* 9.6 Write property test for ImageCarousel image count — Property 5
    - **Property 5: Image carousel renders all property images**
    - **Validates: Requirements 2.1**

  - [ ]* 9.7 Write property test for PanoramaViewer conditional rendering — Property 6
    - **Property 6: PanoramaViewer conditionally rendered**
    - **Validates: Requirements 2.3**

  - [ ]* 9.8 Write property test for PanoramaViewer hotspots — Property 7
    - **Property 7: PanoramaViewer receives hotspots when present**
    - **Validates: Requirements 2.5**

  - [ ]* 9.9 Write property test for generateStaticParams coverage — Property 16
    - **Property 16: generateStaticParams covers all property IDs**
    - **Validates: Requirements 8.3**

  - [ ]* 9.10 Write unit test for 404 page
    - Renders a link back to homepage
    - _Requirements: 2.7_

- [x] 10. SEO and Open Graph meta tags
  - [x] 10.1 Add `generateMetadata` to `app/[locale]/page.tsx` — exports `og:title`, `og:description`, `og:image` (default `og-default.jpg`, ≥1200×630), `og:url`, `twitter:card`, `twitter:title`, `twitter:image`
    - _Requirements: 4.1, 4.3, 4.4_

  - [x] 10.2 Add `generateMetadata` to `app/[locale]/properties/[id]/page.tsx` — uses property `title`, `description`, and `images[0]` for OG tags; falls back to defaults for missing fields
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 10.3 Add `public/og-default.jpg` placeholder (1200×630) for homepage and fallback OG image
    - _Requirements: 4.3_

  - [ ]* 10.4 Write property test for OG/Twitter meta tags on all pages — Property 9
    - **Property 9: All pages include required OG and Twitter meta tags**
    - **Validates: Requirements 4.1, 4.4**

  - [ ]* 10.5 Write property test for property detail OG tags matching property data — Property 10
    - **Property 10: Property detail OG tags match property data**
    - **Validates: Requirements 4.2**

- [ ] 11. CDN image URL validation
  - [ ]* 11.1 Write property test for CDN image URLs — Property 18
    - **Property 18: CDN image URLs use CloudFront domain**
    - **Validates: Requirements 9.4**

- [x] 12. Deployment configuration
  - [x] 12.1 Create `amplify.yml` with build commands (`npm ci`, `npm run build`) and output directory (`out/`)
    - _Requirements: 10.1, 10.3_

  - [x] 12.2 Verify `next.config.ts` has `output: 'export'` and correct `images.domains` / `remotePatterns` for CloudFront
    - _Requirements: 9.4, 10.1_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Run `jest --ci` and `tsc --noEmit`; ensure all tests pass and no type errors remain. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with `numRuns: 100` in CI
- PanoramaViewer must use `dynamic(() => import(...), { ssr: false })` to avoid SSR issues with Pannellum browser APIs
- `lib/tracking.ts` calls must be guarded with `typeof window !== 'undefined'` and try/catch
