# Branding & Assets Tracker

**Start Date**: 2026-02-14
**Status**: Archived (2026-02-17)

> Remaining tasks (OG thumbnail test, opengraph.xyz preview, logo at 16x16) rolled into
> [VitePress implementation tracker](../vitepress-docs/implementation-tracker.md) Phase 6.

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

- [x] Export favicon source at 512x512 PNG from logo mark
- [x] Generate `favicon.ico` (contains 16x16 and 32x32)
- [x] Generate `favicon-16x16.png`
- [x] Generate `favicon-32x32.png`
- [x] Generate `apple-touch-icon.png` (180x180)
- [x] Generate `android-chrome-192x192.png`
- [x] Generate `android-chrome-512x512.png`

### Web Manifest

- [x] Create `site.webmanifest` with icon references
  - [x] Name: "claudelint"
  - [x] Short name: "claudelint"
  - [x] Theme color: `#1a1a19`
  - [x] Background color: `#faf9f5`
  - [x] Icon entries for 192x192 and 512x512

### Place Files

- [x] All favicon files placed in `website/public/`
- [x] Verify `favicon.ico` replaces the missing one already referenced in config

**Phase 2 Complete**: (11/11 tasks)

---

## Phase 3: Page Metadata & SEO

**Goal**: Ensure every page has meaningful title, description, and meta tags for search engines and social sharing
**Deliverable**: All pages have proper frontmatter; `transformPageData` injects complete meta tags

### Rule Page Generator

- [x] Update `scripts/generators/rule-page.ts` to emit YAML frontmatter
  - [x] `description:` from `meta.description` (e.g., "SKILL.md body should not exceed 500 lines")
- [x] Regenerate all rule pages with `npm run docs:generate`
- [x] Verify generated pages have frontmatter in output

### Hand-Written Page Descriptions (46 pages)

Add `description:` frontmatter to all manually authored pages.
Each description: 1-2 sentences, action-oriented, under 160 characters.

#### Homepage

- [x] `index.md` — use hero tagline as description

#### Guide (10 pages)

- [x] `guide/getting-started.md`
- [x] `guide/why-claudelint.md`
- [x] `guide/configuration.md`
- [x] `guide/cli-reference.md`
- [x] `guide/file-discovery.md`
- [x] `guide/auto-fix.md`
- [x] `guide/inline-disables.md`
- [x] `guide/rules-overview.md`
- [x] `guide/troubleshooting.md`
- [x] `guide/glossary.md`

#### Validators (11 pages)

- [x] `validators/overview.md`
- [x] `validators/claude-md.md`
- [x] `validators/skills.md`
- [x] `validators/settings.md`
- [x] `validators/hooks.md`
- [x] `validators/mcp.md`
- [x] `validators/plugin.md`
- [x] `validators/agents.md`
- [x] `validators/lsp.md`
- [x] `validators/output-styles.md`
- [x] `validators/commands.md`

#### Integrations (8 pages)

- [x] `integrations/overview.md`
- [x] `integrations/ci.md`
- [x] `integrations/pre-commit.md`
- [x] `integrations/npm-scripts.md`
- [x] `integrations/claude-code-plugin.md`
- [x] `integrations/monorepos.md`
- [x] `integrations/sarif.md`
- [x] `integrations/faq-mockups.md`

#### API (7 pages)

- [x] `api/overview.md`
- [x] `api/claudelint-class.md`
- [x] `api/functional-api.md`
- [x] `api/types.md`
- [x] `api/schemas.md`
- [x] `api/formatters.md`
- [x] `api/recipes.md`

#### Development (9 pages)

- [x] `development/overview.md`
- [x] `development/design-philosophy.md`
- [x] `development/architecture.md`
- [x] `development/rule-system.md`
- [x] `development/internals.md`
- [x] `development/custom-rules.md`
- [x] `development/custom-rules-troubleshooting.md`
- [x] `development/helper-library.md`
- [x] `development/contributing.md`

#### Rules (1 page)

- [x] `rules/overview.md`

### Global Head Tags (`config.mts`)

- [x] Add `<meta property="og:site_name" content="claudelint">`
- [x] Add `<meta name="twitter:card" content="summary_large_image">`
- [x] Add default `<meta property="og:image" content="https://claudelint.com/og-image.png">`
- [x] Add default `<meta property="og:image:width" content="1200">`
- [x] Add default `<meta property="og:image:height" content="630">`

### Per-Page Meta Tags (`transformPageData`)

Extend the existing hook (currently sets `og:title`, `og:description`, `og:url`, `canonical`):

- [x] Add `<meta name="description">` per page (for Google search snippets — currently missing entirely)
- [x] Add `<meta property="og:type">` — `article` for content pages, `website` for homepage
- [x] Add `<meta property="og:image:alt">` from page title
- [x] Add `<meta name="twitter:title">` mirroring `og:title`
- [x] Add `<meta name="twitter:description">` mirroring `og:description`

### Audit

- [x] Verify all ~170 pages have non-empty `description` in frontmatter or derived from content
- [x] Verify `<meta name="description">` renders in page source for 5 sample pages
- [x] Verify `og:title` format follows convention: `{title} | claudelint`
- [x] Verify rule pages use rule ID as title, `meta.description` as description

**Phase 3 Complete**: (60/60 tasks)

---

## Phase 4: OG Image Generation

**Goal**: Build a build-time pipeline that generates unique OG images for every page
**Deliverable**: Every page gets a 1200x630 PNG with its title, description, and section breadcrumb

### Dependencies

- [x] Install `satori` (JSX/HTML to SVG)
- [x] Install `@resvg/resvg-js` (SVG to PNG, Rust-based)
- [x] Download Inter and Source Serif 4 fonts as TTF for Satori
  - [x] Place font files in `scripts/fonts/`

### OG Template Design

- [x] Design the HTML+inline-CSS template (flexbox only, Satori constraints)
  - [x] Gradient background: `moderate-tr` (`linear-gradient(225deg, #3a2518, #251a14, #1a1a19)`)
  - [x] Logo mark (site logo) in upper-left
  - [x] "Claudelint Docs" site name in Source Serif 4, muted text
  - [x] Section breadcrumb in terracotta accent (e.g., "Rules / Skills")
  - [x] Page title — large, white, serif font (72px)
  - [x] Page description — smaller, muted color (30px), max 2 lines
  - [x] Content anchored to bottom with padding
- [x] Verify template renders correctly with Satori (test-og.ts)
- [ ] Test at thumbnail size (~300px wide) for readability

### OG Image Content Per Page Type

| Page type | Section line | Title | Description |
|-----------|-------------|-------|-------------|
| Rule pages | `Rules / {category}` | Rule ID | `meta.description` |
| Guide pages | `Guide` | H1 title | Frontmatter description |
| Integration pages | `Integrations` | H1 title | Frontmatter description |
| API pages | `API` | H1 title | Frontmatter description |
| Validator pages | `Validators` | H1 title | Frontmatter description |
| Development pages | `Development` | H1 title | Frontmatter description |
| Homepage | *(none)* | "The linter for Claude Code" | Tagline |

### Build Script (`scripts/generate/og-images.ts`)

- [x] Create script that iterates all VitePress pages
- [x] Extract per-page metadata: title, description, section/category
- [x] Map file paths to section display names
- [x] Render via pipeline: satori VDOM -> satori (SVG) -> resvg (PNG)
- [x] Write PNGs to `website/public/og/{slug}.png`
- [x] Implement content-hash caching:
  - [x] Hash page title + description + template version with SHA-256
  - [x] Store cache in `.og-cache/` (git-ignored)
  - [x] Skip regeneration when hash matches existing cached file
- [x] Add `npm run generate:og` script to `package.json`

### Static Fallback

- [x] Create `og-image.png` (1200x630) as a static default
  - [x] Same design as template but with generic "claudelint" branding + tagline
  - [x] Place in `website/public/og-image.png`

### VitePress Integration

- [x] Add per-page `og:image` injection in `transformPageData` pointing to generated PNG
- [x] Add per-page `twitter:image` matching the `og:image` path
- [x] Integrate `generate:og` into `npm run docs:build` pipeline

### Testing

- [x] Run full build — all ~170 pages generate OG images
- [x] Verify build time impact is acceptable (target: <60s additional)
- [x] Spot-check 5 generated PNGs for visual quality
- [ ] Preview with opengraph.xyz or similar debugger
- [x] Verify fallback `og-image.png` is used for homepage

**Phase 4 Complete**: (18/19 tasks)

---

## Phase 5: VitePress Configuration Cleanup

**Goal**: Verify all config items are wired up correctly
**Deliverable**: All head tags, logo config, and meta tags confirmed working

### Head Tags (`config.mts`)

Items already completed in Phases 2-3:

- [x] Favicon link set (32x32, 16x16, apple-touch-icon, manifest)
- [x] Theme-color meta tag
- [x] OG type, title, description (static fallbacks)

Remaining:

- [x] Verify no duplicate or conflicting meta tags after Phase 3 changes
- [x] Verify static fallback OG tags don't conflict with per-page overrides

### Theme Config

- [x] Logo in nav bar with light/dark variants
- [x] Logo renders inline next to "claudelint" text

### Per-Page OG Verification

- [x] Verify per-page `og:image` overrides the static fallback correctly
- [x] Verify canonical URLs still work correctly after all changes
- [x] View page source on 3 different page types — confirm all meta tags render

### Testing

- [x] `npm run docs:build` succeeds with all config changes
- [ ] `npm run docs:dev` — verify favicon appears in browser tab
- [ ] `npm run docs:dev` — verify logo appears in nav bar (light and dark mode)

**Phase 5 Complete**: (11/13 tasks)

---

## Phase 6: Validation & Polish

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

### SEO Validation

- [ ] Google Search Console — verify no crawl errors after changes
- [ ] Check that `<meta name="description">` appears in Google snippets (may take days to index)
- [ ] Verify sitemap includes all pages

### Lighthouse Audit

- [ ] Run Lighthouse on homepage
- [ ] Verify no performance regression from new assets
- [ ] Verify no SEO warnings about missing meta tags

### Cleanup

- [ ] Update design.md assets checklist (mark items complete)
- [ ] Update VitePress implementation-tracker.md Phase 5 og:image task
- [x] Remove any temporary/draft files (`scripts/test-og.ts`, `scripts/generate-favicons.ts` moved to `scripts/generate/favicons.ts`)

**Phase 6 Complete**: ( /19 tasks)

---

## Overall Progress

### By Phase

- [ ] Phase 1: Logo Design (10/11)
- [x] Phase 2: Favicon Set (11/11)
- [x] Phase 3: Page Metadata & SEO (60/60)
- [ ] Phase 4: OG Image Generation (18/19)
- [ ] Phase 5: VitePress Configuration Cleanup (11/13)
- [ ] Phase 6: Validation & Polish (1/19)

**Total**: 116/133 tasks (87%)

---

## Dependencies Between Phases

```text
Phase 1 (Logo) ──┬──> Phase 2 (Favicons)
                  │
                  └──> Phase 3 (Metadata) ── descriptions feed OG images
                                │
                  Phase 3 ──────┼──> Phase 4 (OG Images) ── uses page metadata
                                │
Phase 2 ────────────────────────┼──> Phase 5 (Config Cleanup)
Phase 4 ────────────────────────┘         │
                                          └──> Phase 6 (Validation)
```

- Phase 1 blocks Phases 2 and 3 (logo needed for favicons and OG template)
- Phase 3 blocks Phase 4 (page descriptions must exist before OG images can render them)
- Phases 2, 3, and 4 feed into Phase 5 (config verification)
- Phase 5 blocks Phase 6 (everything must be wired up before validation)

## Notes

- The existing `config.mts` already has favicon links, logo config, and basic OG tags configured
- The VitePress implementation tracker (Phase 5) has an open task for `og:image` — this project fulfills that
- OG images are generated at build time using `satori` + `@resvg/resvg-js`
- OG template uses `moderate-tr` gradient chosen through visual iteration
- Claude Code Docs achieves per-page OG cards via Mintlify (which uses `@vercel/og` at the edge); we replicate the same result at build time
- Satori only supports flexbox layout and inline styles — the OG template must be designed within these constraints
- Font files must be TTF/OTF/WOFF (no WOFF2) — Source Serif 4 and Inter downloaded as TTF
- Content-hash caching prevents regenerating unchanged images on rebuild
- Rule page H1s use the rule ID (e.g., `skill-body-too-long`) matching ESLint/Stylelint/Biome convention
- `<meta name="description">` now populated for all pages (fixed in Phase 3)
- `twitter:card` and `twitter:image` now set for all pages (fixed in Phases 3-4)
- `generate-favicons.ts` moved from `scripts/` root to `scripts/generate/favicons.ts`
- `test-og.ts` removed (iteration scratch file, replaced by `scripts/generate/og-images.ts`)
