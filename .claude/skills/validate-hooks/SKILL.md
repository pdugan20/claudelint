---
name: validate-hooks
description: Validate Claude Code hooks.json files for schema, events, and commands
version: 1.0.0
allowed-tools:
  - Bash
  - Read
---

# Validate Hooks

Runs `claude-code-lint validate-hooks` to validate `.claude/hooks/hooks.json` files.

## Usage

```bash
claude-code-lint validate-hooks
```

## Options

- `--path <path>` - Custom path to hooks.json
- `--verbose` - Show detailed output
- `--warnings-as-errors` - Treat warnings as errors

## What Gets Validated

- JSON syntax
- Hook events (tool-use, user-prompt-submit, etc.)
- Hook types (command, prompt, agent)
- Matcher validation (tool names, regex patterns)
- Command script file existence

## Examples

```bash
claude-code-lint validate-hooks
claude-code-lint validate-hooks --path /path/to/hooks.json
```

## See Also

- [validate](../validate/SKILL.md) - Run all validators
