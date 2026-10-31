# 🚀 SKILLEZO.AI — Complete Technical SEO & Search Visibility Implementation Plan

**Target Domain:** `https://www.skillezo.com` (and `https://skillezo.com`)  
**Objective:** Resolve Google Search's *"No information is available for this page"*, eliminate the generic globe favicon, establish rich search snippets, deploy automated crawler indexing, and implement Schema.org JSON-LD structured data.  
**Framework:** Next.js 15 (App Router) + TypeScript + Tailwind CSS  
**Status:** 🟡 **Planning Phase (Awaiting User Review & Approval)**

---

## 🔍 1. Root Cause Analysis: Why Google Currently Shows "No information is available"

When Google Search displays:
```text
skillezo.com
https://www.skillezo.com/
No information is available for this page. Learn why
```
with a generic globe icon, it indicates that Google has indexed the URL reference from the web, but **Googlebot was unable or unauthorized to parse, index, and extract document metadata**.

### Specific Deficiencies Identified on `https://www.skillezo.com`:
1. **404 on `robots.txt`**: `https://www.skillezo.com/robots.txt` returns `404 Not Found`. Without explicit crawler permissions, search engines may throttle indexing or assume crawl ambiguity.
2. **404 on `sitemap.xml`**: `https://www.skillezo.com/sitemap.xml` returns `404 Not Found`. Googlebot has no canonical map of public crawlable routes.
3. **Missing `metadataBase`**: Next.js App Router cannot resolve relative canonical URLs, Open Graph images, or Twitter cards without a configured `metadataBase`.
4. **Missing Explicit Robots Directives**: No `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">` in HTML head.
5. **Missing Canonical URL Tag**: No `<link rel="canonical" href="https://www.skillezo.com" />`, creating potential duplicate content dilution between `skillezo.com` and `www.skillezo.com`.
6. **Missing Schema.org JSON-LD**: Zero structured data (`Organization`, `WebSite`, `SoftwareApplication`, `FAQPage`), preventing rich snippets, knowledge graph cards, and breadcrumbs.
7. **Missing Brand Icons & Web Manifest**: Only a basic `favicon.ico` exists; missing standard high-res touch icons (`apple-touch-icon.png`, `icon-192.png`, `site.webmanifest`), which is why Google Search displays the generic globe icon instead of the Skillezo logo.

---

## 🏗️ 2. Architectural Blueprint: The 6 Pillars of Technical SEO

```mermaid
graph TD
    A[Googlebot & Search Crawlers] --> B[app/robots.ts]
    A --> C[app/sitemap.ts]
    
    B -->|Allow Public Routes| D[Landing Page & Legal Pages]
    B -->|Disallow Private Routes| E[/dashboard/*, /recruiter/*, /api/*]
    
    D --> F[Rich Metadata Engine: layout.tsx]
    D --> G[Schema.org JSON-LD Structured Data]
    D --> H[Brand Icons & Web Manifest]
    
    F --> I[Search Snippet: Title + High-CTR Description]
    G --> J[Rich Search Cards: Organization + Software + FAQ]
    H --> K[Google Search Favicon Logo Badge]
```

---

## 📋 3. Detailed Implementation Steps

### Pillar 1: Crawler & Indexing Infrastructure (`robots.ts` & `sitemap.ts`)
* **Create `client/app/robots.ts`** (Next.js Native Crawler Route):
  - Automatically generates `https://www.skillezo.com/robots.txt` with HTTP 200.
  - Grants unrestricted crawl access to `Googlebot`, `bingbot`, and all standard spiders for public landing pages (`/`, `/privacy`, `/terms`).
  - Blocks search engine crawlers from indexing private authenticated app routes (`/dashboard/*`, `/recruiter/*`, `/admin/*`, `/api/*`).
  - Declares the sitemap link: `https://www.skillezo.com/sitemap.xml`.
* **Create `client/app/sitemap.ts`** (Next.js Dynamic XML Sitemap):
  - Automatically generates `https://www.skillezo.com/sitemap.xml` with HTTP 200.
  - Lists canonical URLs, `lastModified`, `changeFrequency`, and `priority`:
    - `/` (Priority: `1.0`, Change: `daily`)
    - `/privacy` (Priority: `0.5`, Change: `monthly`)
    - `/terms` (Priority: `0.5`, Change: `monthly`)

---

### Pillar 2: Master Metadata & Social Graph Overhaul (`layout.tsx`)
* **Update `client/app/layout.tsx` Metadata**:
  - **`metadataBase`**: `new URL("https://www.skillezo.com")`.
  - **Title Structure**:
    - Default: `"SKILLEZO.AI — Know Your Employability Score. Get Hired with AI Career Intelligence"`
    - Template: `"%s | SKILLEZO.AI"`
  - **Meta Description** (crafted for high Google Search CTR, ~155 chars):
    - `"AI career intelligence that benchmarks your profile against real hiring data. Calculate your Employability Index, verify skills cryptographically, and get hired faster."`
  - **Targeted High-Intent Keywords**:
    - `AI Career Intelligence`, `Employability Score`, `Resume Analyzer`, `Cryptographic Skill Verification`, `Job Readiness Index`, `Tech Recruitment`, `Career GPS`.
  - **Canonical URL**:
    ```typescript
    alternates: {
      canonical: "https://www.skillezo.com",
    },
    ```
  - **Crawler Directives (`robots`)**:
    ```typescript
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    ```
  - **Open Graph (Facebook / LinkedIn previews)**:
    - `type: "website"`, `locale: "en_US"`, `siteName: "SKILLEZO.AI"`, `url: "https://www.skillezo.com"`
    - High-res preview image (`1200x630`) with alt text.
  - **Twitter Card**:
    - `card: "summary_large_image"`
    - Title, description, creator, image.
  - **Search Console Verification Placeholder**:
    - Hook for `google-site-verification` token from Google Search Console.

---

### Pillar 3: Schema.org JSON-LD Structured Data (Rich Results)
We will create a reusable server component [`client/components/seo/JsonLd.tsx`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/components/seo/JsonLd.tsx) injecting structured micro-data:

1. **`Organization` Schema**:
   - Name: `SKILLEZO.AI`
   - Legal Entity: `DEVAADYA TECHNOLOGIES PRIVATE LIMITED` (via SkilledHyre Labs)
   - Logo: `https://www.skillezo.com/skillezo-logo.png`
   - URL: `https://www.skillezo.com`
   - SameAs: LinkedIn, Twitter/X, GitHub profiles.
2. **`WebSite` Schema**:
   - Name: `SKILLEZO.AI`
   - URL: `https://www.skillezo.com`
   - SearchAction / Query input hook.
3. **`SoftwareApplication` / `WebApplication` Schema**:
   - Operating System: `Web, Cloud`
   - Application Category: `BusinessApplication, Career Intelligence`
   - Offers: Free / Freemium pricing model.
   - Key Features: Employability Index Calculation, Cryptographic Skill Verification, AI Career GPS.
4. **`FAQPage` Schema**:
   - Injects structured Question & Answer pairs from the landing page FAQ section so Google Search displays rich expandable Q&A accordions directly below the search result snippet!

---

### Pillar 4: Brand Favicon & Web Manifest (Fixing the Generic Globe Icon)
Google Search displays a globe icon when it cannot find a high-res square brand icon associated with the domain.
* **Create `client/app/manifest.ts`** (Next.js Dynamic Web Manifest):
  - `name: "SKILLEZO.AI — Career Intelligence"`
  - `short_name: "SKILLEZO"`
  - `theme_color: "#0B1130"`
  - `background_color: "#0B1130"`
  - `display: "standalone"`
  - Multi-size icons (`192x192`, `512x512`).
* **Configure Metadata Icons**:
  - `icon: [{ url: "/favicon.ico" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }]`
  - `apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]`
* Place optimized PNG brand icons in `client/public/`.

---

### Pillar 5: Page-Level Canonical & Subpage Metadata
* **`/privacy/page.tsx`**: Add canonical URL, OpenGraph tags, and explicit `index: true` metadata.
* **`/terms/page.tsx`**: Add canonical URL, OpenGraph tags, and explicit `index: true` metadata.
* **Authenticated Routes (`/dashboard/*`, `/recruiter/*`)**: Add explicit `robots: { index: false, follow: false }` to prevent sensitive app routes from accidentally appearing in search indices.

---

### Pillar 6: Google Search Console Verification & Expedited Re-Indexation Guide
Once deployed, we will provide the exact 3-step action checklist to force Google to re-crawl the live URL immediately:
1. Add `google-site-verification` HTML meta tag to `layout.tsx`.
2. Submit `https://www.skillezo.com/sitemap.xml` in Google Search Console.
3. Use the **URL Inspection Tool** on `https://www.skillezo.com` and click **"Request Indexing"** to replace the outdated cache within 24–48 hours.

---

## 🚦 4. Execution Sequence & Dependencies

1. **Step 1**: Create `app/robots.ts` and `app/sitemap.ts`.
2. **Step 2**: Enhance `app/layout.tsx` with complete metadata, `metadataBase`, OpenGraph, Twitter, and canonical rules.
3. **Step 3**: Create `components/seo/JsonLd.tsx` and inject Organization, WebSite, SoftwareApplication, and FAQPage schemas.
4. **Step 4**: Create `app/manifest.ts` and configure touch icons in `public/`.
5. **Step 5**: Protect private routes (`/dashboard`, `/recruiter`) with `noindex` metadata.
6. **Step 6**: Validate TypeScript diagnostics with `npx tsc --noEmit` and verify live HTTP response with `curl`.
