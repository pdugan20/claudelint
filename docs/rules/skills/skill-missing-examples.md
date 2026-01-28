# Rule: skill-missing-examples

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Completeness

Enforces that Claude Code skills include usage examples in SKILL.md to demonstrate invocation patterns and expected behavior.

## Rule Details

This rule triggers when SKILL.md lacks both code blocks (fenced with backticks) and a section titled "Example", "Examples", or "Usage". Examples are critical because they teach by showing (clearer than prose), reduce support burden (users self-serve), prevent misuse (show correct patterns), and speed adoption (copy-paste and adapt).

Without examples, users don't know how to invoke the skill, what arguments are accepted, or what output to expect. This hurts usability and adoption. The rule checks for either dedicated example sections or inline code blocks demonstrating usage.

### Incorrect

SKILL.md without examples:

````markdown
---
name: deploy
description: Deploys the application to production
---

# Deploy Skill

This skill handles deployment to production servers.

## Features

- Automated deployment
- Rollback support
- Health checks

## Requirements

- Valid API credentials
- Network access to production
````

### Correct

SKILL.md with Examples section:

````markdown
---
name: deploy
description: Deploys the application to production
---

# Deploy Skill

This skill handles deployment to production servers.

## Examples

To deploy to production:

```bash
/deploy production
```

To deploy with a specific version:

```bash
/deploy production --version 1.2.3
```

To rollback to previous version:

```bash
/deploy rollback
```
````

SKILL.md with inline code examples:

````markdown
---
name: git-commit
description: Creates formatted git commits
---

# Git Commit Skill

Creates well-formatted git commits following conventional commits.

Basic usage: `/git-commit "Add user authentication"`

With type: `/git-commit "feat: Add user authentication"`

With scope: `/git-commit "feat(auth): Add user authentication"`
````

## How To Fix

1. **Add Examples section**: Create a section titled "Examples" with fenced code blocks showing common use cases (basic invocation, common arguments, advanced usage)
2. **Add Usage section**: Create a section titled "Usage" with command syntax and option descriptions
3. **Add inline examples**: Include code snippets inline within the description showing invocation patterns
4. **Show expected output**: Include what users should see after running commands (success messages, error cases)
5. **Document arguments**: Explain what each argument or flag does with examples

**Examples Section Template:**

````markdown
## Examples

Basic usage:

```bash
/your-skill argument
```

With options:

```bash
/your-skill --flag value
```
````

**Usage Section Template:**

````markdown
## Usage

```bash
/your-skill [options] <arguments>
```

Options:

- `--verbose`: Enable detailed output
- `--dry-run`: Preview without executing

Example:

```bash
/your-skill production --verbose
```
````

**Minimum Requirements:**
- Basic invocation (simplest way to use)
- Common arguments (most used options)
- Expected output (what users should see)

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if your skill is self-explanatory with no arguments, examples exist in separate README.md (though SKILL.md is preferred), or your skill is internal and well-understood by the team. However, examples benefit all skills, even simple ones.

## Related Rules

- [skill-missing-changelog](./skill-missing-changelog.md) - Skills should track changes
- [skill-missing-version](./skill-missing-version.md) - Skills should have version numbers
- [skill-missing-comments](./skill-missing-comments.md) - Scripts should have comments

## Resources

- [Implementation](../../../src/validators/skills.ts)
- [Tests](../../../tests/validators/skills.test.ts)

## Version

Available since: v1.0.0
