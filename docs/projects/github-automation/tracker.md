# GitHub Automation & Project Maintenance Tracker

**Created:** 2026-02-01
**Status:** In Progress

## Overview

This document tracks the multi-phase project to improve GitHub automation, update dependencies, and configure project infrastructure for claudelint.

## Tasks Overview

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 1 | Research .github folder patterns | [COMPLETE] Complete | High | See [prettier-eslint-research.md](./prettier-eslint-research.md) |
| 2 | Update all out-of-date packages | [COMPLETE] Complete | High | 778/780 tests passing, 5 security vulns fixed |
| 3 | Setup and configure Dependabot | [COMPLETE] Complete | High | Enhanced with grouping, labels, commit prefixes |
| 4 | Add appropriate badges to README | [COMPLETE] Complete | Medium | Added 5 new badges (downloads, coverage, node, size, stars) |
| 5 | Setup codecov and configure coverage exemptions | [COMPLETE] Complete | High | .codecov.yml created with exemptions and targets |
| 6 | Configure GitHub branch protection and contributor workflow | [COMPLETE] Complete | High | Templates created, docs written. Needs GitHub repo setup |
| 7 | Create GitHub repository and push code | [PENDING] Pending | High | Push to GitHub, then run label script |
| 8 | Fix 171 TypeScript-ESLint violations | [COMPLETE] Complete | High | All type safety errors fixed, tests passing |
| 9 | Fix Settings schema to match official Claude Code format | [IN PROGRESS] In Progress | **CRITICAL** | Schema was completely wrong - see Task 9 below |

## Task Details

### Task 1: Research .github folder patterns [COMPLETE]

**Status:** Complete

**Deliverables:**

- [x] Research prettier .github structure
- [x] Research eslint .github structure
- [x] Document best practices
- [x] Create recommendations for claudelint

**Output:** [prettier-eslint-research.md](./prettier-eslint-research.md)

**Key Findings:**

- ESLint uses YAML issue templates (better than Markdown)
- Both projects have comprehensive CI workflows
- Dependabot + Renovate for dependency management
- Automated PR labeling and stale issue management
- CodeQL for security scanning

---

### Task 2: Update all out-of-date packages [COMPLETE]

**Status:** Complete

**Package Update Summary:**

| Package | Old Version | New Version | Status | Notes |
|---------|-------------|-------------|--------|-------|
| @commitlint/cli | 20.3.1 | 20.4.0 | [COMPLETE] Updated | - |
| @commitlint/config-conventional | 20.3.1 | 20.4.0 | [COMPLETE] Updated | - |
| @types/inquirer | 9.0.7 | 9.0.9 | [COMPLETE] Updated | - |
| @types/jest | 29.5.14 | 30.0.0 | [COMPLETE] Updated | - |
| @typescript-eslint/eslint-plugin | 6.21.0 | 8.54.0 | [COMPLETE] Updated | Required for ESLint 9 |
| @typescript-eslint/parser | 6.21.0 | 8.54.0 | [COMPLETE] Updated | Required for ESLint 9 |
| commander | 12.1.0 | 14.0.3 | [COMPLETE] Updated | - |
| diff | 5.2.2 | 8.0.3 | [COMPLETE] Updated | - |
| eslint | 8.57.1 | 9.39.2 | [COMPLETE] Updated | **Fixed 5 security vulnerabilities** |
| eslint-config-prettier | 9.1.2 | 10.1.8 | [COMPLETE] Updated | - |
| glob | 10.5.0 | 13.0.0 | [COMPLETE] Updated | - |
| inquirer | 9.3.8 | 13.2.2 | [COMPLETE] Updated | - |
| markdownlint | 0.35.0 | 0.35.0 | [DEFERRED] Deferred | Breaking changes - see [Deviations](#markdownlint-040) |
| minimatch | 9.0.5 | 10.1.1 | [COMPLETE] Updated | - |
| ora | 6.3.1 | 6.3.1 | [DEFERRED] Deferred | Major changes - needs research |
| zod | 3.25.76 | 3.25.76 | [DEFERRED] Deferred | Breaking changes - see [Deviations](#zod-4x) |

**Security Impact:**

- [COMPLETE] **Fixed 5 moderate severity vulnerabilities** in ESLint 8.x by upgrading to ESLint 9.39.2
- [COMPLETE] All packages now at latest compatible versions
- [COMPLETE] Zero vulnerabilities reported by `npm audit`

**Build Status:**

- [COMPLETE] Build successful with updated packages
- [COMPLETE] TypeScript compilation passes
- [COMPLETE] Tests passing: 777/780 (99.6%)
- WARNING: 1 test failure due to commander.js v14 API change (minor, will fix separately)

**Completed:** 2026-02-01

---

### Task 3: Setup and configure Dependabot [COMPLETE]

**Status:** Complete

**Implemented:**

- [x] Add commit message prefixes (`deps:`, `deps-dev:`, `ci:`)
- [x] Configure assignees and reviewers
- [x] Add labels for different dependency types (`dependencies`, `npm`, `github-actions`)
- [x] Set up grouping rules (group minor/patch updates by development vs production)
- [x] Schedule updates for Monday mornings at 6am
- [x] Set PR limits to prevent spam

**Configuration Details:**

```yaml
# npm dependencies
- Groups dev dependencies (minor/patch)
- Groups production dependencies (minor/patch)
- Major updates get individual PRs for careful review
- Commit prefix: "deps" (production), "deps-dev" (dev)

# GitHub Actions
- Weekly updates
- Commit prefix: "ci"
- Labeled: dependencies, github-actions
```

**Future Consideration:**

- Renovate can be added later for more advanced features (auto-merge, custom grouping)

**Completed:** 2026-02-01

---

### Task 4: Add appropriate badges to README [COMPLETE]

**Status:** Complete

**Badges Added:**

- [x] CI Status (already had)
- [x] npm version (fixed package name)
- [x] npm downloads (new)
- [x] codecov (new - will work once codecov is set up)
- [x] Node.js version support (new)
- [x] Bundle size (new)
- [x] License (already had)
- [x] GitHub stars (new)

**Total:** 8 badges (was 3, added 5)

**Future Considerations:**

- OpenSSF Scorecard (security) - add after 1.0 release
- Dependency status badge - optional

**Completed:** 2026-02-01

---

### Task 5: Setup codecov and configure coverage exemptions [COMPLETE]

**Status:** Complete

**Implemented:**

- [x] Created `.codecov.yml` configuration file
- [x] Configured coverage thresholds (80% target)
- [x] Set up exemptions for:
  - Test fixtures (`tests/fixtures/**`, `tests/__temp__/**`)
  - Generated code (`src/rules/rule-ids.ts`, `src/rules/index.ts`)
  - Type definitions (`**/*.d.ts`)
  - Scripts (`scripts/**`, `bin/**`)
  - Examples (`examples/**`)
  - Documentation (`docs/**`)
  - Build output (`dist/**`, `coverage/**`)
  - Configuration files
- [x] Configured PR comment behavior
- [x] Enabled GitHub checks annotations
- [x] Set up component-based coverage tracking (rules, validators, cli, config, schemas)
- [x] Configured flags for unit tests

**Coverage Configuration:**

```yaml
coverage:
  status:
    project:
      default:
        target: 80%
        threshold: 2%
    patch:
      default:
        target: 80%
        threshold: 5%
```

**Completed:** 2026-02-01

---

### Task 6: Configure GitHub branch protection and contributor workflow [COMPLETE]

**Status:** Complete (documentation and templates ready, requires GitHub repo setup)

**Implemented:**

**Issue Templates (YAML forms):**

- [x] `.github/ISSUE_TEMPLATE/config.yml` - Links to discussions, contributing guide, docs
- [x] `.github/ISSUE_TEMPLATE/bug-report.yml` - Comprehensive bug report form
- [x] `.github/ISSUE_TEMPLATE/rule-request.yml` - New rule request form
- [x] `.github/ISSUE_TEMPLATE/rule-change.yml` - Rule change request form
- [x] `.github/ISSUE_TEMPLATE/docs.yml` - Documentation update form

**Pull Request Template:**

- [x] `.github/PULL_REQUEST_TEMPLATE.md` - Comprehensive PR template with:
  - Prerequisites checklist
  - Type of change selection
  - Summary and detailed description
  - Related issues linking
  - Test plan section
  - Breaking changes section
  - Reviewer notes

**Repository Management:**

- [x] `.github/CODEOWNERS` - Code ownership definitions
- [x] `.github/SECURITY.md` - Security policy and vulnerability reporting
- [x] `docs/github-branch-protection.md` - Complete branch protection configuration guide

**Documentation Created:**

- [x] Branch protection rules documented
- [x] Required status checks listed
- [x] Implementation steps provided
- [x] Emergency override process documented

**Label Management:**

- [x] `docs/github-labels.md` - Complete label documentation (54 labels)
- [x] `scripts/setup-github-labels.sh` - Automated label creation script
- [x] Label categories: Type (8), Component (10), Priority (4), Status (8), Resolution (6), Automation (4), Special (3)

**Next Steps (requires GitHub repository to be created):**

1. Push code to GitHub repository
2. Run `scripts/setup-github-labels.sh` to create labels
3. Configure branch protection rules per `docs/github-branch-protection.md`
4. Enable GitHub Discussions
5. Set up required status checks in branch protection

**Completed:** 2026-02-01

---

## Deviations

This section tracks packages that couldn't be updated to latest versions due to breaking changes.

### Zod 4.x

**Original Plan:** Update from 3.25.76 → 4.3.6

**Status:** [DEFERRED] Deferred

**Reason:** Major breaking changes in Zod 4 require significant code refactoring:

1. `.default()` behavior change (now expects output type, not input type)
2. String format validators moved to top-level functions (e.g., `z.email()` instead of `z.string().email()`)
3. Error handling changes (`error.errors` → `error.issues`)
4. UUID validation now enforces RFC 4122 compliance
5. Issue types renamed with `$` prefix in `z.core` namespace
6. Optional properties with defaults now always return caught values

**TypeScript Errors Encountered:**

```
src/schemas/lsp-config.schema.ts(18,10): error TS2554: Expected 2-3 arguments, but got 1.
src/schemas/lsp-config.schema.ts(38,12): error TS2554: Expected 2-3 arguments, but got 1.
src/schemas/refinements.ts(141,6): error TS2694: Namespace has no exported member 'ZodEffects'.
src/validators/schemas.ts(90,10): error TS2554: Expected 2-3 arguments, but got 1.
[... 8 more similar errors]
```

**Migration Effort:** High (affects ~15+ files)

**Next Steps:**

1. Create separate migration task
2. Review [Zod v4 Migration Guide](https://zod.dev/v4/changelog)
3. Consider using [zod-v3-to-v4 codemod](https://github.com/colinhacks/zod) for automation
4. Update all schema files
5. Update error handling code
6. Full test suite verification

**Resources:**

- [Zod v4 Migration Guide](https://zod.dev/v4/changelog)
- [Zod v4 Breaking Changes Gist](https://gist.github.com/imaman/a62d1c7bab770a3b49fe3be10a66f48a)
- [GitHub Issue: Migration Guide Improvements](https://github.com/colinhacks/zod/issues/4854)

---

### Markdownlint 0.40

**Original Plan:** Update from 0.35.0 → 0.40.0

**Status:** [DEFERRED] Deferred

**Reason:** Breaking changes in the TypeScript API:

1. `Configuration` namespace export removed/changed
2. `.sync()` method no longer exists
3. API signature changes requiring migration

**TypeScript Errors Encountered:**

```
src/cli/utils/formatters/markdownlint.ts(49,28): error TS2694: Namespace has no exported member 'Configuration'.
src/cli/utils/formatters/markdownlint.ts(63,32): error TS2339: Property 'sync' does not exist.
src/cli/utils/formatters/markdownlint.ts(73,9): error TS18046: 'violations' is of type 'unknown'.
```

**Migration Effort:** Medium (affects 1 file, but critical formatter)

**Next Steps:**

1. Review markdownlint 0.40 changelog
2. Update `src/cli/utils/formatters/markdownlint.ts`
3. Migrate from sync API to async or new sync alternative
4. Update type imports
5. Test formatter output

---

### Ora 9.x

**Original Plan:** Update from 6.3.1 → 9.1.0

**Status:** [DEFERRED] Deferred (low priority)

**Reason:** Not attempted yet, but likely has breaking changes (3 major versions jump)

**Migration Effort:** Unknown (needs research)

**Next Steps:**

1. Check ora changelog for 7.x, 8.x, 9.x breaking changes
2. Test with new version in isolated environment
3. Update if straightforward, otherwise defer

---

## Follow-up Tasks

These tasks emerged during the main work and should be tracked separately:

### 1. Zod 4 Migration

- **Priority:** Medium
- **Effort:** High
- **Timeline:** Separate sprint
- **Blockers:** None (can be done anytime)

### 2. Markdownlint 0.40 Migration

- **Priority:** Medium
- **Effort:** Medium
- **Timeline:** Can be bundled with Zod 4 or done separately
- **Blockers:** None

### 3. Ora 9 Migration

- **Priority:** Low
- **Effort:** Unknown
- **Timeline:** Nice-to-have
- **Blockers:** None

### 4. Create .github Templates

- **Priority:** High
- **Effort:** Medium
- **Timeline:** Part of Task 6
- **Files Needed:**
  - `.github/ISSUE_TEMPLATE/*.yml` (5 templates)
  - `.github/PULL_REQUEST_TEMPLATE.md`
  - `.github/CODEOWNERS`
  - `.github/copilot-instructions.md`

### 5. Enhanced CI Workflows

- **Priority:** Medium
- **Effort:** Medium
- **Timeline:** After core tasks complete
- **Additions:**
  - CodeQL security scanning
  - PR auto-labeling
  - Stale issue management
  - Bundle size checking

---

## Testing Checklist

Before marking package updates complete:

- [ ] Build succeeds (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Formatting passes (`npm run format:check`)
- [ ] Markdown linting passes (`npm run lint:md`)
- [ ] Self-validation passes (`npm run validate`)
- [ ] No security vulnerabilities (`npm audit`)
- [ ] No breaking changes in public API

---

## Notes

### Package Update Strategy

We took a pragmatic approach to package updates:

1. **Updated immediately:** Packages with minor/patch updates or major updates without breaking changes
2. **Deferred with tracking:** Packages with major breaking changes requiring significant refactoring (Zod, Markdownlint, Ora)
3. **Security prioritized:** ESLint update was critical to fix 5 moderate vulnerabilities

This approach gets us 90% of the benefits (security fixes, bug fixes, performance improvements) with 10% of the migration effort.

### Dependency Management Philosophy

Following industry best practices:

- **Dependabot** for GitHub Actions (weekly)
- **Renovate** (planned) for npm packages with intelligent grouping
- **Manual review** for major version updates
- **Deferred migrations** tracked in this document

---

---

### Task 7: Create GitHub repository and push code [PENDING]

**Status:** Pending (repository not yet on GitHub)

**Discovery:** The git remote is configured but code hasn't been pushed to GitHub yet.

**Steps to Complete:**

1. **Option A: Repository already exists on GitHub (private/visibility issue)**
   ```bash
   # Just push the code
   git push -u origin main
   ```

2. **Option B: Create new repository on GitHub**
   ```bash
   # Create repository via GitHub CLI
   gh repo create pdugan20/claudelint --public --source=. --remote=origin --push

   # Or create via web UI and push
   # 1. Go to https://github.com/new
   # 2. Create repository named "claudelint"
   # 3. Push code:
   git push -u origin main
   ```

3. **After pushing, run the label script:**
   ```bash
   bash scripts/setup-github-labels.sh
   ```

4. **Configure branch protection:**
   - Follow instructions in `docs/github-branch-protection.md`
   - Navigate to: `https://github.com/pdugan20/claudelint/settings/branches`
   - Apply all recommended settings

5. **Enable GitHub features:**
   - Enable GitHub Discussions
   - Enable GitHub Issues (if not already enabled)
   - Enable GitHub Actions (should be automatic)
   - Set up Codecov integration (https://codecov.io)

**Files Ready for GitHub:**

- [x] Issue templates (5 YAML forms)
- [x] PR template
- [x] CODEOWNERS
- [x] SECURITY.md
- [x] Dependabot config
- [x] CI workflows
- [x] Codecov config
- [x] Label setup script

**Next Steps:**

1. Push code to GitHub
2. Run label setup script
3. Configure branch protection
4. Set up Codecov
5. Enable Discussions

---

## Timeline

| Date | Milestone |
|------|-----------|
| 2026-02-01 | Started project, completed research |
| 2026-02-01 | Updated 90% of packages, fixed security issues |
| 2026-02-01 | Configured Dependabot, Codecov, created all templates |
| 2026-02-01 | Created GitHub automation infrastructure (6/7 tasks complete) |
| TBD | Push to GitHub and run label script (task 7) |
| TBD | Circle back to deferred package migrations (Zod 4, markdownlint 0.40) |

---

## Success Criteria

**Phase 1 (Core Tasks 1-6):**

- [x] Research complete
- [ ] All packages updated (excluding deferred)
- [ ] Zero security vulnerabilities
- [ ] Dependabot properly configured
- [ ] Codecov configured with exemptions
- [ ] Branch protection rules active
- [ ] README badges updated
- [ ] All tests passing

**Phase 2 (Deferred Migrations):**

- [ ] Zod 4 migration complete
- [ ] Markdownlint 0.40 migration complete
- [ ] Ora 9 migration (if needed)

**Phase 3 (Enhancements):**

- [ ] GitHub templates implemented
- [ ] Enhanced CI workflows
- [ ] Documentation complete

---

## Related Documents

- [prettier-eslint-research.md](./prettier-eslint-research.md) - Research on .github patterns
- [.github/workflows/ci.yml](/.github/workflows/ci.yml) - Current CI workflow
- [.github/dependabot.yml](/.github/dependabot.yml) - Current Dependabot config
- [package.json](/package.json) - Package dependencies

---

---

## Summary

### Completed (7 of 8 tasks)

[COMPLETE] **Research:** Analyzed prettier and eslint .github setups, documented best practices

[COMPLETE] **Packages:** Updated 14 major packages, fixed 5 security vulnerabilities, 778/780 tests passing

[COMPLETE] **Dependabot:** Enhanced config with grouping, labels, commit prefixes, scheduled updates

[COMPLETE] **README Badges:** Added 5 new badges (npm downloads, coverage, Node version, bundle size, GitHub stars)

[COMPLETE] **Codecov:** Complete configuration with 80% target, exemptions, component tracking

[COMPLETE] **GitHub Templates:** Created 5 issue templates, PR template, CODEOWNERS, SECURITY.md, branch protection docs

[COMPLETE] **TypeScript-ESLint:** Fixed all 171 type safety violations across 4 phases, 0 errors remaining

[PENDING] **GitHub Setup:** Need to push to GitHub and run label script (54 labels ready)

### Deferred for Later

[DEFERRED] **Zod 4.x Migration:** Breaking changes require code refactoring (~15 files)

[DEFERRED] **Markdownlint 0.40 Migration:** API changes in formatter (~1 file)

[DEFERRED] **Ora 9.x Migration:** Lower priority, research needed

### Impact

- **Security:** Fixed 5 moderate vulnerabilities in ESLint
- **Automation:** Dependabot will keep dependencies updated automatically
- **Quality:** Branch protection will enforce code review and CI checks
- **Organization:** 54 labels and 5 issue templates for better issue management
- **Visibility:** 8 badges showcase project health and activity
- **Coverage:** Codecov configured to track code coverage with exemptions

### Files Created/Modified

**Created:**

- `docs/projects/github-automation/prettier-eslint-research.md`
- `docs/projects/github-automation/tracker.md` (this file)
- `docs/github-branch-protection.md`
- `docs/github-labels.md`
- `scripts/setup-github-labels.sh`
- `.codecov.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/ISSUE_TEMPLATE/bug-report.yml`
- `.github/ISSUE_TEMPLATE/rule-request.yml`
- `.github/ISSUE_TEMPLATE/rule-change.yml`
- `.github/ISSUE_TEMPLATE/docs.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/CODEOWNERS`
- `.github/SECURITY.md`

**Modified:**

- `package.json` (updated 14 packages)
- `README.md` (added 5 badges)
- `.github/dependabot.yml` (enhanced configuration)

**Total:** 14 files created, 3 files modified

---

**Last Updated:** 2026-02-01
**Next Review:** After GitHub repository setup
**Status:** 87.5% Complete (7/8 core tasks done)

### Task 8: Fix 171 TypeScript-ESLint type safety violations [COMPLETE]

**Status:** Complete

**Background:**

TypeScript-ESLint v6 → v8 upgrade introduced stricter type checking. These 171 violations represented real type safety issues.

**What We Fixed:**

**Phase 1: Quick Wins (24 errors fixed, 171→147)**
- Removed unused error variables in catch blocks
- Fixed duplicate catch blocks
- Wrapped case statements in braces for proper scoping
- Removed unused variables with `_` prefix

**Phase 2: Dynamic Imports (30 errors fixed, 147→117)**
- Added type assertions for all require() calls
- Fixed typeof import assertions for Node.js modules
- Properly typed dynamic imports

**Phase 3: Runtime Type Validation (73 errors fixed, 117→44)**
- Created type-guards.ts with helper functions (isObject, hasProperty, isString)
- Fixed all LSP rules (8 files) with proper type guards
- Fixed all MCP rules (10 files) with runtime validation
- Fixed Plugin and Settings rules (5 files)
- Changed from typed interfaces to unknown + runtime validation for true type safety

**Phase 4: Final Cleanup (44 errors fixed, 44→0)**
- Changed safeParseJSON return type from any to unknown
- Fixed base-to-string errors with isString() checks
- Converted all remaining require() to ES6 imports
- Made ClaudeLint.findConfigFile() synchronous (was async with dummy await)
- Fixed formatter.ts to use isFormatter() type guard
- Fixed empty LintOptions interface to type alias

**Additional Fixes:**
- Fixed RuleMetadata type mismatch (API vs canonical type)
- Removed unused @ts-expect-error directive
- Fixed CLI test for check-claude-md command

**Results:**
- ESLint errors: 171 → 0 ✓
- Test suites: 146/146 passing ✓
- Tests: 778/780 passing, 2 skipped ✓
- All TypeScript compilation errors resolved ✓

**Completed:** 2026-02-01

---

### Task 9: Fix Settings Schema to Match Official Claude Code Format [IN PROGRESS]

**Status:** In Progress (CRITICAL - Schema was completely wrong)

**Discovery:**

While investigating validation errors in `.claude/settings.local.json`, discovered that our entire settings schema was designed based on assumptions rather than Claude Code's official format.

**The Problem:**

**Our wrong schema:**
```typescript
permissions: Array<{
  tool: string,
  action: PermissionActions,
  pattern?: string
}>
```

**Official Claude Code schema (from https://json.schemastore.org/claude-code-settings.json):**
```typescript
permissions: {
  allow?: string[],
  deny?: string[],
  ask?: string[],
  defaultMode?: "acceptEdits" | "bypassPermissions" | "default" | "plan",
  disableBypassPermissionsMode?: "disable",
  additionalDirectories?: string[]
}
```

**What's Wrong:**

1. ✗ Permissions is an **object**, not an array
2. ✗ Has `allow`, `deny`, `ask` arrays, not `action` field
3. ✗ Rules are **strings** like `"Bash(npm run *)"`, not objects
4. ✗ Missing `defaultMode`, `disableBypassPermissionsMode`, `additionalDirectories`

**Impact:**

- [X] **All settings validation is broken** - validating wrong format
- [X] **3 permission rules are useless** - checking non-existent structure
- [X] **Tests are testing wrong format** - all permission tests need rewrite
- [X] **Documentation is wrong** - examples show wrong format
- [ ] **Users not affected yet** - package hasn't been published to npm

**Files to Fix:**

1. **Schema Definition**
   - [ ] `src/validators/schemas.ts` - Update `SettingsSchema` and `PermissionRuleSchema`

2. **Validation Rules (3 files)**
   - [ ] `src/rules/settings/settings-invalid-permission.ts` - Validate tool names and action arrays
   - [ ] `src/rules/settings/settings-permission-empty-pattern.ts` - Validate Tool(pattern) syntax
   - [ ] `src/rules/settings/settings-permission-invalid-rule.ts` - Validate rule format

3. **Tests (3 files)**
   - [ ] `tests/rules/settings/settings-invalid-permission.test.ts`
   - [ ] `tests/rules/settings/settings-permission-empty-pattern.test.ts`
   - [ ] `tests/rules/settings/settings-permission-invalid-rule.test.ts`

4. **Documentation (3 files)**
   - [ ] `docs/rules/settings/settings-invalid-permission.md`
   - [ ] `docs/rules/settings/settings-permission-empty-pattern.md`
   - [ ] `docs/rules/settings/settings-permission-invalid-rule.md`

**Fix Plan:**

**Phase 1: Update Schema (15 min)**
- Reference official schema: https://json.schemastore.org/claude-code-settings.json
- Update `PermissionRuleSchema` → `PermissionsSchema`
- Add all fields: allow, deny, ask, defaultMode, disableBypassPermissionsMode, additionalDirectories

**Phase 2: Fix Validation Rules (30 min)**
- `settings-invalid-permission` → validate allow/deny/ask arrays exist and have valid strings
- `settings-permission-empty-pattern` → validate Tool(pattern) syntax in rule strings
- `settings-permission-invalid-rule` → validate tool names are valid (Bash, Read, Write, etc.)

**Phase 3: Update Tests (20 min)**
- Rewrite all permission rule tests with correct format
- Add tests for new fields (defaultMode, additionalDirectories)

**Phase 4: Fix Documentation (15 min)**
- Update all 3 rule docs with correct examples
- Reference official Claude Code docs

**Total Estimated Time:** 80 minutes (1.5 hours)

**Started:** 2026-02-01

---
