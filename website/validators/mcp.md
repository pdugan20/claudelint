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

| Rule | Severity | Description |
|------|----------|-------------|
| [mcp-http-invalid-url](/rules/mcp/mcp-http-invalid-url) | error | Invalid HTTP URL |
| [mcp-sse-invalid-url](/rules/mcp/mcp-sse-invalid-url) | error | Invalid SSE URL |
| [mcp-websocket-invalid-url](/rules/mcp/mcp-websocket-invalid-url) | error | Invalid WebSocket URL |
| [mcp-invalid-transport](/rules/mcp/mcp-invalid-transport) | error | Unknown transport type |
| [mcp-invalid-server](/rules/mcp/mcp-invalid-server) | error | Invalid server configuration |
| [mcp-invalid-env-var](/rules/mcp/mcp-invalid-env-var) | warn | Invalid environment variable |
| [mcp-server-key-mismatch](/rules/mcp/mcp-server-key-mismatch) | warn | Server key mismatch |

See the [MCP rules category](/rules/overview) for the complete list of <RuleCount category="mcp" /> rules.

## CLI Usage

```bash
claudelint validate-mcp
claudelint validate-mcp --verbose
```

## See Also

- [Rules Reference](/rules/overview) - All validation rules
- [Configuration](/guide/configuration) - Customize rule severity
