# Current State Audit

Snapshot of all `since` field usage across the codebase.

**Date:** 2026-02-17
**Package Version:** 0.2.0-beta.1
**Released Tags:** v0.2.0-beta.0, v0.2.0-beta.1

## Built-in Rules by `since` Value

| Version | Count | Status | Notes |
|---------|-------|--------|-------|
| `0.2.0` | 107 | Correct | Target stable release for initial rule set |
| `0.3.0` | 6 | Correct | Added after 0.2.0 feature freeze, targeting next minor |

### Rules with `since: '0.3.0'`

| Rule ID | File |
|---------|------|
| `skill-frontmatter-unknown-keys` | `src/rules/skills/skill-frontmatter-unknown-keys.ts` |
| `skill-xml-tags-anywhere` | `src/rules/skills/skill-xml-tags-anywhere.ts` |
| `skill-cross-reference-invalid` | `src/rules/skills/skill-cross-reference-invalid.ts` |
| `skill-readme-forbidden` | `src/rules/skills/skill-readme-forbidden.ts` |
| `skill-description-max-length` | `src/rules/skills/skill-description-max-length.ts` |
| `skill-body-word-count` | `src/rules/skills/skill-body-word-count.ts` |

## Schema-Generated Rules

- **Generator:** `scripts/generate/schema-rules.ts:270`
- **Hardcoded value:** `'1.0.0'`
- **Should be:** Derived from `package.json` version, stripped to stable
- **Current correct value:** `'0.2.0'`

## Custom Rules (Test Fixtures and Dogfood)

| File | Value | Notes |
|------|-------|-------|
| `tests/fixtures/custom-rules/valid-custom-rule.ts` | `'1.0.0'` | Placeholder |
| `tests/fixtures/custom-rules/team-conventions.ts` | `'1.0.0'` | Placeholder |
| `tests/fixtures/custom-rules/invalid-no-validate.ts` | `'1.0.0'` | Placeholder |
| `.claudelint/rules/no-user-paths.ts` | `'1.0.0'` | Dogfood rule |
| `.claudelint/rules/max-section-depth.ts` | `'1.0.0'` | Dogfood rule |
| `.claudelint/rules/require-skill-see-also.ts` | `'1.0.0'` | Dogfood rule |
| `.claudelint/rules/normalize-code-fences.ts` | `'1.0.0'` | Dogfood rule |

All custom rules use `'1.0.0'` as a meaningless placeholder. After this project, `since` will be optional for custom rules.

## Validation Gaps

### What is validated today

- `since` must be present (required field on `RuleMetadata`)
- `since` must be a string (checked by `isRule()` type guard)

### What is NOT validated today

- `since` is valid semver (no check)
- `since` corresponds to a real release (no check)
- `since` does not use pre-release suffix for built-in rules (no check)
- Schema-generated rules use current version (hardcoded instead)
- Built-in rules all have `since` (only enforced by TypeScript compiler, not CI)

## Consumption Points

| Location | Usage | Handles missing? |
|----------|-------|-----------------|
| `scripts/generators/rule-page.ts:188` | `Available since: v${meta.since}` | No -- would show "Available since: vundefined" |
| `src/cli/commands/explain.ts:141` | `Since: ${meta.since}` | No -- would show "Since: undefined" |
| `list-rules --format json` | Serializes full `RuleMetadata` | Would serialize `since: undefined` |

All consumption points need updates to handle optional `since` gracefully.
