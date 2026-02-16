# Asset Specifications

Detailed specifications for every branding asset needed.

## Color Reference

From `website/.vitepress/theme/style.css`:

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Brand/text | `#1a1a19` | `#e8e6dc` | Nav, sidebar, links |
| Background | `#faf9f5` | `#1a1a19` | Page background |
| Terracotta | `#d97757` | `#e08b6e` | Hero gradient, accent (sparingly) |
| Terracotta dark | `#c4683f` | `#d97757` | Gradient end |
| Secondary text | `#5c5a52` | `#a8a69d` | Body text |
| Border | `#e8e6dc` | `#3a3830` | Dividers |

---

## 1. Logo SVG (Nav Bar)

**Purpose**: Displayed inline in the VitePress nav bar next to the "claudelint" site title.

**Requirements**:

- Format: SVG (vector, scalable)
- Target display height: ~24px in nav bar
- Must be legible and recognizable at this small size
- Two variants needed:
  - `logo.svg` — for light backgrounds (dark mark)
  - `logo-dark.svg` — for dark backgrounds (light mark)
- No text in the SVG (VitePress shows the site title separately)
- Simple, clean mark — avoid fine detail that disappears at small sizes
- Should feel warm and professional, matching the site's Anthropic-inspired aesthetic

**VitePress Config**:

```typescript
themeConfig: {
  logo: {
    light: '/logo.svg',
    dark: '/logo-dark.svg',
  },
}
```

**File locations**:

- `website/public/logo.svg`
- `website/public/logo-dark.svg`

---

## 2. Favicon Set

**Purpose**: Browser tab icon, bookmarks, home screen shortcuts.

All favicons are derived from the logo mark. Use a tool like [RealFaviconGenerator](https://realfavicongenerator.net/) or export manually from the source SVG.

### favicon.ico

- Format: ICO (multi-resolution container)
- Contains: 16x16 and 32x32 bitmaps
- Location: `website/public/favicon.ico`
- Note: This file is already referenced in `config.mts` but currently missing

### favicon-16x16.png

- Format: PNG
- Dimensions: 16x16
- Location: `website/public/favicon-16x16.png`
- Use: Modern browsers that prefer PNG

### favicon-32x32.png

- Format: PNG
- Dimensions: 32x32
- Location: `website/public/favicon-32x32.png`
- Use: High-DPI browser tabs

### apple-touch-icon.png

- Format: PNG
- Dimensions: 180x180
- Location: `website/public/apple-touch-icon.png`
- Use: iOS "Add to Home Screen" bookmark
- Note: Should have slight padding around the mark (Apple adds rounding)

### android-chrome-192x192.png

- Format: PNG
- Dimensions: 192x192
- Location: `website/public/android-chrome-192x192.png`
- Use: Android home screen shortcut, PWA icon

### android-chrome-512x512.png

- Format: PNG
- Dimensions: 512x512
- Location: `website/public/android-chrome-512x512.png`
- Use: Android PWA splash screen, high-res icon

---

## 3. Web Manifest

**Purpose**: PWA metadata linking icon files and defining app appearance.

**File**: `website/public/site.webmanifest`

**Contents**:

```json
{
  "name": "claudelint",
  "short_name": "claudelint",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#1a1a19",
  "background_color": "#faf9f5",
  "display": "standalone"
}
```

---

## 4. OG Images (Per-Page Social Sharing Cards)

**Purpose**: Preview images shown when someone shares a claudelint link on Slack, Twitter, Discord, iMessage, LinkedIn, etc. Each page gets its own unique card with the page title and section context.

**How Claude Code Docs does it**: Their site is built on Mintlify, which uses `@vercel/og` (Satori-based) at the edge to generate per-page cards on demand. We replicate this result at build time using the same underlying technology (Satori).

### Static Fallback Image

- Format: PNG
- Dimensions: 1200x630
- Location: `website/public/og-image.png`
- Use: Default for homepage and any page without a generated image
- Design: dark background, logo, "claudelint", tagline

### Per-Page Generated Images

- Format: PNG
- Dimensions: 1200x630
- Location: Generated into `outDir/og/<slug>.png` during build (e.g., `og/guide-getting-started.png`)
- File size target: under 200KB each
- Total: ~170 images (one per page)

### Template Design Spec

The template is an HTML string with inline flexbox styles (Satori constraint). Layout:

```text
 ┌────────────────────────────────────────────────────┐
 │                                                    │
 │  [logo]  claudelint                                │
 │                                                    │
 │  Guide > Getting Started          (section crumb)  │
 │                                                    │
 │  Getting Started with              (page title)    │
 │  claudelint                                        │
 │                                                    │
 │  Install, configure, and run       (description)   │
 │  your first validation.                            │
 │                                                    │
 └────────────────────────────────────────────────────┘
```

**Visual details**:

- Background: `#1a1a19` (near-black), optionally with subtle gradient
- Logo mark: upper-left, ~40-60px
- "claudelint" text: next to logo, muted (`#a8a69d`), small
- Section breadcrumb: terracotta (`#d97757`), medium size
- Page title: white/cream (`#e8e6dc`), large, Source Serif 4 font
- Description: muted (`#a8a69d`), smaller
- Optional: subtle terracotta accent line at top or bottom

**Satori constraints** (must follow these):

- Flexbox only (`display: flex` on every container)
- Inline styles only (no CSS classes, no `<style>` tags)
- No CSS Grid, no `calc()`, no `z-index`
- Fonts must be TTF/OTF/WOFF (no WOFF2, no variable fonts)
- Images must be base64 data URIs or absolute URLs with explicit width/height

### Generation Pipeline

```text
Page metadata (title, description, section)
    │
    ▼
HTML template string (inline flexbox styles)
    │
    ▼
satori-html  ──>  Satori-compatible VDOM
    │
    ▼
satori  ──>  SVG (1200x630)
    │
    ▼
@resvg/resvg-js  ──>  PNG
    │
    ▼
Write to outDir/og/<slug>.png
```

### Required Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `satori` | latest | HTML+CSS to SVG via Yoga layout engine |
| `@resvg/resvg-js` | latest | SVG to PNG via Rust (fast, no Chromium) |
| `satori-html` | latest | Plain HTML strings to Satori VDOM (needed since we use Vue, not React) |

Install as dev dependencies:

```bash
npm install -D satori @resvg/resvg-js satori-html
```

### Font Files

Satori requires font data as `ArrayBuffer`. Google Fonts serves Source Serif 4 as WOFF2 which Satori cannot read.

**Action**: Download Source Serif 4 TTF files from Google Fonts and place in the repo:

```text
scripts/fonts/
  SourceSerif4-Regular.ttf
  SourceSerif4-SemiBold.ttf
```

Load in the generation script:

```typescript
const fontRegular = fs.readFileSync('scripts/fonts/SourceSerif4-Regular.ttf');
const fontBold = fs.readFileSync('scripts/fonts/SourceSerif4-SemiBold.ttf');
```

---

## 5. File Tree (Final State)

After all assets are created:

```text
website/public/
  android-chrome-192x192.png
  android-chrome-512x512.png
  apple-touch-icon.png
  favicon-16x16.png
  favicon-32x32.png
  favicon.ico
  logo.svg
  logo-dark.svg
  og-image.png              (static fallback)
  robots.txt                (already exists)
  site.webmanifest

# Generated at build time (written to .vitepress/dist/):
.vitepress/dist/og/
  guide-getting-started.png
  guide-configuration.png
  rules-skills-skill-name.png
  ... (~170 files)

# Font files (not public, used by generation script):
scripts/fonts/
  SourceSerif4-Regular.ttf
  SourceSerif4-SemiBold.ttf

# Build cache (git-ignored):
.og-cache/
  <sha256-hash>.png
```

---

## 6. Generation Tools

### From SVG to Favicon Set

#### Option A: RealFaviconGenerator (recommended)

1. Go to <https://realfavicongenerator.net/>
2. Upload the logo SVG or a 512x512 PNG export
3. Configure settings per platform
4. Download the generated package
5. Place files in `website/public/`

#### Option B: Manual with sharp/Inkscape

```bash
# Using sharp (Node.js)
npx sharp-cli -i logo-512.png -o favicon-16x16.png resize 16 16
npx sharp-cli -i logo-512.png -o favicon-32x32.png resize 32 32
npx sharp-cli -i logo-512.png -o apple-touch-icon.png resize 180 180
npx sharp-cli -i logo-512.png -o android-chrome-192x192.png resize 192 192
```

#### Option C: Figma/design tool

Export at each required size from the design file.

### For ICO File

The `.ico` format requires a specific tool:

```bash
# Using png-to-ico
npx png-to-ico favicon-16x16.png favicon-32x32.png > favicon.ico
```

Or use RealFaviconGenerator which handles this automatically.

### For OG Images

See [og-image-generation.md](./og-image-generation.md) for the complete implementation guide.
