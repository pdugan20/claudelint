---
description: "WebSocket URLs should use ws:// or wss:// protocol"
---

# mcp-websocket-invalid-protocol

<RuleHeader description="WebSocket URLs should use ws:// or wss:// protocol" severity="warn" :fixable="false" :configurable="false" category="MCP" />

## Rule Details

This rule parses the url field of MCP servers with type "websocket" and checks that the protocol is ws: or wss:. Using an incorrect protocol such as http:// or https:// may cause connection failures or unexpected behavior. URLs containing variable expansions (${ or $) are skipped since they are resolved at runtime. Completely invalid URLs are caught by the mcp-websocket-invalid-url rule instead.

### Incorrect

WebSocket server using https:// instead of wss://

```json
{
  "mcpServers": {
    "realtime": {
      "type": "websocket",
      "url": "https://mcp.example.com/ws"
    }
  }
}
```

### Correct

WebSocket server using wss:// protocol

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

WebSocket server using ws:// protocol for local development

```json
{
  "mcpServers": {
    "local": {
      "type": "websocket",
      "url": "ws://localhost:8080/ws"
    }
  }
}
```

## How To Fix

Change the URL scheme to ws:// (unencrypted) or wss:// (encrypted). Use wss:// for production servers and ws:// only for local development.

## Options

This rule does not have any configuration options.

## Related Rules

- [`mcp-websocket-invalid-url`](/rules/mcp/mcp-websocket-invalid-url)
- [`mcp-websocket-empty-url`](/rules/mcp/mcp-websocket-empty-url)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/mcp/mcp-websocket-invalid-protocol.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/mcp/mcp-websocket-invalid-protocol.test.ts)

## Version

Available since: v0.2.0
