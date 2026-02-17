# Since Field Improvements

Harden the `since` metadata field on rules: add validation, fix incorrect values, make the field optional for custom rules, and enforce correctness in CI.

## Problem Statement

The `since` field on `RuleMetadata` tracks when a rule was introduced. Currently:

1. **No validation** -- Any string is accepted (`"banana"` passes). A `validateSemver()` helper exists but is never applied to `since`.
2. **Built-in rules reference unreleased versions** -- 107 rules say `0.2.0`, 6 say `0.3.0`, but only `0.2.0-beta.0` and `0.2.0-beta.1` have been released.
3. **Schema-generated rules hardcode `1.0.0`** -- The generator template uses a static string instead of the current package version.
4. **Custom rules must provide `since` but it's meaningless** -- Custom rules aren't part of the claude-lint release cycle. Users set arbitrary values like `1.0.0`.
5. **No CI enforcement** -- Nothing verifies `since` values are valid semver or correspond to real releases.

## Goals

- Validate `since` is valid semver at rule load time (built-in and custom)
- Make `since` optional for custom rules (not semantically meaningful for them)
- Fix all built-in rules to use correct, consistent version values
- Auto-derive `since` for schema-generated rules from package.json
- Add CI check to prevent regressions

## Scope

### In Scope

- Type system changes (`RuleMetadata.since` becomes optional)
- Validation logic (`validateRuleValues()`, `isRule()`)
- Built-in rule metadata corrections
- Schema-rules generator fix
- CI enforcement script
- CLI and docs display updates for optional `since`
- Custom rule loader and documentation updates

### Out of Scope

- Changing the field name (keeping `since` for consistency with ESLint precedent)
- Adding `since` to the public API types (intentionally excluded)
- Versioning policy changes (covered by npm-release-setup project)

## Documentation

- **[tracker.md](./tracker.md)** -- Central progress tracker with phased tasks
- **[audit.md](./audit.md)** -- Current state audit of all `since` values
- **[design.md](./design.md)** -- Design decisions and rationale

## Key Files

| File | Role |
|------|------|
| `src/types/rule.ts:114` | `RuleMetadata.since` type definition |
| `src/types/rule.ts:303-330` | `isRule()` type guard |
| `src/utils/rules/loader.ts:36-56` | `validateRuleValues()` |
| `src/utils/rules/helpers.ts:149-153` | `validateSemver()` helper |
| `scripts/generators/rule-page.ts:188` | Docs generation consumption |
| `src/cli/commands/explain.ts:141` | CLI explain consumption |
| `scripts/generate/schema-rules.ts:270` | Schema-rules generator (hardcodes `1.0.0`) |

## Version Policy Decision

Built-in rules should use the **target stable release version** where the rule will first be available to non-beta users. Rules shipping in the `0.2.0-beta.x` series use `since: '0.2.0'`. Rules added after stable 0.2.0 ships use the next planned version (e.g., `0.3.0`).

See [design.md](./design.md) for full rationale.
