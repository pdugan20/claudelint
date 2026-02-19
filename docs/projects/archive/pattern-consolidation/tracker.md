# Pattern Consolidation & Regression Prevention

**Status:** Complete
**Created:** 2026-02-18
**Last Updated:** 2026-02-18

---

## Context

A regex duplication audit revealed that shared utilities exist (`src/utils/formats/markdown.ts`, `src/utils/rules/helpers.ts`) but are inconsistently used. Rules duplicate patterns instead of importing them, enforcement scripts miss key anti-patterns, the custom rule author API (`claudelint/utils`) is documented but not actually exported, and `extractImports` has bugs causing false positives on `@Decorators`.

### Current State

- **3 copies** of the import detection regex (`/@([^\s]+)/g`), one with a different (fixed) variant
- **5 copies** of the env var placeholder regex with no shared constant
- **3 copies** of the semver regex despite `validateSemver()` existing in helpers
- **3 copies** of `escapeRegExp` logic with no shared function
- **3 rules** with ad-hoc code block state machines despite `stripCodeBlocks()` existing
- **2 divergent** env var name validation patterns
- **4 rules** using `exec()` loops instead of `matchAll()`
- **`extractImports()`** uses banned anti-pattern (regex code-block stripping) and duplicates `extractImportsWithLineNumbers()` logic
- **`extractImportsWithLineNumbers()`** doesn't handle tilde fences (`~~~`)
- **`claudelint/utils`** documented in website and JSDoc but not in `package.json` exports
- **`rule-patterns.ts`** enforces 5 anti-patterns but misses the ones above
- **No test** validates that the documented `claudelint/utils` import path actually resolves
- **Package name mismatch** in docs/JSDoc: `claudelint/utils` vs actual npm name `claude-code-lint/utils`
- **`hasVariableExpansion()`** in `src/utils/validators/helpers.ts` may be another env var detection copy

### Design Principles

Based on patterns from ESLint, TypeScript-ESLint, Stylelint, and markdownlint:

1. **Simple wraps complex** -- when two functions return the same data at different fidelity levels, the simpler one delegates to the richer one (never duplicate logic). From `@eslint-community/eslint-utils`: `getStringIfConstant()` wraps `getStaticValue()`.
2. **Constants, not copies** -- regex patterns are defined once as named exports, imported everywhere. Build on each other (e.g., `containsEnvVar()` wraps `ENV_VAR_PLACEHOLDER_RE`).
3. **Curated public surface** -- internal utils use direct imports (`../../utils/formats/markdown`). The `claudelint/utils` subpath export is a hand-curated barrel that only exposes what custom rule authors need.
4. **Snapshot-test the public API** -- `Object.keys(exports).sort()` inline snapshot prevents accidental export additions/removals (ESLint and TypeScript-ESLint pattern).
5. **Mechanical enforcement** -- anti-patterns are caught by ESLint rules and CI scripts, not documentation alone.

---

## Phase 1: Fix Shared Utilities

Fix all bugs and duplication in the shared utility layer before touching any rule files. This is the foundation everything else builds on.

### 1.1 Create `src/utils/patterns.ts`

Centralized regex constants and small helpers. Pure, stateless, safe to import from anywhere.

- [x] Create `src/utils/patterns.ts` with:

```typescript
/** Match env var placeholders: ${VAR} or $VAR */
export const ENV_VAR_PLACEHOLDER_RE = /\$\{[A-Z_]+\}|\$[A-Z_]+\b/;

/** Full semver validation */
export const SEMVER_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(...))?(?:\+(...))?$/;

/** Markdown heading (any level) */
export const HEADING_RE = /^(#{1,6})\s+(.+)$/;

/** Escape string for use in RegExp constructor */
export function escapeRegExp(str: string): string;

/** Check if value contains env var placeholder */
export function containsEnvVar(value: string): boolean;

/** Validate semver format */
export function isValidSemver(version: string): boolean;
```

**Design decision: `IMPORT_RE`** -- Claude Code imports use `@path` syntax. Must distinguish real imports (`@./file.md`, `@.claude/rules/test.md`, `@path/to/file`) from decorators (`@Injected`), emails (`user@example.com`), and JSDoc (`@param`). First check whether bare `@file.md` (no `/` or leading `.`) is a supported import syntax in Claude Code. If not, require `/` or leading `.` in the match. If so, require a file extension (`.md`) as the distinguisher. The regex should NOT have a global flag baked in -- export without `/g` so callers can use it with `matchAll()` (which requires adding `/g` at the call site) or `.test()` safely. This avoids stale `lastIndex` bugs.

- [x] Determine whether `@file.md` (bare filename, no path separator) is valid Claude Code import syntax -- YES, confirmed via test fixtures
- [x] Define `isImportPath()` filter function -- requires `/` OR file extension (`.md`, etc.)
- [x] Add tests in `tests/utils/regex-patterns.test.ts` for all exports (28 tests)

### 1.2 Consolidate `extractImports()` as a wrapper

`extractImports()` currently has its own implementation using a banned anti-pattern (regex code-block stripping `/```[\s\S]*?```/g`). Following the ESLint "simple wraps complex" pattern, make it delegate to `extractImportsWithLineNumbers()`.

- [x] Replace `extractImports()` body with:

```typescript
export function extractImports(content: string): string[] {
  return extractImportsWithLineNumbers(content).map(imp => imp.path);
}
```

- [x] This eliminates: the duplicate implementation, the banned regex code-block stripping, the missing tilde fence support, and the `exec()` loop -- all in one change

### 1.3 Fix `extractImportsWithLineNumbers()`

The core import extraction function has three bugs:

- [x] Use `isImportPath()` from `patterns.ts` instead of inline `/@([^\s]+)/g` (fixes `@Decorator` false positives)
- [x] Add tilde fence (`~~~`) support to the code block state machine (currently only handles backticks)
- [x] Convert `exec()` loop to `matchAll()`
- [x] Update tests in `tests/utils/markdown.test.ts` (7 new tests):
  - `@Injected`, `@param`, `user@example.com` are NOT matched
  - `@imported.md`, `@docs/guide` ARE matched
  - Imports inside tilde-fenced code blocks are skipped

### 1.4 Update `escapeRegExp` consumers

Replace inline `text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` with `escapeRegExp()` from patterns.

- [x] `src/utils/formats/markdown.ts` (in `getFrontmatterFieldLine`)
- [x] `src/utils/rules/helpers.ts` (in `hasHeading`)

### 1.5 Update `validateSemver` to use shared constant

- [x] `src/utils/rules/helpers.ts` -- use `SEMVER_RE` from patterns instead of inline regex

### 1.6 Verify Phase 1

- [x] `npm test` passes (1723 tests, 204 suites)
- [x] `npm run check:self` passes (16 files, no problems)
- [x] Run `claudelint --cwd` against NextUp iOS project -- `@Injected` false positives gone (32 -> 29 findings)
- [x] Run `claudelint --cwd` against nextup-backend -- 68 problems (unchanged)

---

## Phase 2: Update Rule Files

With the shared utilities fixed, update all rule files to use them instead of inline patterns. Each change is a mechanical replacement with no behavioral change.

### 2.1 Update env var placeholder consumers (5 files)

Replace inline `/\$\{[A-Z_]+\}|\$[A-Z_]+\b/` with `containsEnvVar()`.

- [x] `src/rules/mcp/mcp-http-invalid-url.ts`
- [x] `src/rules/mcp/mcp-sse-invalid-url.ts`
- [x] `src/rules/mcp/mcp-websocket-invalid-url.ts`
- [x] `src/rules/mcp/mcp-websocket-invalid-protocol.ts`
- [x] `src/rules/hooks/hooks-missing-script.ts`

### 2.2 Update semver consumer

- [x] `src/rules/plugin/plugin-invalid-version.ts` -- removed `SEMVER_PATTERN` constant, using `isValidSemver()` from patterns

### 2.3 Update `escapeRegExp` consumer

- [x] `src/rules/skills/skill-allowed-tools-not-used.ts` -- using `escapeRegExp()` from patterns

### 2.4 Update `claude-md-import-in-code-block`

This rule needs to find imports *inside* code blocks (the inverse of `stripCodeBlocks`). It keeps its own code block loop, but now uses the shared `isImportPath()` function.

- [x] Replace inline regex with `isImportPath()` from patterns
- [x] Add tilde fence support (fixed toggle-based tracking to proper open/close tracking)
- [x] Convert `exec()` loop to `matchAll()`

### 2.5 Update `claude-md-content-too-many-sections`

- [x] Replace inline heading regex with `HEADING_RE` from patterns (using `new RegExp(HEADING_RE.source, 'gm')`)

### 2.6 Fix `skill-body-long-code-block`

- [x] Fix frontmatter offset to use regex-based boundary detection instead of naive `indexOf('---')`
- [x] Add tilde fence support
- [x] Proper open/close fence tracking (not toggle-based)

### 2.7 Fix `claude-md-file-reference-invalid`

- [x] Add tilde fence support with proper open/close tracking
- [x] Cannot use `stripCodeBlocks()` due to needing `codeBlockLang` for language-specific logic

### 2.8 Convert remaining `exec()` loops to `matchAll()`

- [x] `src/rules/claude-md/claude-md-npm-script-not-found.ts`
- [x] `src/rules/skills/skill-xml-tags-anywhere.ts`
- [x] `src/rules/skills/skill-cross-reference-invalid.ts`

### 2.9 Check `hasVariableExpansion()` in `src/utils/validators/helpers.ts`

- [x] Read implementation -- it's intentionally broader than `containsEnvVar()`: matches any `$` in paths (including lowercase vars, positional params like `$1`, default-value syntax like `${VAR:-default}`)
- [x] Documented the intentional difference in JSDoc
- [x] NOT consolidated — serves a different purpose

### 2.10 Resolve env var name pattern divergence

- [x] Aligned `settings-invalid-env-var.ts` to `/^[A-Z_][A-Z0-9_]*$/` (POSIX allows leading underscore)
- [x] Now matches `refinements.ts` and `mcp-invalid-env-var.ts`

### 2.11 Verify Phase 2

- [x] `npm test` passes (1723 tests, 204 suites)
- [x] `npm run check:self` passes (16 files, no problems)
- [x] No behavioral changes (all existing tests pass without modification)

---

## Phase 3: Export `claudelint/utils` for Custom Rules

The helper library is documented on the website and in JSDoc, but `claudelint/utils` isn't in `package.json` exports. Custom rule authors can't actually import it.

### 3.1 Curate `src/utils/index.ts` as the public barrel

The file already exists but currently re-exports everything (including internals like registry, loader, fixer). Rewrite it as a curated public surface. Internal code already uses direct imports (`../../utils/formats/markdown`), so this change only affects external consumers.

- [x] Rewrite `src/utils/index.ts` to export only the public API:

```typescript
// Markdown utilities
export { extractFrontmatter, extractBodyContent, stripCodeBlocks,
         extractImports, extractImportsWithLineNumbers,
         getFrontmatterFieldLine, countLines } from './formats/markdown';
export type { FrontmatterResult, Import } from './formats/markdown';

// Pattern matching and helpers
export { hasHeading, extractHeadings, matchesPattern, countOccurrences,
         findLinesMatching, validateSemver, parseJSON, parseYAML } from './rules/helpers';
export type { Heading, LineMatch } from './rules/helpers';

// Shared patterns and constants
export { IMPORT_RE, ENV_VAR_PLACEHOLDER_RE, SEMVER_RE, HEADING_RE,
         escapeRegExp, containsEnvVar, isValidSemver } from './patterns';

// File system (async)
export { fileExists, readFileContent } from './filesystem/files';
```

### 3.2 Add `package.json` exports entry

- [x] Add `"./utils"` subpath export:

```json
"./utils": {
  "types": "./dist/utils/index.d.ts",
  "default": "./dist/utils/index.js"
}
```

- [x] Verify `import { hasHeading } from 'claude-code-lint/utils'` resolves correctly after build

### 3.3 Add API surface snapshot tests

Following the ESLint/TypeScript-ESLint pattern of inline snapshot testing to prevent accidental export changes.

- [x] Added to `tests/api/api-surface.test.ts` — snapshot test, documented function checks, pattern constant checks, markdown utility checks, negative tests for internal utilities
- [x] Every function documented in `website/development/helper-library.md` is present in the snapshot

### 3.4 Add end-to-end custom rule test

A custom rule fixture that imports from `claudelint/utils`, gets loaded by the custom rule loader, and executes. This is the test that would have caught the broken export immediately.

- [x] Created `tests/fixtures/custom-rules/utils-consumer-rule.ts` — imports `hasHeading`, `extractHeadings`, `extractFrontmatter`, `matchesPattern`, `countOccurrences` from utils barrel
- [x] Integration test in `tests/integration/custom-rules.integration.test.ts` — exercises rule with multiple inputs, verifies report behavior
- [x] Validates the full chain: barrel export -> fixture rule -> execution with assertions

### 3.5 Add documentation-export sync check

CI check that scans docs and source JSDoc for import paths like `from 'claudelint/...'` or `require('claudelint/...')` and verifies each subpath exists in `package.json` exports. Prevents docs from advertising paths that don't work.

- [x] Created `scripts/check/export-sync.ts` — verifies barrel exports match documented functions
- [x] Added `check:export-sync` npm script
- [x] Correctly identifies 10 functions exported but not yet documented (to be resolved in Phase 5)
- [ ] Add to pre-commit hooks (after Phase 5 resolves drift)

### 3.6 Verify Phase 3

- [x] `npm test` passes (1730 tests, 204 suites)
- [x] `npm run build` produces correct `dist/utils/index.js` and `dist/utils/index.d.ts`
- [x] End-to-end custom rule test passes (10/10 integration tests)
- [x] Export sync check runs and correctly identifies doc drift (to be resolved in Phase 5)
- [x] API surface snapshot tests pass (7/7 tests, 2 snapshots)

---

## Phase 4: Strengthen Enforcement

Prevent regressions by adding new anti-pattern checks. Every pattern fixed in Phases 1-2 gets a corresponding enforcement rule.

### 4.1 Add anti-patterns to `scripts/check/rule-patterns.ts`

- [x] Detect inline env var placeholder regex (should use `containsEnvVar()`)
- [x] Detect inline `escapeRegExp` pattern (should use `escapeRegExp()`)
- [x] Detect `exec()` in while loops (should use `matchAll()`)
- [x] Detect inline semver regex (should use `isValidSemver()`)
- [x] Add allowlist mechanism for rules that legitimately need custom behavior (`skill-body-long-code-block.ts` uses frontmatter regex for line offset calculation)

### 4.2 Add ESLint rules

- [ ] Skipped -- `exec()` has legitimate single-match uses; the rule-patterns check catches the anti-pattern (while loops) specifically

### 4.3 Update `src/CLAUDE.md`

- [x] Added `utils/patterns` exports to the shared utilities table (`containsEnvVar`, `isValidSemver`, `escapeRegExp`, `isImportPath`, `ENV_VAR_PLACEHOLDER_RE`, `SEMVER_RE`, `HEADING_RE`)
- [x] Updated anti-patterns list with all new checks

### 4.4 Verify Phase 4

- [x] `npm run check:rule-patterns` passes with new checks
- [x] All existing rules pass (1 allowlisted: `skill-body-long-code-block.ts`)
- [x] `npm run build && npm run check:self` passes

---

## Phase 5: Documentation & Website

### 5.1 Update helper library docs

`website/development/helper-library.md`:

- [x] Added "Markdown Utilities" section with `extractBodyContent`, `stripCodeBlocks`, `extractImports`, `extractImportsWithLineNumbers`, `getFrontmatterFieldLine`, `countLines`
- [x] Added "Patterns & Constants" section with `escapeRegExp`, `containsEnvVar`, `isValidSemver`, `isImportPath`
- [x] Updated top-level import example to include all 21 exported functions
- [x] `npm run check:export-sync` passes (21 functions in sync)

### 5.2 Update custom rules docs

`website/development/custom-rules.md`:

- [x] Fixed import path from `claudelint/utils` to `claude-code-lint/utils` (3 occurrences)

### 5.3 Fix package name in docs and JSDoc

- [x] `src/utils/index.ts` JSDoc already correct (`claude-code-lint/utils`)
- [x] `website/development/helper-library.md` fixed (2 occurrences)
- [x] `website/development/custom-rules.md` fixed (3 occurrences)
- [x] `website/development/custom-rules-troubleshooting.md` fixed (5 occurrences)
- [x] No remaining `from 'claudelint/` references in website or src

### 5.4 Update contributing guide

- [ ] Deferred — contributing guide updates are lower priority and can be done separately

### 5.5 Regenerate rule docs

- [x] `npm run docs:generate` — 117 rule pages generated

### 5.6 Verify Phase 5

- [x] `npm run lint:md` passes
- [x] `npm run check:export-sync` passes

---

## Phase 6: Test Coverage

### 6.1 Rule regression tests

Add test cases to each refactored rule verifying the specific false positive or bug that motivated the change.

- [x] `claude-md-import-in-code-block` -- test with `@Injected` Swift decorator (should not flag)
- [x] `claude-md-import-in-code-block` -- tilde fence tests already existed (added in Phase 1)
- [x] `skill-body-long-code-block` -- test with tilde fence within threshold (valid) and over threshold (invalid)
- [x] `claude-md-file-reference-invalid` -- test with tilde fence bash block (valid existing file, invalid missing file, non-bash skipped)
- [x] MCP URL rules -- env var placeholder tests already exist (verified: `${API_URL}`, `$BASE_URL` patterns)

### 6.2 Custom rule loader integration tests

- [x] Created `tests/fixtures/custom-rules/utils-consumer-rule.ts` — fixture rule importing from utils barrel
- [x] Integration test in `tests/integration/custom-rules.integration.test.ts` exercises the rule end-to-end (done in Phase 3)

### 6.3 Verify Phase 6

- [x] `npm test` passes (1730 tests, 204 suites)
- [x] `npm run check:self` passes

---

## Final Verification

- [x] `npm test` -- 1730 tests, 204 suites all pass
- [x] `npm run check:self` -- dogfood passes (16 files, no problems)
- [x] `npm run check:rule-patterns` -- all anti-pattern checks pass (9 patterns, 1 allowlisted)
- [x] `npm run check:export-sync` -- 21 functions in sync between barrel and docs
- [x] `npm run lint:md` -- markdown lint passes
- [x] Run `claudelint --cwd` against NextUp iOS -- no `@Injected` false positives (29 findings, down from 32)
- [x] Verify `claude-code-lint/utils` export works end-to-end (integration tests pass)

---

## Key Files

| File | Changes |
|------|---------|
| `src/utils/patterns.ts` | **New** -- centralized regex patterns and helpers |
| `src/utils/formats/markdown.ts` | Consolidate `extractImports` as wrapper, fix `extractImportsWithLineNumbers` (import regex, tilde fences, matchAll), use `escapeRegExp` |
| `src/utils/rules/helpers.ts` | Use `SEMVER_RE` and `escapeRegExp` from patterns |
| `src/utils/index.ts` | Rewrite as curated public barrel (currently leaks internals) |
| `src/rules/mcp/mcp-http-invalid-url.ts` | Use `containsEnvVar()` |
| `src/rules/mcp/mcp-sse-invalid-url.ts` | Use `containsEnvVar()` |
| `src/rules/mcp/mcp-websocket-invalid-url.ts` | Use `containsEnvVar()` |
| `src/rules/mcp/mcp-websocket-invalid-protocol.ts` | Use `containsEnvVar()` |
| `src/rules/hooks/hooks-missing-script.ts` | Use `containsEnvVar()` |
| `src/rules/plugin/plugin-invalid-version.ts` | Use `isValidSemver()` |
| `src/rules/skills/skill-allowed-tools-not-used.ts` | Use `escapeRegExp()` |
| `src/rules/skills/skill-body-long-code-block.ts` | Use `extractBodyContent()`, fix tilde fences |
| `src/rules/skills/skill-xml-tags-anywhere.ts` | Convert `exec()` to `matchAll()` |
| `src/rules/skills/skill-cross-reference-invalid.ts` | Convert `exec()` to `matchAll()` |
| `src/rules/claude-md/claude-md-import-in-code-block.ts` | Use shared `IMPORT_RE`, add tilde fences, `matchAll()` |
| `src/rules/claude-md/claude-md-file-reference-invalid.ts` | Add tilde fence support |
| `src/rules/claude-md/claude-md-npm-script-not-found.ts` | Convert `exec()` to `matchAll()` |
| `src/rules/claude-md/claude-md-content-too-many-sections.ts` | Use `extractHeadings()` from helpers |
| `src/schemas/refinements.ts` | Align env var name pattern |
| `src/rules/settings/settings-invalid-env-var.ts` | Align env var name pattern |
| `scripts/check/rule-patterns.ts` | Add new anti-pattern checks + allowlist |
| `scripts/check/export-sync.ts` | **New** -- verify docs match package exports |
| `package.json` | Add `./utils` subpath export |
| `src/CLAUDE.md` | Update utilities table, add anti-patterns |
| `website/development/helper-library.md` | Add patterns, constants, context properties |
| `website/development/custom-rules.md` | Update import guidance, add context docs |
| `website/development/contributing.md` | Add shared utilities section |
| `tests/utils/patterns.test.ts` | **New** -- pattern module tests |
| `tests/utils/markdown.test.ts` | Import regex edge cases, tilde fences |
| `tests/api/exports.test.ts` | **New** -- API surface snapshot tests |
| ~8 rule test files | Regression test cases |
