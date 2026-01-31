---
name: validate-settings
description: Validate Claude Code settings.json files for schema, permissions, and security
version: 1.0.0
allowed-tools:
  - Bash
  - Read
---

# Validate Settings

Runs `claude-code-lint validate-settings` to validate `.claude/settings.json` and `.claude/settings.local.json` files.

## Usage

```bash
claude-code-lint validate-settings
```

## Options

- `--path <path>` - Custom path to settings.json
- `--verbose` - Show detailed output
- `--warnings-as-errors` - Treat warnings as errors

## What Gets Validated

- JSON syntax
- Model validation (sonnet, opus, haiku)
- Permission rules (tool names, actions: allow/block)
- Hooks configuration
- Environment variables (naming, empty values, secrets detection)

## Examples

```bash
claude-code-lint validate-settings
claude-code-lint validate-settings --path /path/to/settings.json
```

## See Also

- [validate](../validate/SKILL.md) - Run all validators
