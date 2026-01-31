# Rule: mcp-websocket-invalid-url

**Severity**: Error
**Fixable**: No
**Validator**: MCP
**Category**: Schema Validation

MCP WebSocket transport URL must be valid format

## Rule Details

WebSocket transport URLs must be valid, well-formed URLs that can be parsed by standard URL parsers. Invalid URLs will cause connection errors when Claude Code attempts to establish WebSocket transport to the MCP server.

This rule validates URL syntax using JavaScript's URL constructor. URLs containing environment variables (${VAR} or $VAR syntax) skip validation since they will be expanded at runtime.

### Incorrect

Missing protocol:

```json
{
  "mcpServers": {
    "ws-server": {
      "name": "ws-server",
      "transport": {
        "type": "websocket",
        "url": "localhost:9000"
      }
    }
  }
}
```

Invalid URL format:

```json
{
  "mcpServers": {
    "broken-ws": {
      "name": "broken-ws",
      "transport": {
        "type": "websocket",
        "url": "ws://invalid url with spaces"
      }
    }
  }
}
```

Malformed protocol:

```json
{
  "mcpServers": {
    "bad-protocol": {
      "name": "bad-protocol",
      "transport": {
        "type": "websocket",
        "url": "ws:/localhost:9000"
      }
    }
  }
}
```

### Correct

Valid ws:// URL:

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

Valid wss:// URL:

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

WebSocket URL with port and path:

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

URL with environment variable (skips validation):

```json
{
  "mcpServers": {
    "dynamic-ws": {
      "name": "dynamic-ws",
      "transport": {
        "type": "websocket",
        "url": "${WS_BASE_URL}/socket"
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
        "url": "${WS_URL:-ws://localhost:9000}"
      }
    }
  }
}
```

Valid http:// URL (triggers protocol warning):

```json
{
  "mcpServers": {
    "http-ws": {
      "name": "http-ws",
      "transport": {
        "type": "websocket",
        "url": "http://localhost:9000"
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
       "type": "websocket",
       "url": "localhost:9000"
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

2. **Use ws:// or wss:/** for WebSocket transport:

   ```json
   # Use ws:// for local development
   "url": "ws://localhost:9000"

   # Use wss:// for production/secure
   "url": "wss://api.example.com"
   ```

3. **Remove spaces and special characters**:

   ```json
   # Before
   "url": "ws://my server.com/socket"

   # After
   "url": "ws://my-server.com/socket"
   ```

4. **Encode special characters** if needed:

   ```json
   # Use URL encoding for special characters
   "url": "ws://api.example.com/path%20with%20spaces"
   ```

5. **Fix protocol format**:

   ```json
   # Before (malformed)
   "url": "ws:/localhost:9000"

   # After (correct)
   "url": "ws://localhost:9000"
   ```

6. **Test URL validity**:

   ```bash
   # Test if URL is valid
   node -e "new URL('ws://localhost:9000')"

   # Test WebSocket connection (using wscat)
   npx wscat -c ws://localhost:9000
   ```

7. **Run validation**:

   ```bash
   claude-code-lint check-mcp
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid URLs will cause connection failures when Claude Code attempts to establish the WebSocket connection. URLs with environment variables are automatically skipped from validation, so there's no need to disable the rule for dynamic configurations.

## Related Rules

- [mcp-websocket-empty-url](./mcp-websocket-empty-url.md) - WebSocket URL emptiness check
- [mcp-websocket-invalid-protocol](./mcp-websocket-invalid-protocol.md) - WebSocket protocol validation
- [mcp-invalid-transport](./mcp-invalid-transport.md) - Transport configuration validation

## Resources

- [Rule Implementation](../../src/rules/mcp/mcp-websocket-invalid-url.ts)
- [Rule Tests](../../tests/rules/mcp/mcp-websocket-invalid-url.test.ts)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [WebSocket Protocol RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455)

## Version

Available since: v1.0.0
