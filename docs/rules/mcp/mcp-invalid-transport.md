# Rule: mcp-invalid-transport

**Severity**: Error
**Fixable**: No
**Validator**: MCP
**Category**: Schema Validation

Validates that MCP server transport configurations use valid types (stdio or SSE) with properly formatted required fields.

## Rule Details

MCP servers support two transport types: `stdio` (subprocess via standard input/output) and `sse` (Server-Sent Events over HTTP). Each transport type has specific required fields that must be properly formatted and non-empty.

This rule detects invalid transport types, empty commands in stdio transport, empty or invalid URLs in SSE transport, and improper variable expansion syntax. All transport configurations must specify a valid type and provide all required fields for that type.

### Incorrect

Invalid transport type:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "http",
        "url": "http://localhost:3000"
      }
    }
  }
}
```

Empty required field:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "stdio",
        "command": ""
      }
    }
  }
}
```

### Correct

Valid stdio transport:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["server.js"],
        "env": {
          "LOG_LEVEL": "info"
        }
      }
    }
  }
}
```

Valid SSE transport with variable expansion:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "sse",
        "url": "${MCP_SERVER_URL:-http://localhost:3000}",
        "env": {
          "API_KEY": "${API_KEY}"
        }
      }
    }
  }
}
```

## How To Fix

1. **Use valid transport type**: Must be `"stdio"` or `"sse"` (not http, websocket, etc.)
2. **Provide required stdio fields**: Include non-empty `command` field
3. **Provide required SSE fields**: Include non-empty, valid `url` field with protocol
4. **Fix URL format**: Ensure URLs include protocol (`http://` or `https://`)
5. **Use proper variable expansion**: Use `${VAR}` syntax instead of `$VAR` (see [mcp-invalid-env-var](./mcp-invalid-env-var.md))

**Transport Type: "stdio"**

Launches MCP server as subprocess.

Required: `command` (string, non-empty)
Optional: `args` (array), `env` (object)

**Transport Type: "sse"**

Connects to MCP server via Server-Sent Events.

Required: `url` (string, non-empty, valid URL)
Optional: `env` (object)

**Variable Expansion:**

- Basic: `${VAR}`
- With default: `${VAR:-default}`
- Special: `${CLAUDE_PLUGIN_ROOT}`

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid transport configuration causes MCP server connection failures, runtime errors, silent functionality loss, and difficult debugging. Always fix transport issues rather than disabling validation.

## Related Rules

- [mcp-invalid-server](./mcp-invalid-server.md) - Server configuration validation
- [mcp-invalid-env-var](./mcp-invalid-env-var.md) - Environment variable validation

## Resources

- [Implementation](../../../src/validators/mcp.ts)
- [Tests](../../../tests/validators/mcp.test.ts)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP Transport Types](https://spec.modelcontextprotocol.io/specification/architecture/#transports)

## Version

Available since: v1.0.0
