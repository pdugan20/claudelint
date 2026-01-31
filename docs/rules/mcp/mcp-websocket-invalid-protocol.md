# Rule: mcp-websocket-invalid-protocol

**Severity**: Warning
**Fixable**: No
**Validator**: MCP
**Category**: Best Practices

WebSocket URLs should use ws:// or wss:// protocol

## Rule Details

WebSocket transport URLs should use the appropriate WebSocket protocol scheme (`ws://` or `wss://`). Using other protocols like `http://` or `https://` may work in some WebSocket implementations that auto-upgrade the connection, but it's not guaranteed and can lead to connection failures or unexpected behavior.

This rule warns when a WebSocket transport uses a non-WebSocket protocol scheme. URLs containing environment variables skip validation since they will be expanded at runtime.

### Incorrect

Using HTTP protocol instead of ws://:

```json
{
  "mcpServers": {
    "ws-server": {
      "name": "ws-server",
      "transport": {
        "type": "websocket",
        "url": "http://localhost:9000"
      }
    }
  }
}
```

Using HTTPS protocol instead of wss://:

```json
{
  "mcpServers": {
    "secure-ws": {
      "name": "secure-ws",
      "transport": {
        "type": "websocket",
        "url": "https://api.example.com/ws"
      }
    }
  }
}
```

Using FTP protocol:

```json
{
  "mcpServers": {
    "broken-ws": {
      "name": "broken-ws",
      "transport": {
        "type": "websocket",
        "url": "ftp://server.com"
      }
    }
  }
}
```

Multiple servers with wrong protocols:

```json
{
  "mcpServers": {
    "ws-1": {
      "name": "ws-1",
      "transport": {
        "type": "websocket",
        "url": "http://localhost:8080"
      }
    },
    "ws-2": {
      "name": "ws-2",
      "transport": {
        "type": "websocket",
        "url": "https://api.example.com"
      }
    }
  }
}
```

### Correct

Using ws:// for unencrypted connections:

```json
{
  "mcpServers": {
    "local-ws": {
      "name": "local-ws",
      "transport": {
        "type": "websocket",
        "url": "ws://localhost:9000"
      }
    }
  }
}
```

Using wss:// for encrypted connections:

```json
{
  "mcpServers": {
    "secure-ws": {
      "name": "secure-ws",
      "transport": {
        "type": "websocket",
        "url": "wss://api.example.com/ws"
      }
    }
  }
}
```

WebSocket URL with path:

```json
{
  "mcpServers": {
    "realtime-api": {
      "name": "realtime-api",
      "transport": {
        "type": "websocket",
        "url": "wss://realtime.example.com/mcp/v1"
      }
    }
  }
}
```

URL with environment variable (skips validation):

```json
{
  "mcpServers": {
    "dynamic-ws": {
      "name": "dynamic-ws",
      "transport": {
        "type": "websocket",
        "url": "${WEBSOCKET_URL}"
      }
    }
  }
}
```

URL with variable and default:

```json
{
  "mcpServers": {
    "configurable-ws": {
      "name": "configurable-ws",
      "transport": {
        "type": "websocket",
        "url": "${WS_URL:-wss://default.example.com}"
      }
    }
  }
}
```

## How To Fix

To resolve protocol mismatch warnings:

1. **Replace http:// with ws://**:

   ```json
   # Before
   {
     "transport": {
       "type": "websocket",
       "url": "http://localhost:9000"
     }
   }

   # After
   {
     "transport": {
       "type": "websocket",
       "url": "ws://localhost:9000"
     }
   }
   ```

2. **Replace https:// with wss://**:

   ```json
   # Before
   {
     "transport": {
       "type": "websocket",
       "url": "https://api.example.com/ws"
     }
   }

   # After
   {
     "transport": {
       "type": "websocket",
       "url": "wss://api.example.com/ws"
     }
   }
   ```

3. **Use ws:// for local development**:

   ```json
   {
     "transport": {
       "type": "websocket",
       "url": "ws://localhost:9000"
     }
   }
   ```

4. **Use wss:// for production/remote**:

   ```json
   {
     "transport": {
       "type": "websocket",
       "url": "wss://api.example.com/ws"
     }
   }
   ```

5. **Test WebSocket connection**:

   ```bash
   # Test WebSocket connectivity (using wscat or similar tool)
   npx wscat -c ws://localhost:9000
   ```

6. **Run validation**:

   ```bash
   claudelint check-mcp
   ```

## Protocol Guide

| Protocol | Use Case | Encrypted |
|----------|----------|-----------|
| ws:// | Local development, unencrypted connections | No |
| wss:// | Production, secure connections | Yes |
| http:// | Not recommended for WebSocket | No |
| https:// | Not recommended for WebSocket | Yes |

## Options

This rule does not have configuration options.

## When Not To Use It

This rule enforces best practices for WebSocket URLs. However, you might disable it if:

- Your WebSocket server/client auto-upgrades http:// to ws://
- You're using a proxy that handles protocol conversion
- You have a specific implementation that requires non-standard protocols

To disable:

```json
{
  "rules": {
    "mcp-websocket-invalid-protocol": "off"
  }
}
```

However, using proper WebSocket protocols prevents confusion and ensures compatibility across different WebSocket implementations.

## Related Rules

- [mcp-websocket-empty-url](./mcp-websocket-empty-url.md) - WebSocket URL emptiness check
- [mcp-websocket-invalid-url](./mcp-websocket-invalid-url.md) - WebSocket URL format validation
- [mcp-invalid-transport](./mcp-invalid-transport.md) - Transport configuration validation

## Resources

- [Rule Implementation](../../src/rules/mcp/mcp-websocket-invalid-protocol.ts)
- [Rule Tests](../../tests/rules/mcp/mcp-websocket-invalid-protocol.test.ts)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [WebSocket Protocol RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455)

## Version

Available since: v1.0.0
