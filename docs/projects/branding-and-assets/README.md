# Branding & Assets Project

Create logo, favicon, social sharing assets, and integrate them into the claudelint website.

## Project Overview

**Goal**: Establish visual brand identity for claudelint with a logo, complete favicon set, per-page OG image generation, and all necessary VitePress configuration
**Start Date**: 2026-02-14
**Status**: Phase 1 (Logo Design)

## Problem

The claudelint website currently has:

- No logo (nav bar shows only the text "claudelint")
- A missing favicon (configured in `config.mts` but file doesn't exist - browsers get a 404)
- No `og:image` meta tag, so shared links on Slack/Twitter/Discord show no preview card (Claude Code Docs shows rich per-page cards via Mintlify's built-in generation)
- No `twitter:card` meta tags
- No Apple touch icon or PWA icons
- No web manifest

When someone shares a claudelint link, it looks bare compared to sites like Claude Code Docs which show a rich card with logo, title, and description.

## Design Context

The website already has a well-defined visual identity:

- **Terracotta accent**: `#d97757` (light) / `#e08b6e` (dark)
- **Near-black**: `#1a1a19`
- **Warm off-white**: `#faf9f5`
- **Heading font**: Source Serif 4 (serif)
- **Body font**: System stack (sans-serif)
- **Code font**: System monospace

The logo should feel natural alongside this warm, Anthropic-inspired palette.

## Project Documents

### [tracker.md](./tracker.md)

Phase-by-phase task tracking with checkboxes. The centralized tracker for this project.

### [asset-spec.md](./asset-spec.md)

Detailed specifications for every asset needed: dimensions, formats, color requirements, and where each file goes.

### [og-image-generation.md](./og-image-generation.md)

Implementation guide for the per-page OG image generation pipeline: architecture, package selection, template design, VitePress hook integration, caching strategy, and font handling.

### [config-changes.md](./config-changes.md)

Exact VitePress configuration changes needed in `config.mts` to wire up all assets (head tags, theme config, OG meta, build hooks).

## Quick Reference

### Assets Summary

| Asset | Format | Dimensions | Location |
|-------|--------|-----------|----------|
| Logo (nav bar) | SVG | ~24px height | `website/public/logo.svg` |
| Logo dark variant | SVG | ~24px height | `website/public/logo-dark.svg` |
| favicon.ico | ICO | 16x16 + 32x32 | `website/public/favicon.ico` |
| favicon-16x16.png | PNG | 16x16 | `website/public/favicon-16x16.png` |
| favicon-32x32.png | PNG | 32x32 | `website/public/favicon-32x32.png` |
| apple-touch-icon.png | PNG | 180x180 | `website/public/apple-touch-icon.png` |
| android-chrome-192x192.png | PNG | 192x192 | `website/public/android-chrome-192x192.png` |
| android-chrome-512x512.png | PNG | 512x512 | `website/public/android-chrome-512x512.png` |
| og-image.png | PNG | 1200x630 | `website/public/og-image.png` (static fallback) |
| og/*.png | PNG | 1200x630 | Generated at build time into dist output |
| site.webmanifest | JSON | N/A | `website/public/site.webmanifest` |

### Key Files to Modify

- `website/.vitepress/config.mts` — head tags, theme logo, OG meta, build hooks
- `website/public/` — all new static asset files
- `scripts/generate-og-images.ts` — new build-time OG image generation script

### OG Image Generation Approach

Per-page OG images are generated at build time using `satori` + `@resvg/resvg-js` + `satori-html`. Each page gets a unique card with its title, description, and section breadcrumb — similar to how Claude Code Docs renders per-page cards (they use Mintlify which handles this via `@vercel/og` at the edge; we replicate this at build time).

See [og-image-generation.md](./og-image-generation.md) for full implementation details.

## Related

- [Design System](../vitepress-docs/design.md) — existing design documentation
- [VitePress Implementation Tracker](../vitepress-docs/implementation-tracker.md) — parent project (Phase 5 SEO tasks link here)
