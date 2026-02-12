# mcp-websocket-invalid-url

<RuleHeader description="MCP WebSocket transport URL must be valid" severity="error" :fixable="false" :configurable="false" category="MCP" />

## Rule Details

This rule checks that the url field of MCP servers with type "websocket" is a valid URL by attempting to parse it with the URL constructor. URLs containing variable expansions (${ or $) are skipped since they are resolved at runtime. An invalid URL will prevent Claude Code from establishing a WebSocket connection to the MCP server.

### Incorrect

WebSocket server with a malformed URL

```json
{
  "mcpServers": {
    "realtime": {
      "type": "websocket",
      "url": "not-a-valid-url"
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

WebSocket server with a variable-expanded URL (skipped)

```json
{
  "mcpServers": {
    "realtime": {
      "type": "websocket",
      "url": "${MCP_WS_URL}"
    }
  }
}
```

## How To Fix

Provide a fully qualified URL with a ws:// or wss:// scheme. Ensure the URL is well-formed and reachable from the environment where Claude Code runs.

## Options

This rule does not have any configuration options.

## Related Rules

- [`mcp-websocket-empty-url`](/rules/mcp/mcp-websocket-empty-url)
- [`mcp-websocket-invalid-protocol`](/rules/mcp/mcp-websocket-invalid-protocol)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/mcp/mcp-websocket-invalid-url.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/mcp/mcp-websocket-invalid-url.test.ts)

## Version

Available since: v0.2.0
