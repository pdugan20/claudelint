# Rule Reliability & Parsing Hardening -- Progress Tracker

**Last Updated**: 2026-02-14
**Status**: Complete
**Progress**: 30/30 tasks

---

## How to Use This Tracker

- Mark tasks `[x]` when complete, update date
- Update phase progress counts after each task
- Each task lists files to modify and test expectations
- Run verification after each phase (see README.md)

---

## Phase 1: Shared Utility Hardening

**Progress**: 4/4
**Priority**: Highest
**Prerequisite**: None
**Completed**: 2026-02-14

Foundation work. Phases 2-3 depend on these utilities existing and being tested.

### P1-1: Extract `stripCodeBlocks()` utility

- [x] Add `stripCodeBlocks(content: string): string` to `src/utils/formats/markdown.ts`
- [x] Handle both `` ``` `` and `~~~` fences
- [x] Handle inline code stripping (`` `...` ``)
- [x] Preserve line count (replace code lines with empty lines, not removal)
- [x] Add tests: basic fenced block, tilde fence, unclosed fence, inline code, nested backticks in code
- [x] Add test: content with no code blocks (passthrough)

**Files**: `src/utils/formats/markdown.ts`
**Tests**: `tests/utils/markdown.test.ts` (9 new tests)

---

### P1-2: Fix `extractBodyContent` naive `---` splitting

- [x] Rewrite `extractBodyContent()` to use regex-based frontmatter boundary detection
- [x] Ensure it returns empty string when no frontmatter exists
- [x] Add test: frontmatter containing `---` in a YAML value
- [x] Add test: frontmatter with no body after closing `---`
- [x] Add test: file with no frontmatter at all
- [x] Verify existing tests still pass

**Files**: `src/utils/formats/markdown.ts`
**Tests**: `tests/utils/markdown.test.ts` (2 new tests)

---

### P1-3: Escape regex metacharacters in `getFrontmatterFieldLine`

- [x] Add regex escape utility: `fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`
- [x] Apply to `getFrontmatterFieldLine` in `src/utils/formats/markdown.ts`
- [x] Add test: field name with regex metacharacters (e.g., `metadata[0]`)
- [x] Verify existing tests still pass

**Files**: `src/utils/formats/markdown.ts`
**Tests**: `tests/utils/markdown.test.ts` (4 new tests for getFrontmatterFieldLine)

---

### P1-4: Normalize line endings in frontmatter extraction

- [x] Add `content = content.replace(/\r\n/g, '\n')` at the top of `extractFrontmatter()`
- [x] Also applied to `extractBodyContent()` for consistency
- [x] Add test: frontmatter with `\r\n` line endings produces same result as `\n`
- [x] Verify existing tests still pass

**Files**: `src/utils/formats/markdown.ts`
**Tests**: `tests/utils/markdown.test.ts` (2 new tests)

---

## Phase 2: Consolidate Hand-Rolled Parsing

**Progress**: 5/5
**Priority**: High
**Prerequisite**: Phase 1 complete
**Completed**: 2026-02-14

Replace inline regex parsing in rules with calls to shared utilities from Phase 1.

### P2-1: `skill-frontmatter-unknown-keys` -- use js-yaml via extractFrontmatter

- [x] Import `extractFrontmatter` from `../../utils/formats/markdown`
- [x] Replace regex-based key extraction with `extractFrontmatter()` + `Object.keys(frontmatter)`
- [x] Remove the manual frontmatter regex match
- [x] Verify existing tests still pass (7/7)

**Files**: `src/rules/skills/skill-frontmatter-unknown-keys.ts`
**Tests**: `tests/rules/skills/skill-frontmatter-unknown-keys.test.ts`

---

### P2-2: `skill-description-max-length` -- use extractFrontmatter

- [x] Import `extractFrontmatter` from `../../utils/formats/markdown`
- [x] Replace inline regex with `extractFrontmatter()` call
- [x] Verify existing tests still pass (5/5)

**Files**: `src/rules/skills/skill-description-max-length.ts`
**Tests**: `tests/rules/skills/skill-description-max-length.test.ts`

---

### P2-3: `skill-body-word-count` -- use extractBodyContent

- [x] Import `extractBodyContent` from `../../utils/formats/markdown`
- [x] Replace inline regex with `extractBodyContent()` call
- [x] Verify existing tests still pass (4/4)

**Files**: `src/rules/skills/skill-body-word-count.ts`
**Tests**: `tests/rules/skills/skill-body-word-count.test.ts`

---

### P2-4: `skill-xml-tags-anywhere` -- use stripCodeBlocks utility

- [x] Import `stripCodeBlocks` from `../../utils/formats/markdown`
- [x] Replace inline regex stripping with `stripCodeBlocks()` call
- [x] Verify existing tests still pass (6/6)

**Files**: `src/rules/skills/skill-xml-tags-anywhere.ts`
**Tests**: `tests/rules/skills/skill-xml-tags-anywhere.test.ts`

---

### P2-5: `skill-unknown-string-substitution` -- use stripCodeBlocks utility

- [x] Import `stripCodeBlocks` from `../../utils/formats/markdown`
- [x] Replace inline regex stripping with `stripCodeBlocks()` call
- [x] Verify existing tests still pass (7/7)

**Files**: `src/rules/skills/skill-unknown-string-substitution.ts`
**Tests**: `tests/rules/skills/skill-unknown-string-substitution.test.ts`

---

## Phase 3: Regex Correctness Fixes

**Progress**: 3/3
**Priority**: High
**Prerequisite**: Phase 2 complete
**Completed**: 2026-02-14

### P3-1: Fix `$VARIABLE` detection regex anchoring

- [x] Implement two-pass approach: strip `${...}` first, then match bare `$UPPERCASE`
- [x] Switched to `matchAll()` in same change (natural fit with two-pass approach)
- [x] Verify existing tests still pass (7/7 including `${VARIABLE}` syntax test)

**Files**: `src/rules/skills/skill-unknown-string-substitution.ts`
**Tests**: `tests/rules/skills/skill-unknown-string-substitution.test.ts`

---

### P3-2: Switch global regex patterns to `matchAll()`

- [x] Convert `FILE_PATH_REGEX.lastIndex = 0; while (exec...)` to `for (const match of line.matchAll(...))`
- [x] Converted both bash code block and inline code loops
- [x] Verify existing tests still pass (1/1)

**Files**: `src/rules/claude-md/claude-md-file-reference-invalid.ts`
**Tests**: `tests/rules/claude-md/claude-md-file-reference-invalid.test.ts`

---

### P3-3: Tighten XML tag regex for edge cases

- [x] Changed `[^>]*` to `[^>]{0,200}` to cap attribute matching length
- [x] Verify existing tests still pass (6/6)

**Files**: `src/rules/skills/skill-xml-tags-anywhere.ts`
**Tests**: `tests/rules/skills/skill-xml-tags-anywhere.test.ts`

---

## Phase 4: Filesystem & Security Hardening

**Progress**: 3/3
**Priority**: Medium
**Prerequisite**: None
**Completed**: 2026-02-14

### P4-1: Add symlink loop protection to `skill-deep-nesting`

- [x] Add `!entry.isSymbolicLink()` to the directory filter
- [x] Add `MAX_RECURSION_DEPTH = 20` safety cap independent of configurable `maxDepth`
- [x] Verify existing tests still pass (1/1)

**Files**: `src/rules/skills/skill-deep-nesting.ts`
**Tests**: `tests/rules/skills/skill-deep-nesting.test.ts`

---

### P4-2: Improve secret detection comment filtering

- [x] Check exemption words in comment-only lines (shell `#`, JS `//`, block `/* */`, HTML `<!-- -->`)
- [x] For non-comment lines, strip the matched pattern then check context for "fake", "dummy", "mock", "sample", "placeholder"
- [x] Verify existing tests still pass (1/1, including AKIAIOSFODNN7EXAMPLE case)

**Files**: `src/rules/skills/skill-hardcoded-secrets.ts`
**Tests**: `tests/rules/skills/skill-hardcoded-secrets.test.ts`
**Deviation**: See [deviations.md](deviations.md) Phase 4 for details on the revised exemption approach.

---

### P4-3: Tighten URL variable detection in MCP rules

- [x] Replace `url.includes('$')` with specific env var pattern `/\$\{[A-Z_]+\}|\$[A-Z_]+\b/`
- [x] Applied to both `mcp-http-invalid-url.ts` and `mcp-websocket-invalid-url.ts`
- [x] Verify existing tests still pass (1/1 each)

**Files**: `src/rules/mcp/mcp-http-invalid-url.ts`, `src/rules/mcp/mcp-websocket-invalid-url.ts`
**Tests**: `tests/rules/mcp/mcp-http-invalid-url.test.ts`, `tests/rules/mcp/mcp-websocket-invalid-url.test.ts`

---

## Phase 5: Cleanup, Tests & Documentation

**Progress**: 4/4
**Priority**: Medium
**Prerequisite**: Phases 1-4 complete
**Completed**: 2026-02-14

### P5-1: Remove dead `ajv` / `ajv-formats` devDependencies

- [x] Confirmed no imports exist in `src/` or `tests/`
- [x] Removed `ajv` and `ajv-formats` from `package.json` devDependencies

**Files**: `package.json`

---

### P5-2: Full test suite verification

- [x] `npm run build` passes (116 rules, clean compilation)
- [x] `npm test` passes: 195 suites, 1503 tests, 0 failures
- [x] `npm run check:self` reports 0 errors, 0 warnings
- [x] No regressions

---

### P5-3: Regenerate rule documentation

- [x] N/A -- no `meta.docs` content was changed (only internal implementation)
- [x] Auto-generated pages are unaffected

---

### P5-4: Update troubleshooting docs (if needed)

- [x] N/A -- all fixes target edge cases. No user-facing behavior changes for well-formed inputs.

---

## Phase 6: Banned-Pattern CI Script

**Progress**: 4/4
**Priority**: High
**Prerequisite**: Phase 6a complete (no remaining lastIndex to allowlist)
**Completed**: 2026-02-14

Automated CI check that greps rule source files for known anti-patterns and fails the build.

### P6a-1: Migrate `skill-reference-not-linked` to `matchAll()`

- [x] Convert two `lastIndex = 0; while (exec...)` loops to `for...of matchAll()`
- [x] Verify existing tests still pass (11/11)

**Files**: `src/rules/skills/skill-reference-not-linked.ts`
**Tests**: `tests/rules/skills/skill-reference-not-linked.test.ts`

---

### P6a-2: Migrate `skill-referenced-file-not-found` to `matchAll()`

- [x] Convert `lastIndex = 0; while (exec...)` loop to `for...of matchAll()`
- [x] Verify existing tests still pass (4/4)

**Files**: `src/rules/skills/skill-referenced-file-not-found.ts`
**Tests**: `tests/rules/skills/skill-referenced-file-not-found.test.ts`

---

### P6-1: Create `scripts/check/rule-patterns.ts`

- [x] Create script following the `message-content.ts` pattern
- [x] Detect anti-patterns: `lastIndex`, inline code block regex, naive `---` split, `new RegExp(` without escaping, `url.includes('$')`, hand-rolled frontmatter regex
- [x] Group violations by pattern type with file:line references
- [x] Exit 1 on violations, 0 on clean
- [x] Script caught 5 additional violations in rules missed by original audit -- fixed all 5

**Files**: `scripts/check/rule-patterns.ts`

---

### P6-2: Wire into package.json

- [x] Add `check:rule-patterns` script to package.json
- [x] Add to `check:all` script (in `scripts/check/all.ts`)
- [x] Verify passes on current codebase

**Files**: `package.json`, `scripts/check/all.ts`

---

## Phase 7: ESLint Rule-Scoped Restrictions

**Progress**: 2/2
**Priority**: High
**Prerequisite**: None
**Completed**: 2026-02-14

AST-level enforcement via ESLint, scoped to `src/rules/**/*.ts`. Catches patterns grep might miss.

### P7-1: Add `no-restricted-syntax` override

- [x] Add override block in `.eslintrc.json` for `src/rules/**/*.ts`
- [x] Ban `MemberExpression[property.name='lastIndex']` with message
- [x] Verify `npm run lint` passes

**Files**: `.eslintrc.json`

---

### P7-2: Add `no-restricted-imports` override

- [x] Ban direct `js-yaml` imports in rule files (use `extractFrontmatter()` instead)
- [x] Verify `npm run lint` passes

**Files**: `.eslintrc.json`

---

## Phase 8: Rule Authoring Documentation

**Progress**: 1/1
**Priority**: Medium
**Prerequisite**: None
**Completed**: 2026-02-14

Update developer-facing docs so rule authors know which utilities to use.

### P8-1: Add shared utilities section to `src/CLAUDE.md`

- [x] Document `extractFrontmatter()`, `extractBodyContent()`, `stripCodeBlocks()`, `getFrontmatterFieldLine()`
- [x] Document anti-patterns to avoid (hand-rolled YAML, inline code stripping, raw `new RegExp`)
- [x] Place after existing "Rule Authoring" section
- [x] Also documented pre-parsed context fields (Phase 9 forward reference)

**Files**: `src/CLAUDE.md`

---

## Phase 9: Enrich RuleContext

**Progress**: 3/3
**Priority**: Medium
**Prerequisite**: None
**Completed**: 2026-02-14

Add lazy-computed pre-parsed data to RuleContext so rules never need to parse content themselves.

### P9-1: Add optional fields to `RuleContext` interface

- [x] Add `frontmatter?: Record<string, unknown>` (lazy, readonly)
- [x] Add `bodyContent?: string` (lazy, readonly)
- [x] Add `contentWithoutCode?: string` (lazy, readonly)
- [x] Keep fields optional for backward compatibility

**Files**: `src/types/rule.ts`

---

### P9-2: Populate fields in `executeRule()`

- [x] Use ES getter pattern with null-sentinel caching
- [x] Compute `frontmatter` via `extractFrontmatter()` on first access
- [x] Compute `bodyContent` via `extractBodyContent()` on first access
- [x] Compute `contentWithoutCode` via `stripCodeBlocks()` on first access

**Files**: `src/validators/file-validator.ts`
**Deviation**: Used inline getters with null-sentinel caching instead of `Object.defineProperty`. Simpler, same effect.

---

### P9-3: Add tests for enriched context

- [x] Test that `context.frontmatter` returns parsed YAML (3 tests)
- [x] Test that `context.bodyContent` returns body after frontmatter (2 tests)
- [x] Test that `context.contentWithoutCode` returns code-stripped content (2 tests)
- [x] Test lazy evaluation and caching (2 tests)

**Files**: `tests/validators/rule-context.test.ts` (new, 9 tests)

---

## Phase 10: Pre-Commit Integration & Final Verification

**Progress**: 2/2
**Priority**: Medium
**Prerequisite**: Phases 6-9 complete
**Completed**: 2026-02-14

### P10-1: Wire `check:rule-patterns` into lint-staged

- [x] Add `check:rule-patterns` to `src/rules/**/*.ts` lint-staged config
- [x] Scoped to rule files only (not all TS files)

**Files**: `package.json`

---

### P10-2: Full verification

- [x] `npm run build` passes (tsc clean)
- [x] `npm test` passes: 196 suites, 1512 tests, 0 failures
- [x] `npm run lint` passes (including new ESLint restrictions)
- [x] `npm run check:rule-patterns` passes
- [x] `npm run check:self` reports 0 errors, 0 warnings

---

## Overall Progress

```text
Phase 1: Shared Utility Hardening     [##########] 100%  (4/4)
Phase 2: Consolidate Parsing          [##########] 100%  (5/5)
Phase 3: Regex Correctness            [##########] 100%  (3/3)
Phase 4: Filesystem & Security        [##########] 100%  (3/3)
Phase 5: Cleanup & Documentation      [##########] 100%  (4/4)
Phase 6: Banned-Pattern CI Script     [##########] 100%  (4/4)
Phase 7: ESLint Restrictions          [##########] 100%  (2/2)
Phase 8: Rule Authoring Docs          [##########] 100%  (1/1)
Phase 9: Enrich RuleContext           [##########] 100%  (3/3)
Phase 10: Pre-Commit & Verification   [##########] 100%  (2/2)
                                                         ----
Total                                                   30/30
```

---

## Final Verification

```text
Build:      PASS (tsc clean)
Tests:      196 suites, 1512 tests, 0 failures
Lint:       PASS (ESLint with no-restricted-syntax/imports)
Patterns:   PASS (check:rule-patterns, 0 violations)
Self-check: 0 errors, 0 warnings
```

---

## Notes & Decisions

### 2026-02-14

- Decided against adding `remark` or `markdown-it` as a dependency. The line-by-line state tracking approach is sufficient for code block detection and avoids a new dependency.
- Decided against replacing secret detection with `detect-secrets` library. Our patterns cover the most common API key formats; a full secret scanner is out of scope.
- The `gray-matter` library was considered for frontmatter parsing but rejected -- our regex + js-yaml approach is correct.
- AJV removal confirmed safe -- zero imports in `src/` and `tests/`.
- P4-2 exemption words required refinement: "example" and "test" appear in real secret values (AWS `EXAMPLE` key, `test_key` patterns). Revised to check context around the secret, not the line wholesale. See [deviations.md](deviations.md).
