---
name: validate-mcp
description: Validate MCP server configuration files (.mcp.json). Use when you want to "check my MCP config", "why isn't my MCP working", ".mcp.json errors", "validate MCP servers", or "MCP connection failed". Validates transport types (stdio, sse, http, websocket), server names, and environment variables.
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

# Validate MCP Servers

Runs `claudelint validate-mcp` to validate `.mcp.json` configuration files.

## Usage

```bash
claudelint validate-mcp
```

## Options

- `--path <path>` - Custom path to .mcp.json
- `--verbose` - Show detailed output
- `--warnings-as-errors` - Treat warnings as errors

## What Gets Validated

- JSON syntax
- Server name uniqueness and consistency
- Transport type (stdio, sse)
- Stdio transport (command validation)
- SSE transport (URL validation)
- Variable expansion patterns (${VAR}, ${VAR:-default})
- Environment variables

## Examples

```bash
claudelint validate-mcp
claudelint validate-mcp --path /path/to/.mcp.json
```

## See Also

- [validate](../validate/SKILL.md) - Run all validators
