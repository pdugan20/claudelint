# VitePress Documentation Project

Create a modern, fast documentation website for claudelint using VitePress.

## Project Overview

**Goal**: Build and deploy a professional documentation website at docs.claudelint.dev
**Framework**: VitePress (Vue-powered static site generator)
**Timeline**: 2-3 weeks
**Hosting**: GitHub Pages / Vercel / Cloudflare Pages

## Why VitePress?

- **Fast**: Vite-powered dev server with instant HMR
- **Modern**: TypeScript-first, Vue 3 components
- **Minimal Setup**: Zero config to start, easy to customize
- **Great DX**: Excellent developer experience
- **Perfect for CLIs**: Used by Vite, Vitest, Vue, Pinia
- **SEO-Friendly**: Static site generation with excellent performance

## Project Documents

### [IMPLEMENTATION-TRACKER.md](./IMPLEMENTATION-TRACKER.md)

Phase-by-phase task tracking with checkboxes:

- Phase 1: Setup & Configuration
- Phase 2: Content Migration
- Phase 3: Custom Components
- Phase 4: Interactive Features
- Phase 5: Deployment
- Phase 6: Polish & Launch

### [PLAN.md](./PLAN.md)

Comprehensive implementation plan covering:

- Architecture decisions
- File structure
- Content organization
- Custom components
- Deployment strategy
- Migration guide

### [DESIGN.md](./DESIGN.md)

Design system and branding:

- Color scheme
- Typography
- Component library
- Layout patterns
- Accessibility considerations

### [DEPLOYMENT.md](./DEPLOYMENT.md)

Deployment configuration and CI/CD:

- GitHub Pages setup
- Alternative hosting options
- CI/CD pipeline
- Custom domain configuration
- Performance optimization

## Quick Stats

### Content to Migrate

- **Existing Docs**: 20+ markdown files
- **Rule Docs**: 27+ individual rule pages
- **Examples**: 3 example projects
- **Guides**: Getting started, configuration, development

### Features to Implement

- **Core Features**: 8 essential features
- **Interactive Components**: 5 custom Vue components
- **Navigation**: Multi-level sidebar, navbar, search
- **Enhancements**: Dark mode, syntax highlighting, mobile-responsive

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
docs.claudelint.dev/
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
**Next Phase**: Setup & Configuration

See [IMPLEMENTATION-TRACKER.md](./IMPLEMENTATION-TRACKER.md) for detailed task list.

## Success Criteria

### Performance

- **Lighthouse Score**: 95+ on all metrics
- **First Contentful Paint**: <1s
- **Time to Interactive**: <2s
- **Bundle Size**: <200KB initial load

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

- **Week 1**: Setup, configuration, basic structure
- **Week 2**: Content migration, custom components
- **Week 3**: Deployment, polish, launch

## Questions?

- **Why VitePress over Docusaurus?** Faster, simpler, better for TypeScript projects
- **Can we use React components?** No, VitePress is Vue-based. Use Vue components.
- **What about versioning?** Start with single version, add versioning in Phase 6
- **Custom domain?** Yes, docs.claudelint.dev (configure in Phase 5)

## Related Documents

- [Launch Plan](../../launch.md) - Overall project launch strategy
- [Architecture](../../architecture.md) - claudelint system architecture
- [Contributing](../../../CONTRIBUTING.md) - Contribution guidelines
