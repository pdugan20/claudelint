# MCP Servers Validator

The MCP validator checks `.mcp.json` configuration files for transport types, URLs, environment variables, and server configuration.

## What It Checks

- Server name uniqueness
- Transport type validity (stdio, SSE, HTTP, WebSocket)
- URL format validation per transport type
- Environment variable syntax
- Variable expansion patterns
- Command validation for stdio transport

## Rules

This validator includes <RuleCount category="mcp" /> rules. See the [MCP rules category](/rules/overview) for the complete list.

| Rule | Severity | Description |
|------|----------|-------------|
| [mcp-invalid-server](/rules/mcp/mcp-invalid-server) | error | Invalid server configuration |
| [mcp-invalid-transport](/rules/mcp/mcp-invalid-transport) | error | Unknown transport type |
| [mcp-stdio-empty-command](/rules/mcp/mcp-stdio-empty-command) | error | Stdio transport command is empty |
| [mcp-http-invalid-url](/rules/mcp/mcp-http-invalid-url) | error | Invalid HTTP URL |
| [mcp-invalid-env-var](/rules/mcp/mcp-invalid-env-var) | warn | Invalid environment variable |

## CLI Usage

```bash
claudelint validate-mcp
claudelint validate-mcp --verbose
```

## See Also

- [Rules Reference](/rules/overview) - All validation rules
- [Configuration](/guide/configuration) - Customize rule severity
