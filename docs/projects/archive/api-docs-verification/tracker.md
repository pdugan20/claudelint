# API Documentation Verification - Progress Tracker

Verify, fix, and enforce that API documentation matches implementation. Prevent future drift with CI guardrails.

**Status:** Phase 5 Complete
**Start Date:** 2026-02-16
**Last Updated:** 2026-02-16

---

## Phase 1: Fix Known Discrepancies

Fix all issues identified in the [audit](./audit-findings.md). Estimated effort: ~3 hours.

### 1.1 Critical Fixes

- [x] **C1: RuleMetadata type mismatch** — Added `toPublicRuleMetadata()` mapping in `src/api/claudelint.ts` that converts internal type to public API shape. Updated tests to verify public shape.
- [x] **C2: sarif formatter not implemented in API** — Created `src/api/formatters/sarif.ts` and added `sarif` case to `loadBuiltinFormatter()`. Added test verifying SARIF output structure.
- [x] **C3: FixInfo placeholder values** — Documented the limitation in `website/api/types.md` with VitePress info callout.

### 1.2 Moderate Fixes

- [x] **M1: BaseFormatter.getSummary() return type** — Fixed return type in `website/api/types.md`.
- [x] **M2: ClaudeLintConfig.output type** — Updated `format` to union type and added `collapseRepetitive`.
- [x] **M3: github formatter undocumented** — Added `github` to built-in list in `website/api/claudelint-class.md`.
- [x] **M4: Overview table progress callbacks** — Fixed "At a Glance" table in `website/api/overview.md`.
- [x] **M5: ClaudeLintConfig.rules type** — Updated `ClaudeLintConfig` and `ConfigOverride` to show shorthand strings.

### 1.3 Minor Fixes

- [x] **m1: DeprecatedRuleUsage type** — Added full type definition to `website/api/types.md`.
- [x] **m2: endLine/endColumn/suggestions** — Added "Reserved for future use" notes in `website/api/types.md`.
- [x] **m3: formatResults options type** — Fixed to `{ cwd?: string }` in `website/api/functional-api.md`.
- [x] **m4: Undocumented exports** — Added `loadFormatter`, `BUILTIN_FORMATTERS`, `BuiltinFormatterName` to `website/api/functional-api.md`.
- [x] **m5: LintOptions type** — Added as alias in `website/api/types.md`.

### Phase 1 Completion Criteria

- [x] All 3 critical issues resolved (code changes + docs updates)
- [x] All 5 moderate issues resolved (docs updates)
- [x] All 5 minor issues resolved (docs updates)
- [x] `npm run build` passes
- [x] `npm test` passes (1620 tests, 197 suites)
- [x] `npm run docs:build` passes

---

## Phase 2: Export Snapshot + TSDoc Enforcement

Add lightweight CI checks that catch new drift as it happens. Estimated effort: ~1 hour.

### 2.1 Export Snapshot Test

- [x] Create `tests/api/api-surface.test.ts` with a snapshot of all public export names from `src/index.ts`
- [x] Verify snapshot test passes: `npx jest tests/api/api-surface.test.ts`
- [x] Confirm that adding/removing an export from `src/index.ts` causes the test to fail

### 2.2 TSDoc Lint Rules

- [x] Install `eslint-plugin-tsdoc`: `npm install --save-dev eslint-plugin-tsdoc`
- [x] Add `tsdoc/syntax: 'error'` to ESLint config (scoped to `src/api/**/*.ts` and `src/index.ts`)
- [x] Verify it catches malformed doc comments in `src/api/`
- [x] Fix any existing violations in `src/api/*.ts` files (12 `@module` → `@packageDocumentation`, 1 unescaped `>`)

### 2.3 JSDoc Completeness Rules

- [x] Install `eslint-plugin-jsdoc`: `npm install --save-dev eslint-plugin-jsdoc`
- [x] Add `jsdoc/require-jsdoc` with `publicOnly: true` scoped to `src/api/**/*.ts` and `src/index.ts`
- [x] Fix any existing violations (added JSDoc to 6 formatter class methods)
- [x] Verify that a new undocumented export triggers an ESLint error

### 2.4 Type-Level Assertions

- [x] Install `tsd`: `npm install --save-dev tsd`
- [x] Create `src/index.test-d.ts` with type assertions for key public API functions
- [x] Assert return types for: `lint()`, `lintText()`, `formatResults()`, `resolveConfig()`, `getFileInfo()`
- [x] Assert constructor type for `new ClaudeLint()`
- [x] Assert instance method return types for `lintFiles()`, `loadFormatter()`, `getRules()`
- [x] Add `check:types:api` npm script
- [x] Add to CI pipeline (build job in `.github/workflows/ci.yml`)

### Phase 2 Completion Criteria

- [x] Export snapshot test in CI, fails on unexpected API surface changes
- [x] TSDoc syntax validation active on `src/api/` files
- [x] JSDoc completeness enforcement active on public exports
- [x] Type-level assertions passing for all key API functions
- [x] All checks running in CI

---

## Phase 3: API Extractor Report

Track the full public API surface in a committed report file. PRs that change the API show a clear diff. Estimated effort: ~3 hours.

### 3.1 Install and Configure

- [x] Install: `npm install --save-dev @microsoft/api-extractor`
- [x] Run `npx api-extractor init` to generate `api-extractor.json`
- [x] Configure `mainEntryPointFilePath` to `dist/index.d.ts`
- [x] Enable `apiReport` with `reportFolder: "etc/"`
- [x] Disable `docModel` and `dtsRollup` (we don't need these)

### 3.2 Generate Initial Report

- [x] Run `npx api-extractor run --local --verbose`
- [x] Review the generated `etc/claude-code-lint.api.md` report
- [x] Verify it captures all public exports with correct signatures
- [x] Commit the initial report

### 3.3 CI Integration

- [x] Add npm script: `check:api-report` → `api-extractor run`
- [x] Add npm script: `check:api-report:update` → `api-extractor run --local --verbose`
- [x] Add `check:api-report` to CI pipeline (runs after `build`)
- [x] Verify CI fails when report is stale (change an export, don't update report)

### 3.4 Review Workflow

- [x] Add `etc/*.api.md` to `.gitattributes` as `linguist-generated` (collapses in GitHub diffs by default but expandable)
- [x] Document in CONTRIBUTING.md: "If you change the public API, run `npm run check:api-report:update` and commit the updated report"

### Phase 3 Completion Criteria

- [x] API report committed at `etc/claude-code-lint.api.md`
- [x] CI fails when report doesn't match current code
- [x] CONTRIBUTING.md updated with API change workflow
- [x] API surface changes visible as diffs in PRs

---

## Phase 4: Executable Code Samples

Make all API code examples in the docs compile-checked in CI. Estimated effort: ~1 day.

### 4.1 Create Example Files

Extract code samples from `website/api/recipes.md` into standalone TypeScript files:

- [x] `tests/api-examples/build-script.ts` (from Recipes: Build Script)
- [x] `tests/api-examples/pre-commit-hook.ts` (from Recipes: Pre-commit Hook)
- [x] `tests/api-examples/ci-pipeline.ts` (from Recipes: CI/CD Pipeline)
- [x] `tests/api-examples/text-validation.ts` (from Recipes: Text Validation)
- [x] `tests/api-examples/config-inspector.ts` (from Recipes: Configuration Inspector)
- [x] `tests/api-examples/progress-tracking.ts` (from Recipes: Progress Tracking)
- [x] `tests/api-examples/selective-auto-fix.ts` (from Recipes: Selective Auto-fix)
- [x] `tests/api-examples/markdown-formatter.ts` (from Recipes: Markdown Report)
- [x] `tests/api-examples/group-by-rule-formatter.ts` (from Recipes: Group-by-Rule)

### 4.2 Add Type-Check CI Step

- [x] Create `tsconfig.api-examples.json` extending base tsconfig, targeting `tests/api-examples/`
- [x] Add npm script: `check:api-examples` → `tsc --noEmit -p tsconfig.api-examples.json`
- [x] Verify all example files compile cleanly
- [x] Add to CI pipeline

### 4.3 Cross-Reference Docs to Examples

- [x] Add comments in each example file referencing which docs page it supports
- [x] Add a CI check script `scripts/check/api-examples.ts` that verifies every example file has a corresponding code block in the docs (prevents orphaned examples)
- [ ] Consider adding a VitePress plugin or build step that imports example files into docs pages (stretch goal -- evaluate complexity vs benefit)

### 4.4 Update knip Configuration

- [x] Add `tests/api-examples/**/*.ts` to knip entry points (these files have intentionally unused exports)

### Phase 4 Completion Criteria

- [x] All recipe code samples exist as standalone `.ts` files
- [x] All examples compile against current API
- [x] CI fails if an API change breaks a code sample
- [x] Example files cross-referenced with docs pages

---

## Phase 5: Range-Based Auto-Fix System

Replace the function-based `AutoFix.apply()` system with ESLint-style character-range edits (`range` + `text`). This aligns the internal fix representation with the public `FixInfo` API, eliminates the placeholder converter, and enables API consumers to inspect and apply individual fixes programmatically. Estimated effort: ~4-5 hours.

### Background and Prior Art

- **Current internal format (`AutoFix`):** `apply: (content: string) => string` — a closure that takes whole file content and returns modified content. Opaque to the system; cannot be inspected, serialized, or composed.
- **Current public API (`FixInfo`):** `range: [number, number]` + `text: string` — ESLint-compatible character-range format. Currently returns placeholder values `{ range: [0, 0], text: '' }`.
- **7 rules** declare `fixable: true` but only **4** produce `autoFix` objects; 3 have no fix implementation.

**Research findings** (ESLint, Ruff, markdownlint, Stylelint, Biome):

- ESLint, Ruff, and markdownlint all use character-range edits as their canonical fix format. Rule authors provide ranges directly (ESLint via `fixer.replaceTextRange()` helpers, Ruff via `Edit { range, content }`, markdownlint via `fixInfo { editColumn, deleteCount, insertText }`).
- Fix application follows a common algorithm: sort edits by range start, linear scan, skip overlapping edits, splice replacements into the source string.
- ESLint and Ruff use multi-pass fix loops (10 and 100 iterations respectively) to handle cascading fixes. markdownlint uses a single pass.
- Stylelint and Biome work via AST mutation + re-serialization (not applicable here since claudelint has no AST).

**Design decision:** Adopt ESLint's model. Replace `apply()` with `range`/`text` on `AutoFix`. No backward compatibility shim — the function-based approach is fully replaced.

### 5.1 Refactor `AutoFix` Interface

Replace the function-based `AutoFix` with range-based edits.

- [x] Update `AutoFix` in `src/validators/file-validator.ts`:
  - Removed: `apply: (currentContent: string) => string`
  - Added: `range: [number, number]` (0-based character offsets, start inclusive, end exclusive)
  - Added: `text: string` (replacement text; empty string = deletion; range `[n, n]` + text = insertion)
  - Kept: `ruleId`, `description`, `filePath`
- [x] `RuleIssue` in `src/types/rule.ts` — no change needed (references `AutoFix` by type)

### 5.2 Update `Fixer` Class

- [x] Rewrote `Fixer.applyFixes()` in `src/utils/rules/fixer.ts` with ESLint-style sorted range splicing: sort by `range[0]`, linear scan, skip overlapping edits

### 5.3 Update `applyFixes()` in ClaudeLint

- [x] Updated `ClaudeLint.applyFixes()` in `src/api/claudelint.ts` with range-based splice algorithm
- [x] Fix predicate filtering still works — filter applied before sorting/applying

### 5.4 Simplify `convertAutoFixToFixInfo()`

- [x] Replaced placeholder converter in `src/api/message-builder.ts` with direct pass-through: `{ range: autoFix.range, text: autoFix.text }`

### 5.5 Update the 4 Existing Fixable Rules

- [x] `skill-missing-shebang` — `range: [0, 0]`, text: `#!/usr/bin/env bash\n`
- [x] `skill-shell-script-no-error-handling` — computed insertion point after shebang via `indexOf('\n') + 1`
- [x] `skill-name-directory-mismatch` — IIFE computing `indexOf('name: ' + oldName)` for range
- [x] `skill-reference-not-linked` — uses `matchIndex` from regex for range

### 5.6 Fix `fixable: true` Rules Missing AutoFix

- [x] `plugin-missing-component-paths` — set `fixable: false` (no autoFix implementation)
- [x] `skill-missing-changelog` — set `fixable: false` (no autoFix implementation)
- [x] `skill-missing-version` — set `fixable: false` (no autoFix implementation)

### 5.7 Tests

**Updated existing tests:**

- [x] `tests/api/message-builder.test.ts` — verify correct computed range/text values
- [x] `tests/utils/fixer-integration.test.ts` — rewritten with range-based tests for all 4 fix patterns + overlap skipping
- [x] `tests/api/result-builder.test.ts` — updated autoFix mock to range/text format
- [x] `tests/integration/dogfood-rules.test.ts` — updated normalize-code-fences autoFix test to verify range/text
- [x] `tests/utils/custom-rule-loader.test.ts` — updated auto-fix mock to range/text format
- [x] `tests/api/claudelint.test.ts` — all fix-related tests pass with new format

**Updated custom rule:**

- [x] `.claudelint/rules/normalize-code-fences.ts` — converted from `apply()` function to per-fence range-based fixes with computed character offsets

**All 1625 tests passing across 198 test suites.**

### 5.8 Documentation Updates

- [x] Removed "Current limitation" tip callout from `website/api/types.md`
- [x] Updated FixInfo section in `website/api/types.md` with range semantics and splice usage example

### Phase 5 Completion Criteria

- [x] `AutoFix` uses `range`/`text` instead of `apply()` — no function-based fixes remain
- [x] `Fixer.applyFixes()` uses ESLint-style sorted range splicing
- [x] `FixInfo.range` and `FixInfo.text` populated with correct values for all fixable rules
- [x] All 7 `fixable: true` rules either produce autoFix objects or are corrected to `fixable: false`
- [x] Overlapping fix handling tested
- [x] "Current limitation" callout removed from docs
- [x] All existing tests pass (1625 tests, 198 suites)
- [x] API Extractor report unchanged (no public interface changes — `FixInfo` already had `range`/`text`)

---

## Post-Completion

### Ongoing Maintenance

After all phases are complete, these CI checks run automatically:

1. **Export snapshot test** — catches accidental public API changes
2. **TSDoc/JSDoc lint** — enforces doc comments on all public exports
3. **tsd type assertions** — catches type signature drift
4. **API Extractor report** — makes API changes visible in PRs
5. **Code sample compilation** — catches stale examples

### When to Update

- **Adding a new public export:** update snapshot, add doc comment, add to docs page, update API report
- **Changing a function signature:** update type assertions, update docs, update API report, fix any broken examples
- **Adding a new recipe:** create corresponding example file in `tests/api-examples/`
- **Removing a public export:** update snapshot, remove from docs, update API report
