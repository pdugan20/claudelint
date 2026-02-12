# Rule: skill-description

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill description must be at least 10 characters, written in third person, with no XML tags

## Rule Details

This rule validates that skill descriptions are meaningful, properly formatted, and written in third person. Descriptions help users understand what a skill does at a glance, appear in skill listings and search results, and should be clear and professional.

Descriptions must be at least 10 characters (avoiding vague text like "Deploy"), written in third person (e.g., "Deploys applications" not "Deploy your application"), and cannot contain XML tags or malicious content. First-person ("I deploy") and second-person ("You can deploy") are not allowed.

### Incorrect

Invalid descriptions in SKILL.md frontmatter:

```markdown
---
name: deploy
description: Deploy           # Too short (under 10 characters)
---
```

```markdown
---
name: deploy
description: Deploy your application to production    # Second person
---
```

```markdown
---
name: deploy
description: I deploy applications to the cloud       # First person
---
```

```markdown
---
name: deploy
description: Deploys <script>alert('xss')</script>    # Contains XML tags
---
```

### Correct

Valid third-person descriptions:

```markdown
---
name: deploy
description: Deploys applications to production servers
---
```

```markdown
---
name: health-check
description: Performs health checks on deployed services
---
```

```markdown
---
name: rollback
description: Rolls back deployments to the previous version
---
```

```markdown
---
name: api-client
description: Provides utilities for interacting with external APIs
---
```

## How To Fix

Rewrite descriptions to meet the requirements:

1. Make it at least 10 characters
2. Use third person (describes what the skill does)
3. Remove any XML tags
4. Be specific and clear

Examples:

- `Deploy` → `Deploys applications to production`
- `Deploy your app` → `Deploys applications to servers`
- `I deploy apps` → `Deploys applications automatically`
- `Checks health` → `Performs health checks on services`

Third person patterns:

- "Deploys..." (present tense, third person)
- "Performs..."
- "Validates..."
- "Generates..."
- "Provides..."

## Options

This rule does not have any configuration options.

## When Not To Use It

This is a critical validation rule that should never be disabled. Skill descriptions must follow this format for:

- Consistent skill documentation
- Proper display in skill listings
- Security (preventing XML injection)
- Professional presentation

If a description fails validation, fix it rather than disabling the rule.

## Related Rules

- [skill-name](./skill-name.md) - Skill name format validation
- [skill-tags](./skill-tags.md) - Skill tags validation

## Resources

- [Rule Implementation](../../src/rules/skills/skill-description.ts)
- [Rule Tests](../../tests/rules/skills/skill-description.test.ts)
- [Technical Writing Style Guide](https://developers.google.com/style/person)

## Version

Available since: v0.2.0
