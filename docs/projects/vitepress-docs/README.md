# VitePress Documentation Project

Create a modern, fast documentation website for claudelint using VitePress.

## Project Overview

**Goal**: Build and deploy a professional documentation website at claudelint.com
**Framework**: VitePress (Vue-powered static site generator)
**Timeline**: 6 weeks (phased approach)
**Hosting**: Vercel (automatic PR previews, global CDN)
**Approach**: Monorepo with auto-generated rule docs
**Domain Strategy**: Single domain (claudelint.com) with landing page at root, docs at path prefixes - matching ESLint, Prettier, Biome, and Oxc patterns

## Key Decisions

### Architecture: Monorepo

- [x] **website/** folder in claudelint repo (not separate repo)
- [x] **Auto-generate** rule docs from TypeScript metadata
- [x] **Single source of truth**: Rule docs live with code
- [x] **Phased migration**: Manual → gradual → full auto-generation

### Deployment: Vercel

- [x] **Automatic PR previews** for every pull request
- [x] **Global CDN** for fastest performance worldwide
- [x] **Zero configuration** - auto-detects VitePress
- [x] **Free for open source** projects

### Domain Strategy: Single Domain (No Subdomain)

- [x] **claudelint.com** - Single domain, no docs subdomain
- [x] **Landing page at root** (`/`) - Marketing hero, install snippet, features
- [x] **Docs at path prefixes** (`/guide/`, `/rules/`, etc.)
- [x] **Industry standard** - ESLint, Prettier, Biome, Stylelint, and Oxc all use this pattern
- [x] **Simpler setup** - No CORS, no split deployments, no split analytics

### Information Architecture

- [x] **~170 pages** total documentation
- [x] **117 rule pages** auto-generated from code
- [x] **6 main sections**: Guide, Validators, Rules, Integrations, API, Development
- [x] **Hybrid approach**: ESLint's depth + Prettier's simplicity
- [x] **Reference project**: Oxc (oxc.rs) - VitePress-based linting tool with similar structure

See [information-architecture.md](./information-architecture.md) and [auto-generation-guide.md](./auto-generation-guide.md) for complete details.

## Why VitePress?

- **Fast**: Vite-powered dev server with instant HMR
- **Modern**: TypeScript-first, Vue 3 components
- **Minimal Setup**: Zero config to start, easy to customize
- **Great DX**: Excellent developer experience
- **Perfect for CLIs**: Used by Vite, Vitest, Vue, Pinia
- **SEO-Friendly**: Static site generation with excellent performance

## VitePress vs Docusaurus: Key Trade-offs

### What We're Getting

- **Lightning-fast builds**: <100ms HMR, instant dev server
- **Minimal bundle**: <200KB initial load (Docusaurus often 500KB+)
- **Better TypeScript DX**: Vue 3 + Vite + TS integration
- **Built-in local search**: minisearch-powered, no Algolia needed initially
- **Simpler maintenance**: Less configuration, fewer moving parts

### What We're Giving Up

- **Native versioning**: No built-in v1/v2/v3 doc hosting
- **Smaller plugin ecosystem**: ~50 VitePress themes vs 500+ Docusaurus plugins
- **Vue requirement**: Must use Vue for custom components (not React/JSX)
- **Less mature**: v1.0 released 2024 vs Docusaurus stable since 2020
- **Smaller community**: Fewer tutorials, Stack Overflow answers

### Why This Trade-off Makes Sense

claudelint is:

- A single-version CLI tool (no multi-version docs needed)
- Medium-sized documentation (~53 hand-written pages + 117 auto-generated rule pages)
- TypeScript-based (VitePress advantage)
- Developer-focused (users value performance)

## Project Documents

### [implementation-tracker.md](./implementation-tracker.md)

Phase-by-phase task tracking with checkboxes:

- Phase 1: Setup & Configuration
- Phase 2: Content Migration
- Phase 3: Custom Components
- Phase 4: Interactive Features
- Phase 5: Deployment
- Phase 6: Polish & Launch

### [plan.md](./plan.md)

Comprehensive implementation plan covering:

- Monorepo architecture (website/ folder)
- Auto-generation system
- VitePress configuration
- Custom components
- Vercel deployment strategy
- Phased migration approach

### [information-architecture.md](./information-architecture.md)

Site structure and navigation:

- Analysis of ESLint and Prettier docs
- Proposed 6-section structure
- Content mapping (existing → new)
- ~170 pages breakdown
- Page templates and patterns

### [auto-generation-guide.md](./auto-generation-guide.md)

Rule documentation auto-generation:

- Metadata-driven approach
- TypeScript type definitions
- Generation scripts and templates
- Phased migration strategy
- Developer workflow

### [design.md](./design.md)

Design system and branding:

- Color scheme
- Typography
- Component library
- Layout patterns
- Accessibility considerations

### [deployment.md](./deployment.md)

Deployment configuration:

- Vercel setup (primary)
- GitHub Pages (alternative)
- Custom domain configuration
- Performance optimization
- PR preview deployments

## Quick Stats

### Documentation Scale

- **Total Pages**: ~170 pages
- **Auto-Generated**: 117 rule pages (from TypeScript metadata)
- **Hand-Written**: ~53 pages (guides, validators, API, development)
- **Build Size**: <200KB gzipped
- **Build Time**: <30 seconds for full site

### Rule Categories (117 rules across 10 categories)

- **skills**: 45 rules
- **claude-md**: 14 rules
- **mcp**: 13 rules
- **agents**: 12 rules
- **plugin**: 12 rules
- **lsp**: 8 rules
- **settings**: 5 rules
- **hooks**: 3 rules
- **output-styles**: 3 rules
- **commands**: 2 rules

### Content Organization

- **/guide/**: 8 pages (getting started, config, CLI, troubleshooting)
- **/validators/**: 11 pages (overview + 10 validators)
- **/rules/**: 118 pages (overview + 117 auto-generated rules)
- **/integrations/**: 10 pages (npm, pre-commit, GitHub Actions, Claude plugin, **monorepos**)
- **/api/**: 7 pages (programmatic API docs)
- **/development/**: 8 pages (custom rules, architecture, contributing)
- **/reference/**: 6 pages (cheatsheet, glossary, rule index, exit codes, file naming)

### Comparison to Similar Tools

- **Prettier**: ~24 pages (simple formatter)
- **claudelint**: ~170 pages (comprehensive linter) ← You are here
- **ESLint**: ~364 pages (284 rules)
- **Oxc/oxlint**: Uses VitePress, 668 rules, multi-dimension filtering (closest comparable)

claudelint is **47% the size of ESLint**, appropriate for our 117 rules.

### Recent Feature Additions (Feb 2026)

- **Monorepo Support** - Config inheritance with `extends`, workspace detection, 3-10x faster validation
- **Simplified Architecture** - Removed composition framework, renamed validators (FileValidator, SchemaValidator)
- **Performance** - Parallel workspace validation for large monorepos
- **SARIF Output** - Standard SARIF format for CI/CD integration
- **Watch Mode** - Continuous validation during development
- **Diagnostic Collector** - Improved error aggregation and reporting
- **12 New Rules** - Added across agents, plugin, skills, claude-md categories (M5-M6)
- **Skills Directory Migration** - Skills moved from `.claude/skills/` to root `skills/` directory

### Features to Implement

- **Auto-Generation**: Rule docs from TypeScript metadata
- **Interactive Components**: 5 custom Vue components
- **Navigation**: Multi-level sidebar, navbar, local search
- **Enhancements**: Dark mode, syntax highlighting, mobile-responsive
- **PR Previews**: Automatic deployment previews on Vercel

## Key Features

### Must-Have (Phase 1-2)

1. **Homepage** - Hero section, quick start, feature highlights
2. **Getting Started** - Installation, setup, first validation
3. **Validators** - Detailed docs for each validator type
4. **Rules** - Individual rule pages with examples
5. **Configuration** - .claudelintrc.json reference
6. **CLI Reference** - All commands and options
7. **Search** - Full-text search across all docs
8. **Dark Mode** - Toggle between light/dark themes

### Nice-to-Have (Phase 3-4)

1. **Interactive Examples** - Live validation demos
2. **Config Generator** - Visual .claudelintrc.json builder
3. **Rule Playground** - Test rules with live code
4. **Version Selector** - Multi-version documentation
5. **API Reference** - Auto-generated from TypeScript

## Site Structure

```text
claudelint.com/
├── /                          # Homepage
├── /guide/
│   ├── /getting-started       # Quick start guide
│   ├── /installation          # Install instructions
│   ├── /configuration         # Config reference
│   └── /cli                   # CLI commands
├── /validators/
│   ├── /overview              # Validator architecture
│   ├── /claude-md             # CLAUDE.md validator
│   ├── /skills                # Skills validator
│   ├── /settings              # Settings validator
│   └── /...                   # Other validators
├── /rules/
│   ├── /overview              # Rules overview
│   ├── /claude-md/
│   │   ├── /size-error        # Individual rules
│   │   └── /...
│   └── /...
├── /examples/
│   ├── /basic                 # Basic usage
│   ├── /strict                # Strict mode
│   └── /custom-validator      # Plugin development
├── /development/
│   ├── /architecture          # System design
│   ├── /validator-guide       # Build validators
│   ├── /plugin-guide          # Build plugins
│   └── /contributing          # Contribution guide
└── /api/                      # API reference (future)
```

## Technology Stack

### Core

- **VitePress** - Static site generator
- **Vue 3** - Component framework
- **TypeScript** - Type safety
- **Vite** - Build tool

### Extensions

- **Shiki** - Syntax highlighting (built-in)
- **Vue Components** - Interactive demos
- **Algolia DocSearch** - Search (future)
- **GitHub Actions** - CI/CD
- **Vite Plugins** - Access to 1000+ Vite plugins:
  - `vite-plugin-pwa` for offline support
  - `vite-plugin-compression` for gzip/brotli
  - `vite-plugin-imagetools` for image optimization
  - `@vitejs/plugin-vue-jsx` for JSX support in Vue

## Development Workflow

```bash
# Install VitePress
npm install -D vitepress

# Dev server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

## Current Status

**Phase**: Planning
**Progress**: 0/6 phases complete
**Next Step**: Validate VitePress (Pre-Phase)

**Phases:**

1. Week 1: VitePress Setup + Manual Sync
2. Week 2: Metadata Foundation (25% of rules)
3. Weeks 3-4: Metadata Completion (100% of rules)
4. Week 5: Custom Components + Enhanced Features
5. Week 6: Deployment & Launch

See [implementation-tracker.md](./implementation-tracker.md) for detailed task list.

## Success Criteria

### Performance

**Build Performance**:

- Development server start: <1s (VitePress average: instant)
- Hot Module Replacement: <100ms (VitePress guarantee)
- Production build: <30s for 50 pages
- Memory usage: <500MB during builds

**Runtime Performance**:

- **Lighthouse Score**: 95+ on all metrics
- **First Contentful Paint**: <1s
- **Time to Interactive**: <2s
- **Total bundle size**: <200KB initial load
- **Per-page JS**: <50KB

**Why these matter**: Research shows Docusaurus sites with versioning + i18n can require 10GB+ RAM and 26-minute builds. VitePress's Vite-powered architecture avoids these scalability issues.

### Developer Experience

- **Dev server start**: <1 second
- **HMR speed**: <100ms for content changes
- **Build time**: <30s for full site
- **No memory issues**: Builds complete with <500MB RAM

### Content

- **100% Migration**: All existing docs migrated
- **Zero Broken Links**: All internal links work
- **SEO Optimized**: Meta tags, sitemap, robots.txt
- **Mobile-Friendly**: Responsive on all devices

### Features

- **Search**: Full-text search working
- **Dark Mode**: Fully functional light/dark toggle
- **Navigation**: Intuitive sidebar and navbar
- **Code Examples**: Syntax highlighted, copyable

## Timeline

- **Week 1**: VitePress setup, manual doc sync
- **Week 2**: Auto-generation infrastructure, add metadata to 25% of rules
- **Weeks 3-4**: Complete metadata for all 117 rules
- **Week 5**: Custom Vue components, interactive features
- **Week 6**: Deploy to Vercel, performance optimization, launch

## Vue Components: What You Need to Know

### For Content Authors

- **Markdown is primary**: 95% of docs are just markdown
- **No Vue knowledge needed** for writing docs
- Built-in components (code groups, containers) work in markdown

### For Developers (Custom Components)

- **Vue 3 Composition API** required for custom components
- Similar to React hooks if you know those
- **Learning resources**:
  - Vue 3 docs: <https://vuejs.org>
  - VitePress components: <https://vitepress.dev/guide/extending-default-theme>

### Realistic Time Investment

- **Zero Vue experience**: ~4 hours to learn basics for simple components
- **React experience**: ~2 hours to translate concepts
- **Vue 2 experience**: ~1 hour to learn Composition API

This is acceptable for the performance and simplicity gains.

## Why This Will Work: Real-World Evidence

### VitePress Migration Success Stories

**400+ page migration** (Material for MkDocs → VitePress):

- Completed in ~1 week
- "Significantly faster and more responsive"
- Built-in search "drastically improved speed and accuracy"

**Socket.io considering migration** (Docusaurus → VitePress):

- Primary reason: Vue-based examples align with Vue framework
- Performance gains expected

**Our situation**:

- ~50 pages (smaller than above migrations)
- TypeScript-based (VitePress strength)
- No versioning needs (avoids Docusaurus complexity)
- Developer audience (values performance)

**Confidence level**: High

## Questions?

- **Why VitePress over Docusaurus?** See trade-offs section above
- **Can we use React components?** No, VitePress is Vue-based. See Vue section above.
- **What about versioning?** VitePress has no native versioning - see plan.md for details
- **Custom domain?** Yes, claudelint.com with docs at path prefixes (configure in Phase 5)

## Docs Cleanup Strategy

**Principle: Single Source of Truth** - When the VitePress site goes live, the `docs/` folder is eliminated.

### What Happens to Existing `docs/`

- **User-facing docs** (guides, API, rule docs): Migrated into `website/`, then deleted from `docs/`
- **Rule docs** (117 files): Become seed content for auto-generation metadata, then deleted
- **Project planning docs** (`docs/projects/`): Archived or deleted (not public-facing)
- **Internal docs** (enforcement policies, templates): Removed or moved to repo root

### Migration Approach: Hard Cutover (Recommended)

Instead of a gradual migration with dual locations, we do a single cutover:

1. Build the VitePress site with all content in `website/`
2. Delete the entire `docs/` directory
3. Add CI check to prevent new files in `docs/`
4. Update CLAUDE.md: "Documentation lives in `website/`"

See [docs-migration-inventory.md](./docs-migration-inventory.md) for the complete file-by-file mapping.

### What Stays in Repo Root

Only standard repo-level files: `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `CLAUDE.md`

## Comparable Projects

| Project | Framework | Domain Pattern | Rules |
|---------|-----------|---------------|-------|
| **ESLint** | Eleventy | eslint.org/docs/latest/ | 270+ |
| **Prettier** | Docusaurus | prettier.io/docs/ | N/A |
| **Biome** | Astro + Starlight | biomejs.dev/guides/ | 434 |
| **Oxc/oxlint** | **VitePress** | oxc.rs/docs/ | 668 |
| **Stylelint** | Docusaurus | stylelint.io/user-guide/ | 170+ |
| **claudelint** | **VitePress** | claudelint.com/guide/ | 117 |

**Key takeaway**: No major project uses a docs subdomain. All use path prefixes on a single domain.

## Related Documents

- [Architecture](../../architecture.md) - claudelint system architecture
- [Contributing](../../../CONTRIBUTING.md) - Contribution guidelines
- [Docs Migration Inventory](./docs-migration-inventory.md) - File-by-file migration mapping
- [Landing Page Spec](./landing-page-spec.md) - Marketing homepage design
