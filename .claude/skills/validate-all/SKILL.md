---
name: validate-all
description: Run comprehensive claudelint validation on all Claude Code project files
version: 1.0.0
allowed-tools:
  - Bash
  - Read
---

# Validate Claude Code Project

Runs `claudelint check-all` to validate all Claude Code project files including CLAUDE.md, skills, settings, hooks, MCP servers, and plugin manifests.

## Usage

```bash
claudelint check-all
```

## Options

Available flags:

- `--verbose` - Show detailed validation output
- `--warnings-as-errors` - Treat warnings as errors
- `--explain` - Show detailed explanations and fix suggestions
- `--format <format>` - Output format: stylish, json, compact (default: stylish)
- `--config <path>` - Path to custom config file
- `--fast` - Fast mode: skip expensive checks
- `--color` / `--no-color` - Control color output

## Examples

Basic validation:

```bash
claudelint check-all
```

Verbose output with explanations:

```bash
claudelint check-all --verbose --explain
```

JSON output for CI/CD:

```bash
claudelint check-all --format json
```

Use custom config:

```bash
claudelint check-all --config .claudelintrc.custom.json
```

Treat warnings as errors (strict mode):

```bash
claudelint check-all --warnings-as-errors
```

## What Gets Validated

The validate skill checks:

1. **CLAUDE.md files** - File size, imports, frontmatter, sections
2. **Skills** - SKILL.md schema, naming, documentation, security
3. **Settings** - settings.json schema, permissions, environment variables
4. **Hooks** - hooks.json schema, events, commands
5. **MCP Servers** - .mcp.json schema, transport config, variables
6. **Plugins** - plugin.json schema, semantic versioning, references

## Exit Codes

- `0` - No errors or warnings
- `1` - Warnings found (or warnings treated as errors)
- `2` - Errors found or fatal error (invalid config, crash)

## Configuration

Create a `.claudelintrc.json` file to customize validation:

```json
{
  "rules": {
    "size-error": "error",
    "size-warning": "warn",
    "import-missing": "error"
  },
  "output": {
    "format": "stylish",
    "verbose": false
  }
}
```

See [configuration docs](../../docs/configuration.md) for full options.

## Ignoring Files

Create a `.claudelintignore` file to exclude files:

```text
# Test fixtures
fixtures/
**/*.test.md

# Generated files
**/*.generated.ts
```

## Integration

Add to package.json scripts:

```json
{
  "scripts": {
    "lint:claude": "claudelint check-all",
    "lint:claude:fix": "claudelint format --fix"
  }
}
```

Add to pre-commit hooks:

```bash
#!/bin/sh
claudelint check-all --warnings-as-errors
```

## See Also

- [validate-cc-md](../validate-cc-md/SKILL.md) - Validate only CLAUDE.md files
- [validate-skills](../validate-skills/SKILL.md) - Validate only skills
- [validate-settings](../validate-settings/SKILL.md) - Validate only settings
- [format-cc](../format-cc/SKILL.md) - Format Claude files with prettier/markdownlint
