# Rule: mcp-http-empty-url

**Severity**: Error
**Fixable**: No
**Validator**: MCP
**Category**: Schema Validation

MCP HTTP transport URL cannot be empty

## Rule Details

HTTP transport configurations must include a non-empty URL. The URL specifies where Claude Code should connect to reach the MCP server. An empty or whitespace-only URL will cause connection failures when Claude Code attempts to establish the HTTP transport.

This rule validates that the `url` field in HTTP transport configurations contains actual content, not empty strings or whitespace.

### Incorrect

Empty URL string:

```json
{
  "mcpServers": {
    "api-server": {
      "name": "api-server",
      "transport": {
        "type": "http",
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
    "web-service": {
      "name": "web-service",
      "transport": {
        "type": "http",
        "url": "   "
      }
    }
  }
}
```

Missing URL property triggers other rules:

```json
{
  "mcpServers": {
    "remote-api": {
      "name": "remote-api",
      "transport": {
        "type": "http"
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
    "api-server": {
      "name": "api-server",
      "transport": {
        "type": "http",
        "url": "http://localhost:8080"
      }
    }
  }
}
```

HTTPS URL with path:

```json
{
  "mcpServers": {
    "remote-api": {
      "name": "remote-api",
      "transport": {
        "type": "http",
        "url": "https://api.example.com/mcp/v1"
      }
    }
  }
}
```

URL with environment variable:

```json
{
  "mcpServers": {
    "configurable-api": {
      "name": "configurable-api",
      "transport": {
        "type": "http",
        "url": "${API_URL}"
      }
    }
  }
}
```

URL with default fallback:

```json
{
  "mcpServers": {
    "flexible-api": {
      "name": "flexible-api",
      "transport": {
        "type": "http",
        "url": "${API_URL:-http://localhost:3000}"
      }
    }
  }
}
```

## How To Fix

To resolve empty URL errors:

1. **Add a valid URL** to the HTTP transport:
   ```json
   # Before
   {
     "transport": {
       "type": "http",
       "url": ""
     }
   }

   # After
   {
     "transport": {
       "type": "http",
       "url": "http://localhost:8080"
     }
   }
   ```

2. **Use environment variable** for configurable URLs:
   ```json
   {
     "transport": {
       "type": "http",
       "url": "${MCP_SERVER_URL}"
     }
   }
   ```

3. **Include a default value** for environment variables:
   ```json
   {
     "transport": {
       "type": "http",
       "url": "${MCP_SERVER_URL:-http://localhost:8080}"
     }
   }
   ```

4. **Ensure URL includes protocol**:
   - Use `http://` for local/development servers
   - Use `https://` for production/remote servers
   - Include port if not using standard ports (80/443)

5. **Run validation**:
   ```bash
   claudelint check-mcp
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. An empty HTTP URL will cause immediate connection failures when Claude Code attempts to connect to the MCP server. Always provide a valid URL rather than disabling validation.

## Related Rules

- [mcp-http-invalid-url](./mcp-http-invalid-url.md) - HTTP URL format validation
- [mcp-invalid-transport](./mcp-invalid-transport.md) - Transport configuration validation
- [mcp-invalid-env-var](./mcp-invalid-env-var.md) - Environment variable syntax

## Resources

- [Rule Implementation](../../src/rules/mcp/mcp-http-empty-url.ts)
- [Rule Tests](../../tests/rules/mcp/mcp-http-empty-url.test.ts)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## Version

Available since: v1.0.0
