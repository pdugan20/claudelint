# Design Decisions

## 1. Version Policy for `since` Values

### Decision

Use the **target stable release version**, not the exact pre-release tag.

### Rationale

- Rules in `0.2.0-beta.0` through `0.2.0-beta.x` all ship in `0.2.0` stable. Saying `since: '0.2.0-beta.0'` is noise to end users -- they care about the stable release.
- This matches ESLint's convention: rules show the minor version they debuted in (e.g., `"eslint:recommended" since 5.0.0`), not the exact RC or nightly.
- The `since` field is user-facing documentation (shown in `explain` and on the website). It should communicate "when can I use this?" not "what was the internal build."

### Implications

- The 107 rules currently marked `0.2.0` are **correct** -- they target the 0.2.0 stable release.
- The 6 rules marked `0.3.0` are **correct if** they were added after the 0.2.0 feature freeze and target the next minor release.
- Schema-generated rules should derive their version from `package.json` at generation time, stripped to the nearest stable version (e.g., `0.2.0-beta.1` becomes `0.2.0`).

### Enforcement

A CI check will verify:

1. All `since` values are valid semver (no pre-release suffixes like `-beta.1`)
2. All `since` values are `<=` the current package version's stable target
3. No rule claims a `since` version that hasn't been planned yet

## 2. Making `since` Optional for Custom Rules

### Decision

Change `since` from required to optional on `RuleMetadata`. Keep it required for built-in rules via the CI check (not the type system).

### Rationale

- Custom rules are authored by users for their own projects. They have no relationship to claude-lint's release cycle.
- Requiring `since` forces users to pick a meaningless value. Every custom rule example uses `'1.0.0'` as a placeholder, which is confusing.
- ESLint's custom rule API does not require `meta.version` or equivalent.

### Implications

- `RuleMetadata.since` becomes `since?: string`
- `isRule()` type guard removes the `since` check (it becomes optional)
- `validateRuleValues()` validates `since` **if present** (must be valid semver)
- CLI `explain` command omits the "Since:" line when `since` is absent
- Docs generator skips the "Available since:" section when `since` is absent
- Built-in rules still provide `since` -- enforced by a CI script that scans `src/rules/`
- Custom rule examples are updated to not include `since`

### Migration

- Existing custom rules with `since` continue to work (no breaking change)
- Custom rules without `since` now load successfully (was previously a hard error)

## 3. Semver Validation Approach

### Decision

Use the existing `validateSemver()` helper in `src/utils/rules/helpers.ts` to validate the `since` field during rule loading.

### Rationale

- The helper already exists and uses a comprehensive semver regex
- Reusing it avoids duplicating validation logic
- Validation at load time catches errors early (before rules execute)

### Implementation

Add a `since` check to `validateRuleValues()`:

```typescript
if (rule.meta.since !== undefined) {
  if (!validateSemver(rule.meta.since)) {
    errors.push(
      `Invalid 'since' value '${rule.meta.since}'. Must be a valid semver string`
    );
  }
}
```

### What This Catches

- Non-semver strings: `"banana"`, `"v0.2.0"` (the `v` prefix), `"latest"`
- Empty strings: `""`
- Malformed versions: `"0.2"`, `"1"`, `"0.2.0.1"`

### What This Does NOT Catch (handled by CI script instead)

- Versions that don't correspond to actual releases (e.g., `"9.9.9"`)
- Pre-release versions on built-in rules (e.g., `"0.2.0-beta.1"`)
- Built-in rules missing the field entirely (since it's now optional on the type)

## 4. CI Enforcement Strategy

### Decision

Create `scripts/check/rule-since.ts` that enforces stricter requirements for built-in rules than the runtime validation does.

### Rationale

The type system and runtime validation handle the basics (valid semver, optional for custom). But built-in rules need stricter governance:

- Every built-in rule MUST have `since`
- Values must be stable versions (no pre-release suffixes)
- Values must not reference versions beyond the current development target

### Checks

1. **Presence**: Every file in `src/rules/` must define `since`
2. **Format**: Must be valid semver without pre-release suffix
3. **Range**: Must be `<=` the current stable target version
4. **Consistency**: Rules in the same PR should use the same `since` value (advisory, not blocking)

### Integration

- Added to `npm run lint` (runs with other checks)
- Added to CI pipeline
- Fails on violations

## 5. Schema-Generated Rules

### Decision

Read `package.json` version at generation time and strip to stable (e.g., `0.2.0-beta.1` -> `0.2.0`).

### Rationale

- Hardcoding `1.0.0` is incorrect for rules generated now
- Reading from `package.json` keeps the value aligned with the release the rules will ship in
- Stripping the pre-release suffix follows the version policy (Decision 1)

### Implementation

```typescript
import { readFileSync } from 'fs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const stableVersion = pkg.version.replace(/-.*$/, '');
// Use stableVersion in template instead of '1.0.0'
```
