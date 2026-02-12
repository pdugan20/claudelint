# skill-dependencies

<RuleHeader description="Skill dependencies must be an array of strings" severity="error" :fixable="false" category="Skills" />

## Rule Details

The `dependencies` field declares other skills or packages that this skill depends on. It must be a YAML array of strings. Malformed values (e.g., a single string, a number, or nested objects) will cause runtime errors when the system tries to resolve dependencies. This rule delegates to the Zod schema for validation.

### Incorrect

Dependencies as a single string instead of an array

```yaml
---
name: deploy
description: Deploys the application
dependencies: build
---
```

Dependencies with non-string entries

```yaml
---
name: deploy
description: Deploys the application
dependencies:
  - 123
  - true
---
```

### Correct

Valid dependencies array

```yaml
---
name: deploy
description: Deploys the application
dependencies:
  - build
  - test
---
```

No dependencies field (optional)

```yaml
---
name: lint
description: Runs linting checks
---
```

## How To Fix

Ensure the `dependencies` field is a YAML array where each entry is a string representing a skill name or package identifier.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-cross-reference-invalid`](/rules/skills/skill-cross-reference-invalid)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-dependencies.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-dependencies.test.ts)

## Version

Available since: v0.2.0
