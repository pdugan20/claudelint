# Rule: skill-dependencies

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill dependencies must be an array of strings

## Rule Details

This rule validates that when a skill includes a `dependencies` field in its frontmatter, it must be an array of strings. Dependencies specify required system tools, libraries, or other skills that must be present for the skill to function correctly.

The dependencies field is optional, but when present it must be properly formatted as a YAML array with string values representing tool names, package names, or skill names. Invalid formats like comma-separated strings or non-string values will trigger this rule.

### Incorrect

Invalid dependency formats in SKILL.md frontmatter:

```markdown
---
name: deploy
description: Deploys applications
dependencies: docker, kubectl, aws-cli    # Comma-separated, not array
---
```

```markdown
---
name: deploy
description: Deploys applications
dependencies: "docker"                    # Single string, not array
---
```

```markdown
---
name: deploy
description: Deploys applications
dependencies:
  - docker
  - kubectl
  - 123                                   # Number instead of string
---
```

### Correct

Valid dependencies array:

```markdown
---
name: deploy
description: Deploys applications
dependencies:
  - docker
  - kubectl
  - aws-cli
---
```

Alternative YAML syntax:

```markdown
---
name: deploy
description: Deploys applications
dependencies: ["docker", "kubectl", "aws-cli"]
---
```

Empty array (valid but unusual):

```markdown
---
name: simple-skill
description: Simple skill with no dependencies
dependencies: []
---
```

Common dependency examples:

```markdown
---
name: database-backup
description: Backs up database to S3
dependencies:
  - postgresql-client
  - aws-cli
  - gzip
---
```

Skill dependencies:

```markdown
---
name: full-deployment
description: Complete deployment pipeline
dependencies:
  - build-skill
  - test-skill
  - deploy-skill
---
```

## How To Fix

Convert the dependencies field to a properly formatted array:

1. Use YAML array syntax with dashes or brackets
2. Ensure each dependency is a string
3. Use exact names for system tools
4. Reference skill names for skill dependencies

Examples:

- `dependencies: docker` → `dependencies: ["docker"]`
- `dependencies: docker, kubectl` → `dependencies: ["docker", "kubectl"]`
- `dependencies: [1, 2, 3]` → `dependencies: ["tool1", "tool2", "tool3"]`

## Options

This rule does not have any configuration options.

## When Not To Use It

This is a critical validation rule that should rarely be disabled. Only consider disabling if:

- You're migrating from a system with different dependency syntax
- Dependencies are managed by an external configuration
- You're using a custom dependency resolution system

Fix the dependency format rather than disabling the rule.

## Related Rules

- [skill-tags](./skill-tags.md) - Tag format validation
- [skill-allowed-tools](./skill-allowed-tools.md) - Tool restrictions
- [skill-disallowed-tools](./skill-disallowed-tools.md) - Tool restrictions

## Resources

- [Rule Implementation](../../src/rules/skills/skill-dependencies.ts)
- [Rule Tests](../../tests/rules/skills/skill-dependencies.test.ts)

## Version

Available since: v1.0.0
