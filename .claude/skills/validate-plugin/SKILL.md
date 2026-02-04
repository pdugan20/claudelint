---
name: validate-plugin
description: Validate Claude Code plugin manifest files (plugin.json). Use when you want to "check my plugin config", "validate plugin.json", "plugin errors", or "why isn't my plugin loading". Validates JSON syntax, required fields (name, version, description), semantic versioning, and skill file references.
version: 1.0.0
tags:
  - validation
  - claude-code
  - linting
dependencies:
  - npm:claude-code-lint
allowed-tools:
  - Bash
  - Read
---

# Validate Plugin Manifests

Runs `claudelint validate-plugin` to validate `.claude-plugin/plugin.json` files.

## Usage

```bash
claudelint validate-plugin
```

## Options

- `--path <path>` - Custom path to plugin.json
- `--verbose` - Show detailed output
- `--warnings-as-errors` - Treat warnings as errors

## What Gets Validated

- JSON syntax
- Required fields (name, version, description)
- Semantic versioning (x.y.z format)
- Skill file references (checks if referenced skills exist)
- Optional fields (homepage, repository, author, license)

## Examples

```bash
claudelint validate-plugin
claudelint validate-plugin --path /path/to/plugin.json
```

## See Also

- [validate](../validate/SKILL.md) - Run all validators
