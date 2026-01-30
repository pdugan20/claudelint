# Rule: mcp-websocket-empty-url

**Severity**: Error
**Fixable**: No
**Validator**: MCP
**Category**: Schema Validation

MCP WebSocket transport URL cannot be empty

## Rule Details

WebSocket transport configurations must include a non-empty URL. The URL specifies where Claude Code should establish the WebSocket connection to communicate with the MCP server. An empty or whitespace-only URL will cause connection failures.

This rule validates that the `url` field in WebSocket transport configurations contains actual content, not empty strings or whitespace.

### Incorrect

Empty URL string:

```json
{
  "mcpServers": {
    "ws-server": {
      "name": "ws-server",
      "transport": {
        "type": "websocket",
        "url": ""
      }
    }
  }
}
```

Whitespace-only URL:

```json
{
  "mcpServers": {
    "realtime-service": {
      "name": "realtime-service",
      "transport": {
        "type": "websocket",
        "url": "   "
      }
    }
  }
}
```

Missing URL property:

```json
{
  "mcpServers": {
    "socket-server": {
      "name": "socket-server",
      "transport": {
        "type": "websocket"
      }
    }
  }
}
```

### Correct

Valid WebSocket URL:

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

Secure WebSocket URL:

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
    "custom-ws": {
      "name": "custom-ws",
      "transport": {
        "type": "websocket",
        "url": "ws://localhost:8080/mcp/realtime"
      }
    }
  }
}
```

URL with environment variable:

```json
{
  "mcpServers": {
    "configurable-ws": {
      "name": "configurable-ws",
      "transport": {
        "type": "websocket",
        "url": "${WS_URL}"
      }
    }
  }
}
```

URL with default fallback:

```json
{
  "mcpServers": {
    "flexible-ws": {
      "name": "flexible-ws",
      "transport": {
        "type": "websocket",
        "url": "${WS_URL:-ws://localhost:9000}"
      }
    }
  }
}
```

## How To Fix

To resolve empty URL errors:

1. **Add a valid WebSocket URL**:
   ```json
   # Before
   {
     "transport": {
       "type": "websocket",
       "url": ""
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

2. **Use ws:// or wss:// protocol**:
   ```json
   # Use ws:// for local development
   {
     "transport": {
       "type": "websocket",
       "url": "ws://localhost:9000"
     }
   }

   # Use wss:// for production/secure connections
   {
     "transport": {
       "type": "websocket",
       "url": "wss://api.example.com/ws"
     }
   }
   ```

3. **Use environment variable** for configurable URLs:
   ```json
   {
     "transport": {
       "type": "websocket",
       "url": "${WEBSOCKET_URL}"
     }
   }
   ```

4. **Include a default value** for environment variables:
   ```json
   {
     "transport": {
       "type": "websocket",
       "url": "${WEBSOCKET_URL:-ws://localhost:9000}"
     }
   }
   ```

5. **Ensure URL includes protocol and port**:
   - Use `ws://` for unencrypted local connections
   - Use `wss://` for encrypted remote connections
   - Include port number (e.g., 9000, 8080)
   - Add path if your server uses one (e.g., `/ws`, `/mcp`)

6. **Run validation**:
   ```bash
   claudelint check-mcp
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. An empty WebSocket URL will cause immediate connection failures when Claude Code attempts to establish the WebSocket connection. Always provide a valid URL rather than disabling validation.

## Related Rules

- [mcp-websocket-invalid-url](./mcp-websocket-invalid-url.md) - WebSocket URL format validation
- [mcp-websocket-invalid-protocol](./mcp-websocket-invalid-protocol.md) - WebSocket protocol validation
- [mcp-invalid-transport](./mcp-invalid-transport.md) - Transport configuration validation

## Resources

- [Rule Implementation](../../src/rules/mcp/mcp-websocket-empty-url.ts)
- [Rule Tests](../../tests/rules/mcp/mcp-websocket-empty-url.test.ts)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## Version

Available since: v1.0.0
