---
name: validate-settings
description: Validates Claude Code settings.json files for schema, permissions, and security. Use when user asks to "check my settings", "validate settings.json", "permission errors", "environment variable issues", or "settings syntax errors". Validates model names, permission rules, hooks configuration, and environment variables.
version: 1.0.0
disable-model-invocation: true
allowed-tools:
  - Bash(claudelint:*)
  - Read
---

# Validate Settings

Runs `claudelint validate-settings` to validate `.claude/settings.json` and `.claude/settings.local.json` files.

## Usage

```bash
claudelint validate-settings
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
claudelint validate-settings
claudelint validate-settings --path /path/to/settings.json
```

## See Also

- [validate-all](../validate-all/SKILL.md) - Run all validators
