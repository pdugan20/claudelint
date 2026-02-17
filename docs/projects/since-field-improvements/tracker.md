# Since Field Improvements -- Progress Tracker

Harden the `since` metadata field: validation, optional for custom rules, fix incorrect values, CI enforcement.

**Status:** Not Started
**Start Date:** 2026-02-17
**Last Updated:** 2026-02-17

## Phase 1: Type System and Validation

**Status:** Not Started
**Effort:** ~2 hours
**Dependencies:** None

Make `since` optional on the type and validate it as semver when present.

### 1.1 Make `since` Optional on `RuleMetadata`

- [ ] Update `src/types/rule.ts:114`: change `since: string` to `since?: string`
- [ ] Update `isRule()` type guard at `src/types/rule.ts:326-327`: remove the `since` presence check (allow rules without it)
- [ ] Update loader error message at `src/utils/rules/loader.ts:161-168`: remove `since` from the required fields list
- [ ] Verify TypeScript compilation passes (built-in rules still provide `since` so no type errors expected)

### 1.2 Add Semver Validation to `validateRuleValues()`

- [ ] Update `src/utils/rules/loader.ts:36-56`: add `since` validation block
- [ ] Import `validateSemver` from `../rules/helpers` (or adjust import path)
- [ ] When `since` is present and non-empty, validate it with `validateSemver()`
- [ ] Push error: `Invalid 'since' value '${rule.meta.since}'. Must be a valid semver string`
- [ ] When `since` is absent or undefined, skip validation (valid for custom rules)

### 1.3 Update Tests

- [ ] Update `tests/utils/custom-rule-loader.test.ts`: test at line 572-598 ("should reject missing since field") now expects the rule to LOAD successfully (since is optional)
- [ ] Add new test: rule with `since: 'banana'` should fail with semver validation error
- [ ] Add new test: rule with `since: 'v0.2.0'` should fail (v-prefix is not valid semver)
- [ ] Add new test: rule with `since: ''` should fail (empty string)
- [ ] Add new test: rule with `since: '0.2.0'` should pass
- [ ] Add new test: rule with `since: '1.0.0-beta.1'` should pass (pre-release is valid semver)
- [ ] Add new test: rule without `since` should load successfully
- [ ] Run full test suite: `npm test`

**Phase 1 Completion Criteria:**

- [ ] `RuleMetadata.since` is optional (`since?: string`)
- [ ] `isRule()` accepts rules without `since`
- [ ] `validateRuleValues()` rejects invalid semver when `since` is present
- [ ] Custom rules without `since` load successfully
- [ ] All existing tests pass
- [ ] New validation tests pass

---

## Phase 2: Consumption Point Updates

**Status:** Not Started
**Effort:** ~1 hour
**Dependencies:** Phase 1 complete

Update all places that read `since` to handle the field being absent.

### 2.1 Update Docs Generator

- [ ] Update `scripts/generators/rule-page.ts:188`: wrap in conditional
- [ ] When `meta.since` is defined: output `Available since: v${meta.since}` (current behavior)
- [ ] When `meta.since` is undefined: skip the "Version" section entirely
- [ ] Verify with `npm run docs:generate` -- existing docs unchanged, no "vundefined" output

### 2.2 Update CLI `explain` Command

- [ ] Update `src/cli/commands/explain.ts:141`: wrap in conditional
- [ ] When `meta.since` is defined: output `Since: ${meta.since}` (current behavior)
- [ ] When `meta.since` is undefined: omit the "Since:" line
- [ ] Test manually: `npx claudelint explain skill-body-too-long` (should still show Since)

### 2.3 Update CLI `list-rules` JSON Output

- [ ] Check `src/cli/commands/list-rules.ts` for JSON serialization
- [ ] Ensure `since: undefined` does not appear in JSON output (omit the key)
- [ ] If already handled by `JSON.stringify` (which drops undefined), verify with test

### 2.4 Update `check-deprecated` Command

- [ ] Review `src/cli/commands/check-deprecated.ts:122` for `deprecatedSince` usage
- [ ] This is a different field (`DeprecationInfo.deprecatedSince`), but confirm no cross-dependency on `meta.since`

**Phase 2 Completion Criteria:**

- [ ] No "undefined" appears in any output when `since` is absent
- [ ] Docs generator skips version section for rules without `since`
- [ ] CLI explain omits "Since:" line for rules without `since`
- [ ] JSON output omits `since` key when not present

---

## Phase 3: Fix Schema-Generated Rules

**Status:** Not Started
**Effort:** ~30 minutes
**Dependencies:** None (can run in parallel with Phase 1-2)

### 3.1 Read Version from `package.json`

- [ ] Update `scripts/generate/schema-rules.ts`: read `package.json` version at top of script
- [ ] Strip pre-release suffix: `version.replace(/-.*$/, '')` to get stable target
- [ ] Replace hardcoded `'1.0.0'` at line 270 with the derived stable version

### 3.2 Verify

- [ ] Run `npm run generate:types` to regenerate schema rules
- [ ] Verify generated rule files in `src/rules/` have `since: '0.2.0'` (not `'1.0.0'`)
- [ ] Run `npm test` to confirm nothing breaks

**Phase 3 Completion Criteria:**

- [ ] Schema-generated rules derive `since` from `package.json`
- [ ] Pre-release suffixes are stripped (e.g., `0.2.0-beta.1` -> `0.2.0`)
- [ ] Generated rules show correct version

---

## Phase 4: CI Enforcement Script

**Status:** Not Started
**Effort:** ~2 hours
**Dependencies:** Phase 1 complete (uses optional `since` type)

### 4.1 Create Check Script

- [ ] Create `scripts/check/rule-since.ts`
- [ ] Scan all files in `src/rules/` (excluding `index.ts`, `rule-ids.ts`)
- [ ] For each rule file, extract `since` value from the `meta` object
- [ ] Validate:
  - [ ] **Presence**: Every built-in rule must have `since` defined
  - [ ] **Format**: Must be valid semver (use `validateSemver()`)
  - [ ] **No pre-release**: Must not contain `-` suffix (stable versions only for built-in rules)
  - [ ] **Range**: Must be `<=` the stable target derived from `package.json`
- [ ] Report violations with file path and current value
- [ ] Exit 0 on success, 1 on any violation

### 4.2 Add NPM Script

- [ ] Add to `package.json` scripts: `"check:rule-since": "tsx scripts/check/rule-since.ts"`
- [ ] Add to the `lint` script (runs with other checks in parallel)
- [ ] Verify: `npm run check:rule-since` passes with current correct values

### 4.3 Add to CI

- [ ] Verify the script runs as part of `npm run lint` in the CI workflow
- [ ] If `lint` doesn't cover it, add explicit step to `.github/workflows/ci.yml`
- [ ] Confirm CI passes

### 4.4 Test the Check Script

- [ ] Temporarily set one rule's `since` to `'banana'` -- verify script catches it
- [ ] Temporarily set one rule's `since` to `'0.2.0-beta.1'` -- verify script catches pre-release
- [ ] Temporarily remove `since` from one rule -- verify script catches missing field
- [ ] Revert all temporary changes

**Phase 4 Completion Criteria:**

- [ ] `scripts/check/rule-since.ts` exists and validates all built-in rules
- [ ] Runs as part of `npm run lint` or has its own CI step
- [ ] Catches: missing since, invalid semver, pre-release suffixes, out-of-range versions
- [ ] All built-in rules pass the check

---

## Phase 5: Custom Rule Documentation Updates

**Status:** Not Started
**Effort:** ~1 hour
**Dependencies:** Phase 1 complete

### 5.1 Update Custom Rule Examples

- [ ] Update `tests/fixtures/custom-rules/valid-custom-rule.ts`: remove `since` field
- [ ] Update `tests/fixtures/custom-rules/team-conventions.ts`: remove `since` field
- [ ] Update `.claudelint/rules/no-user-paths.ts`: remove `since` field
- [ ] Update `.claudelint/rules/max-section-depth.ts`: remove `since` field
- [ ] Update `.claudelint/rules/require-skill-see-also.ts`: remove `since` field
- [ ] Update `.claudelint/rules/normalize-code-fences.ts`: remove `since` field
- [ ] Keep `since` in `tests/fixtures/custom-rules/invalid-no-validate.ts` (this tests other failures)

### 5.2 Update Rule Authoring Documentation

- [ ] Update `src/CLAUDE.md` rule authoring template: mark `since` as optional with comment
- [ ] Update any custom rule documentation (check `docs/custom-rules.md` if it exists)
- [ ] Note: "The `since` field is optional for custom rules. If provided, it must be a valid semver string. Built-in rules must always include `since`."

### 5.3 Update Website Documentation

- [ ] Check `website/guide/` for custom rule docs that mention `since`
- [ ] Update any examples that show `since` as required for custom rules
- [ ] Regenerate rule docs: `npm run docs:generate`

**Phase 5 Completion Criteria:**

- [ ] Custom rule examples no longer include `since`
- [ ] Documentation clearly states `since` is optional for custom rules
- [ ] Rule authoring template updated

---

## Phase 6: Final Verification

**Status:** Not Started
**Effort:** ~30 minutes
**Dependencies:** All previous phases complete

### 6.1 Full Validation Run

- [ ] Run `npm run validate` (lint + format + build + test)
- [ ] Run `npm run check:self` (dogfood: build then run claudelint on itself)
- [ ] Run `npm run check:rule-since` (new CI check)
- [ ] Run `npm run docs:generate` (verify no "undefined" in generated docs)

### 6.2 Manual Spot Checks

- [ ] `npx claudelint explain skill-body-too-long` -- shows "Since: 0.2.0"
- [ ] `npx claudelint explain` on a custom rule (if possible) -- omits "Since:" line
- [ ] Check one generated rule doc page for correct "Available since: v0.2.0"

### 6.3 Update Project Docs

- [ ] Update this tracker: mark all phases complete
- [ ] Update `docs/projects/roadmap.md`: add milestone entry if appropriate
- [ ] Update `docs/projects/status.md` if this becomes a tracked project

**Phase 6 Completion Criteria:**

- [ ] All validation passes
- [ ] No regressions in existing functionality
- [ ] Documentation is accurate and complete

---

## Progress Summary

```text
Phase 1: [░░░░░░░░░░]   0%  Type system and validation
Phase 2: [░░░░░░░░░░]   0%  Consumption point updates
Phase 3: [░░░░░░░░░░]   0%  Fix schema-generated rules
Phase 4: [░░░░░░░░░░]   0%  CI enforcement script
Phase 5: [░░░░░░░░░░]   0%  Custom rule documentation updates
Phase 6: [░░░░░░░░░░]   0%  Final verification

Overall: [░░░░░░░░░░]   0%
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
