---
name: validate-plugin
description: Validate Claude Code plugin manifest files
version: 1.0.0
allowed-tools:
  - Bash
  - Read
---

# Validate Plugin Manifests

Runs `claude-code-lint validate-plugin` to validate `.claude-plugin/plugin.json` files.

## Usage

```bash
claude-code-lint validate-plugin
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
claude-code-lint validate-plugin
claude-code-lint validate-plugin --path /path/to/plugin.json
```

## See Also

- [validate](../validate/SKILL.md) - Run all validators
