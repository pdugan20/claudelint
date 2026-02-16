# Deviations from Original Plan

Tracks any deviations from the original project plan on a per-phase basis. Each entry records what was originally planned, what actually happened, and why the deviation occurred.

**Created**: 2026-02-15
**Last Updated**: 2026-02-15

---

## Legend

- **As planned** -- Implemented exactly as proposed
- **Modified** -- Approach or scope changed during implementation
- **Dropped** -- Task removed from scope
- **Added** -- New task not in original plan

---

## Phase 1: Centralized Pattern Constants

### 1.1 Create `patterns.ts`

| | |
|---|---|
| **Original plan** | Create `src/utils/filesystem/patterns.ts` with all pattern constants |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 1.2 Pattern consistency tests

| | |
|---|---|
| **Original plan** | Create `tests/utils/patterns.test.ts` |
| **Actual** | Implemented as planned with 14 test cases |
| **Status** | **As planned** |

---

## Phase 2: Update Centralized Discovery (`files.ts`)

### 2.1 Import patterns and replace inline arrays

| | |
|---|---|
| **Original plan** | Replace inline arrays in all `find*` functions |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 2.2 Fix `findHooksFiles` path

| | |
|---|---|
| **Original plan** | Change `.claude/hooks/hooks.json` to `.claude/hooks.json` + `hooks/hooks.json` |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 2.3 Add `.claude/CLAUDE.md` pattern

| | |
|---|---|
| **Original plan** | Add `**/.claude/CLAUDE.md` to CLAUDE.md patterns |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 2.4 Add `findAllFormattableFiles()`

| | |
|---|---|
| **Original plan** | New function returning categorized `{ markdown, json, yaml, shell }` |
| **Actual** | Implemented with `Promise.all` for parallel resolution of all four categories |
| **Status** | **As planned** |

### 2.5 Expand file discovery tests

| | |
|---|---|
| **Original plan** | Add tests for all untested discovery functions |
| **Actual** | Added 35 tests covering all discovery functions including new `findAllFormattableFiles` |
| **Status** | **As planned** |

---

## Phase 3: Fix Format Command

### 3.1 Fix markdownlint no-op fix

| | |
|---|---|
| **Original plan** | Implement `fixMarkdownlint()` using `applyFixes` from `markdownlint/helpers` |
| **Actual** | `applyFixes` is on main `markdownlint` module, not `markdownlint/helpers`. Used two-pass approach: lint with `resultVersion: 3` for `fixInfo`, apply fixes, re-lint for remaining issues. |
| **Status** | **Modified** -- API location was different than anticipated; approach adapted accordingly |

### 3.2 Fix ShellCheck command injection

| | |
|---|---|
| **Original plan** | Replace `execSync` string concatenation with `execFileSync` |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 3.3 Refactor format to use centralized discovery

| | |
|---|---|
| **Original plan** | Replace hardcoded `claudeFiles` with `findAllFormattableFiles()` |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 3.4 Explicit Prettier config resolution

| | |
|---|---|
| **Original plan** | Call `prettier.resolveConfig()` before check/format |
| **Actual** | Added `resolveOptions()` helper that merges resolved config with filepath option |
| **Status** | **As planned** |

### 3.5 Add `--fix-dry-run` flag

| | |
|---|---|
| **Original plan** | Three modes: `--check`, `--fix-dry-run`, default fix. Dry-run shows diffs. |
| **Actual** | Three modes implemented. Dry-run runs in check mode (reports files needing changes) rather than computing diffs, which was simpler and more consistent with `--check`. |
| **Status** | **Modified** -- Simplified dry-run to check mode rather than diff computation |

### 3.6 Improve summary output

| | |
|---|---|
| **Original plan** | Show `N files checked, M formatted, K errors` summary |
| **Actual** | Implemented as planned with per-file error listing in check mode |
| **Status** | **As planned** |

### 3.7 Add format command tests

| | |
|---|---|
| **Original plan** | Create `tests/cli/format.test.ts` |
| **Actual** | Deferred -- format command tests require complex mocking of ESM dynamic imports (markdownlint, prettier). Core functionality verified through pattern tests, file discovery tests, and manual verification. |
| **Status** | **Dropped** -- Tracked as follow-up task |

---

## Phase 4: Update Watch Command

### 4.1 Replace hardcoded `VALIDATOR_TRIGGERS`

| | |
|---|---|
| **Original plan** | Import `WATCH_TRIGGERS` from `patterns.ts` |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 4.2 Add missing validator triggers

| | |
|---|---|
| **Original plan** | Add agents, output-styles, lsp, commands triggers |
| **Actual** | All triggers defined in `WATCH_TRIGGERS` in `patterns.ts` |
| **Status** | **As planned** |

---

## Phase 5: Update Validator `filePatterns`

### 5.1 Fix MCP validator (CRITICAL)

| | |
|---|---|
| **Original plan** | Change `**/.claude/mcp.json` to `**/.mcp.json` |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 5.2 Update claude-md validator

| | |
|---|---|
| **Original plan** | Add `CLAUDE.local.md`, `.claude/CLAUDE.md`, recursive rules |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 5.3 Update skills validator

| | |
|---|---|
| **Original plan** | Add `skills/*/SKILL.md` (plugin root) |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 5.4 Update hooks validator

| | |
|---|---|
| **Original plan** | Align with `HOOKS_PATTERNS` |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 5.5 Update settings validator

| | |
|---|---|
| **Original plan** | Add `**/.claude/settings.local.json` |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 5.6 Update agents validator

| | |
|---|---|
| **Original plan** | Add `agents/*/AGENT.md` (plugin root) |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 5.7 Update output-styles validator

| | |
|---|---|
| **Original plan** | Add `output-styles/*/*.md` (plugin root) |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

---

## Phase 6: Update Init Wizard

### 6.1 Use centralized path constants

| | |
|---|---|
| **Original plan** | Import `INIT_DETECTION_PATHS`, replace hardcoded strings |
| **Actual** | Implemented as planned. Init wizard `detectProject()` now uses `INIT_DETECTION_PATHS` constants. |
| **Status** | **As planned** |

---

## Phase 7: Documentation

### 7.1 Create file discovery guide

| | |
|---|---|
| **Original plan** | New `website/guide/file-discovery.md` with 6 sections |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 7.2 Add to sidebar navigation

| | |
|---|---|
| **Original plan** | Add File Discovery link to Usage section in config.mts |
| **Actual** | Implemented as planned |
| **Status** | **As planned** |

### 7.3 Update CLI reference format section

| | |
|---|---|
| **Original plan** | Add `--fix-dry-run`, update patterns, note markdownlint fix |
| **Actual** | Implemented as planned with cross-reference to File Discovery page |
| **Status** | **As planned** |

---

## Summary

| Status | Count |
|---|---|
| As planned | 24 |
| Modified | 2 |
| Dropped | 1 |
| Added | 0 |
| **Total** | **27** |

### Deviations of note

1. **3.1 markdownlint fix** -- `applyFixes` lives on the main `markdownlint` module, not `markdownlint/helpers` as originally assumed. Implementation adapted to use the correct import.
2. **3.5 --fix-dry-run** -- Simplified from diff computation to check-mode reporting. More consistent with the existing `--check` flag behavior.
3. **3.7 format tests** -- Deferred to a follow-up task due to ESM dynamic import mocking complexity. Pattern and discovery tests provide coverage for the underlying logic.
