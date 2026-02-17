---
description: "Skill version must follow semantic versioning format (e.g., 1.0.0)"
---

# skill-version

<RuleHeader description="Skill version must follow semantic versioning format (e.g., 1.0.0)" severity="error" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

The `version` frontmatter field communicates the skill's release state to users. When present, it must follow semantic versioning format (e.g., `1.0.0`, `0.3.1`). This rule delegates to the skill frontmatter Zod schema for validation. Invalid version strings prevent proper version tracking and dependency resolution. The field is optional; this rule only fires when it is present but malformed.

### Incorrect

Version missing patch number

```yaml
---
name: deploy-app
version: 1.0
---
```

Version with non-numeric components

```yaml
---
name: deploy-app
version: v1.0.0
---
```

Arbitrary string as version

```yaml
---
name: deploy-app
version: latest
---
```

### Correct

Standard semantic version

```yaml
---
name: deploy-app
version: 1.0.0
---
```

Pre-release semantic version

```yaml
---
name: deploy-app
version: 0.3.1
---
```

No version field (version is optional)

```yaml
---
name: deploy-app
description: Deploys the application
---
```

## How To Fix

Set the `version` field to a valid semantic version string in `MAJOR.MINOR.PATCH` format (e.g., `1.0.0`). Do not include a "v" prefix or use partial version numbers.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-name`](/rules/skills/skill-name)
- [`skill-model`](/rules/skills/skill-model)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-version.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-version.test.ts)

## Version

Available since: v0.2.0
