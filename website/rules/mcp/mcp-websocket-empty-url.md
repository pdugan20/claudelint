# Rule: mcp-websocket-empty-url

**Severity**: Error
**Fixable**: No
**Validator**: MCP
**Recommended**: Yes

MCP WebSocket transport URL cannot be empty

## Rule Details

This rule checks that MCP servers configured with type "websocket" include a url field that is present and non-empty. A missing or blank URL means Claude Code cannot establish a WebSocket connection to the MCP server, resulting in connection failures at runtime.

### Incorrect

WebSocket server with an empty URL string

```json
{
  "mcpServers": {
    "realtime": {
      "type": "websocket",
      "url": ""
    }
  }
}
```

WebSocket server with the url field missing

```json
{
  "mcpServers": {
    "realtime": {
      "type": "websocket"
    }
  }
}
```

### Correct

WebSocket server with a valid URL

```json
{
  "mcpServers": {
    "realtime": {
      "type": "websocket",
      "url": "wss://mcp.example.com/ws"
    }
  }
}
```

## How To Fix

Add a non-empty url field to the WebSocket server configuration. The URL should use the ws:// or wss:// protocol scheme.

## Options

This rule does not have any configuration options.

## Related Rules

- [`mcp-websocket-invalid-url`](/rules/mcp/mcp-websocket-invalid-url)
- [`mcp-websocket-invalid-protocol`](/rules/mcp/mcp-websocket-invalid-protocol)
- [`mcp-invalid-server`](/rules/mcp/mcp-invalid-server)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/mcp/mcp-websocket-empty-url.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/mcp/mcp-websocket-empty-url.test.ts)

## Version

Available since: v1.0.0
