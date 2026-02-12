# Rule: skill-overly-generic-name

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill name should be specific and descriptive, not just generic keywords or single-word verbs

## Rule Details

This rule validates that skill names are specific enough to describe what the skill does. Generic names like single-word verbs or common keywords can be confusing and don't help users understand the skill's purpose.

Based on Anthropic Skills Guide p11: "Avoid generic names that don't describe what the skill does."

This rule flags:

1. **Single-word verbs without context**: Names like `format`, `validate`, `test`, `build`, `deploy` don't indicate what is being formatted, validated, tested, built, or deployed.

2. **Generic keywords only**: Names composed only of generic terms like `helper`, `utils`, `tool`, `manager` that don't specify what they help with, what utilities they provide, or what they manage.

### Incorrect

Generic skill names that should be more specific:

```markdown
---
name: format
description: Formats files
---
```

```markdown
---
name: validate
description: Validates something
---
```

```markdown
---
name: test
description: Tests code
---
```

```markdown
---
name: utils
description: Utility functions
---
```

```markdown
---
name: helper
description: Helper functions
---
```

```markdown
---
name: tool-manager
description: Manages tools
---
```

### Correct

Specific skill names that clearly indicate functionality:

```markdown
---
name: format-code
description: Formats source code files using project standards
---
```

```markdown
---
name: validate-config
description: Validates configuration files against schemas
---
```

```markdown
---
name: test-api
description: Tests API endpoints for correctness
---
```

```markdown
---
name: project-utils
description: Utility functions for project management
---
```

```markdown
---
name: docker-helper
description: Helper functions for Docker operations
---
```

```markdown
---
name: build-docker
description: Builds Docker containers for deployment
---
```

## How To Fix

Add specificity to generic names by indicating what they operate on:

1. **For single-word verbs**, add what is being acted upon:
   - `format` → `format-code`, `format-json`, `format-config`
   - `validate` → `validate-schema`, `validate-env`, `validate-config`
   - `test` → `test-api`, `test-e2e`, `test-integration`
   - `build` → `build-docker`, `build-assets`, `build-docs`
   - `deploy` → `deploy-production`, `deploy-staging`, `deploy-lambda`

2. **For generic keywords**, add the specific domain:
   - `utils` → `project-utils`, `api-utils`, `string-utils`
   - `helper` → `docker-helper`, `git-helper`, `api-helper`
   - `tools` → `dev-tools`, `testing-tools`, `build-tools`
   - `manager` → `cache-manager`, `session-manager`, `state-manager`

## Why This Matters

Generic names cause problems:

- **Triggering confusion**: Claude may invoke the wrong skill when names are too generic
- **User confusion**: Users can't tell what the skill does from the name alone
- **Namespace pollution**: Generic names conflict with other skills or future additions
- **Discoverability**: Specific names make skills easier to find and understand

## Options

This rule does not have any configuration options.

## When Not To Use It

This is a warning-level rule, not an error, to allow some flexibility. However, you should only ignore it if:

- The skill name is a proper noun or product name (e.g., `docker`, `kubernetes`)
- The skill truly has a single, universally understood purpose in your domain
- The description field provides sufficient context

If you find yourself wanting to disable this rule frequently, your skill names may need to be more descriptive.

## Related Rules

- [skill-name](./skill-name.md) - Name format validation (kebab-case, length, reserved words)
- [skill-name-directory-mismatch](./skill-name-directory-mismatch.md) - Name must match directory
- [skill-description](./skill-description.md) - Description format validation

## Resources

- [Rule Implementation](../../src/rules/skills/skill-overly-generic-name.ts)
- [Rule Tests](../../tests/rules/skills/skill-overly-generic-name.test.ts)
- [Anthropic Skills Guide p11](https://anthropic.com) - Naming best practices

## Version

Available since: v0.2.0
