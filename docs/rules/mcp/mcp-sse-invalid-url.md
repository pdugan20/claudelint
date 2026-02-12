# Rule: mcp-sse-invalid-url

**Severity**: Error
**Fixable**: No
**Validator**: MCP
**Category**: Schema Validation

MCP SSE transport URL must be valid format

## Rule Details

SSE (Server-Sent Events) transport URLs must be valid, well-formed URLs that can be parsed by standard URL parsers. Invalid URLs will cause connection errors when Claude Code attempts to establish SSE transport to the MCP server.

Note: SSE transport is deprecated. Consider migrating to HTTP or WebSocket transport instead.

This rule validates URL syntax using JavaScript's URL constructor. URLs containing environment variables (${VAR} or $VAR syntax) skip validation since they will be expanded at runtime.

### Incorrect

Missing protocol:

```json
{
  "mcpServers": {
    "events-server": {
      "name": "events-server",
      "transport": {
        "type": "sse",
        "url": "localhost:8080/events"
      }
    }
  }
}
```

Invalid protocol:

```json
{
  "mcpServers": {
    "stream-service": {
      "name": "stream-service",
      "transport": {
        "type": "sse",
        "url": "ftp://server.com/events"
      }
    }
  }
}
```

Malformed URL:

```json
{
  "mcpServers": {
    "broken-sse": {
      "name": "broken-sse",
      "transport": {
        "type": "sse",
        "url": "http://invalid url with spaces"
      }
    }
  }
}
```

### Correct

Valid HTTP URL:

```json
{
  "mcpServers": {
    "local-events": {
      "name": "local-events",
      "transport": {
        "type": "sse",
        "url": "http://localhost:8080/events"
      }
    }
  }
}
```

Valid HTTPS URL:

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

URL with port and path:

```json
{
  "mcpServers": {
    "custom-sse": {
      "name": "custom-sse",
      "transport": {
        "type": "sse",
        "url": "http://localhost:3000/api/v1/events"
      }
    }
  }
}
```

URL with environment variable (skips validation):

```json
{
  "mcpServers": {
    "dynamic-sse": {
      "name": "dynamic-sse",
      "transport": {
        "type": "sse",
        "url": "${SSE_BASE_URL}/events"
      }
    }
  }
}
```

URL with variable and default:

```json
{
  "mcpServers": {
    "configurable-sse": {
      "name": "configurable-sse",
      "transport": {
        "type": "sse",
        "url": "${SSE_URL:-http://localhost:8080/events}"
      }
    }
  }
}
```

## How To Fix

To resolve invalid URL errors:

1. **Add the protocol** if missing:

   ```json
   # Before
   {
     "transport": {
       "type": "sse",
       "url": "localhost:8080/events"
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

2. **Use http:// or https://** for SSE transport:

   ```json
   # Use http:// for local development
   "url": "http://localhost:3000/events"

   # Use https:// for production/remote
   "url": "https://api.example.com/sse"
   ```

3. **Remove spaces and special characters**:

   ```json
   # Before
   "url": "http://my server.com/events"

   # After
   "url": "http://my-server.com/events"
   ```

4. **Encode special characters** if needed:

   ```json
   # Use URL encoding for special characters
   "url": "http://api.example.com/path%20with%20spaces"
   ```

5. **Consider migrating** to non-deprecated transports:

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

6. **Test URL validity**:

   ```bash
   # Test if URL is valid
   node -e "new URL('http://localhost:8080/events')"
   ```

7. **Run validation**:

   ```bash
   claudelint check-mcp
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid URLs will cause connection failures when Claude Code attempts to connect to the MCP server. URLs with environment variables are automatically skipped from validation, so there's no need to disable the rule for dynamic configurations.

Additionally, consider that SSE transport is deprecated and you should plan to migrate to HTTP or WebSocket transport.

## Related Rules

- [mcp-sse-empty-url](./mcp-sse-empty-url.md) - SSE URL emptiness check
- [mcp-sse-transport-deprecated](./mcp-sse-transport-deprecated.md) - SSE deprecation warning
- [mcp-http-invalid-url](./mcp-http-invalid-url.md) - HTTP URL validation
- [mcp-websocket-invalid-url](./mcp-websocket-invalid-url.md) - WebSocket URL validation

## Resources

- [Rule Implementation](../../src/rules/mcp/mcp-sse-invalid-url.ts)
- [Rule Tests](../../tests/rules/mcp/mcp-sse-invalid-url.test.ts)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## Version

Available since: v0.2.0
