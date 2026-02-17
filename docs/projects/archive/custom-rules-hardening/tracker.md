# Custom Rules Hardening - Progress Tracker

**Status:** COMPLETE (Archived)
**Start Date:** 2026-02-16
**Completed:** 2026-02-16
**Progress:** 5/5 phases complete

## Phase Overview

| Phase | Status | Tasks | Progress |
|-------|--------|-------|----------|
| Phase 1: Unified Validation | COMPLETE | 4/4 | 100% |
| Phase 2: Dogfood Custom Rules | COMPLETE | 6/6 | 100% |
| Phase 3: Test Infrastructure | COMPLETE | 5/5 | 100% |
| Phase 4: Documentation | COMPLETE | 6/6 | 100% |
| Phase 5: Verification | COMPLETE | 4/4 | 100% |

---

## Phase 1: Unified Validation

**Status:** COMPLETE
**Dependencies:** None
**Goal:** Replace weak `isValidRule()` with the existing `isRule()` type guard + enum value validation. One validation path for all rules.

- [x] **1.1**: Import `isRule` from `src/types/rule.ts` into `src/utils/rules/loader.ts`
- [x] **1.2**: Create `validateRuleValues()` helper that checks `severity` against `RuleSeverity`, `category` against `RuleCategory`, and ID format against kebab-case regex, returning an array of specific error strings
- [x] **1.3**: Replace `isValidRule()` call in `loadRule()` with `isRule()` + `validateRuleValues()`, joining errors into descriptive message
- [x] **1.4**: Delete the private `isValidRule()` method from `CustomRuleLoader`

---

## Phase 2: Dogfood Custom Rules

**Status:** COMPLETE
**Dependencies:** Phase 1 complete
**Goal:** Create `.claudelint/rules/` with 4 real rules that validate this project's files.

- [x] **2.1**: Create `.claudelint/rules/require-skill-see-also.ts` — basic rule using `hasHeading` helper, `category: 'Skills'`, validates SKILL.md files have `## See Also` section
- [x] **2.2**: Create `.claudelint/rules/no-user-paths.ts` — pattern matching using `findLinesMatching`, `contentWithoutCode`
- [x] **2.3**: Create `.claudelint/rules/normalize-code-fences.ts` — auto-fix rule with `autoFix` interface, `fixable: true`, stateful `addLanguageToBareFences` apply function
- [x] **2.4**: Create `.claudelint/rules/max-section-depth.ts` — configurable rule with `meta.schema` (Zod), `defaultOptions`, `extractHeadings`
- [x] **2.5**: Update `.claudelintrc.json` with `customRulesDir` and rule configuration
- [x] **2.6**: Verify rules load with `npm run build && npx claudelint check-all --verbose`

**Note:** Task 2.1 was originally `require-commands-section` (`category: 'CLAUDE.md'`). Changed to `require-skill-see-also` (`category: 'Skills'`) to demonstrate category diversity across the dogfood rules.

---

## Phase 3: Test Infrastructure

**Status:** COMPLETE
**Dependencies:** Phases 1 and 2 complete
**Goal:** Add tests proving validation rejects bad values, custom rules execute end-to-end, and dogfood rules load.

- [x] **3.1**: Add validation rejection tests to `tests/utils/custom-rule-loader.test.ts` — invalid severity, invalid category, missing fixable/since, invalid ID format, multiple errors
- [x] **3.2**: Add execution tests to `tests/integration/custom-rules.integration.test.ts` — prove a custom rule with `category: 'CLAUDE.md'` produces violations via the validator
- [x] **3.3**: Add options/schema test — verify `meta.schema` + `context.options` work end-to-end
- [x] **3.4**: Update test fixtures: change `tests/fixtures/custom-rules/valid-custom-rule.ts` category from `'Custom'` to `'CLAUDE.md'`, `team-conventions.ts` to `'Skills'`
- [x] **3.5**: Create `tests/integration/dogfood-rules.test.ts` — verify all 4 dogfood rules load, detect violations, skip wrong file types, and produce zero false positives on project files (CLAUDE.md and SKILL.md)

---

## Phase 4: Documentation

**Status:** COMPLETE
**Dependencies:** Phase 2 complete
**Goal:** Fix all bugs in custom rules docs and replace generic examples with dogfood rule references.

- [x] **4.1**: Fix `website/development/custom-rules.md` — remove all `category: 'Custom'` from examples
- [x] **4.2**: Fix severity values — no `severity: 'warning'` found (already correct)
- [x] **4.3**: Fix type reference — change `ValidationContext` to `RuleContext`
- [x] **4.4**: Add "Valid Categories" section after RuleMetadata docs, listing all 10 categories with descriptions
- [x] **4.5**: Replace 6 hypothetical inline example rules with real dogfood rule references organized by feature (basic in Quick Start, pattern matching, auto-fix, configurable options), each with `**Source:**` link to GitHub
- [x] **4.6**: Update `website/development/helper-library.md` — fix `category: 'Custom'` to `'Skills'`

---

## Phase 5: Verification

**Status:** COMPLETE
**Dependencies:** All previous phases complete
**Goal:** Full end-to-end verification that everything works together.

- [x] **5.1**: Run `npm test` — all 1618 tests pass
- [x] **5.2**: Run `npm run build && npm run check:self` — 4 dogfood rules loaded, 15 files checked across 5 categories, no problems
- [x] **5.3**: Run `npm run validate` — full lint + format + build + test suite passes
- [x] **5.4**: Manual test: `category: 'Custom'` and `severity: 'warning'` produce descriptive rejection with valid values listed

---

## Additional Work (Not in Original Plan)

These changes were necessary during implementation but not anticipated in the original plan:

1. **Config loading order fix** (`src/cli/utils/config-loader.ts`, `src/cli/commands/check-all.ts`) — Split `loadAndValidateConfig` into `loadConfig` + `ensureCustomRulesLoaded` + `validateLoadedConfig` so custom rule IDs register before config validation rejects them
2. **Synchronous loading** (`src/utils/rules/loader.ts`) — Added `loadCustomRulesSync` method because `ensureCustomRulesLoaded` needed sync access (jiti is inherently synchronous)
3. **Fixture project isolation** — Added empty `.claudelintrc.json` to `valid-complete` and `invalid-all-categories` fixture projects to prevent parent config inheritance
4. **CLI integration fixture** — Created `tests/fixtures/projects/custom-rules-violation/` with inline JS rule + 4 tests in `fixture-projects.test.ts` proving subprocess execution end-to-end
5. **Troubleshooting page split** — Extracted 12-section troubleshooting into `website/development/custom-rules-troubleshooting.md` with nested sidebar nav item to reduce right-nav clutter
6. **Docs heading cleanup** — Shortened verbose H3 headings in `architecture.md` and `rule-system.md` for cleaner sidebar navigation
7. **SKILL.md update** — Added `## See Also` to `skills/optimize-cc-md/SKILL.md` (only skill missing it) so `require-skill-see-also` produces no false positives
8. **Orphaned legacy docs** — Deleted `docs/examples/custom-rules/` (8 files) as part of this commit

---

## Notes

- The approach uses existing categories rather than adding a new 'Custom' category
- Custom rules import helpers via relative paths from `src/` (dogfood) or `claudelint/utils` (external users)
- The `docs/examples/custom-rules/` directory (8 orphaned legacy files) was deleted as part of this project
