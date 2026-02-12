# Rule: skill-name-directory-mismatch

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill name must match parent directory name

## Rule Details

This rule validates that the skill name in SKILL.md frontmatter matches its parent directory name. Consistency between directory names and skill names prevents confusion, ensures skills are easy to locate, enables predictable file organization, and supports tooling that relies on naming conventions.

When directory names don't match skill names, users have difficulty finding skills, scripts may fail to locate dependencies, and the codebase becomes harder to navigate and maintain.

### Incorrect

Mismatched skill name and directory:

```text
.claude/skills/deployment/        # Directory: deployment
├── SKILL.md
```

SKILL.md contents:

```markdown
---
name: deploy-app                   # Name: deploy-app (doesn't match)
description: Deploys applications
---
```

Another example:

```text
.claude/skills/api-client/        # Directory: api-client
├── SKILL.md
```

SKILL.md contents:

```markdown
---
name: api                          # Name: api (doesn't match)
description: API client utilities
---
```

### Correct

Matching skill name and directory:

```text
.claude/skills/deploy-app/        # Directory: deploy-app
├── SKILL.md
```

SKILL.md contents:

```markdown
---
name: deploy-app                   # Name: deploy-app (matches!)
description: Deploys applications
---
```

Another example:

```text
.claude/skills/health-check/      # Directory: health-check
├── SKILL.md
```

SKILL.md contents:

```markdown
---
name: health-check                 # Name: health-check (matches!)
description: Health check utilities
---
```

## How To Fix

Make the skill name match the directory name:

Option 1: Rename the directory to match the skill name

```bash
mv .claude/skills/deployment .claude/skills/deploy-app
```

Option 2: Update the skill name in SKILL.md to match the directory

```markdown
---
name: deployment                   # Changed to match directory
description: Deploys applications
---
```

Choose the option that best represents the skill's purpose.

## Options

This rule does not have any configuration options.

## When Not To Use It

This is a critical validation rule that should never be disabled. The directory name and skill name must match for Claude Code to function correctly. If you need to rename a skill:

1. Update both the directory name and SKILL.md frontmatter
2. Update any references to the skill in other files
3. Update documentation that mentions the old name

## Related Rules

- [skill-name](./skill-name.md) - Skill name format validation
- [skill-naming-inconsistent](./skill-naming-inconsistent.md) - Consistent file naming

## Resources

- [Rule Implementation](../../src/rules/skills/skill-name-directory-mismatch.ts)
- [Rule Tests](../../tests/rules/skills/skill-name-directory-mismatch.test.ts)

## Version

Available since: v0.2.0
