# skill-tags

<RuleHeader description="Skill tags must be an array of strings" severity="error" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

The `tags` frontmatter field helps categorize and discover skills. When present, it must be a YAML array of strings. This rule delegates to the skill frontmatter Zod schema for validation, reporting the first schema violation found. Invalid tag formats prevent proper skill indexing and search functionality.

### Incorrect

Tags as a single string instead of an array

```yaml
---
name: deploy-app
tags: deployment
---
```

Tags array containing non-string values

```yaml
---
name: deploy-app
tags:
  - deployment
  - 123
---
```

### Correct

Valid tags array

```yaml
---
name: deploy-app
tags:
  - deployment
  - ci-cd
  - production
---
```

No tags field (tags are optional)

```yaml
---
name: deploy-app
description: Deploys the application
---
```

## How To Fix

Ensure the `tags` field is a YAML array of strings. Each tag should be on its own line prefixed with `-`. Remove any non-string values from the array.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-name`](/rules/skills/skill-name)
- [`skill-description`](/rules/skills/skill-description)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-tags.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-tags.test.ts)

## Version

Available since: v0.2.0
