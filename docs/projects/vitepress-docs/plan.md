# VitePress Implementation Plan

Comprehensive plan for building claude-code-lint documentation website with VitePress.

## Executive Summary

**Goal**: Create a modern, fast, and user-friendly documentation website for claude-code-lint

**Why VitePress**:

- Fast builds and HMR (Vite-powered)
- Great TypeScript support
- Minimal configuration
- Perfect for CLI tool documentation
- Active ecosystem (Vue.js official docs use it)

**Timeline**: 3 weeks

**Key Deliverables**:

1. Working documentation site
2. All existing docs migrated
3. Custom components for enhanced UX
4. Deployed with CI/CD
5. SEO optimized and accessible

---

## Architecture

### Directory Structure

```text
claude-lint/
├── docs/                          # VitePress root
│   ├── .vitepress/
│   │   ├── config.ts             # VitePress configuration
│   │   ├── theme/
│   │   │   ├── index.ts          # Theme customization
│   │   │   ├── style.css         # Custom styles
│   │   │   └── components/       # Vue components
│   │   │       ├── FeatureGrid.vue
│   │   │       ├── CodeTabs.vue
│   │   │       ├── RuleCard.vue
│   │   │       └── ...
│   │   └── cache/                # Build cache (gitignored)
│   ├── public/                   # Static assets
│   │   ├── logo.svg
│   │   ├── favicon.ico
│   │   └── images/
│   ├── index.md                  # Homepage
│   ├── guide/
│   │   ├── getting-started.md
│   │   ├── installation.md
│   │   ├── configuration.md
│   │   └── cli.md
│   ├── validators/
│   │   ├── index.md
│   │   ├── claude-md.md
│   │   └── ...
│   ├── rules/
│   │   ├── index.md
│   │   └── ...
│   ├── examples/
│   │   └── ...
│   └── development/
│       └── ...
├── package.json                  # Add docs scripts
└── README.md                     # Link to docs site
```

### Configuration File

**docs/.vitepress/config.ts** - Main configuration:

```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  // Site metadata
  title: 'claude-code-lint',
  description: 'A comprehensive linter for Claude Code projects',
  lang: 'en-US',

  // Base URL (for GitHub Pages: /claude-code-lint/)
  base: '/',

  // Head tags
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'claude-code-lint Documentation' }],
    ['meta', { property: 'og:description', content: 'Comprehensive linter for Claude Code projects' }],
    ['meta', { property: 'og:image', content: '/og-image.png' }],
  ],

  // Theme config
  themeConfig: {
    logo: '/logo.svg',

    // Navigation
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Validators', link: '/validators/' },
      { text: 'Rules', link: '/rules/' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v0.1.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Contributing', link: '/development/contributing' }
        ]
      }
    ],

    // Sidebar
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        },
        {
          text: 'Configuration',
          items: [
            { text: 'Config File', link: '/guide/configuration' },
            { text: 'CLI Reference', link: '/guide/cli' },
            { text: 'Rules', link: '/guide/rules' }
          ]
        }
      ],
      '/validators/': [/* ... */],
      '/rules/': [/* ... */]
    },

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/pdugan20/claude-code-lint' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/claude-code-lint' }
    ],

    // Edit link
    editLink: {
      pattern: 'https://github.com/pdugan20/claude-code-lint/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright  2024-present Pat Dugan'
    },

    // Search
    search: {
      provider: 'local'
    }
  },

  // Markdown config
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})
```

---

## Content Strategy

### Homepage Design

**Hero Section**:

```markdown
---
layout: home

hero:
  name: claude-code-lint
  text: Comprehensive linter for Claude Code
  tagline: Validate CLAUDE.md, skills, settings, hooks, and more
  image:
    src: /logo.svg
    alt: claude-code-lint
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/pdugan20/claude-code-lint

features:
  - icon: 
    title: Fast & Cached
    details: Parallel validation with smart caching for 2.4x speedup
  - icon: 
    title: 27 Validation Rules
    details: Comprehensive checks across 6 validator categories
  - icon: 
    title: Per-rule Documentation
    details: Detailed docs with examples for every rule
  - icon: 
    title: Auto-fix
    details: Automatically fix common issues with --fix flag
  - icon: 
    title: Multiple Formats
    details: Stylish, JSON, and compact output modes
  - icon: 
    title: Plugin System
    details: Extensible with custom validators
---

## Quick Start

```bash
# Install globally
npm install -g claude-code-lint

# Initialize configuration
claude-code-lint init

# Validate your project
claude-code-lint check-all
```

## Why claude-code-lint?

claude-code-lint ensures your Claude Code projects follow best practices...

```

### Navigation Structure

**Main Navbar**:

- Guide (dropdown: Getting Started, Installation, Configuration, CLI)
- Validators (link to overview)
- Rules (link to rules index)
- Examples (dropdown: Basic, Strict, Custom Validator)
- Development (dropdown: Architecture, Contributing, Changelog)

**Sidebar by Section**:

1. **Guide**:
   - Introduction
     - Getting Started
     - Installation
     - Quick Start
   - Usage
     - Configuration
     - CLI Reference
     - Rules System
     - Auto-fix
     - Inline Disables
   - Integration
     - Pre-commit Hooks
     - CI/CD
     - npm Scripts
   - Troubleshooting

2. **Validators**:
   - Overview
   - CLAUDE.md Validator
   - Skills Validator
   - Settings Validator
   - Hooks Validator
   - MCP Validator
   - Plugin Validator
   - Agents Validator
   - LSP Validator
   - Output Styles Validator

3. **Rules**:
   - Overview (filterable index)
   - By Category
     - CLAUDE.md Rules (6)
     - Skills Rules (31)
     - Settings Rules (35)
     - ... etc

4. **Development**:
   - Architecture
   - Validator Development Guide
   - Plugin Development Guide
   - Composition Framework
   - Contributing
   - Changelog

---

## Custom Components

### 1. FeatureGrid.vue

Display features in a responsive grid with icons.

**Props**:

```typescript
interface Feature {
  icon: string      // Emoji or icon name
  title: string     // Feature title
  details: string   // Feature description
}

interface Props {
  features: Feature[]
  columns?: 2 | 3 | 4  // Default: 3
}
```

**Usage**:

```vue
<FeatureGrid :features="[
  { icon: '', title: 'Fast', details: 'Parallel validation' },
  { icon: '', title: 'Comprehensive', details: '27 rules' }
]" />
```

### 2. CodeTabs.vue

Tabbed code blocks for package managers.

**Props**:

```typescript
interface CodeTab {
  label: string     // Tab label (npm, yarn, pnpm)
  code: string      // Code content
  lang?: string     // Language (default: bash)
}

interface Props {
  tabs: CodeTab[]
  activeTab?: number  // Default active (default: 0)
}
```

**Usage**:

```vue
<CodeTabs :tabs="[
  { label: 'npm', code: 'npm install -g claude-code-lint' },
  { label: 'yarn', code: 'yarn global add claude-code-lint' },
  { label: 'pnpm', code: 'pnpm add -g claude-code-lint' }
]" />
```

### 3. RuleCard.vue

Display rule metadata in a card format.

**Props**:

```typescript
interface Rule {
  id: string          // Rule ID (e.g., 'size-error')
  category: string    // Category (e.g., 'CLAUDE.md')
  severity: 'error' | 'warning' | 'info'
  fixable: boolean
  description: string
  link: string        // Link to full docs
}

interface Props {
  rule: Rule
}
```

**Usage**:

```vue
<RuleCard :rule="{
  id: 'size-error',
  category: 'CLAUDE.md',
  severity: 'error',
  fixable: false,
  description: 'CLAUDE.md file exceeds 10MB context window limit',
  link: '/rules/claude-md/size-error'
}" />
```

### 4. ValidatorDiagram.vue

Interactive validator flow diagram (using Mermaid.js internally).

**Props**:

```typescript
interface Props {
  type: 'skills' | 'claude-md' | 'settings' | ...
}
```

**Usage**:

```vue
<ValidatorDiagram type="skills" />
```

### 5. ConfigExample.vue

Display JSON config with inline annotations.

**Props**:

```typescript
interface Props {
  config: object       // JSON config object
  annotations?: {      // Optional annotations
    [key: string]: string
  }
}
```

**Usage**:

```vue
<ConfigExample
  :config="{ rules: { 'size-error': 'error' } }"
  :annotations="{ 'rules.size-error': 'Enable size validation' }"
/>
```

---

## Migration Guide

### From Existing Docs to VitePress

**Step 1: Copy markdown files**

```bash
# Create directory structure
mkdir -p docs/guide docs/validators docs/rules docs/development

# Copy files
cp docs/getting-started.md docs/guide/
cp docs/validators.md docs/validators/index.md
cp docs/architecture.md docs/development/
# ... etc
```

**Step 2: Add frontmatter**

Convert from:

```markdown
# Getting Started

This guide will help you...
```

To:

```markdown
---
title: Getting Started
description: Quick start guide for claude-code-lint
---

# Getting Started

This guide will help you...
```

**Step 3: Update links**

Convert from:

```markdown
See [Configuration](configuration.md) for details.
```

To:

```markdown
See [Configuration](/guide/configuration) for details.
```

**Step 4: Enhance with VitePress features**

Add custom containers:

```markdown
::: tip
Run `claude-code-lint init` to generate configuration interactively.
:::

::: warning
Make sure to run validation before committing!
:::

::: danger
This rule is marked as `error` by default.
:::
```

Add code groups:

```markdown
::: code-group
```bash [npm]
npm install -g claude-code-lint
```

```bash [yarn]
yarn global add claude-code-lint
```

```bash [pnpm]
pnpm add -g claude-code-lint
```

:::

```

---

## Deployment Strategy

### Option 1: GitHub Pages (Recommended)

**Pros**:

- Free hosting
- Automatic HTTPS
- Good performance
- Simple CI/CD

**Setup**:

```yaml
# .github/workflows/deploy.yml
name: Deploy VitePress site to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build with VitePress
        run: npm run docs:build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Custom Domain**:

1. Add `docs/public/CNAME` with `docs.claude-code-lint.dev`
2. Configure DNS: `CNAME docs.claude-code-lint.dev -> pdugan20.github.io`
3. Enable HTTPS in GitHub Pages settings

### Option 2: Vercel

**Pros**:

- Fastest edge network
- Automatic previews for PRs
- Great analytics
- Zero config

**Setup**:

1. Connect GitHub repo at vercel.com
2. Auto-detected VitePress settings
3. Deploy

**Build settings**:

- Framework: VitePress
- Build command: `npm run docs:build`
- Output directory: `docs/.vitepress/dist`

### Option 3: Netlify

**Pros**:

- Great DX
- Form handling
- Split testing
- Deploy previews

**Setup** (netlify.toml):

```toml
[build]
  command = "npm run docs:build"
  publish = "docs/.vitepress/dist"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

---

## Performance Optimization

### 1. Image Optimization

```bash
# Install tools
npm install -D sharp

# Optimize images
npx @squoosh/cli --webp auto docs/public/images/*.png
```

**Best practices**:

- Use WebP for photos
- Use SVG for logos/icons
- Compress PNGs with TinyPNG
- Add width/height attributes

### 2. Code Splitting

VitePress automatically code-splits by route. No action needed.

### 3. Preloading

Configure in config.ts:

```typescript
export default defineConfig({
  vite: {
    build: {
      chunkSizeWarningLimit: 1000
    }
  }
})
```

### 4. Caching

Configure headers for static assets:

```typescript
// GitHub Pages: handled automatically
// Vercel: vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## SEO Strategy

### Meta Tags

Every page should have:

```markdown
---
title: Page Title
description: Page description for search results (150-160 chars)
head:
  - - meta
    - property: og:title
      content: Page Title
  - - meta
    - property: og:description
      content: Page description
  - - meta
    - property: og:image
      content: /og-image.png
---
```

### Sitemap

Auto-generated by VitePress. Configure in config.ts:

```typescript
export default defineConfig({
  sitemap: {
    hostname: 'https://docs.claude-code-lint.dev'
  }
})
```

### Structured Data

Add to homepage:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "claude-code-lint",
  "description": "A comprehensive linter for Claude Code projects",
  "url": "https://docs.claude-code-lint.dev",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "macOS, Linux, Windows"
}
</script>
```

---

## Accessibility Checklist

- [ ] All images have alt text
- [ ] Color contrast ratio ≥ 4.5:1 for normal text
- [ ] Color contrast ratio ≥ 3:1 for large text
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators are visible
- [ ] Skip to content link present
- [ ] Headings follow logical hierarchy (no skipped levels)
- [ ] ARIA labels for icon-only buttons
- [ ] Form inputs have associated labels
- [ ] Screen reader tested (VoiceOver/NVDA)

---

## Timeline & Milestones

### Week 1: Foundation

**Days 1-2: Setup**

- Install VitePress
- Configure basic structure
- Set up theme and navigation
- **Deliverable**: Dev server running

**Days 3-5: Content Migration**

- Migrate all markdown docs
- Update links and frontmatter
- Create homepage
- **Deliverable**: All content accessible

### Week 2: Enhancement

**Days 1-3: Components**

- Build custom Vue components
- Add interactive features
- Polish design
- **Deliverable**: Enhanced UX

**Days 4-5: Features**

- Set up search
- Add diagrams
- Configure SEO
- **Deliverable**: Full-featured site

### Week 3: Launch

**Days 1-2: Deployment**

- Set up CI/CD
- Deploy to production
- Configure custom domain
- **Deliverable**: Live site

**Days 3-5: Polish**

- Accessibility audit
- Performance optimization
- Final testing
- Announcement
- **Deliverable**: Production launch

---

## Success Metrics

### Performance

- Lighthouse score: 95+ (all metrics)
- First Contentful Paint: <1s
- Time to Interactive: <2s
- Total bundle size: <200KB

### Content

- 100% docs migrated
- Zero broken links
- All examples tested
- Mobile-responsive

### Features

- Search working
- Dark mode functional
- All components rendering
- CI/CD operational

---

## Future Enhancements (Post-Launch)

### Version 2.0

- [ ] Interactive rule playground (WASM-based validator)
- [ ] Visual config generator
- [ ] Multi-version docs (v0.x, v1.x)
- [ ] API reference (auto-generated from TypeScript)
- [ ] Video tutorials
- [ ] Community showcase
- [ ] Plugin marketplace

### Integrations

- [ ] Algolia DocSearch (when >1000 pages/week traffic)
- [ ] GitHub Discussions integration
- [ ] StackBlitz embedded examples
- [ ] CodeSandbox templates

---

## Questions & Answers

**Q: Why VitePress over Docusaurus?**
A: Faster builds, simpler config, better TypeScript support, lighter bundle size.

**Q: Can we use React components?**
A: No, VitePress is Vue-based. Use Vue components or web components.

**Q: What about versioning?**
A: Start with single version, add versioning plugin in v2.0 when we have multiple major versions.

**Q: How do we handle API docs?**
A: Use TypeDoc to generate markdown from TypeScript, then include in VitePress.

**Q: What's the plan for i18n?**
A: Not planned for v1. VitePress has built-in i18n support for future.

**Q: How do we manage redirects?**
A: Use VitePress cleanUrls option + server-level redirects (netlify.toml/vercel.json).
