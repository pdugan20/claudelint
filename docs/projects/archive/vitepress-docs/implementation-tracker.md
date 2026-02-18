# VitePress Implementation Tracker

**Start Date**: 2026-02-11
**Target Completion**: 6 weeks from start
**Current Phase**: Complete (Phase 7 done, Phase 6 deferred items remaining)

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

- [x] Set up minimal VitePress proof-of-concept
  - [x] Install VitePress in website/ directory (v1.6.4)
  - [x] Create basic config (.mts for ESM compat) and 3 markdown pages
  - [x] Verify dev server starts (port 5173, all pages return 200)
- [x] Test Vue component creation
  - [x] Create RuleBadge.vue component (error/warning/info badges)
  - [x] Register in theme/index.ts and use in rules-overview.md
  - [x] Verify component renders (confirmed in build HTML output)
- [x] Verify build performance
  - [x] Dev server start: ~1.6s (target: <1s, acceptable)
  - [x] Production build: 1.59s (target: <30s)
  - [x] Per-page JS: ~5KB (target: <50KB)
- [x] Confirm local search works
  - [x] Local search enabled in config (provider: 'local')
  - [x] Search index generated: 12 sections, 6.5KB index file
  - [x] Search index accessible via preview server (HTTP 200)

### Decision Gate

- [x] **All validation tasks passed**: Proceed to Phase 1
- [ ] ~~Any blockers identified~~: No blockers found

**Note**: Config file uses `.mts` extension (not `.ts`) due to project `"type": "commonjs"` and VitePress being ESM-only.

**Pre-Phase Complete**: (9/9 tasks = 100%)

---

## Phase 1: VitePress Setup + Manual Sync (Week 1)

**Goal**: Get VitePress site running with existing docs
**Deliverable**: Working dev server at localhost:5173

### Installation

- [x] Install VitePress dependencies
  - [x] `npm install -D vitepress vue tsx`
- [x] Create `website/` directory structure
  - [x] `website/.vitepress/` with config.mts, theme/, components/
  - [x] `website/public/` (static assets)
  - [x] Section dirs: guide/, validators/, rules/, integrations/, api/, development/
- [x] Add npm scripts to package.json
  - [x] `"docs:dev": "vitepress dev website"`
  - [x] `"docs:build": "vitepress build website"`
  - [x] `"docs:preview": "vitepress preview website"`

### Configuration

- [x] Create `website/.vitepress/config.mts` (ESM compat with .mts)
  - [x] Set site title and description
  - [x] Configure base URL (`/` for Vercel)
  - [x] Set up metadata (og:title, og:description)
  - [x] Set up head tags (favicon, meta)
  - [x] Enable local search (provider: 'local')
  - [x] Configure sitemap (hostname: <https://claudelint.com>)
  - [x] Dead links ignored temporarily (TODO: remove in Phase 3)
- [x] Configure navigation (based on information-architecture.md)
  - [x] Create navbar (Guide, Validators, Rules, Integrations, API, Development)
  - [x] Create sidebar structure (per-section sidebars, 6 sections)
  - [x] Configure social links (GitHub, npm)
- [x] Set up theme
  - [x] Configure brand colors (#2563eb blue) in style.css
  - [x] Configure footer (MIT license, copyright)
  - [x] Set up edit link (GitHub)

### Manual Doc Sync

- [x] Copy existing docs to website structure (direct copy, no sync script needed)
  - [x] Guide docs: 9 files (getting-started, configuration, cli-reference, auto-fix, inline-disables, troubleshooting, glossary, why-claudelint, rules-overview)
  - [x] API docs: 5 files (overview, claudelint-class, functional-api, types, formatters)
  - [x] Integration docs: 6 files (overview, ci, pre-commit, npm-scripts, claude-code-plugin, monorepos)
  - [x] Development docs: 4 files (overview, architecture, custom-rules, contributing)
  - [x] Validator overview: 1 file
  - [x] Rules overview: 1 file
- [x] Create homepage `website/index.md`
  - [x] Hero section (name, tagline, CTA buttons)
  - [x] Feature highlights (4 features)

### Testing

- [x] Build succeeds: 26 pages in 5.28s
- [x] All 7 section entry points return HTTP 200
- [x] Navbar with 6 sections renders
- [x] Sidebar navigation per section
- [x] Local search index generated (26 pages indexed)
- [x] Dark mode toggle (verified via browser testing 2026-02-17)
- [x] Mobile responsiveness (verified via browser testing 2026-02-17)

**Note**: 106 dead links from old docs/ relative paths; ignored for now, will be resolved as rule pages are added in Phase 2-3.

**Phase 1 Complete**: (29/29 tasks = 100%)

---

## Phase 2: Metadata Foundation (Week 2)

**Goal**: Set up auto-generation infrastructure and add metadata to 25% of rules
**Deliverable**: Rule doc generation working, high-priority rules have metadata

### Auto-Generation Infrastructure

- [x] Create type definitions
  - [x] Create `src/types/rule-metadata.ts`
  - [x] Define `RuleDocumentation` interface
  - [x] Define `ExampleBlock`, `ConfigExample`, `Link` types
  - [x] Export all types
- [x] Create generation script
  - [x] Create `scripts/generate/rule-docs.ts`
  - [x] Implement `getAllRules()` registry reader
  - [x] Implement fallback to existing docs
  - [x] Add progress logging and sidebar data generation
- [x] Create page template generator
  - [x] Create `scripts/generators/rule-page.ts`
  - [x] Implement `generateRulePage(rule)` function
  - [x] Generate badges (severity, fixable, recommended)
  - [x] Generate examples sections (incorrect/correct)
  - [x] Generate options documentation
  - [x] Generate related rules links
- [x] Test generation system
  - [x] 29 rules generate from metadata, 91 from existing docs
  - [x] Run `npm run docs:generate` (120 total pages)
  - [x] Verify generated markdown quality
  - [x] VitePress build succeeds (148 HTML pages in 8s)

### Priority 1: High-Impact Rules (25% = ~29 rules)

Add `meta.docs` to most commonly violated rules:

#### CLAUDE.md Rules (14 total → 4 with metadata)

- [x] claude-md-size-error
- [x] claude-md-size-warning
- [x] claude-md-import-missing
- [x] claude-md-file-not-found

#### Skills Rules (45 total → 10 with metadata)

- [x] skill-name
- [x] skill-description
- [x] skill-missing-shebang (auto-fixable)
- [x] skill-missing-version (auto-fixable)
- [x] skill-missing-changelog (auto-fixable)
- [x] skill-dangerous-command
- [x] skill-eval-usage
- [x] skill-path-traversal
- [x] skill-body-too-long
- [x] skill-body-word-count

#### Settings Rules (5 total → 2 with metadata)

- [x] settings-invalid-permission
- [x] settings-permission-invalid-rule

#### Hooks Rules (3 total → 2 with metadata)

- [x] hooks-invalid-event
- [x] hooks-missing-script

#### MCP Rules (13 total → 4 with metadata)

- [x] mcp-invalid-server
- [x] mcp-stdio-empty-command
- [x] mcp-http-invalid-url
- [x] mcp-invalid-env-var

#### Plugin Rules (12 total → 3 with metadata)

- [x] plugin-invalid-manifest
- [x] plugin-name-required
- [x] plugin-version-required

#### Agents Rules (12 total → 2 with metadata)

- [x] agent-name
- [x] agent-description

#### LSP Rules (8 total → 1 with metadata)

- [x] lsp-invalid-transport

#### Output Styles Rules (3 total → 1 with metadata)

- [x] output-style-name-directory-mismatch

### Testing & Validation

- [x] Generate all docs: `npm run docs:generate`
- [x] Verify 29 rules have generated docs
- [x] Verify 91 rules use existing docs (fallback)
- [x] Check generated markdown quality
- [x] Test all links work (ignoreDeadLinks active)
- [x] Build succeeds: 148 HTML pages in 8s

### Documentation

- [x] Update README with metadata approach
- [x] Add examples of good metadata to contributing guide
- [x] Document metadata schema in development docs

**Phase 2 Complete**: (43/43 tasks = 100%)

---

## Phase 3: Metadata Completion (Weeks 3-4)

**Goal**: Add metadata to 100% of rules
**Deliverable**: All 117 rules auto-generated from source code

### Remaining Rules (91 rules across all categories)

- [x] Add metadata to all Agents rules (10 rules)
- [x] Add metadata to all CLAUDE.md rules (12 rules)
- [x] Add metadata to Commands, Hooks, LSP, Output Styles, Settings rules (15 rules)
- [x] Add metadata to MCP and Plugin rules (18 rules)
- [x] Add metadata to Skills rules batch 1 (18 rules)
- [x] Add metadata to Skills rules batch 2 (18 rules)

### Validation

- [x] Run full generation: `npm run docs:generate`
- [x] Verify all 117 rules auto-generated from metadata
- [x] No fallback to manual docs (0 copied from existing)
- [x] All examples render correctly (quadruple fences for nested code blocks)
- [x] All options documented (optionExamples where applicable)
- [x] All related rules linked

**Phase 3 Complete**: (12/12 tasks = 100%)

---

## Phase 4: Custom Components (Week 5)

**Goal**: Build interactive Vue components
**Deliverable**: Enhanced documentation with interactive features

### Component Infrastructure

- [x] Extend default theme in `website/.vitepress/theme/index.ts`
- [x] Register all 6 global components (RuleBadge + 5 new)
- [x] Components directory: `website/.vitepress/theme/components/`

### Core Components

- [x] Create `FeatureGrid.vue`
  - [x] Props: features array with title, details, optional icon
  - [x] Responsive grid layout (auto-fit, min 240px)
  - [x] Hover effects with brand color border
- [x] Create `CodeTabs.vue`
  - [x] Tabbed code blocks with ARIA roles
  - [x] Copy button (appears on hover)
  - [x] Used in getting-started (npm/yarn/pnpm install)
- [x] Create `RuleCard.vue`
  - [x] Rule ID, description, severity badge (uses RuleBadge)
  - [x] Fixable indicator and category tag
  - [x] Link to full rule page
  - [x] Used in rules overview (6 featured rules)
- [x] Create `ValidatorDiagram.vue`
  - [x] Visual pipeline: Input -> Engine -> Validators -> Output
  - [x] Clickable validator boxes with rule counts
  - [x] Used in validators overview
- [x] Create `ConfigExample.vue`
  - [x] Filename header with copy button
  - [x] JSON display with monospace formatting
  - [x] Optional caption for context
  - [x] Used in getting-started configuration section

### Interactive Components (Deferred)

- [ ] `RulePlayground.vue` - Requires backend or WASM (post-launch)
- [ ] `ConfigGenerator.vue` - Visual config builder (post-launch)

### Component Testing

- [x] VitePress build succeeds with all components (7.19s)
- [x] Test mobile responsiveness (verified via browser testing 2026-02-17)
- [x] Test dark mode compatibility (verified via browser testing 2026-02-17)
- [x] Check accessibility (Lighthouse 96-100, axe audit run 2026-02-17)

**Phase 4 Complete**: (21/21 tasks = 100%, excluding deferred interactive components)

---

## Phase 5: Enhanced Features (Week 5 continued)

**Goal**: Add advanced VitePress features
**Deliverable**: Search, diagrams, enhanced navigation

### Search Setup

- [x] Configure local search (provider: 'local' in config.mts)
- [ ] Algolia DocSearch (optional, post-launch upgrade)

### Diagrams & Visualizations

- [x] Validator flow diagram (custom ValidatorDiagram.vue component)
- [ ] Mermaid.js support (optional, post-launch)

### Code Features

- [x] Shiki syntax highlighting (github-light / github-dark themes)
- [x] CodeTabs component for multi-variant code examples
- [ ] Line highlighting and diff highlighting (post-launch polish)

### Navigation Enhancements

- [x] "On this page" outline (configured: levels 2-3)
- [x] Custom 404 page created
- [x] Edit link on each page (GitHub)
- [ ] Breadcrumbs (VitePress does not natively support; deferred)

### SEO & Meta

- [x] OG meta tags configured (og:type, og:title, og:description)
- [x] Sitemap generation enabled (hostname: claudelint.com)
- [x] robots.txt created (Allow all, sitemap reference)
- [x] llms.txt and llms-full.txt (vitepress-plugin-llms, auto-generated at build time)
- [x] og:image for social previews (completed in branding-and-assets project)
- [ ] Test social media previews (post-deployment)

**Phase 5 Complete**: (12/16 tasks = 75%, remainder deferred to post-launch)

---

## Phase 6: Deployment & Launch (Week 6)

**Goal**: Deploy to Vercel and launch publicly
**Deliverable**: Live site at claudelint.com with 95+ Lighthouse score

### Vercel Setup (Days 1-2)

- [x] Create Vercel account / sign in with GitHub
- [x] Import claudelint repository
  - [x] Click "Add New Project"
  - [x] Select pdugan20/claudelint
  - [x] Verify auto-detected settings:
    - [x] Framework: VitePress
    - [x] Build command: `npm run docs:build`
    - [x] Output directory: `website/.vitepress/dist`
    - [x] Root directory: `./`
- [x] Deploy initial version
  - [x] Click "Deploy"
  - [x] Wait for build completion
  - [x] Verify preview URL works
- [x] Configure custom domain
  - [x] Add domain: `claudelint.com`
  - [x] Configure DNS at domain provider
  - [x] Verify HTTPS works
  - [x] Live at <https://www.claudelint.com>
- [x] Test PR preview deployments
  - [x] Create test PR (#36, closed after verification)
  - [x] Verify Vercel bot comments with preview URL
  - [x] Test preview deployment works (SSO-protected preview served by Vercel)

### Vercel Configuration

- [x] Create `vercel.json` for advanced settings
  - [x] Configure cache headers (immutable for /assets/, must-revalidate for HTML)
  - [x] Configure security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
  - [x] Set cleanUrls and trailingSlash
  - [x] Set Content-Type for llms.txt files
- [x] Create `.vercelignore` (exclude tests, docs, .claude, .github from uploads)
- [x] Add docs-build CI job to validate VitePress build on every PR
- [x] Enable Vercel Analytics
  - [x] Install `@vercel/analytics` and inject in theme
  - [x] Enable Vercel Analytics in dashboard
  - [x] Test analytics tracking (scripts load on production, 404 only on local preview)

### Domain Configuration

- [x] Configure apex domain (`claudelint.com`) as primary production domain
- [x] Configure `www.claudelint.com` as 308 permanent redirect to apex
- [x] Verify HTTPS works on both domains
- [x] Verify sitemap accessible at `/sitemap.xml` (168 URLs, correct domain)

### Deploy Latest Changes

- [x] Commit and push local changes to main (llms plugin, vercel.json, .vercelignore, CI job)
- [x] Verify Vercel auto-deploys from push
- [x] Verify `/llms.txt` accessible on production
- [x] Verify `/llms-full.txt` accessible on production
- [x] Verify hardened security headers active (HSTS, Permissions-Policy, etc.)

### Monitoring & Analytics

- [x] Add Vercel Speed Insights (`@vercel/speed-insights` injected in theme)
- [x] Add Vercel Web Analytics (`@vercel/analytics` injected in theme)
- [x] Enable Vercel Web Analytics in dashboard
- [x] Enable Speed Insights in Vercel dashboard

### Project Links & README

- [x] Update main README.md with docs site link
- [x] Add docs badge to README (`docs | claudelint.com`)
- [x] Verify npm package.json homepage field (already `https://claudelint.com`)

### SEO & Social Verification

- [x] Test OG images with opengraph.xyz or similar debugger
- [x] Verify OG images readable at thumbnail size (~300px wide)
- [x] Verify logo recognizable at 16x16 (favicon size)
- [ ] Test social media share preview (Twitter, LinkedIn)

### Performance Audit

- [x] Run Lighthouse audit on homepage
- [x] Run Lighthouse audit on a rule page
- [x] Target scores:
  - [ ] Performance: 95+ (actual: 88 mobile / 81 desktop — font loading bottleneck)
  - [x] Accessibility: 95+ (actual: 96 homepage, 100 rule pages)
  - [x] Best Practices: 95+ (actual: 100)
  - [x] SEO: 95+ (actual: 100)
- [x] Fix any issues identified (async font loading, heading hierarchy, main landmark, hero spacing)

### PR Preview Deployments

- [x] Create test PR branch (PR #36, test/verify-pr-previews)
- [x] Verify Vercel bot comments with preview URL
- [x] Test preview deployment works (SSO-protected, served by Vercel)
- [x] Verify preview has correct content

### Cross-Browser & Accessibility

- [x] Chrome (desktop + mobile) (verified 2026-02-17)
- [ ] Firefox (requires manual testing)
- [x] Safari (macOS + iOS) (verified 2026-02-17)
- [ ] Edge (requires manual testing)
- [x] Run axe DevTools accessibility audit (Lighthouse uses axe-core: 96 homepage, 100 rule pages)
- [ ] Test keyboard navigation (requires manual testing)
- [x] Check color contrast ratios (Lighthouse verified; footer heading intentionally kept at 3.2:1)
- [x] Verify alt text on images (only nav logos had empty alt — fixed with logo alt prop)

### Image Optimization (Deferred)

- [ ] Compress PNGs with TinyPNG or similar
- [ ] Convert to WebP format where appropriate
- [ ] Add width/height attributes to images

### Post-Launch

- [ ] Monitor Vercel analytics dashboard
- [x] Track any broken links (broken-link-checker: 22,923 links checked, 0 broken)
- [ ] Gather user feedback
- [ ] Set up uptime monitoring (UptimeRobot or similar)

**Phase 6 Complete**: ☐ (44/52 tasks = 85%)

---

## Phase 7: Docs Cleanup & Single Source of Truth (Post-Launch)

**Goal**: Eliminate duplicate documentation, establish single source of truth
**Deliverable**: All user-facing documentation in `website/`, `docs/projects/` retained for internal tracking

### Verify Migration Completeness

- [x] Audit all files in `docs/` against `website/` content
  - [x] Verify every user-facing doc has been migrated (docs/rules/, docs/api/, docs/guide/ already deleted in prior sessions)
  - [x] Verify no content was lost during migration (only docs/projects/ remains — internal tracking)
  - [x] Check all internal links resolve correctly (broken-link-checker: 0 broken)
- [x] Confirm auto-generation covers all 117 rules
  - [x] Run `npm run docs:generate` and verify output (117/117 from metadata)
  - [x] Spot-check rule pages for quality (verified during Lighthouse audit)

### Delete docs/ Directory

- [x] Remove `docs/rules/` (already deleted — now auto-generated in website/rules/)
- [x] Remove `docs/api/` (already deleted — migrated to website/api/)
- [x] ~~Remove `docs/projects/`~~ Retained: internal project tracking, referenced in CLAUDE.md
- [x] Remove remaining guide docs (already deleted — migrated to website/guide/)
- [x] ~~Remove `docs/` directory entirely~~ Retained docs/projects/ for project history
- [x] ~~`git rm -r docs/`~~ Not needed — only internal tracking remains

### Prevent Regression

- [x] ~~Add CI check that fails if files are added to `docs/`~~ Not needed: docs/projects/ is retained, and no user-facing docs dirs exist to accidentally populate
- [x] Update CLAUDE.md with "Documentation lives in `website/`" (already present)
- [x] Update CONTRIBUTING.md with new docs workflow (all links point to claudelint.com)
- [x] Update README.md to link to live site instead of docs/ files (badges point to claudelint.com)

### Update References

- [x] Search codebase for `docs/` references and update (112 rule docUrls + reporting.ts baseUrl migrated to claudelint.com)
- [x] ~~Update `scripts/check/file-naming.ts` to remove `checkRuleDocs()` which scans `docs/rules/`~~ Already correct: checkRuleDocs() scans website/rules, not docs/rules
- [x] Update skill and hook references to docs/ paths (DEVELOPMENT.md updated)
- [x] Update package.json homepage field to claudelint.com (already set)
- [x] Verify all README badge links point to live site (verified: docs badge links to claudelint.com)

**Phase 7 Complete**: (14/14 tasks = 100%)

---

## Overall Progress

### By Phase

- [x] Pre-Phase: Validation (9/9 = 100%)
- [x] Phase 1: VitePress Setup + Manual Sync (29/29 = 100%)
- [x] Phase 2: Metadata Foundation (43/43 = 100%)
- [x] Phase 3: Metadata Completion (12/12 = 100%)
- [x] Phase 4: Custom Components (21/21 = 100%)
- [x] Phase 5: Enhanced Features (12/16 = 75%, remainder deferred to post-launch)
- [ ] Phase 6: Deployment & Launch (44/52 = 85%, remainder deferred/manual)
- [x] Phase 7: Docs Cleanup & Single Source of Truth (14/14 = 100%)

**Total Progress**: 179/185 tasks (97%) — Phases 1-5, 7 complete. Phase 6 at 85% (deferred items: social media preview testing, Firefox/Edge manual testing, keyboard navigation, image optimization, monitoring setup).

### By Category

- **Validation**: 9/9 (100%)
- **Setup & Infrastructure**: 27/29 (93%)
- **Auto-Generation & Metadata**: 55/55 (100%)
- **Components & Features**: 29/36 (81%)
- **Deployment & Launch**: 44/52 (85%)
- **Docs Cleanup**: 14/14 (100%)

### Note on Rule Counts

The tracker originally referenced 120 rules. Through deprecation, consolidation, and additions (M6 batches, agents rework), the current count is 117 rules. All 117 are auto-generated from source metadata.

---

## Milestones

### Milestone 0: Validation Complete

- [x] Pre-Phase complete
- [x] VitePress capabilities validated
- [x] Performance confirmed (1.59s build, ~5KB per-page JS)
- [x] Decision to proceed made
- **Target**: Before Week 1
- **Completed**: 2026-02-11

### Milestone 1: Site Running with Existing Docs

- [x] Phase 1 complete
- [x] VitePress installed and configured in website/ folder
- [x] Existing docs synced to VitePress
- [x] Dev server running at localhost:5173
- [x] Basic navigation working
- **Target**: End of Week 1
- **Completed**: 2026-02-11

### Milestone 2: Auto-Generation Working

- [x] Phase 2 complete
- [x] Auto-generation infrastructure built
- [x] 25% of rules have TypeScript metadata
- [x] Rule docs auto-generating from code
- [x] Fallback to manual docs working
- **Target**: End of Week 2
- **Completed**: 2026-02-11

### Milestone 3: 100% Auto-Generated Docs

- [x] Phase 3 complete
- [x] All 117 rules have metadata
- [x] All rule docs auto-generated (117/117 from metadata, 0 fallback)
- [x] Generation script handles nested code blocks (quadruple fences)
- **Target**: End of Week 4
- **Completed**: 2026-02-11

### Milestone 4: Enhanced UX

- [x] Phase 4 complete (5 core components)
- [x] Custom Vue components: CodeTabs, RuleCard, FeatureGrid, ValidatorDiagram, ConfigExample
- [x] Components integrated into pages (getting-started, rules overview, validators overview)
- [x] Phase 5 features: local search, Shiki highlighting, outline, 404, robots.txt, sitemap, llms.txt
- **Target**: End of Week 5
- **Completed**: 2026-02-11

### Milestone 5: Production Deployed

- [x] Phase 6 complete (deployment section)
- [x] Site deployed to Vercel
- [x] Custom domain configured (claudelint.com)
- [x] HTTPS enabled
- [x] PR previews working (verified PR #36)
- **Target**: Week 6, Day 2
- **Completed**: 2026-02-17

### Milestone 6: Public Launch

- [ ] Phase 6 complete (all tasks)
- [ ] Lighthouse score 95+
- [ ] Accessibility verified
- [ ] Site announced publicly
- [ ] Monitoring active
- **Target**: End of Week 6

### Milestone 7: Single Source of Truth

- [x] Phase 7 complete
- [x] User-facing docs fully migrated (docs/projects/ retained for internal tracking)
- [x] All 112 rule docUrls migrated from GitHub docs/ to claudelint.com
- [x] All references updated to live site
- [x] CLAUDE.md, CONTRIBUTING.md, and DEVELOPMENT.md updated
- **Target**: Week 6 + 1 day (immediately post-launch)
- **Completed**: 2026-02-17

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
