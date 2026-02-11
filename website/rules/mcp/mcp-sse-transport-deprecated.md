# Rule: mcp-sse-transport-deprecated

**Severity**: Warn
**Fixable**: No
**Validator**: MCP
**Recommended**: Yes

SSE transport is deprecated, use HTTP or WebSocket instead

## Rule Details

The Server-Sent Events (SSE) transport for MCP servers is deprecated in favor of the HTTP streamable transport. This rule emits a warning whenever a server has type set to "sse" so that configurations can be migrated before SSE support is removed entirely. The HTTP transport offers better bidirectional communication and is the recommended replacement.

### Incorrect

Server using the deprecated SSE transport

```json
{
  "mcpServers": {
    "remote": {
      "type": "sse",
      "url": "https://mcp.example.com/sse"
    }
  }
}
```

### Correct

Server using the recommended HTTP transport

```json
{
  "mcpServers": {
    "remote": {
      "type": "http",
      "url": "https://mcp.example.com/api"
    }
  }
}
```

Server using WebSocket transport

```json
{
  "mcpServers": {
    "remote": {
      "type": "websocket",
      "url": "wss://mcp.example.com/ws"
    }
  }
}
```

## How To Fix

Change the server type from "sse" to "http" and update the url to point to the HTTP streamable endpoint. Alternatively, use "websocket" if the server supports it.

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if you are intentionally targeting an MCP server that only supports the SSE transport and cannot be upgraded.

## Related Rules

- [`mcp-sse-empty-url`](/rules/mcp/mcp-sse-empty-url)
- [`mcp-sse-invalid-url`](/rules/mcp/mcp-sse-invalid-url)
- [`mcp-invalid-transport`](/rules/mcp/mcp-invalid-transport)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/mcp/mcp-sse-transport-deprecated.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/mcp/mcp-sse-transport-deprecated.test.ts)

## Version

Available since: v1.0.0
