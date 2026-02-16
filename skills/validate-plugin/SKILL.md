---
name: validate-plugin
description: Validates Claude Code plugin manifest files (plugin.json). Use when user asks to "check my plugin.json", "validate plugin.json", "plugin errors", or "why isn't my plugin loading". Validates JSON syntax, required fields (name, version, description), semantic versioning, and skill file references.
version: 1.0.0
allowed-tools:
  - Bash(claudelint:*)
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

- [validate-all](../validate-all/SKILL.md) - Run all validators
