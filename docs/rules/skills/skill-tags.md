# Rule: skill-tags

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill tags must be an array of strings

## Rule Details

This rule validates that when a skill includes a `tags` field in its frontmatter, it must be an array of strings. Tags help categorize skills, enable searching and filtering, group related functionality, and improve discoverability.

The tags field is optional, but when present it must be properly formatted as a YAML array with string values. Invalid formats like comma-separated strings, numbers, or objects will trigger this rule.

### Incorrect

Invalid tag formats in SKILL.md frontmatter:

```markdown
---
name: deploy
description: Deploys applications
tags: deployment, production, ci-cd    # Comma-separated string, not array
---
```

```markdown
---
name: deploy
description: Deploys applications
tags:
  - deployment
  - 123                 # Number instead of string
  - production
---
```

```markdown
---
name: deploy
description: Deploys applications
tags: "deployment"      # Single string, not array
---
```

### Correct

Valid tags array:

```markdown
---
name: deploy
description: Deploys applications
tags:
  - deployment
  - production
  - ci-cd
---
```

Alternative YAML array syntax:

```markdown
---
name: deploy
description: Deploys applications
tags: ["deployment", "production", "ci-cd"]
---
```

Empty array (valid but not recommended):

```markdown
---
name: deploy
description: Deploys applications
tags: []
---
```

## How To Fix

Convert the tags field to a properly formatted array:

1. Use YAML array syntax with dashes
2. Ensure each tag is a string
3. Use kebab-case for multi-word tags
4. Keep tags concise and relevant

Examples:

- `tags: "deployment"` → `tags: ["deployment"]`
- `tags: deployment, ci` → `tags: ["deployment", "ci"]`
- `tags: [123, 456]` → `tags: ["build", "deploy"]`

## Options

This rule does not have any configuration options.

## When Not To Use It

This is a critical validation rule that should rarely be disabled. Only consider disabling if:

- You're migrating from a system with a different tag format
- Your organization uses a non-standard frontmatter structure
- Tags are managed by an external system

Fix the tag format rather than disabling the rule.

## Related Rules

- [skill-name](./skill-name.md) - Skill name format validation
- [skill-description](./skill-description.md) - Skill description validation

## Resources

- [Rule Implementation](../../src/rules/skills/skill-tags.ts)
- [Rule Tests](../../tests/rules/skills/skill-tags.test.ts)
- [YAML Array Syntax](https://yaml.org/spec/1.2.2/#23-collections)

## Version

Available since: v0.2.0
