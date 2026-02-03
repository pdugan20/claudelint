# VitePress Implementation Tracker

**Start Date**: TBD
**Target Completion**: 6 weeks from start
**Current Phase**: Planning

Track progress through each phase of VitePress documentation website implementation.

**Key Decisions:**

- [x] Monorepo approach (website/ folder in claudelint repo)
- [x] Vercel deployment (automatic PR previews)
- [x] Auto-generate rule docs from source code metadata
- [x] Phased migration (manual → gradual → full auto-generation)

---

## Pre-Phase: Validation (Before Starting)

**Goal**: Validate VitePress capabilities before committing
**Deliverable**: Decision gate - proceed or reconsider framework

### Proof of Concept

- [ ] Set up minimal VitePress proof-of-concept (1 hour)
  - [ ] Install VitePress in test directory
  - [ ] Create basic config and 2-3 markdown pages
  - [ ] Verify dev server starts
- [ ] Test Vue component creation (1 hour)
  - [ ] Create simple custom component
  - [ ] Register and use in markdown
  - [ ] Verify component renders
- [ ] Verify build performance (30 min)
  - [ ] Run dev server and measure HMR speed
  - [ ] Confirm <100ms hot module replacement
  - [ ] Test production build time
- [ ] Confirm local search works (30 min)
  - [ ] Enable local search in config
  - [ ] Test search with sample content
  - [ ] Verify search quality

### Decision Gate

- [ ] **All validation tasks passed**: Proceed to Phase 1
- [ ] **Any blockers identified**: Reconsider framework choice or address issues

**Pre-Phase Complete**: ☐ (0/9 tasks = 0%)

---

## Phase 1: VitePress Setup + Manual Sync (Week 1)

**Goal**: Get VitePress site running with existing docs
**Deliverable**: Working dev server at localhost:5173

### Installation

- [ ] Install VitePress dependencies
  - [ ] `npm install -D vitepress vue tsx`
- [ ] Create `website/` directory structure
  - [ ] `website/.vitepress/`
  - [ ] `website/.vitepress/config.ts`
  - [ ] `website/.vitepress/theme/`
  - [ ] `website/public/` (static assets)
- [ ] Add npm scripts to package.json
  - [ ] `"docs:generate": "tsx scripts/generate-rule-docs.ts"`
  - [ ] `"docs:dev": "npm run docs:generate && vitepress dev website"`
  - [ ] `"docs:build": "npm run docs:generate && vitepress build website"`
  - [ ] `"docs:preview": "vitepress preview website"`

### Configuration

- [ ] Create `website/.vitepress/config.ts`
  - [ ] Set site title and description
  - [ ] Configure base URL (`/` for Vercel)
  - [ ] Set up metadata (og:image, description)
  - [ ] Configure appearance (dark mode settings)
  - [ ] Set up head tags (favicon, meta)
  - [ ] Enable local search
  - [ ] Configure sitemap (hostname: docs.claudelint.dev)
- [ ] Configure navigation (based on information-architecture.md)
  - [ ] Create navbar (Guide, Validators, Rules, Integrations, API, Development)
  - [ ] Create sidebar structure (per-section sidebars)
  - [ ] Configure social links (GitHub, npm)
- [ ] Set up theme
  - [ ] Configure colors (brand, accent) from design.md
  - [ ] Set up logo
  - [ ] Configure footer
  - [ ] Set up edit link (GitHub)

### Manual Doc Sync

- [ ] Create sync script `scripts/sync-docs.ts`
  - [ ] Copy guide docs from docs/ to website/guide/
  - [ ] Copy validator docs to website/validators/
  - [ ] Copy API docs to website/api/
  - [ ] Copy development docs to website/development/
  - [ ] Transform markdown (update links, add frontmatter)
- [ ] Run sync script: `npm run sync-docs`
- [ ] Create homepage `website/index.md`
  - [ ] Hero section
  - [ ] Feature highlights
  - [ ] Quick start code snippet

### Testing

- [ ] Run dev server (`npm run docs:dev`)
- [ ] Verify all sections load
- [ ] Test navigation (navbar, sidebar)
- [ ] Test dark mode toggle
- [ ] Check mobile responsiveness
- [ ] Test search functionality
- [ ] Verify all links work

**Phase 1 Complete**: ☐ (0/29 tasks = 0%)

---

## Phase 2: Metadata Foundation (Week 2)

**Goal**: Set up auto-generation infrastructure and add metadata to 25% of rules
**Deliverable**: Rule doc generation working, high-priority rules have metadata

### Auto-Generation Infrastructure

- [ ] Create type definitions
  - [ ] Create `src/types/rule-metadata.ts`
  - [ ] Define `RuleDocumentation` interface
  - [ ] Define `ExampleBlock`, `ConfigExample`, `Link` types
  - [ ] Export all types
- [ ] Create generation script
  - [ ] Create `scripts/generate-rule-docs.ts`
  - [ ] Implement `getAllRules()` registry reader
  - [ ] Implement fallback to existing docs (Phase 1)
  - [ ] Add progress logging
- [ ] Create page template generator
  - [ ] Create `scripts/generators/rule-page.ts`
  - [ ] Implement `generateRulePage(rule)` function
  - [ ] Generate badges (severity, fixable, recommended)
  - [ ] Generate examples sections (incorrect/correct)
  - [ ] Generate options documentation
  - [ ] Generate related rules links
- [ ] Test generation system
  - [ ] Create 1-2 rules with full metadata as examples
  - [ ] Run `npm run docs:generate`
  - [ ] Verify generated markdown quality
  - [ ] Test in VitePress dev server

### Priority 1: High-Impact Rules (25% = ~26 rules)

Add `meta.docs` to most commonly violated rules:

#### CLAUDE.md Rules (14 total → 4 with metadata)

- [ ] claude-md-size-error
- [ ] claude-md-size-warning
- [ ] claude-md-import-missing
- [ ] claude-md-file-not-found

#### Skills Rules (32 total → 8 with metadata)

- [ ] skill-name
- [ ] skill-description
- [ ] skill-missing-shebang (auto-fixable)
- [ ] skill-missing-version (auto-fixable)
- [ ] skill-missing-changelog (auto-fixable)
- [ ] skill-dangerous-command
- [ ] skill-eval-usage
- [ ] skill-path-traversal

#### Settings Rules (5 total → 2 with metadata)

- [ ] settings-invalid-permission
- [ ] settings-permission-invalid-rule

#### Hooks Rules (3 total → 2 with metadata)

- [ ] hooks-invalid-event
- [ ] hooks-missing-script

#### MCP Rules (13 total → 4 with metadata)

- [ ] mcp-invalid-server
- [ ] mcp-stdio-empty-command
- [ ] mcp-http-invalid-url
- [ ] mcp-invalid-env-var

#### Plugin Rules (13 total → 3 with metadata)

- [ ] plugin-invalid-manifest
- [ ] plugin-name-required
- [ ] plugin-version-required

#### Other Validators (25 total → 3 with metadata)

- [ ] agent-name
- [ ] lsp-command-not-in-path
- [ ] output-style-name

### Testing & Validation

- [ ] Generate all docs: `npm run docs:generate`
- [ ] Verify 26 rules have generated docs
- [ ] Verify 79 rules use existing docs (fallback)
- [ ] Check generated markdown quality
- [ ] Test all links work
- [ ] Run dev server and spot-check pages

### Documentation

- [ ] Update README with metadata approach
- [ ] Add examples of good metadata to contributing guide
- [ ] Document metadata schema in development docs

**Phase 2 Complete**: ☐ (0/43 tasks = 0%)

---

## Phase 3: Metadata Completion (Weeks 3-4)

**Goal**: Add metadata to 100% of rules
**Deliverable**: All 105 rules auto-generated from source code

### Week 3: Remaining 50% (40 rules)

#### Priority 2: Medium-Priority Rules

- [ ] Add metadata to 20 rules (Days 1-3)
  - [ ] Mix across all validators
  - [ ] Focus on rules with complex options
  - [ ] Include auto-fixable rules
- [ ] Add metadata to 20 more rules (Days 4-5)
  - [ ] Continue across validators
  - [ ] Ensure good coverage of all categories
- [ ] Testing
  - [ ] Generate docs: `npm run docs:generate`
  - [ ] Verify ~75% auto-generated
  - [ ] Check quality and consistency

### Week 4: Final 25% (39 rules)

#### Priority 3: Remaining Rules

- [ ] Add metadata to remaining rules (Days 1-4)
  - [ ] Complete all CLAUDE.md rules
  - [ ] Complete all Skills rules
  - [ ] Complete all other validators
- [ ] Final cleanup (Day 5)
  - [ ] Ensure all 105 rules have metadata
  - [ ] Verify consistency across all docs
  - [ ] Generate final docs
  - [ ] Remove docs/ folder (now unnecessary)

### Validation

- [ ] Run full generation: `npm run docs:generate`
- [ ] Verify all 105 rules auto-generated
- [ ] No fallback to manual docs
- [ ] All examples render correctly
- [ ] All options documented
- [ ] All related rules linked

### Pre-commit Hook

- [ ] Create `.pre-commit-config.yaml`
- [ ] Add docs:generate hook
- [ ] Test hook prevents commits with stale docs
- [ ] Document in CONTRIBUTING.md

**Phase 3 Complete**: ☐ (0/10 tasks = 0%)

---

## Phase 4: Custom Components (Week 5)

**Goal**: Build interactive Vue components
**Deliverable**: Enhanced documentation with interactive features

### Component Infrastructure

- [ ] Create `docs/.vitepress/theme/index.ts`
  - [ ] Extend default theme
  - [ ] Register global components
- [ ] Create `docs/.vitepress/components/` directory
- [ ] Set up component TypeScript types

### Core Components

- [ ] Create `FeatureGrid.vue`
  - [ ] Props: features array
  - [ ] Grid layout with icons
  - [ ] Responsive design
  - [ ] Usage in homepage
- [ ] Create `CodeTabs.vue`
  - [ ] Tabbed code blocks
  - [ ] npm/yarn/pnpm variants
  - [ ] Copy button
  - [ ] Usage in installation
- [ ] Create `RuleCard.vue`
  - [ ] Display rule metadata
  - [ ] Severity badge
  - [ ] Fixable indicator
  - [ ] Link to full docs
  - [ ] Usage in rules index
- [ ] Create `ValidatorDiagram.vue`
  - [ ] Visual flow diagram
  - [ ] Interactive elements
  - [ ] Usage in architecture
- [ ] Create `ConfigExample.vue`
  - [ ] JSON config display
  - [ ] Inline annotations
  - [ ] Copy button
  - [ ] Usage throughout guides

### Interactive Components (Nice-to-Have)

- [ ] Create `RulePlayground.vue`
  - [ ] Input textarea
  - [ ] Live validation
  - [ ] Error display
  - [ ] Requires backend or WASM
- [ ] Create `ConfigGenerator.vue`
  - [ ] Visual config builder
  - [ ] Form inputs
  - [ ] Generate JSON
  - [ ] Download button

### Component Testing

- [ ] Verify all components render
- [ ] Test mobile responsiveness
- [ ] Test dark mode compatibility
- [ ] Check accessibility (a11y)

**Phase 4 Complete**: ☐ (0/24 tasks = 0%)

---

## Phase 5: Enhanced Features (Week 5 continued)

**Goal**: Add advanced VitePress features
**Deliverable**: Search, diagrams, enhanced navigation

(Note: Can overlap with Phase 4 component development)

### Search Setup

- [ ] Configure local search
  - [ ] Enable in config.ts
  - [ ] Test search functionality
  - [ ] Customize search options
- [ ] OR Configure Algolia DocSearch
  - [ ] Apply for DocSearch
  - [ ] Add API keys
  - [ ] Customize search UI
  - [ ] Test integration

### Diagrams & Visualizations

- [ ] Set up Mermaid.js support
  - [ ] Install plugin
  - [ ] Configure in VitePress
  - [ ] Test rendering
- [ ] Add architecture diagrams
  - [ ] Validator flow diagram
  - [ ] Plugin system diagram
  - [ ] Composition framework diagram
- [ ] Add flowcharts for guides
  - [ ] Validation flow
  - [ ] Decision trees

### Code Features

- [ ] Configure syntax highlighting
  - [ ] Add custom language grammars
  - [ ] Configure Shiki theme
  - [ ] Test all code blocks
- [ ] Add code group examples
  - [ ] Multiple file examples
  - [ ] Before/after comparisons
  - [ ] Different config formats
- [ ] Enable line highlighting
  - [ ] Highlight specific lines
  - [ ] Focus regions
  - [ ] Diff highlighting

### Navigation Enhancements

- [ ] Add breadcrumbs
- [ ] Configure prev/next links
- [ ] Add "on this page" outline
- [ ] Create custom 404 page

### SEO & Meta

- [ ] Add og:image for all pages
- [ ] Configure meta descriptions
- [ ] Generate sitemap
- [ ] Add robots.txt
- [ ] Test social media previews

**Phase 5 Complete**: ☐ (0/29 tasks = 0%)

---

## Phase 6: Deployment & Launch (Week 6)

**Goal**: Deploy to Vercel and launch publicly
**Deliverable**: Live site at docs.claudelint.dev with 95+ Lighthouse score

### Vercel Setup (Days 1-2)

- [ ] Create Vercel account / sign in with GitHub
- [ ] Import claudelint repository
  - [ ] Click "Add New Project"
  - [ ] Select pdugan20/claudelint
  - [ ] Verify auto-detected settings:
    - [ ] Framework: VitePress
    - [ ] Build command: `npm run docs:build`
    - [ ] Output directory: `website/.vitepress/dist`
    - [ ] Root directory: `./`
- [ ] Deploy initial version
  - [ ] Click "Deploy"
  - [ ] Wait for build completion (~1-2 min)
  - [ ] Verify preview URL works
- [ ] Configure custom domain
  - [ ] Add domain: `docs.claudelint.dev`
  - [ ] Copy DNS instructions
  - [ ] Configure DNS at domain provider:
    - Type: CNAME
    - Name: docs
    - Value: cname.vercel-dns.com
  - [ ] Wait for DNS propagation (5-30 min)
  - [ ] Verify HTTPS works
- [ ] Test PR preview deployments
  - [ ] Create test PR
  - [ ] Verify Vercel bot comments with preview URL
  - [ ] Test preview deployment works

### Vercel Configuration (Optional)

- [ ] Create `vercel.json` for advanced settings
  - [ ] Configure cache headers
  - [ ] Set up redirects (if needed)
  - [ ] Configure security headers
- [ ] Enable Vercel Analytics
  - [ ] Go to Project → Analytics
  - [ ] Enable Vercel Analytics
  - [ ] Test analytics tracking

### Performance Optimization (Days 3-4)

- [ ] Optimize images
  - [ ] Compress PNGs with TinyPNG
  - [ ] Convert to WebP format where appropriate
  - [ ] Add width/height attributes
  - [ ] Optimize logo/favicon
- [ ] Test performance
  - [ ] Run Lighthouse audit
  - [ ] Target scores:
    - [ ] Performance: 95+
    - [ ] Accessibility: 95+
    - [ ] Best Practices: 95+
    - [ ] SEO: 95+
  - [ ] Fix any issues identified

### Monitoring & Analytics (Optional)

- [ ] Add privacy-friendly analytics
  - [ ] Option 1: Vercel Analytics (built-in, free)
  - [ ] Option 2: Plausible (privacy-focused)
- [ ] Set up uptime monitoring
  - [ ] UptimeRobot or similar
  - [ ] Monitor docs.claudelint.dev
  - [ ] Configure alerts

### Pre-Launch Polish (Day 5)

- [ ] Content review
  - [ ] Proofread key pages (homepage, getting started)
  - [ ] Check code examples work
  - [ ] Verify all navigation links
  - [ ] Test search functionality
- [ ] Cross-browser testing
  - [ ] Chrome (desktop + mobile)
  - [ ] Firefox
  - [ ] Safari (macOS + iOS)
  - [ ] Edge
- [ ] Accessibility audit
  - [ ] Run axe DevTools
  - [ ] Test keyboard navigation
  - [ ] Check color contrast
  - [ ] Verify alt text on images

### Launch (Day 5)

- [ ] Final deployment
  - [ ] Merge to main branch
  - [ ] Verify Vercel auto-deploys
  - [ ] Test live site at docs.claudelint.dev
  - [ ] Verify search works in production
  - [ ] Test mobile responsiveness
- [ ] Update project links
  - [ ] Update main README.md with docs link
  - [ ] Update npm package.json homepage field
  - [ ] Add docs badge to README
- [ ] Announce
  - [ ] Post to GitHub Discussions
  - [ ] Update project description
  - [ ] Share on social media (optional)

### Post-Launch (Ongoing)

- [ ] Monitor Vercel analytics
- [ ] Track any broken links
- [ ] Gather user feedback
- [ ] Create backlog for improvements

**Phase 6 Complete**: ☐ (0/32 tasks = 0%)

---

## Overall Progress

### By Phase

- [ ] Pre-Phase: Validation (0/9 tasks = 0%)
- [ ] Phase 1: VitePress Setup + Manual Sync (0/29 tasks = 0%)
- [ ] Phase 2: Metadata Foundation (0/43 tasks = 0%)
- [ ] Phase 3: Metadata Completion (0/10 tasks = 0%)
- [ ] Phase 4: Custom Components (0/24 tasks = 0%)
- [ ] Phase 5: Enhanced Features (0/29 tasks = 0%)
- [ ] Phase 6: Deployment & Launch (0/32 tasks = 0%)

**Total Progress**: 0/176 tasks (0%)

### By Category

- **Validation**: 0/9 tasks (0%)
- **Setup & Infrastructure**: 0/29 tasks (0%)
- **Auto-Generation & Metadata**: 0/53 tasks (0%)
- **Components & Features**: 0/53 tasks (0%)
- **Deployment & Launch**: 0/32 tasks (0%)

---

## Milestones

### Milestone 0: Validation Complete

- [ ] Pre-Phase complete
- [ ] VitePress capabilities validated
- [ ] Performance confirmed (<100ms HMR)
- [ ] Decision to proceed made
- **Target**: Before Week 1

### Milestone 1: Site Running with Existing Docs

- [ ] Phase 1 complete
- [ ] VitePress installed and configured in website/ folder
- [ ] Existing docs synced to VitePress
- [ ] Dev server running at localhost:5173
- [ ] Basic navigation working
- **Target**: End of Week 1

### Milestone 2: Auto-Generation Working

- [ ] Phase 2 complete
- [ ] Auto-generation infrastructure built
- [ ] 25% of rules have TypeScript metadata
- [ ] Rule docs auto-generating from code
- [ ] Fallback to manual docs working
- **Target**: End of Week 2

### Milestone 3: 100% Auto-Generated Docs

- [ ] Phase 3 complete
- [ ] All 105 rules have metadata
- [ ] All rule docs auto-generated
- [ ] docs/ folder removed (single source of truth)
- [ ] Pre-commit hook enforces metadata sync
- **Target**: End of Week 4

### Milestone 4: Enhanced UX

- [ ] Phase 4 complete
- [ ] Custom Vue components built
- [ ] RuleExplorer working
- [ ] ConfigGenerator functional
- [ ] Interactive features polished
- **Target**: End of Week 5

### Milestone 5: Production Deployed

- [ ] Phase 6 complete (deployment section)
- [ ] Site deployed to Vercel
- [ ] Custom domain configured (docs.claudelint.dev)
- [ ] HTTPS enabled
- [ ] PR previews working
- **Target**: Week 6, Day 2

### Milestone 6: Public Launch

- [ ] Phase 6 complete (all tasks)
- [ ] Lighthouse score 95+
- [ ] Accessibility verified
- [ ] Site announced publicly
- [ ] Monitoring active
- **Target**: End of Week 6

---

## Notes

- Update this file as tasks are completed
- Mark tasks with `[x]` when done
- Update progress percentages after each phase
- Document any blockers or issues
- Celebrate milestones!

## Dependencies

- VitePress `^1.0.0` (latest stable)
- Vue `^3.3.0`
- Node.js `>=18.0.0`

## Useful Commands

```bash
# Development
npm run docs:dev              # Start dev server
npm run docs:build            # Build for production
npm run docs:preview          # Preview production build

# Deployment
git push origin main          # Trigger CI/CD deploy
```

## Related Files

- [plan.md](./plan.md) - Detailed implementation plan
- [information-architecture.md](./information-architecture.md) - Site structure and navigation
- [auto-generation-guide.md](./auto-generation-guide.md) - Rule doc auto-generation system
- [design.md](./design.md) - Design system and branding
- [deployment.md](./deployment.md) - Vercel deployment configuration
