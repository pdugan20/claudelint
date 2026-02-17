# Custom Rules Hardening - Progress Tracker

**Status:** COMPLETE
**Start Date:** 2026-02-16
**Last Updated:** 2026-02-16
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
- [x] **1.2**: Create `validateRuleValues()` helper that checks `severity` against `RuleSeverity` and `category` against `RuleCategory`, returning an array of specific error strings
- [x] **1.3**: Replace `isValidRule()` call in `loadRule()` with `isRule()` + `validateRuleValues()`, joining errors into descriptive message
- [x] **1.4**: Delete the private `isValidRule()` method from `CustomRuleLoader`

**Acceptance Criteria:**

- Loader rejects `severity: 'warning'` with message listing valid values
- Loader rejects `category: 'Custom'` with message listing valid categories
- Loader rejects missing `fixable` or `since` fields
- Loader still accepts all valid built-in rule patterns
- Existing tests updated to match new error messages

---

## Phase 2: Dogfood Custom Rules

**Status:** COMPLETE
**Dependencies:** Phase 1 complete
**Goal:** Create `.claudelint/rules/` with 4 real rules that validate this project's CLAUDE.md files.

- [x] **2.1**: Create `.claudelint/rules/require-commands-section.ts` — basic rule using `hasHeading` helper, `category: 'CLAUDE.md'`
- [x] **2.2**: Create `.claudelint/rules/no-user-paths.ts` — pattern matching using `findLinesMatching`, `contentWithoutCode`
- [x] **2.3**: Create `.claudelint/rules/normalize-code-fences.ts` — auto-fix rule with `autoFix` interface, `fixable: true`
- [x] **2.4**: Create `.claudelint/rules/max-section-depth.ts` — configurable rule with `meta.schema` (Zod), `defaultOptions`, `extractHeadings`
- [x] **2.5**: Update `.claudelintrc.json` with rule configuration
- [x] **2.6**: Verify rules load with `npm run build && npx claudelint check-all --verbose`

**Acceptance Criteria:**

- All 4 rules load without errors
- Rules execute against project's 3 CLAUDE.md files (root, src/, website/)
- All rules pass on the current project state (no false positives)
- Each rule demonstrates a distinct feature (basic, pattern, auto-fix, options)

---

## Phase 3: Test Infrastructure

**Status:** COMPLETE
**Dependencies:** Phases 1 and 2 complete
**Goal:** Add tests proving validation rejects bad values, custom rules execute end-to-end, and dogfood rules load.

- [x] **3.1**: Add validation rejection tests to `tests/utils/custom-rule-loader.test.ts` — invalid severity, invalid category, missing fixable/since
- [x] **3.2**: Add execution tests to `tests/integration/custom-rules.integration.test.ts` — prove a custom rule with `category: 'CLAUDE.md'` produces violations via the validator
- [x] **3.3**: Add options/schema test — verify `meta.schema` + `context.options` work end-to-end
- [x] **3.4**: Update test fixtures: change `tests/fixtures/custom-rules/valid-custom-rule.ts` category from `'Custom'` to `'CLAUDE.md'`, `team-conventions.ts` to `'Skills'` (done in Phase 1)
- [x] **3.5**: Create `tests/integration/dogfood-rules.test.ts` — verify all 4 dogfood rules load from `.claudelint/rules/`

**Acceptance Criteria:**

- All new tests pass
- Invalid severity/category produce specific error messages in tests
- At least one test proves custom rule execution end-to-end via a validator
- Dogfood rules load successfully in test environment
- No regressions in existing test suite

---

## Phase 4: Documentation

**Status:** COMPLETE
**Dependencies:** Phase 2 complete
**Goal:** Fix all bugs in custom rules docs and replace generic examples with dogfood rule references.

- [x] **4.1**: Fix `website/development/custom-rules.md` — change all `category: 'Custom'` to valid categories in inline examples
- [x] **4.2**: Fix severity values — no `severity: 'warning'` found (already correct)
- [x] **4.3**: Fix type reference — change `ValidationContext` to `RuleContext` (line ~512)
- [x] **4.4**: Add "Valid Categories" section after RuleMetadata docs, listing all 10 categories with descriptions
- [x] **4.5**: Add "Real-World Examples" section before Troubleshooting, referencing all 4 dogfood rules with file paths, what each demonstrates, and key techniques
- [x] **4.6**: Update `website/development/helper-library.md` — fix `category: 'Custom'` to `'Skills'`

**Acceptance Criteria:**

- Zero instances of `category: 'Custom'` in website docs
- Zero instances of `severity: 'warning'` in website docs
- Zero references to `ValidationContext`
- Valid categories clearly documented with descriptions
- All 4 dogfood rules referenced with explanations
- `npm run docs:build` succeeds

---

## Phase 5: Verification

**Status:** COMPLETE
**Dependencies:** All previous phases complete
**Goal:** Full end-to-end verification that everything works together.

- [x] **5.1**: Run `npm test` — all 1596 tests pass (13 new tests added)
- [x] **5.2**: Run `npm run build && npm run check:self` — 4 dogfood rules loaded, 15 files checked, no problems
- [x] **5.3**: Run `npm run validate` — full lint + format + build + test suite passes
- [x] **5.4**: Manual test: `category: 'Custom'` and `severity: 'warning'` produce descriptive rejection with valid values listed

**Acceptance Criteria:**

- `npm test` exits 0
- `npm run check:self` shows custom rules loaded in verbose output
- `npm run validate` exits 0
- Invalid rules produce actionable error messages

---

## Notes

- The `docs/examples/custom-rules/` directory (7 orphaned legacy files) was deleted prior to this project
- The approach uses existing categories rather than adding a new 'Custom' category
- Custom rules import helpers via relative paths from `src/` (dogfood) or `claudelint/utils` (external users)
