# Branding & Assets Tracker

**Start Date**: 2026-02-14
**Status**: Phase 1 (nearly complete)

Track progress through each phase of branding and asset implementation.

---

## Phase 1: Logo Design

**Goal**: Create the core logo mark and wordmark
**Deliverable**: Finalized SVG logo files

### Logo Concept

- [x] Decide on logo concept/direction
  - [x] Sketch or describe 2-3 concepts
  - [x] Select final direction
- [x] Determine if logo is icon-only, wordmark-only, or icon + wordmark

### Logo Creation

- [x] Create primary logo SVG (works on light backgrounds)
- [x] Create dark variant SVG (works on dark backgrounds)
- [x] Verify logo is legible at 24px height (nav bar size)
- [ ] Verify logo is recognizable at 16x16 (favicon size)
- [x] Test logo against both light (`#faf9f5`) and dark (`#1a1a19`) backgrounds

### Color Validation

- [x] Logo uses colors from existing palette
  - Primary: terracotta `#d97757` / `#e08b6e`
  - Neutral: near-black `#1a1a19` / warm off-white `#faf9f5`
- [x] Logo works in monochrome (single color)

**Phase 1 Complete**: (10/11 tasks)

---

## Phase 2: Favicon Set

**Goal**: Generate complete favicon set from logo
**Deliverable**: All favicon files in `website/public/`

### Generate Favicons

- [ ] Export favicon source at 512x512 PNG from logo mark
- [ ] Generate `favicon.ico` (contains 16x16 and 32x32)
- [ ] Generate `favicon-16x16.png`
- [ ] Generate `favicon-32x32.png`
- [ ] Generate `apple-touch-icon.png` (180x180)
- [ ] Generate `android-chrome-192x192.png`
- [ ] Generate `android-chrome-512x512.png`

### Web Manifest

- [ ] Create `site.webmanifest` with icon references
  - [ ] Name: "claudelint"
  - [ ] Short name: "claudelint"
  - [ ] Theme color: `#1a1a19`
  - [ ] Background color: `#faf9f5`
  - [ ] Icon entries for 192x192 and 512x512

### Place Files

- [ ] All favicon files placed in `website/public/`
- [ ] Verify `favicon.ico` replaces the missing one already referenced in config

**Phase 2 Complete**: ( /11 tasks)

---

## Phase 3: Per-Page OG Image Generation

**Goal**: Build a build-time pipeline that generates unique OG images for every page
**Deliverable**: Every page gets a 1200x630 PNG with its title, description, and section breadcrumb

### Dependencies

- [ ] Install `satori` (JSX/HTML to SVG)
- [ ] Install `@resvg/resvg-js` (SVG to PNG, Rust-based)
- [ ] Install `satori-html` (HTML string to Satori-compatible VDOM)
- [ ] Download Source Serif 4 font as TTF/OTF for Satori (Google Fonts only serves WOFF2; Satori needs TTF/OTF/WOFF)
  - [ ] Place font file(s) in `scripts/fonts/` or similar non-public location

### OG Template Design

- [ ] Design the HTML+inline-CSS template (flexbox only, Satori constraints)
  - [ ] Dark background (`#1a1a19` or gradient)
  - [ ] Logo mark in upper-left
  - [ ] "claudelint" site name in muted text
  - [ ] Section breadcrumb in terracotta accent (e.g., "Rules > Skills")
  - [ ] Page title — large, white, serif font
  - [ ] Page description — smaller, muted color
  - [ ] Clean layout matching site aesthetic
- [ ] Verify template renders correctly with Satori (test with a sample page)
- [ ] Test at thumbnail size (~300px wide) for readability

### Build Script (`scripts/generate-og-images.ts`)

- [ ] Create script that iterates all pages via VitePress `createContentLoader` or site config
- [ ] Extract per-page metadata: title, description, section/category
- [ ] Render HTML template with page data
- [ ] Convert via pipeline: `satori-html` -> `satori` -> `@resvg/resvg-js` -> PNG
- [ ] Write PNGs to `outDir/og/<slug>.png` (e.g., `og/guide-getting-started.png`)
- [ ] Implement content-hash caching:
  - [ ] Hash page title + description + template version with SHA-256
  - [ ] Store cache in `.og-cache/` (git-ignored)
  - [ ] Skip regeneration when hash matches existing cached file
- [ ] Add `npm run generate:og` script to `package.json`

### Static Fallback

- [ ] Create `og-image.png` (1200x630) as a static default for pages without generated images
  - [ ] Same design as template but with generic "claudelint" branding + tagline
  - [ ] Place in `website/public/og-image.png`

### VitePress Hook Integration

- [ ] Wire into `buildEnd` hook to generate images after SSG
- [ ] Wire into `transformHead` hook to inject per-page `<meta property="og:image">` tags
- [ ] Integrate into `npm run docs:build` pipeline

### Testing

- [ ] Run full build — all ~170 pages generate OG images
- [ ] Verify build time impact is acceptable (target: <60s additional)
- [ ] Spot-check 5 generated PNGs for visual quality
- [ ] Preview with opengraph.xyz or similar debugger
- [ ] Verify fallback `og-image.png` is used for homepage / pages without specific images

**Phase 3 Complete**: ( /22 tasks)

---

## Phase 4: VitePress Configuration

**Goal**: Wire up all assets in VitePress config
**Deliverable**: All meta tags, logo config, and head tags configured

### Head Tags (`config.mts`)

- [ ] Update existing favicon link to include full set:
  - [ ] `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">`
  - [ ] `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">`
  - [ ] `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`
  - [ ] `<link rel="manifest" href="/site.webmanifest">`
- [ ] Add static fallback OG image meta tag (for pages not yet generated):
  - [ ] `<meta property="og:image" content="https://claudelint.com/og-image.png">`
  - [ ] `<meta property="og:image:width" content="1200">`
  - [ ] `<meta property="og:image:height" content="630">`
  - [ ] `<meta property="og:image:alt" content="claudelint - The linter for Claude Code">`
- [ ] Add Twitter card meta tags:
  - [ ] `<meta name="twitter:card" content="summary_large_image">`
- [ ] Add theme-color meta tag:
  - [ ] `<meta name="theme-color" content="#1a1a19">`

### Theme Config (`config.mts`)

- [ ] Add logo to nav bar:
  - [ ] `themeConfig.logo` with light/dark variants
  - [ ] Verify logo renders inline next to "claudelint" text
  - [ ] Test both light and dark mode appearance

### Per-Page OG in `transformHead`

- [ ] Inject per-page `og:image` pointing to generated PNG (e.g., `/og/guide-getting-started.png`)
- [ ] Inject per-page `twitter:image` matching the `og:image` path
- [ ] Inject per-page `og:image:alt` from page title
- [ ] Verify canonical URLs still work correctly after changes

### Testing

- [ ] `npm run docs:build` succeeds with all new config
- [ ] `npm run docs:dev` — verify favicon appears in browser tab
- [ ] `npm run docs:dev` — verify logo appears in nav bar (light mode)
- [ ] `npm run docs:dev` — verify logo appears in nav bar (dark mode)
- [ ] View page source — verify all meta tags render correctly

**Phase 4 Complete**: ( /20 tasks)

---

## Phase 5: Validation & Polish

**Goal**: End-to-end verification across platforms
**Deliverable**: Confirmed working favicons, nav logo, and social cards

### Cross-Browser Favicon Check

- [ ] Chrome — favicon in tab
- [ ] Safari — favicon in tab + favorites
- [ ] Firefox — favicon in tab
- [ ] Edge — favicon in tab

### Nav Bar Logo Check

- [ ] Desktop: logo + "claudelint" text aligned properly
- [ ] Mobile: logo visible in hamburger/collapsed nav
- [ ] Light mode: logo contrast is good
- [ ] Dark mode: logo contrast is good

### Social Sharing Validation

- [ ] Share claudelint.com link on Slack — rich card with OG image appears
- [ ] Share claudelint.com link on Twitter/X — card with image appears
- [ ] Share claudelint.com link on Discord — embed with image appears
- [ ] Share a subpage (e.g., /guide/getting-started) — per-page card with page title appears
- [ ] Share a rule page (e.g., /rules/skills/skill-name) — per-page card with rule title appears

### Lighthouse Audit

- [ ] Run Lighthouse on homepage
- [ ] Verify no performance regression from new assets
- [ ] Verify no SEO warnings about missing meta tags

### Cleanup

- [ ] Update design.md assets checklist (mark items complete)
- [ ] Update VitePress implementation-tracker.md Phase 5 og:image task
- [ ] Remove any temporary/draft files

**Phase 5 Complete**: ( /16 tasks)

---

## Overall Progress

### By Phase

- [ ] Phase 1: Logo Design (10/11)
- [ ] Phase 2: Favicon Set (0/11)
- [ ] Phase 3: Per-Page OG Image Generation (0/22)
- [ ] Phase 4: VitePress Configuration (0/20)
- [ ] Phase 5: Validation & Polish (0/16)

**Total**: 10/80 tasks (12%)

---

## Dependencies Between Phases

```text
Phase 1 (Logo) ──┬──> Phase 2 (Favicons)
                  │
                  └──> Phase 3 (OG Images) ── uses logo in template
                                │
Phase 2 ────────────────────────┼──> Phase 4 (Config) ──> Phase 5 (Validation)
Phase 3 ────────────────────────┘
```

- Phase 1 blocks Phases 2 and 3 (logo is needed for favicons and OG template)
- Phases 2 and 3 can run in parallel once the logo exists
- Phase 4 requires all assets from Phases 2 and 3
- Phase 5 requires Phase 4

## Notes

- The existing `config.mts` already references `/favicon.ico` but the file is missing
- The VitePress implementation tracker (Phase 5) has an open task for `og:image` — this project fulfills that
- OG images are generated at build time using `satori` + `@resvg/resvg-js` + `satori-html`
- Claude Code Docs achieves per-page OG cards via Mintlify (which uses `@vercel/og` at the edge); we replicate the same result at build time
- Satori only supports flexbox layout and inline styles — the OG template must be designed within these constraints
- Font files must be TTF/OTF/WOFF (no WOFF2) — Source Serif 4 needs to be downloaded as TTF from Google Fonts
- Content-hash caching prevents regenerating unchanged images on rebuild
