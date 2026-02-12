# Rule: skill-arguments-without-hint

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill body references arguments but frontmatter lacks an argument-hint field

## Rule Details

This rule warns when a skill body contains argument substitution variables (`$ARGUMENTS`, `$0`, `$1`, etc.) but the frontmatter does not include an `argument-hint` field. The argument-hint provides a short description shown to users so they know what arguments the skill expects. Without it, users have to read the skill source to understand what input is required.

The rule scans the skill body for references to `$ARGUMENTS`, `$0`, `$1`, `$2`, or similar numbered argument variables, and then checks that `argument-hint` is present and non-empty in the frontmatter.

### Incorrect

Body uses $ARGUMENTS without hint:

```markdown
---
name: deploy
description: Deploys to a target environment
---

Deploy the application to the `$ARGUMENTS` environment.
```

Body uses numbered arguments without hint:

```markdown
---
name: rename-file
description: Renames a file in the project
---

Rename the file at `$0` to `$1`.
```

### Correct

Argument-hint provided:

```markdown
---
name: deploy
description: Deploys to a target environment
argument-hint: "<environment> (e.g., staging, production)"
---

Deploy the application to the `$ARGUMENTS` environment.
```

Numbered arguments with hint:

```markdown
---
name: rename-file
description: Renames a file in the project
argument-hint: "<source-path> <destination-path>"
---

Rename the file at `$0` to `$1`.
```

No arguments used (rule does not apply):

```markdown
---
name: health-check
description: Checks service health across all endpoints
---

Run health checks on all configured endpoints.
```

## How To Fix

Add an `argument-hint` field to the skill frontmatter:

1. Identify which argument variables the body references
2. Write a short hint describing the expected input
3. Use angle brackets for placeholders: `<environment>`
4. Include examples in parentheses when helpful

Examples:

- `argument-hint: "<environment>"` for a single argument
- `argument-hint: "<file-path> [--verbose]"` for path with optional flag
- `argument-hint: "<source> <destination>"` for two arguments

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if your skill arguments are self-documenting through context or if the skill is only invoked programmatically by other skills where the argument format is already known.

## Related Rules

- [skill-allowed-tools](./skill-allowed-tools.md) - Tool access restrictions for skills

## Resources

- [Rule Implementation](../../src/rules/skills/skill-arguments-without-hint.ts)
- [Rule Tests](../../tests/rules/skills/skill-arguments-without-hint.test.ts)

## Version

Available since: v0.2.0
