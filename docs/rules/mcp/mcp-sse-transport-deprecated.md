# Rule: mcp-sse-transport-deprecated

**Severity**: Warning
**Fixable**: No
**Validator**: MCP
**Category**: Deprecation

SSE transport is deprecated, use HTTP or WebSocket instead

## Rule Details

The SSE (Server-Sent Events) transport type is deprecated in the MCP specification. While it still functions, it will be removed in a future version. You should migrate to HTTP or WebSocket transport for long-term compatibility and support.

This rule warns whenever SSE transport is detected, encouraging migration to supported transport types.

### Incorrect

Using deprecated SSE transport:

```json
{
  "mcpServers": {
    "events-server": {
      "name": "events-server",
      "transport": {
        "type": "sse",
        "url": "http://localhost:8080/events"
      }
    }
  }
}
```

Multiple servers with SSE transport:

```json
{
  "mcpServers": {
    "stream-1": {
      "name": "stream-1",
      "transport": {
        "type": "sse",
        "url": "http://localhost:3000/stream"
      }
    },
    "stream-2": {
      "name": "stream-2",
      "transport": {
        "type": "sse",
        "url": "https://api.example.com/sse"
      }
    }
  }
}
```

### Correct

Using HTTP transport:

```json
{
  "mcpServers": {
    "http-server": {
      "name": "http-server",
      "transport": {
        "type": "http",
        "url": "http://localhost:8080"
      }
    }
  }
}
```

Using WebSocket transport:

```json
{
  "mcpServers": {
    "ws-server": {
      "name": "ws-server",
      "transport": {
        "type": "websocket",
        "url": "ws://localhost:9000"
      }
    }
  }
}
```

Using stdio transport for local servers:

```json
{
  "mcpServers": {
    "local-server": {
      "name": "local-server",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["server.js"]
      }
    }
  }
}
```

Mixed transports without SSE:

```json
{
  "mcpServers": {
    "local-tools": {
      "name": "local-tools",
      "transport": {
        "type": "stdio",
        "command": "python",
        "args": ["tools.py"]
      }
    },
    "remote-api": {
      "name": "remote-api",
      "transport": {
        "type": "http",
        "url": "https://api.example.com"
      }
    },
    "realtime-service": {
      "name": "realtime-service",
      "transport": {
        "type": "websocket",
        "url": "wss://realtime.example.com"
      }
    }
  }
}
```

## How To Fix

To migrate away from deprecated SSE transport:

1. **Migrate to HTTP transport** for request-response patterns:

   ```json
   # Before (SSE)
   {
     "transport": {
       "type": "sse",
       "url": "http://localhost:8080/events"
     }
   }

   # After (HTTP)
   {
     "transport": {
       "type": "http",
       "url": "http://localhost:8080"
     }
   }
   ```

2. **Migrate to WebSocket transport** for bidirectional streaming:

   ```json
   # Before (SSE)
   {
     "transport": {
       "type": "sse",
       "url": "https://api.example.com/sse"
     }
   }

   # After (WebSocket)
   {
     "transport": {
       "type": "websocket",
       "url": "wss://api.example.com"
     }
   }
   ```

3. **Update server implementation** to support new transport:
   - HTTP transport: Implement standard HTTP request/response handlers
   - WebSocket transport: Implement WebSocket connection handlers
   - Ensure server supports the MCP protocol over new transport

4. **Test the migration**:

   ```bash
   # Verify new transport works
   claudelint check-mcp

   # Test connection to server
   # (specific test depends on your server implementation)
   ```

5. **Update client code** if needed:
   - Most MCP client libraries handle transport transparently
   - Ensure your client library supports the new transport type

## Transport Comparison

| Transport | Use Case | Status | Bidirectional |
|-----------|----------|--------|---------------|
| stdio | Local subprocesses | Supported | Yes |
| http | Request-response | Supported | No |
| sse | Server-sent events | **Deprecated** | No |
| websocket | Bidirectional streaming | Supported | Yes |

## Options

This rule does not have configuration options.

## When Not To Use It

You might temporarily disable this rule if:

- You're in the process of migrating and need time to update servers
- You're working with legacy MCP servers that only support SSE
- You're maintaining compatibility with older MCP client versions

To disable:

```json
{
  "rules": {
    "mcp-sse-transport-deprecated": "off"
  }
}
```

However, plan to complete migration as SSE transport will be removed in future MCP versions.

## Related Rules

- [mcp-sse-empty-url](./mcp-sse-empty-url.md) - SSE URL emptiness check
- [mcp-sse-invalid-url](./mcp-sse-invalid-url.md) - SSE URL format validation
- [mcp-invalid-transport](./mcp-invalid-transport.md) - Transport configuration validation

## Resources

- [Rule Implementation](../../src/rules/mcp/mcp-sse-transport-deprecated.ts)
- [Rule Tests](../../tests/rules/mcp/mcp-sse-transport-deprecated.test.ts)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## Version

Available since: v0.2.0
