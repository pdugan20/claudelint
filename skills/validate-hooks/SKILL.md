---
name: validate-hooks
description: Validates Claude Code hooks.json files for schema, events, and commands. Use when user asks to "check my hooks", "validate hooks.json", "hook errors", "why isn't my hook firing", or "hook event types". Validates hook events, types (command, prompt, agent), matcher patterns, and command script references.
version: 1.0.0
disable-model-invocation: true
allowed-tools:
  - Bash(claudelint:*)
---

# Validate Hooks

Runs `claudelint validate-hooks` to validate `.claude/hooks/hooks.json` files.

## Usage

```bash
claudelint validate-hooks
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
claudelint validate-hooks
claudelint validate-hooks --path /path/to/hooks.json
```

## See Also

- [validate-all](../validate-all/SKILL.md) - Run all validators
