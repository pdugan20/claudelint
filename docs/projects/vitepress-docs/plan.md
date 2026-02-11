# VitePress Implementation Plan

Comprehensive plan for building claudelint documentation website with VitePress.

## Executive Summary

**Goal**: Create a modern, fast, and user-friendly documentation website for claudelint

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

### Directory Structure (Monorepo)

```text
claude-lint/
├── src/                          # Source code
│   └── validators/
│       └── */rules/*.ts          # Rule implementations WITH doc metadata
│
├── docs/                         # DELETED after migration (single source of truth)
│   └── (all content migrated to website/)
│
├── website/                      # VitePress site (NEW)
│   ├── .vitepress/
│   │   ├── config.ts             # VitePress configuration
│   │   ├── theme/
│   │   │   ├── index.ts          # Theme customization
│   │   │   ├── style.css         # Custom styles
│   │   │   └── components/       # Vue components
│   │   │       ├── FeatureGrid.vue
│   │   │       ├── CodeTabs.vue
│   │   │       ├── RuleCard.vue
│   │   │       ├── RuleExplorer.vue
│   │   │       └── ConfigGenerator.vue
│   │   └── plugins/
│   │       └── rule-generator.ts # Auto-generates rule pages
│   ├── public/                   # Static assets
│   │   ├── logo.svg
│   │   ├── favicon.ico
│   │   └── og-image.png
│   ├── index.md                  # Homepage
│   ├── guide/                    # Hand-written guides (8 pages)
│   │   ├── getting-started.md
│   │   ├── why-claudelint.md
│   │   ├── configuration.md
│   │   └── cli-reference.md
│   ├── validators/               # Hand-written validator overviews (11 pages)
│   │   ├── overview.md
│   │   ├── claude-md.md
│   │   └── skills.md
│   ├── rules/                    # AUTO-GENERATED (117 pages - don't edit!)
│   │   ├── overview.md           # Hand-written index
│   │   ├── claude-md/
│   │   │   ├── size-error.md     # Generated from src/
│   │   │   └── *.md
│   │   ├── skills/
│   │   │   └── *.md
│   │   └── */
│   │       └── *.md
│   ├── integrations/             # Hand-written integration guides (10 pages)
│   │   ├── overview.md
│   │   ├── npm-scripts.md
│   │   ├── pre-commit.md
│   │   └── github-actions.md
│   ├── api/                      # Hand-written API docs (7 pages)
│   │   ├── overview.md
│   │   ├── claudelint-class.md
│   │   └── functional-api.md
│   ├── development/              # Hand-written dev guides (8 pages)
│   │   ├── overview.md
│   │   ├── custom-rules.md
│   │   └── architecture.md
│   └── reference/                # Hand-written reference (5 pages)
│       ├── cheatsheet.md
│       └── glossary.md
│
├── scripts/
│   ├── generate-rule-docs.ts    # Rule doc generator
│   ├── generators/
│   │   └── rule-page.ts         # Page template generator
│   └── sync-docs.ts             # Manual doc sync (Phase 1)
│
├── package.json                  # Add docs scripts
└── README.md                     # Link to docs site
```

**Total Pages:** ~170

- Hand-written: ~53 pages (guides, validators, integrations, API, development)
- Auto-generated: 117 pages (rules across 10 categories)
- Total build size: <200KB gzipped

### Auto-Generation System

claudelint uses **metadata-driven documentation**. Rule docs are auto-generated from TypeScript metadata in the rule source files.

**How it works:**

1. **Metadata in code**: Each rule has a `docs` property with examples, options, descriptions
2. **Type-safe**: TypeScript enforces documentation schema
3. **Auto-generate**: Script reads metadata and generates markdown
4. **Single source of truth**: Docs always match code

**Example:**

```typescript
// src/validators/skills/rules/skill-name.ts
export const skillNameRule: Rule = {
  meta: {
    name: 'skill-name',
    severity: 'error',
    docs: {
      summary: 'Skill name is required in frontmatter',
      details: 'Detailed explanation...',
      examples: {
        incorrect: [{ code: '...', description: '...' }],
        correct: [{ code: '...', description: '...' }],
      },
      options: { /* JSON schema */ },
      relatedRules: ['skill-description'],
    },
  },
  validate(context) { /* ... */ },
};
```

**Build process:**

```bash
npm run docs:generate  # Reads src/, generates website/rules/
npm run docs:build     # Builds VitePress site
```

See [auto-generation-guide.md](./auto-generation-guide.md) for complete details.

### Configuration File

**website/.vitepress/config.ts** - Main configuration:

```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  // Site metadata
  title: 'claudelint',
  description: 'A comprehensive linter for Claude Code projects',
  lang: 'en-US',

  // Base URL (for GitHub Pages: /claudelint/)
  base: '/',

  // Head tags
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'claudelint Documentation' }],
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
      { icon: 'github', link: 'https://github.com/pdugan20/claudelint' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/claudelint' }
    ],

    // Edit link
    editLink: {
      pattern: 'https://github.com/pdugan20/claudelint/edit/main/docs/:path',
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

## Search Strategy

### Phase 1: Built-in Local Search (Recommended)

VitePress includes excellent local search out-of-the-box powered by minisearch:

- **No server-side indexing needed**
- **Works offline**
- **Fast and accurate for sites <100 pages**
- **Zero configuration required**
- **Research finding**: Teams migrating to VitePress reported local search "drastically improved speed and accuracy" vs previous solutions

Configuration:

```typescript
export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local'
    }
  }
})
```

### Future Consideration: Algolia DocSearch

Only if we exceed 100+ pages AND need advanced features:

- Typo tolerance
- Analytics on search queries
- Advanced filtering
- Multi-language support

**Current recommendation**: Local search is sufficient for claudelint documentation.

---

## Content Strategy

### Homepage Design

**Hero Section**:

```markdown
---
layout: home

hero:
  name: claudelint
  text: Comprehensive linter for Claude Code
  tagline: Validate CLAUDE.md, skills, settings, hooks, and more
  image:
    src: /logo.svg
    alt: claudelint
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/pdugan20/claudelint

features:
  - icon: 
    title: Fast & Cached
    details: Parallel validation with smart caching for 2.4x speedup
  - icon:
    title: 117 Validation Rules
    details: Comprehensive checks across 10 validator categories
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
claudelint init

# Validate your project
claudelint check-all
```

## Why claudelint?

claudelint ensures your Claude Code projects follow best practices...

```text
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
  { label: 'yarn', code: 'yarn global add claudelint' },
  { label: 'pnpm', code: 'pnpm add -g claudelint' }
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

#### Step 1: Copy markdown files

```bash
# Create directory structure
mkdir -p docs/guide docs/validators docs/rules docs/development

# Copy files
cp docs/getting-started.md docs/guide/
cp docs/validators.md docs/validators/index.md
cp docs/architecture.md docs/development/
# ... etc
```

#### Step 2: Add frontmatter

Convert from:

```markdown
# Getting Started

This guide will help you...
```

To:

```markdown
---
title: Getting Started
description: Quick start guide for claudelint
---

# Getting Started

This guide will help you...
```

#### Step 3: Update links

Convert from:

```markdown
See [Configuration](configuration.md) for details.
```

To:

```markdown
See [Configuration](/guide/configuration) for details.
```

#### Step 4: Enhance with VitePress features

Add custom containers:

```markdown
::: tip
Run `claudelint init` to generate configuration interactively.
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
yarn global add claudelint
```

```bash [pnpm]
pnpm add -g claudelint
```

:::

```text
```

---

## Deployment Strategy

### Vercel (Recommended)

**Why Vercel:**

- [x] Fastest edge network (global CDN)
- [x] Automatic PR preview deployments
- [x] Zero configuration (auto-detects VitePress)
- [x] Free for open source
- [x] Built-in analytics
- [x] Excellent DX

**Setup:**

1. **Connect repository**
   - Go to <https://vercel.com>
   - Click "Import Project"
   - Connect GitHub repo (pdugan20/claudelint)
   - Vercel auto-detects VitePress

2. **Verify build settings** (should auto-detect):

   ```text
   Framework Preset: VitePress
   Root Directory: ./
   Build Command: npm run docs:build
   Output Directory: website/.vitepress/dist
   Install Command: npm install
   ```

3. **Add build script** to package.json:

   ```json
   {
     "scripts": {
       "docs:generate": "tsx scripts/generate-rule-docs.ts",
       "docs:dev": "npm run docs:generate && vitepress dev website",
       "docs:build": "npm run docs:generate && vitepress build website",
       "docs:preview": "vitepress preview website"
     }
   }
   ```

4. **Deploy**
   - Click "Deploy"
   - Site live in ~1 minute
   - Preview URL: `claudelint.vercel.app`

**Custom Domain:**

1. Go to Project Settings → Domains
2. Add domain: `claudelint.com`
3. Add DNS record at domain provider:

   ```text
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel)
   ```

4. Vercel provides automatic HTTPS

**PR Preview Deployments:**

Every pull request gets an automatic preview deployment:

- Unique URL for each PR
- Comment with preview link added to PR automatically
- Perfect for reviewing docs changes before merging
- No configuration needed

**Vercel Configuration (Optional):**

Create `vercel.json` for advanced config:

```json
{
  "buildCommand": "npm run docs:build",
  "outputDirectory": "website/.vitepress/dist",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Alternative: GitHub Pages

If you prefer GitHub Pages instead:

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

## Information Architecture

Based on analysis of ESLint and Prettier documentation structures. See [information-architecture.md](./information-architecture.md) for complete details.

### Main Navigation (6 sections)

```text
Guide | Validators | Rules | Integrations | API | Development
```

### Site Structure (~170 pages)

```text
/guide/                    8 pages (getting started, config, CLI, troubleshooting)
/validators/              11 pages (overview + 10 validators)
/rules/                  118 pages (overview + 117 rules - AUTO-GENERATED)
/integrations/            10 pages (npm, pre-commit, GitHub Actions, Claude plugin, monorepos)
/api/                      7 pages (programmatic API documentation)
/development/              8 pages (custom rules, architecture, contributing)
/reference/                6 pages (cheatsheet, glossary, rule index, exit codes, file naming)
```

**Comparison to similar tools:**

- **Prettier**: ~24 pages (simple formatter, no rules)
- **claudelint**: ~170 pages (comprehensive linter)
- **ESLint**: ~364 pages (284 rules vs our 117)
- **Oxc/oxlint**: VitePress-based, 668 rules (closest comparable)

claudelint is **47% the size of ESLint**, appropriate for our rule count.

### Content Mapping

Existing docs → New structure:

```text
docs/getting-started.md         → /guide/getting-started
docs/configuration.md           → /guide/configuration
docs/cli-reference.md           → /guide/cli-reference
docs/troubleshooting.md         → /guide/troubleshooting

docs/validation-reference.md    → Split into /validators/* pages

docs/rules/**/*.md              → /rules/**/* (AUTO-GENERATED from code)

docs/formatting-tools.md        → /integrations/formatting-tools
docs/hooks.md                   → /integrations/claude-code-hooks
docs/plugin-usage.md            → /integrations/claude-code-plugin

docs/api/**/*.md                → /api/**/* (keep structure)

docs/custom-rules.md            → /development/custom-rules
docs/rule-development.md        → /development/rule-development
docs/architecture.md            → /development/architecture
CONTRIBUTING.md                 → /development/contributing

docs/glossary.md                → /reference/glossary
docs/file-naming-conventions.md → /reference/file-naming
```

---

## Migration Phases

### Phase 1: Manual Sync (Week 1)

Start with manual doc copying to get site up quickly:

```bash
# Quick start
npm install -D vitepress
mkdir website
node scripts/sync-docs.js  # Copies docs/ → website/
npm run docs:dev
```

**Goal:** VitePress site running with existing docs.

### Phase 2: Gradual Metadata Addition (Weeks 2-4)

Add `docs` metadata to rules incrementally:

```typescript
// Priority 1: Most commonly violated rules (10 rules)
// Priority 2: Auto-fixable rules (3 rules)
// Priority 3: All remaining rules (92 rules)

// Each PR: Add metadata to 5-10 rules
```

**Goal:** 25% by end of week 2, 100% by end of week 4.

### Phase 3: Full Auto-Generation (Week 5+)

Once all rules have metadata:

```bash
npm run docs:generate  # 100% auto-generated
npm run docs:build     # Deploy to Vercel
```

**Goal:** Eliminate docs/ folder, single source of truth.

---

## Package.json Scripts

```json
{
  "scripts": {
    "docs:generate": "tsx scripts/generate-rule-docs.ts",
    "docs:dev": "npm run docs:generate && vitepress dev website",
    "docs:build": "npm run docs:generate && vitepress build website",
    "docs:preview": "vitepress preview website"
  },
  "devDependencies": {
    "vitepress": "^1.0.0",
    "vue": "^3.3.0"
  }
}
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
    hostname: 'https://claudelint.com'
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
  "name": "claudelint",
  "description": "A comprehensive linter for Claude Code projects",
  "url": "https://claudelint.com",
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

### Week 1: VitePress Setup + Manual Sync

#### Phase 1: Quick Start

- Day 1-2: Install VitePress, configure structure
- Day 3-4: Copy existing docs (manual sync)
- Day 5: Create homepage, test navigation
- **Deliverable**: VitePress site running with existing content

**Milestone:** Dev server at `localhost:5173` with all existing docs browsable

### Week 2-4: Metadata Migration

#### Phase 2: Gradual Auto-Generation

- Week 2: Add metadata to 25% of rules (Priority 1: common violations)
- Week 3: Add metadata to 50% of rules (Priority 2: auto-fixable)
- Week 4: Add metadata to 100% of rules (Priority 3: all remaining)
- **Deliverable**: All 117 rules have TypeScript metadata

**Milestone:** 100% auto-generated rule docs, docs/ folder deleted (single source of truth)

### Week 5: Custom Components

#### Phase 3: Enhanced UX

- Day 1-2: Build RuleExplorer, RuleCard components
- Day 3-4: Build ConfigGenerator component
- Day 5: Build interactive features
- **Deliverable**: Enhanced documentation with Vue components

**Milestone:** Interactive rule browsing and config generation

### Week 6: Deployment & Polish

#### Phase 4: Launch

- Day 1: Deploy to Vercel
- Day 2: Configure custom domain (claudelint.com)
- Day 3-4: Accessibility audit, performance optimization
- Day 5: Final testing, announcement
- **Deliverable**: Production launch

**Milestone:** Live at claudelint.com with 95+ Lighthouse score

### Post-Launch: Docs Cleanup

#### Delete docs/ Folder

- Delete entire `docs/` directory (all content now in `website/`)
- Add CI check to prevent new files in `docs/`
- Update CLAUDE.md: "Documentation lives in `website/`"
- Keep only repo-root files: README.md, CONTRIBUTING.md, CHANGELOG.md, CLAUDE.md

**Goal:** Single source of truth, no duplicate documentation.

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

### Phase 2.0 (3-6 months)

- [ ] Config generator (high value, medium complexity)
- [ ] Video tutorials (high value, low complexity)
- [ ] Community showcase (medium value, low complexity)

### Phase 3.0 (6-12 months)

- [ ] **Interactive rule playground** (high complexity)
  - Requires compiling claudelint to WASM
  - Or running validator in Node.js via WebContainer
  - Estimated effort: 40-60 hours
  - Consider StackBlitz integration first (easier)
- [ ] Multi-version docs (if needed)
  - Manual implementation or migrate to Docusaurus
- [ ] API reference auto-generation
  - Use TypeDoc → markdown → VitePress

### Integrations

- [ ] Algolia DocSearch (if needed)
  - Use when we exceed 100+ pages AND need advanced features
  - Current local search should be sufficient
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
A: VitePress does not have native versioning like Docusaurus. If claudelint requires multi-version docs (v1.x, v2.x, v3.x hosted simultaneously), we would need to:

- Manually organize folders by version
- Build custom routing/navigation
- OR migrate to Docusaurus at that point

For now, we'll maintain a single version with a changelog. This is appropriate for a linter tool where users typically stay on the latest version.

**Q: How do we handle API docs?**
A: Use TypeDoc to generate markdown from TypeScript, then include in VitePress.

**Q: What's the plan for internationalization (i18n)?**
A: Not planned for v1.0.

If needed in the future:

- VitePress supports i18n through manual locale configuration
- More flexible than Docusaurus (less folder duplication)
- But requires manual setup (no i18n plugin)
- Suitable for 2-3 languages; consider Docusaurus if 10+ languages needed

For a CLI tool, English-only is appropriate initially.

**Q: How do we manage redirects?**
A: Use VitePress cleanUrls option + server-level redirects (netlify.toml/vercel.json).
