# Rule: mcp-http-invalid-url

**Severity**: Error
**Fixable**: No
**Validator**: MCP
**Category**: Schema Validation

MCP HTTP transport URL must be valid format

## Rule Details

HTTP transport URLs must be valid, well-formed URLs that can be parsed by standard URL parsers. Invalid URLs will cause connection errors when Claude Code attempts to establish HTTP transport to the MCP server.

This rule validates URL syntax using JavaScript's URL constructor. URLs containing environment variables (${VAR} or $VAR syntax) skip validation since they will be expanded at runtime.

### Incorrect

Missing protocol:

```json
{
  "mcpServers": {
    "api-server": {
      "name": "api-server",
      "transport": {
        "type": "http",
        "url": "localhost:8080"
      }
    }
  }
}
```

Invalid protocol for HTTP transport:

```json
{
  "mcpServers": {
    "web-service": {
      "name": "web-service",
      "transport": {
        "type": "http",
        "url": "ftp://server.com/api"
      }
    }
  }
}
```

Malformed URL:

```json
{
  "mcpServers": {
    "broken-api": {
      "name": "broken-api",
      "transport": {
        "type": "http",
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
    "local-api": {
      "name": "local-api",
      "transport": {
        "type": "http",
        "url": "http://localhost:8080"
      }
    }
  }
}
```

Valid HTTPS URL:

```json
{
  "mcpServers": {
    "secure-api": {
      "name": "secure-api",
      "transport": {
        "type": "http",
        "url": "https://api.example.com/mcp"
      }
    }
  }
}
```

URL with port and path:

```json
{
  "mcpServers": {
    "custom-api": {
      "name": "custom-api",
      "transport": {
        "type": "http",
        "url": "http://localhost:3000/api/v1/mcp"
      }
    }
  }
}
```

URL with environment variable (skips validation):

```json
{
  "mcpServers": {
    "dynamic-api": {
      "name": "dynamic-api",
      "transport": {
        "type": "http",
        "url": "${API_BASE_URL}/mcp"
      }
    }
  }
}
```

URL with variable and default:

```json
{
  "mcpServers": {
    "configurable-api": {
      "name": "configurable-api",
      "transport": {
        "type": "http",
        "url": "${MCP_URL:-http://localhost:8080}"
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
       "type": "http",
       "url": "localhost:8080"
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

2. **Use http:// or https://** for HTTP transport:

   ```json
   # Use http:// for local development
   "url": "http://localhost:3000"

   # Use https:// for production/remote
   "url": "https://api.example.com"
   ```

3. **Remove spaces and special characters**:

   ```json
   # Before
   "url": "http://my server.com/api"

   # After
   "url": "http://my-server.com/api"
   ```

4. **Encode special characters** if needed:

   ```json
   # Use URL encoding for special characters
   "url": "http://api.example.com/path%20with%20spaces"
   ```

5. **Test URL validity**:

   ```bash
   # Test if URL is valid
   node -e "new URL('http://localhost:8080')"
   ```

6. **Run validation**:

   ```bash
   claude-code-lint check-mcp
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid URLs will cause connection failures when Claude Code attempts to connect to the MCP server. URLs with environment variables are automatically skipped from validation, so there's no need to disable the rule for dynamic configurations.

## Related Rules

- [mcp-http-empty-url](./mcp-http-empty-url.md) - HTTP URL emptiness check
- [mcp-invalid-transport](./mcp-invalid-transport.md) - Transport configuration validation
- [mcp-invalid-env-var](./mcp-invalid-env-var.md) - Environment variable syntax

## Resources

- [Rule Implementation](../../src/rules/mcp/mcp-http-invalid-url.ts)
- [Rule Tests](../../tests/rules/mcp/mcp-http-invalid-url.test.ts)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## Version

Available since: v1.0.0
