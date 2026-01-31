---
name: validate-skills
description: Validate Claude Code skills for schema, naming, documentation, and security
version: 1.0.0
allowed-tools:
  - Bash
  - Read
---

# Validate Claude Code Skills

Runs `claude-code-lint validate-skills` to validate Claude Code skill directories.

## Usage

```bash
claude-code-lint validate-skills
```

## Options

- `--path <path>` - Custom path to skills directory
- `--skill <name>` - Validate specific skill
- `--verbose` - Show detailed output
- `--warnings-as-errors` - Treat warnings as errors

## Examples

Validate all skills:

```bash
claude-code-lint validate-skills
```

Validate specific skill:

```bash
claude-code-lint validate-skills --skill my-skill
```

## What Gets Validated

### Required Fields

- `name` field must match directory name
- `description` must be present
- Name must be kebab-case (lowercase with hyphens)
- Name must not exceed 64 characters

### allowed-tools Validation

- Must be an array
- Warns for unknown tools
- Accepts: Bash, Read, Write, Edit, Grep, Glob, LSP, WebFetch, WebSearch, etc.

### Model Validation

- Validates model field if present
- Accepted values: sonnet, opus, haiku

### File References

- Checks that referenced files in SKILL.md exist
- Validates relative paths

### Directory Organization

- Warns if skill has >10 loose files (suggest subdirectories)
- Warns if directory nesting >3 levels deep

### Documentation

- Warns if CHANGELOG.md is missing
- Warns if SKILL.md lacks usage examples (no code blocks)
- Warns if multi-file skill (>3 scripts) lacks README.md
- Warns if skill lacks version field

### Best Practices

- Warns if shell scripts lack shebang (#!/bin/bash)
- Warns if scripts have no explanatory comments
- Detects inconsistent naming conventions

### Security

- Errors for dangerous commands (rm -rf /, dd, mkfs)
- Warns for eval/exec usage
- Warns for path traversal patterns

## Configuration

Configure rules in `.claudelintrc.json`:

```json
{
  "rules": {
    "skill-missing-shebang": "warn",
    "skill-dangerous-command": "error",
    "skill-eval-usage": "error"
  }
}
```

## Exit Codes

- `0` - No errors or warnings
- `1` - Warnings found
- `2` - Errors found

## See Also

- [validate](../validate/SKILL.md) - Run all validators
- [validators documentation](../../docs/validators.md) - Complete validation rules
