# Rule: mcp-invalid-server

**Severity**: Error
**Fixable**: No
**Validator**: MCP
**Category**: Schema Validation

MCP server names must be unique

## Rule Details

MCP server configurations require unique names across all servers, and the server object key should match the server's name property for clarity and maintainability. Each server must have a `name` field and `transport` configuration.

This rule detects duplicate server names (error) and warns when server keys don't match their name properties. While key-name mismatches are only warnings, matching them improves clarity, searchability, and maintainability.

### Incorrect

Duplicate server names:

```json
{
  "mcpServers": {
    "server-1": {
      "name": "my-server",
      "transport": {
        "type": "stdio",
        "command": "node server1.js"
      }
    },
    "server-2": {
      "name": "my-server",
      "transport": {
        "type": "stdio",
        "command": "node server2.js"
      }
    }
  }
}
```

Key doesn't match name (warning):

```json
{
  "mcpServers": {
    "database-tools": {
      "name": "db-tools",
      "transport": {
        "type": "stdio",
        "command": "python db_server.py"
      }
    }
  }
}
```

### Correct

Unique names with matching keys:

```json
{
  "mcpServers": {
    "tools-server": {
      "name": "tools-server",
      "transport": {
        "type": "stdio",
        "command": "node tools.js"
      }
    },
    "api-server": {
      "name": "api-server",
      "transport": {
        "type": "sse",
        "url": "http://localhost:3000"
      }
    }
  }
}
```

Multiple servers with consistent naming:

```json
{
  "mcpServers": {
    "local-tools": {
      "name": "local-tools",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["./servers/tools.js"]
      }
    },
    "python-analyzer": {
      "name": "python-analyzer",
      "transport": {
        "type": "stdio",
        "command": "python",
        "args": ["-m", "analyzer"]
      }
    },
    "remote-api": {
      "name": "remote-api",
      "transport": {
        "type": "sse",
        "url": "https://api.example.com/mcp"
      }
    }
  }
}
```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid server configuration causes MCP server initialization failures, ambiguous server references, configuration conflicts, and runtime errors. Always fix server configuration issues rather than disabling validation.

## Related Rules

- [mcp-invalid-transport](./mcp-invalid-transport.md) - Transport configuration validation
- [mcp-invalid-env-var](./mcp-invalid-env-var.md) - Environment variable validation

## Resources

- [Implementation](../../../src/validators/mcp.ts)
- [Tests](../../../tests/validators/mcp.test.ts)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## Version

Available since: v1.0.0
