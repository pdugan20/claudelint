# OG Image Generation

Implementation guide for per-page Open Graph image generation at build time.

## Background

When someone shares a claudelint link on Slack, Twitter, Discord, or iMessage, the platform fetches the page's `og:image` meta tag and displays a preview card. Without this, shared links appear as plain text.

Claude Code Docs achieves per-page OG cards through Mintlify, which uses `@vercel/og` (Satori-based) at the edge. Since claudelint is a static VitePress site, we replicate this at build time — same technology, different execution model.

## Architecture

### Pipeline

```text
VitePress pages (frontmatter + content)
    │
    ▼
scripts/generate-og-images.ts
    │
    ├──  For each page:
    │    │
    │    ├──  Extract: title, description, section/category
    │    │
    │    ├──  Check cache (SHA-256 of metadata + template version)
    │    │    └── If cached: skip generation
    │    │
    │    ├──  Render HTML template (inline flexbox styles)
    │    │
    │    ├──  satori-html  ──>  Satori VDOM
    │    │
    │    ├──  satori  ──>  SVG (1200x630)
    │    │
    │    ├──  @resvg/resvg-js  ──>  PNG
    │    │
    │    └──  Write to outDir/og/<slug>.png
    │
    └──  Done (~170 images)
```

### Integration Points

Two VitePress hooks are involved:

1. **`transformPageData`** (runs at build time per page) — injects `<meta property="og:image" content="/og/<slug>.png">` into each page's head
2. **`buildEnd`** or **separate script** — generates the actual PNG files after VitePress SSG finishes

### File Layout

```text
scripts/
  generate-og-images.ts     # Main generation script
  og-template.ts            # HTML template function
  fonts/
    SourceSerif4-Regular.ttf
    SourceSerif4-SemiBold.ttf

website/public/
  og-image.png              # Static fallback (homepage, etc.)

# Build output (git-ignored):
website/.vitepress/dist/og/
  guide-getting-started.png
  rules-skills-skill-name.png
  ...

# Cache (git-ignored):
.og-cache/
  <hash>.png
```

## Package Selection

### Core Stack

| Package | Purpose | Why This One |
|---------|---------|-------------|
| `satori` | HTML+CSS to SVG | Industry standard (Vercel), 13k stars, 474k downloads/wk. Same engine behind `@vercel/og`. |
| `@resvg/resvg-js` | SVG to PNG | Rust-based (fast), purpose-built companion to Satori. Faster and lighter than sharp for this use case. |
| `satori-html` | HTML string to Satori VDOM | Required because Satori expects React-like VDOM, not raw HTML. Bridges the gap for non-React frameworks. |

### Evaluated and Rejected

| Package | Why Not |
|---------|---------|
| `@vercel/og` | Designed for edge/serverless runtime, not build-time static generation. We use the same underlying libraries (`satori` + `resvg-js`) directly. |
| `@nolebase/vitepress-plugin-og-image` | Beta status, incomplete docs, ~173 downloads/wk. Too risky to depend on. |
| `vitepress-plugin-og-image` (ryohidaka) | 0 GitHub stars, minimal features. |
| `x-satori` | Vue SFC templates are nice but adds indirection. Direct `satori-html` usage is simpler and more debuggable. |
| `og-images-generator` | Solid wrapper but adds another abstraction layer over the same core libraries. Custom script gives us full control. |
| Puppeteer/Playwright | Full CSS support but extremely slow (seconds per image), requires Chromium binary (~400MB), heavy CI footprint. |
| `sharp` | General-purpose image processing, not specialized for SVG-to-PNG. `resvg-js` is faster for this specific task. |

## Template Design

### Satori Constraints

Satori uses the Yoga layout engine (same as React Native). It supports a subset of CSS:

**Supported**:

- `display: flex` / `display: none`
- All flexbox properties (`flex-direction`, `align-items`, `justify-content`, `gap`, `flex-wrap`, etc.)
- `position: absolute` / `relative`
- Margins, padding, borders, border-radius
- Colors, backgrounds (including `linear-gradient`)
- Typography (`font-size`, `font-weight`, `font-family`, `line-height`, `letter-spacing`, `text-align`)
- `opacity`, `box-shadow`, `overflow: hidden`
- `width`, `height`, `max-width`, `max-height`

**Not Supported**:

- `display: grid`
- `calc()`
- `z-index`
- CSS classes or `<style>` tags
- WOFF2 or variable fonts
- 3D transforms
- `text-overflow: ellipsis` (must truncate in JS)

### Template Function

The template takes page metadata and returns an HTML string:

```typescript
interface OgTemplateData {
  title: string;
  description: string;
  section?: string;     // e.g., "Guide", "Rules > Skills"
  logoSvg: string;      // Base64-encoded logo SVG
}

function renderOgTemplate(data: OgTemplateData): string {
  return `
    <div style="display: flex; flex-direction: column; width: 1200px; height: 630px; background: #1a1a19; padding: 60px; font-family: 'Source Serif 4', serif;">

      <!-- Header: logo + site name -->
      <div style="display: flex; align-items: center; gap: 12px;">
        <img src="${data.logoSvg}" width="40" height="40" />
        <span style="color: #a8a69d; font-size: 24px;">claudelint</span>
      </div>

      <!-- Section breadcrumb -->
      ${data.section ? `
        <div style="display: flex; margin-top: 40px;">
          <span style="color: #d97757; font-size: 20px;">${data.section}</span>
        </div>
      ` : ''}

      <!-- Title -->
      <div style="display: flex; margin-top: ${data.section ? '20px' : '60px'}; flex: 1;">
        <span style="color: #e8e6dc; font-size: 48px; font-weight: 600; line-height: 1.2; max-width: 900px;">
          ${truncate(data.title, 80)}
        </span>
      </div>

      <!-- Description -->
      ${data.description ? `
        <div style="display: flex; margin-top: 16px;">
          <span style="color: #a8a69d; font-size: 22px; line-height: 1.4; max-width: 900px;">
            ${truncate(data.description, 150)}
          </span>
        </div>
      ` : ''}

    </div>
  `;
}
```

Note: This is illustrative. The exact template will be refined during implementation. Text truncation must happen in JS since Satori does not support `text-overflow: ellipsis`.

## Caching Strategy

### Why Cache

Generating ~170 images at ~100-300ms each adds 17-50 seconds to the build. Most rebuilds change only a few pages, so regenerating all images is wasteful.

### How It Works

1. For each page, compute a cache key: `SHA-256(title + description + section + TEMPLATE_VERSION)`
2. Check if `.og-cache/<hash>.png` exists
3. If yes: copy cached file to output directory (near-instant)
4. If no: generate image, write to both output and cache

```typescript
import { createHash } from 'crypto';

const TEMPLATE_VERSION = '1';  // Bump when template changes

function getCacheKey(data: OgTemplateData): string {
  const content = `${data.title}|${data.description}|${data.section}|${TEMPLATE_VERSION}`;
  return createHash('sha256').update(content).digest('hex');
}
```

### Cache Location

- `.og-cache/` at repo root (git-ignored)
- Add to `.gitignore`: `.og-cache/`
- In CI: persist `.og-cache/` between builds for maximum benefit

### Invalidation

- Changing page title or description: new hash, regenerated
- Changing template design: bump `TEMPLATE_VERSION`, all images regenerated
- Changing fonts: bump `TEMPLATE_VERSION`

## Font Handling

### The Problem

The claudelint website uses Source Serif 4 for headings (loaded from Google Fonts as WOFF2). Satori cannot use WOFF2 or variable fonts — it requires static TTF, OTF, or WOFF files loaded as `ArrayBuffer`.

### The Solution

1. Download Source Serif 4 as static TTF files from [Google Fonts on GitHub](https://github.com/google/fonts/tree/main/ofl/sourceserif4)
2. Place in `scripts/fonts/` (not in `website/public/` — these are build-time only)
3. Load as buffers in the generation script

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

const fontsDir = join(__dirname, 'fonts');

const fonts = [
  {
    name: 'Source Serif 4',
    data: readFileSync(join(fontsDir, 'SourceSerif4-Regular.ttf')),
    weight: 400,
    style: 'normal' as const,
  },
  {
    name: 'Source Serif 4',
    data: readFileSync(join(fontsDir, 'SourceSerif4-SemiBold.ttf')),
    weight: 600,
    style: 'normal' as const,
  },
];
```

### Font Weights Needed

- **400 (Regular)**: Description text, breadcrumb
- **600 (SemiBold)**: Page title, site name

Only two font files needed. Keep it minimal to manage file size and memory.

## Slug Generation

Page paths are converted to flat slugs for the output filenames:

| Page path | Slug | Output file |
|-----------|------|-------------|
| `index.md` | (use fallback) | `og-image.png` (static) |
| `guide/getting-started.md` | `guide-getting-started` | `og/guide-getting-started.png` |
| `rules/overview.md` | `rules-overview` | `og/rules-overview.png` |
| `rules/skills/skill-name.md` | `rules-skills-skill-name` | `og/rules-skills-skill-name.png` |
| `api/claudelint-class.md` | `api-claudelint-class` | `og/api-claudelint-class.png` |
| `validators/claude-md.md` | `validators-claude-md` | `og/validators-claude-md.png` |

```typescript
function pagePathToSlug(relativePath: string): string {
  return relativePath
    .replace(/\.md$/, '')
    .replace(/\/index$/, '')
    .replace(/\//g, '-');
}
```

The same function is used in both the generation script and `transformPageData` to ensure paths match.

## Section Extraction

The section breadcrumb (e.g., "Rules > Skills") is derived from the page path:

```typescript
function getSection(relativePath: string): string | undefined {
  const parts = relativePath.replace(/\.md$/, '').split('/');
  if (parts.length <= 1) return undefined;

  const sectionMap: Record<string, string> = {
    guide: 'Guide',
    validators: 'Validators',
    rules: 'Rules',
    integrations: 'Integrations',
    api: 'API',
    development: 'Development',
  };

  const section = sectionMap[parts[0]];
  if (!section) return undefined;

  if (parts.length === 2) return section;

  // For nested paths like rules/skills/skill-name -> "Rules > Skills"
  const subsection = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).replace(/-/g, ' ');
  return `${section} > ${subsection}`;
}
```

## Build Integration

### Option A: Separate Script (recommended)

Run OG generation as a standalone step after VitePress build:

```json
{
  "scripts": {
    "docs:build": "npm run docs:generate && vitepress build website && npm run generate:og",
    "generate:og": "tsx scripts/generate-og-images.ts"
  }
}
```

The script reads the built HTML from `website/.vitepress/dist/` to discover pages, or reads the VitePress config/content loader directly.

**Pros**: Easy to run independently, easy to debug, no coupling to VitePress internals.

### Option B: VitePress `buildEnd` Hook

```typescript
// website/.vitepress/config.mts
async buildEnd(siteConfig) {
  const { generateOgImages } = await import('../../scripts/generate-og-images');
  await generateOgImages(siteConfig.outDir, siteConfig.pages);
}
```

**Pros**: Single build command, access to VitePress site config and page list.
**Cons**: Tighter coupling, harder to run in isolation.

### Recommendation

Start with **Option A** (separate script). It's easier to develop, test, and debug. If the integration feels clunky, refactor into a `buildEnd` hook later.

## Performance Expectations

| Pages | Est. Time (uncached) | Est. Time (cached, no changes) |
|-------|---------------------|-------------------------------|
| 10 | 1-3s | <1s |
| 50 | 5-15s | <1s |
| 170 | 17-50s | <1s |
| 500 | 50-150s | <1s |

With ~170 pages, expect **17-50 seconds** on a clean build. With caching, rebuilds that change only a few pages will add **<5 seconds**.

## Testing the Template

During development, test the template without running the full build:

```bash
# Generate a single test image
tsx scripts/generate-og-images.ts --test "Getting Started" "Install and configure claudelint" "Guide"
```

The `--test` flag renders one image with the provided title/description/section and opens it, skipping the full page iteration.

## Packages Reference

```bash
npm install -D satori @resvg/resvg-js satori-html
```

| Package | Version | Size | License |
|---------|---------|------|---------|
| `satori` | ^0.12.x | ~2MB (includes Yoga WASM) | MPL-2.0 |
| `@resvg/resvg-js` | ^2.x | ~8MB (includes Rust binary) | MPL-2.0 |
| `satori-html` | ^0.3.x | ~5KB | MIT |

Total added to `node_modules`: ~10MB (dev dependencies only, not shipped to users).
