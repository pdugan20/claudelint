# Rule: skill-name

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill name must be lowercase-with-hyphens, under 64 characters, with no XML tags or reserved words

## Rule Details

This rule validates that skill names follow kebab-case naming convention, stay under 64 characters, avoid XML tags, and don't use reserved words. Consistent naming ensures compatibility with file systems, URLs, command-line interfaces, and prevents conflicts with system keywords.

Skill names must use only lowercase letters, numbers, and hyphens. They cannot start or end with a hyphen, contain consecutive hyphens, include underscores or spaces, or exceed 64 characters. Names must also avoid XML tags (like `<script>`) and reserved words (like `null`, `undefined`).

### Incorrect

Invalid skill names in frontmatter:

```markdown
---
name: Deploy_App           # Underscores not allowed
description: Deploys applications
---
```

```markdown
---
name: deployApp            # camelCase not allowed
description: Deploys applications
---
```

```markdown
---
name: DEPLOY               # Uppercase not allowed
description: Deploys applications
---
```

```markdown
---
name: deploy-app-to-production-with-health-checks-and-rollback-capability-v2
# Over 64 characters
description: Deploys applications
---
```

```markdown
---
name: null                 # Reserved word
description: Deploys applications
---
```

### Correct

Valid skill names:

```markdown
---
name: deploy-app
description: Deploys applications
---
```

```markdown
---
name: health-check
description: Performs health checks
---
```

```markdown
---
name: api-v2
description: API version 2 client
---
```

```markdown
---
name: rollback
description: Rollback deployment
---
```

## How To Fix

Convert skill names to kebab-case:

1. Convert to lowercase
2. Replace spaces and underscores with hyphens
3. Remove special characters
4. Ensure length is under 64 characters
5. Avoid reserved words

Examples:

- `Deploy_App` → `deploy-app`
- `deployApp` → `deploy-app`
- `DEPLOY` → `deploy`
- `API Client v2` → `api-client-v2`
- `null` → `deploy-null-values` (avoid reserved word)

## Options

This rule does not have any configuration options.

## When Not To Use It

This is a critical validation rule that should never be disabled. Skill names must follow this format for Claude Code to function correctly. If you have naming conflicts:

- Rename the skill to follow conventions
- Use the description field for detailed naming
- Add tags for categorization

## Related Rules

- [skill-name-directory-mismatch](./skill-name-directory-mismatch.md) - Name must match directory
- [skill-description](./skill-description.md) - Description format validation

## Resources

- [Rule Implementation](../../src/rules/skills/skill-name.ts)
- [Rule Tests](../../tests/rules/skills/skill-name.test.ts)
- [Kebab Case Naming Convention](https://en.wikipedia.org/wiki/Letter_case#Kebab_case)

## Version

Available since: v0.2.0
