# VitePress Proposal Updates

Based on comprehensive research comparing VitePress and Docusaurus, the following updates have been made to the VitePress documentation project proposal.

## Summary of Changes

All updates are based on real-world migration experiences, performance benchmarks, and feature comparisons from 2026 research.

## Files Updated

### 1. README.md

#### Added: VitePress vs Docusaurus Trade-offs Section

New section clearly outlines what we're gaining and giving up by choosing VitePress:

**What We're Getting**:

- Lightning-fast builds (<100ms HMR)
- Minimal bundle (<200KB vs 500KB+)
- Better TypeScript DX
- Built-in local search
- Simpler maintenance

**What We're Giving Up**:

- Native versioning (critical limitation)
- Smaller plugin ecosystem
- Vue requirement (not React)
- Less mature (v1.0 in 2024)
- Smaller community

**Why It Makes Sense**: Justifies the trade-off based on claudelint's specific needs.

#### Added: Vue Components Section

Clarifies Vue requirements for different user types:

- **Content Authors**: 95% markdown, no Vue needed
- **Developers**: Vue 3 Composition API required
- **Time Investment**: Realistic estimates (0-4 hours depending on experience)

#### Added: Real-World Evidence Section

Documents successful VitePress migrations:

- 400+ page migration completed in ~1 week
- "Significantly faster and more responsive"
- Built-in search "drastically improved speed and accuracy"
- Socket.io considering migration from Docusaurus

#### Enhanced: Success Criteria Section

Expanded performance metrics with context:

**Build Performance**:

- Dev server start: <1s
- HMR: <100ms
- Production build: <30s
- Memory: <500MB

**Why These Matter**: Explains Docusaurus can require 10GB RAM + 26-minute builds.

#### Updated: Questions Section

- Versioning: Clarified VitePress has NO native versioning
- i18n: Explained manual setup required
- References to see plan.md for details

#### Added: Vite Plugins to Extensions

Listed key Vite plugins available:

- vite-plugin-pwa
- vite-plugin-compression
- vite-plugin-imagetools
- @vitejs/plugin-vue-jsx

### 2. plan.md

#### Updated: Q&A - Versioning

**Old**: "Start with single version, add versioning plugin in v2.0"

**New**: Honest explanation that:

- VitePress has NO native versioning
- Would require manual folder organization
- Or migration to Docusaurus
- Single version is appropriate for a linter

#### Updated: Q&A - i18n

**Old**: "VitePress has built-in i18n support for future"

**New**: Clarified that:

- i18n requires manual configuration (no plugin)
- More flexible than Docusaurus but more setup
- English-only is appropriate initially
- Consider Docusaurus if 10+ languages needed

#### Added: Search Strategy Section

New dedicated section explaining:

**Phase 1**: Built-in local search

- Powered by minisearch
- Works offline
- Fast for <100 pages
- Zero configuration
- Research shows it "drastically improved speed and accuracy"

**Future**: Algolia DocSearch only if >100 pages AND need advanced features

#### Updated: Future Enhancements Section

**Old**: Simple list including "Interactive rule playground (WASM-based validator)"

**New**: Realistic phasing:

**Phase 2.0 (3-6 months)**:

- Config generator (high value, medium complexity)
- Video tutorials (high value, low complexity)
- Community showcase (medium value, low complexity)

**Phase 3.0 (6-12 months)**:

- Interactive playground (40-60 hours effort)
- Options: WASM, WebContainer, or StackBlitz integration
- Multi-version docs (manual or migrate to Docusaurus)
- API reference auto-generation

### 3. implementation-tracker.md

#### Added: Pre-Phase Validation

New phase before Phase 1 with 9 validation tasks:

**Proof of Concept**:

- [ ] Set up minimal VitePress (1 hour)
- [ ] Test Vue component creation (1 hour)
- [ ] Verify build performance (30 min)
- [ ] Confirm local search works (30 min)

**Decision Gate**: Proceed or reconsider based on validation results

#### Updated: Overall Progress

- Added Pre-Phase to phase list
- Updated total tasks: 195 → 204
- Added "Validation" to category breakdown

#### Added: Milestone 0

New milestone for validation complete before starting Phase 1.

### 4. deployment.md

#### Added: Expected Build Times Section

Inserted after GitHub Actions workflow with concrete metrics:

**VitePress Expected**:

- Cold build: 10-20 seconds (50 pages)
- Incremental: 5-10 seconds
- CI/CD total: ~2-3 minutes

**Docusaurus Comparison**:

- Similar sites: 30-60 seconds
- Large versioned sites: Up to 26 minutes

**GitHub Actions Budget**:

- Free tier: 2,000 min/month
- Expected usage: 300 min/month
- Well within limits

## Key Research Insights Applied

### 1. Versioning is a Major Differentiator

**Finding**: VitePress has NO native versioning (manual only)
**Impact**: Clarified throughout docs that this is a limitation
**Mitigation**: Single version is appropriate for claudelint

### 2. Build Performance is Dramatically Better

**Finding**: VitePress <100ms HMR vs Docusaurus 26-min builds at scale
**Impact**: Added performance benchmarks as success criteria
**Confidence**: Validates VitePress choice for performance-critical docs

### 3. Local Search is Excellent

**Finding**: Teams reported local search "drastically improved" over alternatives
**Impact**: Changed recommendation from "Algolia in future" to "local search first"
**Savings**: No Algolia setup/cost needed initially

### 4. Real-World Migrations Validate Choice

**Finding**: 400+ page migration in ~1 week, Socket.io considering switch
**Impact**: Added evidence section to build confidence
**Lesson**: Our 50-page migration should be straightforward

### 5. i18n Requires Manual Setup

**Finding**: No i18n plugin, requires manual locale configuration
**Impact**: Set realistic expectations vs Docusaurus auto-i18n
**Conclusion**: English-only is appropriate for CLI tool

### 6. Vue Learning Curve is Manageable

**Finding**: 0-4 hours for basic Vue 3 Composition API
**Impact**: Added realistic time estimates
**Mitigation**: Most docs are markdown (no Vue needed)

## What Changed in Decision-Making

### Before Research

- Assumed versioning "plugin" would be available later
- Thought Algolia was necessary for good search
- Unclear about Vue learning curve
- No performance benchmarks to validate choice

### After Research

- Honest about versioning limitations (critical)
- Confident local search is sufficient
- Clear time estimates for Vue learning
- Concrete performance data validates VitePress choice
- Real-world evidence supports decision

## Confidence Level

**Before Updates**: Medium (missing critical info about limitations)
**After Updates**: High

The proposal now:

- Honestly addresses limitations (versioning, smaller ecosystem)
- Validates the choice with research (performance, real-world migrations)
- Sets realistic expectations (Vue learning, i18n manual setup)
- Provides concrete success metrics (build times, bundle sizes)

## Next Steps

1. **Review updates**: Ensure all stakeholders understand trade-offs
2. **Run Pre-Phase validation**: Validate VitePress capabilities before committing
3. **Proceed to Phase 1**: If validation passes, start implementation

## Questions Answered

- Does VitePress support versioning? **No (manual only)**
- Is Algolia necessary? **No (local search excellent)**
- How does build performance compare? **Much faster than Docusaurus**
- What's the Vue learning curve? **0-4 hours for basics**
- Will this scale? **Yes, up to 100+ pages easily**
- Are we making the right choice? **Yes, for claudelint's needs**

## Files Modified

- `docs/projects/vitepress-docs/README.md` - Trade-offs, Vue section, evidence, metrics
- `docs/projects/vitepress-docs/plan.md` - Q&A clarifications, search strategy, realistic phasing
- `docs/projects/vitepress-docs/implementation-tracker.md` - Pre-phase validation, updated totals
- `docs/projects/vitepress-docs/deployment.md` - Build performance benchmarks

**Total additions**: ~150 lines of critical context and clarifications
**Total changes**: 4 files updated with research-backed improvements

---

## February 2026 Feature Updates

### Monorepo Support Added (2026-02-01)

**Major new feature**: Full monorepo support with config inheritance and workspace detection.

#### New Features to Document

1. **Config Inheritance**
   - `extends` field in `.claudelintrc.json`
   - Relative paths: `"extends": "../../.claudelintrc.json"`
   - npm packages: `"extends": "@company/claudelint-config"`
   - Multiple extends: `"extends": ["base", "overrides"]"`
   - Circular dependency detection

2. **Workspace Detection**
   - Auto-detects pnpm workspaces (`pnpm-workspace.yaml`)
   - Auto-detects npm/Yarn workspaces (`package.json#workspaces`)
   - Glob pattern expansion to package directories
   - Workspace root auto-detection (works from any subdirectory)

3. **New CLI Flags**
   - `--workspace <name>` - Validate specific workspace package
   - `--workspaces` - Validate all workspace packages independently
   - Works with auto-detection (no need to be at workspace root)

4. **Performance Improvements**
   - Parallel workspace validation
   - 3-10x faster for monorepos
   - Maintains single-repo performance

#### Impact on VitePress Docs

**New Pages:**

- `/integrations/monorepos` - Complete monorepo setup guide (source: `docs/projects/archive/monorepo-support/user-guide.md`)

**Pages to Update:**

- `/guide/configuration` - Add `extends` field documentation
- `/guide/cli-reference` - Document `--workspace` and `--workspaces` flags
- `/development/architecture` - Simplify (validator refactoring)
- `index.md` (homepage) - Add monorepo support to features

**Stats Updates:**

- Total pages: ~155 → ~157 pages (+2)
- Features: Add "Monorepo Support" with config inheritance
- Performance: Add "3-10x faster for monorepos"

**Completed:**

- Updated `information-architecture.md` with `/integrations/monorepos` section
- Updated content mapping for monorepo user guide

**References:**

- Monorepo project: `docs/projects/archive/monorepo-support/`
- Git commits: fec2302 (workspace root), faa9fe8 (parallel), ceb4e53 (extends)

### Validator Refactoring (2026-02-01)

**Architecture simplification**: Removed composition framework, renamed validators.

#### Changes Made

1. **Removed Composition Framework**
   - Deleted 733 lines of unused code
   - Simplified validator architecture
   - No impact on functionality

2. **Renamed Classes**
   - `BaseValidator` → `FileValidator` (text/markdown validators)
   - `JSONConfigValidator` → `SchemaValidator` (JSON config validators)
   - `validateConfig()` method → `validateSemantics()`

#### Impact on VitePress Docs

**Pages to Update:**

- `/development/architecture` - Simplify validator class diagram, use new names
- `/development/validator-guide` - Use `FileValidator` and `SchemaValidator`
- `/development/custom-rules` - Update examples with new class names

**No user-facing changes** - purely internal refactoring

**Completed:**

- Documented changes in UPDATES.md

**References:**

- Validator refactor project: `docs/projects/archive/validator-refactor-2026/`
- Git commit: 94bc1c8

## Updated Implementation Plan

### Phase 1 Content Migration - Add Monorepo Guide

When migrating content in Phase 1, include:

```text
Content to migrate:
- docs/getting-started.md → website/guide/getting-started.md
- docs/configuration.md → website/guide/configuration.md
  + ADD: extends field documentation
- docs/cli-reference.md → website/guide/cli-reference.md
  + ADD: --workspace, --workspaces flags
- docs/projects/archive/monorepo-support/user-guide.md → website/integrations/monorepos.md (NEW)
```

### Phase 2 Architecture Updates

When updating architecture documentation:

```text
Architecture simplifications:
- Remove composition framework section (deleted code)
- Update class names:
  - BaseValidator → FileValidator
  - JSONConfigValidator → SchemaValidator
- Simplify validator diagram
```

## Content Outline: Monorepo Integration Guide

**Page**: `/integrations/monorepos.md`

**Source**: `docs/projects/archive/monorepo-support/user-guide.md`

**Sections:**

1. **Introduction**
   - What is monorepo support?
   - Why use config inheritance?
   - Supported package managers (pnpm, npm, Yarn)

2. **Config Inheritance**
   - `extends` field syntax
   - Relative paths vs npm packages
   - Multiple extends
   - Merge order
   - Circular dependency prevention

3. **Workspace Detection**
   - Automatic workspace detection
   - Supported workspace configurations
   - Workspace root auto-detection

4. **CLI Usage**
   - `--workspace <name>` - validate single package
   - `--workspaces` - validate all packages
   - Working from subdirectories

5. **Examples**
   - Basic pnpm monorepo
   - npm workspaces
   - Yarn workspaces
   - Complex inheritance scenarios

6. **Performance**
   - Parallel validation
   - 3-10x speedup for large monorepos
   - Config caching

7. **Migration**
   - Moving from single-repo to monorepo
   - Extracting shared config
   - Testing workspace validation

## Files Modified (Feb 2026)

- `docs/projects/vitepress-docs/information-architecture.md` - Added `/integrations/monorepos`, updated page count
- `docs/projects/vitepress-docs/UPDATES.md` - This file, added Feb 2026 updates

## Next Steps

1. **Phase 1 Implementation** (when ready)
   - Include monorepo user guide in content migration
   - Map `user-guide.md` → `website/integrations/monorepos.md`
   - Update config and CLI reference pages with new features

2. **Phase 2 Architecture Updates**
   - Simplify architecture documentation
   - Use new validator class names
   - Remove composition framework references

3. **Homepage Updates**
   - Add "Monorepo Support" to features
   - Update performance stats ("3-10x faster for monorepos")

4. **Stats Updates**
   - Total pages: ~157 (was ~155)
   - Integrations section: 10 pages (was 9)
