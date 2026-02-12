# Rule: mcp-sse-empty-url

**Severity**: Error
**Fixable**: No
**Validator**: MCP
**Category**: Schema Validation

MCP SSE transport URL cannot be empty

## Rule Details

SSE (Server-Sent Events) transport configurations must include a non-empty URL. The URL specifies where Claude Code should connect to receive server-sent events from the MCP server. An empty or whitespace-only URL will cause connection failures.

Note: SSE transport is deprecated. Consider migrating to HTTP or WebSocket transport instead.

This rule validates that the `url` field in SSE transport configurations contains actual content, not empty strings or whitespace.

### Incorrect

Empty URL string:

```json
{
  "mcpServers": {
    "events-server": {
      "name": "events-server",
      "transport": {
        "type": "sse",
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
    "notification-service": {
      "name": "notification-service",
      "transport": {
        "type": "sse",
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
    "stream-server": {
      "name": "stream-server",
      "transport": {
        "type": "sse"
      }
    }
  }
}
```

### Correct

Valid SSE URL:

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

HTTPS SSE URL:

```json
{
  "mcpServers": {
    "secure-stream": {
      "name": "secure-stream",
      "transport": {
        "type": "sse",
        "url": "https://api.example.com/sse"
      }
    }
  }
}
```

URL with environment variable:

```json
{
  "mcpServers": {
    "configurable-sse": {
      "name": "configurable-sse",
      "transport": {
        "type": "sse",
        "url": "${SSE_URL}"
      }
    }
  }
}
```

URL with default fallback:

```json
{
  "mcpServers": {
    "flexible-sse": {
      "name": "flexible-sse",
      "transport": {
        "type": "sse",
        "url": "${SSE_URL:-http://localhost:3000/events}"
      }
    }
  }
}
```

## How To Fix

To resolve empty URL errors:

1. **Add a valid URL** to the SSE transport:

   ```json
   # Before
   {
     "transport": {
       "type": "sse",
       "url": ""
     }
   }

   # After
   {
     "transport": {
       "type": "sse",
       "url": "http://localhost:8080/events"
     }
   }
   ```

2. **Use environment variable** for configurable URLs:

   ```json
   {
     "transport": {
       "type": "sse",
       "url": "${SSE_SERVER_URL}"
     }
   }
   ```

3. **Include a default value** for environment variables:

   ```json
   {
     "transport": {
       "type": "sse",
       "url": "${SSE_SERVER_URL:-http://localhost:8080/events}"
     }
   }
   ```

4. **Consider migrating** to non-deprecated transports:

   ```json
   # Migrate to HTTP transport
   {
     "transport": {
       "type": "http",
       "url": "http://localhost:8080"
     }
   }

   # Or WebSocket transport
   {
     "transport": {
       "type": "websocket",
       "url": "ws://localhost:8080"
     }
   }
   ```

5. **Run validation**:

   ```bash
   claudelint check-mcp
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. An empty SSE URL will cause immediate connection failures when Claude Code attempts to connect to the MCP server. Always provide a valid URL rather than disabling validation.

Additionally, consider that SSE transport is deprecated and you should plan to migrate to HTTP or WebSocket transport.

## Related Rules

- [mcp-sse-invalid-url](./mcp-sse-invalid-url.md) - SSE URL format validation
- [mcp-sse-transport-deprecated](./mcp-sse-transport-deprecated.md) - SSE deprecation warning
- [mcp-http-empty-url](./mcp-http-empty-url.md) - HTTP URL validation
- [mcp-websocket-empty-url](./mcp-websocket-empty-url.md) - WebSocket URL validation

## Resources

- [Rule Implementation](../../src/rules/mcp/mcp-sse-empty-url.ts)
- [Rule Tests](../../tests/rules/mcp/mcp-sse-empty-url.test.ts)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## Version

Available since: v0.2.0
