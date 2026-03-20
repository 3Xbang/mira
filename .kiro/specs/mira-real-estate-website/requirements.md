# Requirements Document

## Introduction

Mira is a promotional real estate website targeting the Koh Samui, Thailand property market, selling villas and townhouses. The core goal is: showcase listings → attract potential buyers → capture inquiry leads. The tech stack uses Next.js 14 + Tailwind CSS, deployed on AWS Amplify, with image assets hosted on Amazon S3 + CloudFront CDN, property data stored as JSON files, and contact functionality implemented via direct WhatsApp / Line links. The website targets an international audience of buyers from Europe and around the world.

---

## Glossary

- **Website**: The Mira real estate promotional website as a whole system
- **Hero_Section**: The full-screen top section of the homepage, containing a background image and brand tagline
- **Property_Card**: A property summary card component displaying a thumbnail, price, area, and other key details
- **Property_Detail_Page**: The detail page for a single property listing
- **Contact_Button**: A floating contact button component that links to WhatsApp and Line
- **Panorama_Viewer**: A 360° virtual tour component based on Pannellum
- **Tracking_Module**: A traffic tracking module integrating Google Analytics 4 and Facebook Pixel
- **Language_Switcher**: A language switcher in the navigation bar supporting English (en), Russian (ru), French (fr), German (de), Spanish (es), and Italian (it)
- **OG_Tags**: Open Graph meta tags used for social media share previews
- **Property_Data**: Property listing data in JSON format stored at `/data/properties.json`
- **Image_CDN**: The image delivery network composed of Amazon S3 + CloudFront

---

## Requirements

### Requirement 1: Homepage Display

**User Story:** As a potential buyer, I want to see Koh Samui sea views and featured listings when I visit the homepage, so that I can quickly understand the brand and develop interest in purchasing.

#### Acceptance Criteria

1. THE Website SHALL render a full-screen Hero_Section at the top of the homepage with a Koh Samui sea view background image and brand tagline text.
2. THE Website SHALL display a list of 3 to 6 featured Property_Cards below the Hero_Section.
3. THE Property_Card SHALL display the property thumbnail, price, area, number of bedrooms, number of bathrooms, and location.
4. WHEN a user clicks a Property_Card, THE Website SHALL navigate to the corresponding Property_Detail_Page.
5. WHILE a user is browsing the homepage, THE Contact_Button SHALL remain fixed and floating in the bottom-right corner of the page.
6. THE Website SHALL render a navigation bar containing the brand logo and navigation links at the top of all pages.
7. THE Website SHALL render a footer containing copyright information and contact details at the bottom of all pages.

---

### Requirement 2: Property Detail Page

**User Story:** As a potential buyer, I want to view detailed information and a 360° tour of a single property, so that I can make a purchase decision and contact sales.

#### Acceptance Criteria

1. WHEN a user visits a property detail page, THE Property_Detail_Page SHALL display an image carousel for that property supporting at least 3 images.
2. THE Property_Detail_Page SHALL display the property's price, built area, land area, number of bedrooms, number of bathrooms, and geographic location.
3. WHERE the property data contains a 360° panorama URL, THE Property_Detail_Page SHALL embed the Panorama_Viewer component.
4. THE Panorama_Viewer SHALL support mouse-drag rotation and touch-swipe rotation.
5. WHERE the panorama data contains multiple room hotspots, THE Panorama_Viewer SHALL support clicking a hotspot to navigate to the corresponding room panorama.
6. WHILE a user is browsing a Property_Detail_Page, THE Contact_Button SHALL remain fixed and floating in the bottom-right corner of the page.
7. IF a user visits a non-existent property ID, THEN THE Website SHALL return a 404 page with a link back to the homepage.

---

### Requirement 3: Floating Contact Button

**User Story:** As a potential buyer, I want to be able to contact a sales agent with one tap at any time, so that I can quickly get property information.

#### Acceptance Criteria

1. THE Contact_Button SHALL remain fixed and floating in the bottom-right corner of all pages and SHALL NOT disappear when the page is scrolled.
2. THE Contact_Button SHALL include WhatsApp and Line contact options.
3. WHEN a user clicks the WhatsApp button, THE Contact_Button SHALL open the corresponding WhatsApp link (`https://wa.me/{phone_number}`) in a new window.
4. WHEN a user clicks the Line button, THE Contact_Button SHALL open the corresponding Line link (`https://line.me/ti/p/{line_id}`) in a new window.
5. THE Contact_Button SHALL remain fixed and floating on mobile devices without obscuring the main content area.

---

### Requirement 4: Social Media Share Optimization

**User Story:** As a website operator, I want each page to display a rich preview when shared on social media, so that I can increase brand exposure and click-through rates.

#### Acceptance Criteria

1. THE Website SHALL generate OG_Tags containing `og:title`, `og:description`, `og:image`, and `og:url` for every page.
2. THE Property_Detail_Page SHALL use the listing's title, description, and first image to generate the corresponding OG_Tags.
3. THE Website SHALL ensure `og:image` images are no smaller than 1200×630 pixels.
4. THE Website SHALL configure `twitter:card`, `twitter:title`, and `twitter:image` meta tags for every page.

---

### Requirement 5: Traffic Tracking

**User Story:** As a website operator, I want to track user behavior data, so that I can optimize marketing strategies and ad targeting.

#### Acceptance Criteria

1. THE Tracking_Module SHALL send a page view event (`page_view`) to Google Analytics 4 on every page load.
2. THE Tracking_Module SHALL send a `PageView` event to Facebook Pixel on every page load.
3. WHEN a user clicks any Contact_Button option, THE Tracking_Module SHALL send a custom event to Google Analytics 4 with the event name `contact_click` and a contact channel parameter (`whatsapp` / `line`).
4. WHEN a user clicks any Contact_Button option, THE Tracking_Module SHALL send a `Contact` event to Facebook Pixel.
5. THE Tracking_Module SHALL activate tracking code only in the production environment (`NODE_ENV === 'production'`).

---

### Requirement 6: Multilingual Support

**User Story:** As an international buyer, I want to switch the website language to my preferred language, so that I can browse property listings in my native language.

#### Acceptance Criteria

1. THE Website SHALL support six languages: English (`en`), Russian (`ru`), French (`fr`), German (`de`), Spanish (`es`), and Italian (`it`).
2. THE Language_Switcher SHALL be displayed in the top-right area of the navigation bar, allowing users to switch between the six supported languages.
3. WHEN a user switches language, THE Website SHALL update all UI text to the target language without reloading the page.
4. THE Website SHALL store the user's language preference in browser local storage (`localStorage`) and automatically apply it on the next visit.
5. IF a user has not set a language preference, THEN THE Website SHALL default to English.

---

### Requirement 7: Responsive Design

**User Story:** As a mobile user, I want to browse the website smoothly on my phone, so that I can view property listings anytime and anywhere.

#### Acceptance Criteria

1. THE Website SHALL use a mobile-first responsive layout supporting screen widths from 375px to 1920px.
2. THE Property_Card list SHALL display as a single column on mobile (width < 768px), two columns on tablet (768px ≤ width < 1024px), and three columns on desktop (width ≥ 1024px).
3. THE Hero_Section SHALL correctly crop the background image on mobile to ensure the primary visual elements are visible.
4. THE Panorama_Viewer SHALL support touch-swipe rotation and device gyroscope control on mobile.
5. THE Contact_Button SHALL remain fixed and floating on mobile with a touch target area of no less than 44×44 pixels.

---

### Requirement 8: Property Data Management

**User Story:** As a website operator, I want to manage property data through JSON files, so that I can update listings quickly without relying on a database.

#### Acceptance Criteria

1. THE Website SHALL read all property data from the `/data/properties.json` file.
2. THE Property_Data SHALL include the following fields: `id`, `title`, `price`, `currency`, `area_sqm`, `land_sqm`, `bedrooms`, `bathrooms`, `location`, `description`, `images` (array), `panorama_url` (optional), and `featured` (boolean).
3. THE Website SHALL statically generate all property detail pages at build time using Next.js `generateStaticParams`.
4. THE Website SHALL display only properties with the `featured` field set to `true` in the homepage featured list.

---

### Requirement 9: Image Performance Optimization

**User Story:** As a website visitor, I want pages to load quickly, so that I can browse smoothly even under average network conditions.

#### Acceptance Criteria

1. THE Website SHALL use the Next.js `Image` component to render all property images, automatically generating WebP format and multiple size variants.
2. THE Website SHALL configure the `priority` attribute on the Hero_Section background image to ensure above-the-fold images load first.
3. THE Website SHALL configure lazy loading (`loading="lazy"`) for all below-the-fold images.
4. WHERE images are hosted on the Image_CDN, THE Website SHALL access image assets via the CloudFront URL.

---

### Requirement 10: Deployment and Infrastructure

**User Story:** As a website operator, I want the website to deploy automatically and support HTTPS, so that I can reduce operational overhead.

#### Acceptance Criteria

1. THE Website SHALL be automatically built and deployed via AWS Amplify, supporting automatic deployment triggered by a push to the Git repository.
2. THE Website SHALL be served over HTTPS with an SSL certificate automatically managed by AWS Amplify.
3. THE Website SHALL provide an `amplify.yml` build configuration file defining the build command and output directory.
4. THE Website SHALL store image assets in Amazon S3 and distribute them via CloudFront CDN, ensuring global access latency below 500ms.
5. THE Website SHALL operate within the AWS free tier, keeping monthly infrastructure costs below $30.
