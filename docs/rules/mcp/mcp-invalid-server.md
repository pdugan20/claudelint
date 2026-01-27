# Invalid Server

MCP server configuration is invalid.

## Rule Details

This rule enforces that MCP (Model Context Protocol) server configurations are properly structured with unique names and consistent key-name mappings. Each MCP server must have a unique name within the configuration file, and the server object key should match the server's name property for clarity and maintainability.

Server configuration errors include:

- Duplicate server names across multiple servers
- Server key doesn't match server name property
- Missing required server fields

**Category**: MCP
**Severity**: error
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Duplicate server names:

```json
{
  "mcpServers": {
    "server-1": {
      "name": "my-server",   Duplicate name
      "transport": {
        "type": "stdio",
        "command": "node server1.js"
      }
    },
    "server-2": {
      "name": "my-server",   Same name as server-1
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
      "name": "db-tools",   Key is "database-tools", name is "db-tools"
      "transport": {
        "type": "stdio",
        "command": "python db_server.py"
      }
    }
  }
}
```

### Correct Examples

Unique server names:

```json
{
  "mcpServers": {
    "tools-server": {
      "name": "tools-server",   Unique name, key matches
      "transport": {
        "type": "stdio",
        "command": "node tools.js"
      }
    },
    "api-server": {
      "name": "api-server",   Unique name, key matches
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

## Server Configuration Structure

### Required Fields

Every MCP server must have:

- **name**: String - Unique identifier for the server
- **transport**: Object - Transport configuration (stdio or sse)

### Naming Requirements

**Server names must be:**

- Unique within the configuration file
- Non-empty strings
- Ideally matching the server object key

### Example Structure

```json
{
  "mcpServers": {
    "<server-key>": {
      "name": "<server-key>",  // Should match the key
      "transport": {
        // Transport configuration here
      }
    }
  }
}
```

## Why Keys Should Match Names

While it's only a warning if keys don't match names, following this convention provides benefits:

**Clarity**: It's immediately clear which server configuration you're looking at

```json
{
  "mcpServers": {
    "api-gateway": {
      "name": "api-gateway"  // Clear and consistent
    }
  }
}
```

**Maintainability**: Easier to reference servers in documentation and logs

```json
{
  "mcpServers": {
    "tools": {
      "name": "tools"  // Simple to reference
    }
  }
}
```

**Searchability**: Easier to find server configurations when key and name match

## How To Fix

### Option 1: Fix duplicate names

```json
# Before - duplicate names
{
  "mcpServers": {
    "server-1": {
      "name": "my-server"
    },
    "server-2": {
      "name": "my-server"  // Duplicate
    }
  }
}

# After - unique names
{
  "mcpServers": {
    "server-1": {
      "name": "tools-server"
    },
    "server-2": {
      "name": "api-server"
    }
  }
}
```

### Option 2: Match key to name

```json
# Before - mismatched
{
  "mcpServers": {
    "database-tools": {
      "name": "db-tools"
    }
  }
}

# After - matched (option A: change name)
{
  "mcpServers": {
    "database-tools": {
      "name": "database-tools"
    }
  }
}

# After - matched (option B: change key)
{
  "mcpServers": {
    "db-tools": {
      "name": "db-tools"
    }
  }
}
```

### Option 3: Rename for clarity

```json
# Before - ambiguous names
{
  "mcpServers": {
    "server1": {
      "name": "server1"
    },
    "server2": {
      "name": "server2"
    }
  }
}

# After - descriptive names
{
  "mcpServers": {
    "file-operations": {
      "name": "file-operations"
    },
    "api-gateway": {
      "name": "api-gateway"
    }
  }
}
```

## Complete Examples

### Development Environment

```json
{
  "mcpServers": {
    "local-tools": {
      "name": "local-tools",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["./dev/tools-server.js"],
        "env": {
          "NODE_ENV": "development",
          "DEBUG": "true"
        }
      }
    },
    "test-api": {
      "name": "test-api",
      "transport": {
        "type": "sse",
        "url": "http://localhost:3000/mcp"
      }
    }
  }
}
```

### Production Environment

```json
{
  "mcpServers": {
    "production-tools": {
      "name": "production-tools",
      "transport": {
        "type": "stdio",
        "command": "/usr/local/bin/mcp-tools",
        "args": ["--production"],
        "env": {
          "NODE_ENV": "production"
        }
      }
    },
    "api-gateway": {
      "name": "api-gateway",
      "transport": {
        "type": "sse",
        "url": "https://mcp.example.com/stream",
        "env": {
          "API_KEY": "${MCP_API_KEY}"
        }
      }
    }
  }
}
```

### Multi-Purpose Setup

```json
{
  "mcpServers": {
    "file-operations": {
      "name": "file-operations",
      "transport": {
        "type": "stdio",
        "command": "python",
        "args": ["-m", "mcp_file_server"]
      }
    },
    "code-analysis": {
      "name": "code-analysis",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["./servers/analyzer.js"]
      }
    },
    "external-api": {
      "name": "external-api",
      "transport": {
        "type": "sse",
        "url": "https://api.example.com/mcp"
      }
    },
    "database-tools": {
      "name": "database-tools",
      "transport": {
        "type": "stdio",
        "command": "python",
        "args": ["-m", "db_tools"],
        "env": {
          "DATABASE_URL": "${DATABASE_URL}"
        }
      }
    }
  }
}
```

## Naming Best Practices

### Use Descriptive Names

**Good:**

```json
{
  "file-operations": { "name": "file-operations" },
  "api-gateway": { "name": "api-gateway" },
  "database-tools": { "name": "database-tools" }
}
```

**Avoid:**

```json
{
  "server1": { "name": "server1" },
  "mcp": { "name": "mcp" },
  "test": { "name": "test" }
}
```

### Use Kebab-Case

**Good:**

```json
{
  "code-analysis-tools": { "name": "code-analysis-tools" },
  "remote-api-gateway": { "name": "remote-api-gateway" }
}
```

**Avoid:**

```json
{
  "CodeAnalysisTools": { "name": "CodeAnalysisTools" },
  "remote_api_gateway": { "name": "remote_api_gateway" }
}
```

### Be Specific About Purpose

**Good:**

```json
{
  "python-linter": { "name": "python-linter" },
  "postgres-tools": { "name": "postgres-tools" },
  "github-integration": { "name": "github-integration" }
}
```

**Avoid:**

```json
{
  "tools": { "name": "tools" },
  "helper": { "name": "helper" },
  "integration": { "name": "integration" }
}
```

## Common Mistakes

### Mistake 1: Reusing server names

```json
# Wrong - same name for different servers
{
  "mcpServers": {
    "local-server": {
      "name": "tools",
      "transport": { "type": "stdio", "command": "node tools.js" }
    },
    "remote-server": {
      "name": "tools",  // Duplicate name causes error
      "transport": { "type": "sse", "url": "http://example.com" }
    }
  }
}

# Correct - unique names
{
  "mcpServers": {
    "local-server": {
      "name": "local-tools",
      "transport": { "type": "stdio", "command": "node tools.js" }
    },
    "remote-server": {
      "name": "remote-tools",
      "transport": { "type": "sse", "url": "http://example.com" }
    }
  }
}
```

### Mistake 2: Inconsistent key-name mapping

```json
# Wrong - confusing mismatches
{
  "mcpServers": {
    "server_1": {
      "name": "api-gateway"  // Key uses underscores, name uses hyphens
    },
    "DatabaseServer": {
      "name": "database-tools"  // Key uses PascalCase, name uses kebab-case
    }
  }
}

# Correct - consistent naming
{
  "mcpServers": {
    "api-gateway": {
      "name": "api-gateway"
    },
    "database-tools": {
      "name": "database-tools"
    }
  }
}
```

### Mistake 3: Generic names for specific purposes

```json
# Wrong - unclear purpose
{
  "mcpServers": {
    "server": {
      "name": "server"  // What does this server do?
    },
    "api": {
      "name": "api"  // Which API?
    }
  }
}

# Correct - clear purpose
{
  "mcpServers": {
    "file-operations-server": {
      "name": "file-operations-server"
    },
    "github-api-gateway": {
      "name": "github-api-gateway"
    }
  }
}
```

## Validation Checklist

Before deploying MCP configurations, verify:

- [ ] All server names are unique
- [ ] Server keys match server name properties
- [ ] Names are descriptive and indicate purpose
- [ ] Names use consistent formatting (kebab-case recommended)
- [ ] No empty or whitespace-only names
- [ ] Names don't contain special characters that could cause issues

## Options

This rule does not have any configuration options.

## When Not To Use It

You should **never** disable this rule. Invalid server configuration will cause:

- MCP server initialization failures
- Ambiguous server references
- Configuration conflicts
- Runtime errors

Always fix server configuration issues rather than disabling this rule.

## Configuration

This rule should not be disabled, but if absolutely necessary:

```json
{
  "rules": {
    "mcp-invalid-server": "off"
  }
}
```

To change to a warning (not recommended):

```json
{
  "rules": {
    "mcp-invalid-server": "warning"
  }
}
```

## Related Rules

- [mcp-invalid-transport](./mcp-invalid-transport.md) - Transport configuration validation
- [mcp-invalid-env-var](./mcp-invalid-env-var.md) - Environment variable validation

## Resources

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [MCP Server Configuration](https://spec.modelcontextprotocol.io/specification/server/)

## Version

Available since: v1.0.0
