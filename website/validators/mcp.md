---
description: Validate .mcp.json configuration files for transport types, URL formats, environment variable syntax, and server command validity with claudelint.
---

# MCP Servers Validator

The MCP validator checks `.mcp.json` configuration files for transport types, URLs, environment variables, and server configuration.

## What It Checks

- Transport type validity (stdio, SSE, HTTP, WebSocket)
- URL format validation per transport type
- Environment variable syntax
- Variable expansion patterns
- Command validation for stdio transport

## Rules

This validator includes <RuleCount category="mcp" /> rules. See the [MCP rules category](/rules/mcp/mcp-http-empty-url) for the complete list.

| Rule | Severity | Description |
|------|----------|-------------|
| [mcp-invalid-transport](/rules/mcp/mcp-invalid-transport) | error | Unknown transport type |
| [mcp-stdio-empty-command](/rules/mcp/mcp-stdio-empty-command) | error | Stdio transport command is empty |
| [mcp-http-invalid-url](/rules/mcp/mcp-http-invalid-url) | error | Invalid HTTP URL |
| [mcp-invalid-env-var](/rules/mcp/mcp-invalid-env-var) | warn | Invalid environment variable |

## CLI Usage

```bash
claudelint validate-mcp
claudelint validate-mcp --verbose
```

## Plugin Skill

If you have the [claudelint plugin](/integrations/claude-code-plugin) installed, you can run this validator inside Claude Code with `/validate-mcp` or by asking "Validate my MCP config."

## See Also

- [Claude Code MCP Servers](https://code.claude.com/docs/en/mcp) - Official MCP documentation
- [Configuration](/guide/configuration) - Customize rule severity
