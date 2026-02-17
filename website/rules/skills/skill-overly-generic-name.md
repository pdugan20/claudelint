---
description: "Skill name should be specific and descriptive, not just generic keywords or single-word verbs"
---

# skill-overly-generic-name

<RuleHeader description="Skill name should be specific and descriptive, not just generic keywords or single-word verbs" severity="warn" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

Skill names should clearly describe their functionality. Names that consist entirely of generic keywords (e.g., "utils", "helper", "manager") or are single-word verbs (e.g., "build", "deploy", "test") do not communicate the skill's purpose. This rule checks for names composed solely of generic keywords like "helper", "util", "tool", "service", "core", or single-word action verbs like "format", "validate", "deploy". Based on the Anthropic Skills Guide recommendation to avoid generic names.

### Incorrect

Single-word generic verb

```yaml
---
name: deploy
description: Deploys the application
---
```

Name composed only of generic keywords

```yaml
---
name: helper-utils
description: Helper utilities
---
```

Another generic-only name

```yaml
---
name: tool
description: A useful tool
---
```

### Correct

Descriptive name indicating what is deployed

```yaml
---
name: deploy-staging
description: Deploys the application to staging
---
```

Specific name with context

```yaml
---
name: format-sql
description: Formats SQL query files
---
```

## How To Fix

Add descriptive words to the skill name that indicate its specific functionality. For example, change "deploy" to "deploy-staging" or "utils" to "string-utils".

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-name`](/rules/skills/skill-name)
- [`skill-name-directory-mismatch`](/rules/skills/skill-name-directory-mismatch)
- [`skill-description-quality`](/rules/skills/skill-description-quality)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-overly-generic-name.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-overly-generic-name.test.ts)

## Version

Available since: v0.2.0
