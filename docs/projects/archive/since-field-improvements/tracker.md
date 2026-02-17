# Since Field Improvements -- Progress Tracker

Harden the `since` metadata field: validation, optional for custom rules, fix incorrect values, CI enforcement.

**Status:** Complete
**Start Date:** 2026-02-17
**Last Updated:** 2026-02-17

## Phase 1: Type System and Validation

**Status:** Complete
**Effort:** ~2 hours
**Dependencies:** None

Make `since` optional on the type and validate it as semver when present.

### 1.1 Make `since` Optional on `RuleMetadata`

- [x] Update `src/types/rule.ts:114`: change `since: string` to `since?: string`
- [x] Update `isRule()` type guard at `src/types/rule.ts:326-327`: remove the `since` presence check (allow rules without it)
- [x] Update loader error message at `src/utils/rules/loader.ts:161-168`: remove `since` from the required fields list
- [x] Verify TypeScript compilation passes (built-in rules still provide `since` so no type errors expected)

### 1.2 Add Semver Validation to `validateRuleValues()`

- [x] Update `src/utils/rules/loader.ts:36-56`: add `since` validation block
- [x] Import `validateSemver` from `./helpers`
- [x] When `since` is present and non-empty, validate it with `validateSemver()`
- [x] Push error: `Invalid 'since' value '${rule.meta.since}'. Must be a valid semver string`
- [x] When `since` is absent or undefined, skip validation (valid for custom rules)

### 1.3 Update Tests

- [x] Update `tests/utils/custom-rule-loader.test.ts`: test at line 572-598 ("should reject missing since field") now expects the rule to LOAD successfully (since is optional)
- [x] Add new test: rule with `since: 'banana'` should fail with semver validation error
- [x] Add new test: rule with `since: 'v0.2.0'` should fail (v-prefix is not valid semver)
- [x] Add new test: rule with `since: ''` should fail (empty string)
- [x] Add new test: rule with `since: '0.2.0'` should pass
- [x] Add new test: rule with `since: '1.0.0-beta.1'` should pass (pre-release is valid semver)
- [x] Add new test: rule without `since` should load successfully
- [x] Run full test suite: `npm test` -- 1630 tests pass, 198 suites

**Phase 1 Completion Criteria:**

- [x] `RuleMetadata.since` is optional (`since?: string`)
- [x] `isRule()` accepts rules without `since`
- [x] `validateRuleValues()` rejects invalid semver when `since` is present
- [x] Custom rules without `since` load successfully
- [x] All existing tests pass
- [x] New validation tests pass

---

## Phase 2: Consumption Point Updates

**Status:** Complete
**Effort:** ~1 hour
**Dependencies:** Phase 1 complete

Update all places that read `since` to handle the field being absent.

### 2.1 Update Docs Generator

- [x] Update `scripts/generators/rule-page.ts:188`: wrap in conditional
- [x] When `meta.since` is defined: output `Available since: v${meta.since}` (current behavior)
- [x] When `meta.since` is undefined: skip the "Version" section entirely
- [x] Verify with `npm run docs:generate` -- existing docs unchanged, no "vundefined" output

### 2.2 Update CLI `explain` Command

- [x] Update `src/cli/commands/explain.ts:141`: wrap in conditional
- [x] When `meta.since` is defined: output `Since: ${meta.since}` (current behavior)
- [x] When `meta.since` is undefined: omit the "Since:" line

### 2.3 Update CLI `list-rules` JSON Output

- [x] Check `src/cli/commands/list-rules.ts` for JSON serialization
- [x] `JSON.stringify` already drops `undefined` properties -- no code change needed
- [x] Verified: `getAll()` returns `RuleMetadata[]` serialized directly

### 2.4 Update `check-deprecated` Command

- [x] Review `src/cli/commands/check-deprecated.ts` -- uses `deprecatedSince` from `DeprecationInfo`, not `meta.since`
- [x] Confirmed no cross-dependency on `meta.since`

**Phase 2 Completion Criteria:**

- [x] No "undefined" appears in any output when `since` is absent
- [x] Docs generator skips version section for rules without `since`
- [x] CLI explain omits "Since:" line for rules without `since`
- [x] JSON output omits `since` key when not present

---

## Phase 3: Fix Schema-Generated Rules

**Status:** Complete
**Effort:** ~30 minutes
**Dependencies:** None (can run in parallel with Phase 1-2)

### 3.1 Read Version from `package.json`

- [x] Update `scripts/generate/schema-rules.ts`: read `package.json` version at top of script
- [x] Strip pre-release suffix: `version.replace(/-.*$/, '')` to get stable target
- [x] Replace hardcoded `'1.0.0'` with `${stableVersion}` interpolation in template

### 3.2 Verify

- [x] Ran generator -- confirmed output produces `since: '0.2.0'` (derived from `0.2.0-beta.1`)
- [x] Note: Generator is for initial scaffolding only; existing rules with manual enhancements were not overwritten
- [x] All 1630 tests pass

**Phase 3 Completion Criteria:**

- [x] Schema-generated rules derive `since` from `package.json`
- [x] Pre-release suffixes are stripped (e.g., `0.2.0-beta.1` -> `0.2.0`)
- [x] Generated rules show correct version

---

## Phase 4: CI Enforcement Script

**Status:** Complete
**Effort:** ~2 hours
**Dependencies:** Phase 1 complete (uses optional `since` type)

### 4.1 Create Check Script

- [x] Create `scripts/check/rule-since.ts`
- [x] Scan all files in `src/rules/` (excluding `index.ts`, `rule-ids.ts`)
- [x] For each rule file, extract `since` value from the `meta` object
- [x] Validate:
  - [x] **Presence**: Every built-in rule must have `since` defined
  - [x] **Format**: Must be valid semver (regex match)
  - [x] **No pre-release**: Must not contain `-` suffix (stable versions only for built-in rules)
  - [x] **Range**: Must be `<=` next minor release (allows rules targeting upcoming version)
- [x] Report violations with file path and current value
- [x] Exit 0 on success, 1 on any violation

**Design note:** Range check allows `since` up to the next minor version (e.g., if current is `0.2.0`, allows up to `0.3.0`). This supports the pattern where rules are added for an upcoming release before the version bump.

### 4.2 Add NPM Script

- [x] Add to `package.json` scripts: `"check:rule-since": "ts-node scripts/check/rule-since.ts"`
- [x] Verify: `npm run check:rule-since` passes -- all 113 built-in rules valid

### 4.3 Add to CI

- [x] Added step to `.github/workflows/ci.yml` in the validation job
- [x] Runs after `check:rule-structure`, before `check:schema-sync`

### 4.4 Test the Check Script

- [x] Verified script catches 6 `since: '0.3.0'` rules correctly when range was strict
- [x] After adjusting range to next-minor, all rules pass as expected
- [x] All 1630 tests still pass

**Phase 4 Completion Criteria:**

- [x] `scripts/check/rule-since.ts` exists and validates all built-in rules
- [x] Has its own CI step in `.github/workflows/ci.yml`
- [x] Catches: missing since, invalid semver, pre-release suffixes, out-of-range versions
- [x] All built-in rules pass the check

---

## Phase 5: Custom Rule Documentation Updates

**Status:** Complete
**Effort:** ~1 hour
**Dependencies:** Phase 1 complete

### 5.1 Update Custom Rule Examples

- [x] Update `tests/fixtures/custom-rules/valid-custom-rule.ts`: removed `since` field
- [x] Update `tests/fixtures/custom-rules/team-conventions.ts`: removed `since` field
- [x] Update `tests/fixtures/custom-rules/invalid-no-validate.ts`: removed `since` field
- [x] Update `.claudelint/rules/no-user-paths.ts`: removed `since` field
- [x] Update `.claudelint/rules/max-section-depth.ts`: removed `since` field
- [x] Update `.claudelint/rules/require-skill-see-also.ts`: removed `since` field
- [x] Update `.claudelint/rules/normalize-code-fences.ts`: removed `since` field

### 5.2 Update Rule Authoring Documentation

- [x] Update `src/CLAUDE.md` rule authoring template: added comment noting `since` is optional for custom rules
- [x] No `docs/custom-rules.md` exists (custom rule docs live in website)

### 5.3 Update Website Documentation

- [x] Updated `website/development/custom-rules.md`: replaced 4 occurrences of `since: '1.0.0'` with comment noting it's optional
- [x] Updated `website/development/helper-library.md`: replaced 1 occurrence
- [x] All 1630 tests pass after rebuild (snapshot updated for unrelated preset change)

**Phase 5 Completion Criteria:**

- [x] Custom rule examples no longer include `since`
- [x] Documentation clearly states `since` is optional for custom rules
- [x] Rule authoring template updated

---

## Phase 6: Final Verification

**Status:** Complete
**Effort:** ~30 minutes
**Dependencies:** All previous phases complete

### 6.1 Full Validation Run

- [x] Run `npm run check:self` -- 0 errors, 0 warnings on own project
- [x] Run `npm run check:rule-since` -- all 113 built-in rules valid
- [x] Run `npm run docs:generate` -- 113 docs generated, no "undefined" in output
- [x] Run `npm test` -- 1630 tests pass, 198 suites

### 6.2 Manual Spot Checks

- [x] No "vundefined" or "Available since: v$" in any generated rule docs
- [x] Docs generation skips version section when `since` is absent (verified via conditional)

### 6.3 Update Project Docs

- [x] Update this tracker: all phases marked complete
- [ ] Update `docs/projects/roadmap.md`: add milestone entry if appropriate
- [ ] Update `docs/projects/status.md` if this becomes a tracked project

**Phase 6 Completion Criteria:**

- [x] All validation passes
- [x] No regressions in existing functionality
- [x] Documentation is accurate and complete

---

## Progress Summary

```text
Phase 1: [██████████] 100%  Type system and validation
Phase 2: [██████████] 100%  Consumption point updates
Phase 3: [██████████] 100%  Fix schema-generated rules
Phase 4: [██████████] 100%  CI enforcement script
Phase 5: [██████████] 100%  Custom rule documentation updates
Phase 6: [██████████] 100%  Final verification

Overall: [██████████] 100%
```

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Making `since` optional breaks downstream consumers | Medium | Audit all consumption points in Phase 2; `JSON.stringify` already drops `undefined` |
| Existing custom rules fail to load after validation change | Low | Only validates `since` when present; absence is now allowed (less strict, not more) |
| CI check is too strict for development workflow | Low | Only enforce on `src/rules/` (built-in), not custom rules; allow pre-release in `package.json` |
| Schema-generated rules get wrong version on version bump | Low | Derive from `package.json` at generation time, not at commit time |

## References

- [README.md](./README.md) -- Project overview and scope
- [audit.md](./audit.md) -- Current state audit of all `since` values
- [design.md](./design.md) -- Design decisions and rationale
- ESLint `meta.deprecated` precedent: `{ deprecatedSince, availableUntil }` pattern
