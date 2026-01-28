# Rule: mcp-invalid-server

**Severity**: Error
**Fixable**: No
**Validator**: MCP
**Category**: Schema Validation

Validates that MCP server configurations have unique names and consistent key-name mappings within the configuration file.

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

## How To Fix

1. **Ensure unique names**: Give each server a distinct name that doesn't conflict with other servers
2. **Match keys to names**: Make the server object key match the `name` property value
3. **Use descriptive names**: Choose names that indicate the server's purpose (e.g., `file-operations`, `api-gateway`)
4. **Use kebab-case**: Follow consistent naming convention with hyphens for multi-word names
5. **Avoid generic names**: Use specific names like `github-api-gateway` instead of `api` or `server`

**Required Fields:**

- `name` (string): Unique identifier for the server
- `transport` (object): Transport configuration (stdio or sse)

**Naming Best Practices:**

- Descriptive: `file-operations` not `server1`
- Kebab-case: `code-analysis` not `CodeAnalysis` or `code_analysis`
- Specific: `postgres-tools` not `tools`

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
