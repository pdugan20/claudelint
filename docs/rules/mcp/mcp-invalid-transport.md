# Invalid Transport

MCP transport configuration is invalid.

## Rule Details

This rule enforces that MCP (Model Context Protocol) server transport configurations are properly structured with valid types and required fields. MCP servers can use either stdio or SSE (Server-Sent Events) transport, each with specific configuration requirements.

Transport configuration errors include:

- Invalid transport type (must be "stdio" or "sse")
- Empty command in stdio transport
- Empty URL in SSE transport
- Invalid URL format in SSE transport
- Improperly formatted variable expansion

**Category**: MCP
**Severity**: error
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Invalid transport type:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "http",   Invalid type (must be: stdio or sse)
        "url": "http://localhost:3000"
      }
    }
  }
}
```

Empty command in stdio transport:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "stdio",
        "command": ""   Command cannot be empty
      }
    }
  }
}
```

Empty URL in SSE transport:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "sse",
        "url": ""   URL cannot be empty
      }
    }
  }
}
```

Invalid URL format:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "sse",
        "url": "not-a-valid-url"   Invalid URL format
      }
    }
  }
}
```

### Correct Examples

Valid stdio transport:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["server.js"]  
      }
    }
  }
}
```

Valid stdio transport with environment variables:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "stdio",
        "command": "python",
        "args": ["-m", "mcp_server"],
        "env": {
          "MCP_LOG_LEVEL": "debug"
        }  
      }
    }
  }
}
```

Valid SSE transport:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "sse",
        "url": "http://localhost:3000/sse"  
      }
    }
  }
}
```

Valid SSE transport with variable expansion:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "sse",
        "url": "${MCP_SERVER_URL}",
        "env": {
          "API_KEY": "${API_KEY}"
        }  
      }
    }
  }
}
```

## Transport Types

### Type: "stdio"

Launches an MCP server as a subprocess using standard input/output for communication.

**Required fields:**

- `command`: String - Command to execute (cannot be empty)

**Optional fields:**

- `args`: Array of strings - Command arguments
- `env`: Object - Environment variables

**Example:**

```json
{
  "transport": {
    "type": "stdio",
    "command": "node",
    "args": ["./dist/server.js", "--port", "3000"],
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

### Type: "sse"

Connects to an MCP server via Server-Sent Events over HTTP.

**Required fields:**

- `url`: String - Server URL (cannot be empty, must be valid URL)

**Optional fields:**

- `env`: Object - Environment variables

**Example:**

```json
{
  "transport": {
    "type": "sse",
    "url": "https://api.example.com/mcp",
    "env": {
      "API_KEY": "${API_KEY}"
    }
  }
}
```

## Variable Expansion

Transport configurations support variable expansion for dynamic values.

### Valid Formats

**${VAR} syntax (recommended):**

```json
{
  "command": "${MCP_BINARY}",
  "url": "${MCP_URL}"
}
```

**${VAR:-default} syntax (with default):**

```json
{
  "url": "${MCP_URL:-http://localhost:3000}"
}
```

**Special variables:**

```json
{
  "command": "${CLAUDE_PLUGIN_ROOT}/bin/server"
}
```

### Simple Variable Warning

The validator warns about simple `$VAR` syntax and recommends `${VAR}`:

```json
{
  "command": "$HOME/bin/server"   Use ${HOME}/bin/server instead
}
```

## How To Fix

### Option 1: Fix invalid transport type

```json
# Before - invalid type
{
  "transport": {
    "type": "http"
  }
}

# After - valid type
{
  "transport": {
    "type": "sse",
    "url": "http://localhost:3000"
  }
}
```

### Option 2: Add required command

```json
# Before - empty command
{
  "transport": {
    "type": "stdio",
    "command": ""
  }
}

# After - has command
{
  "transport": {
    "type": "stdio",
    "command": "node",
    "args": ["server.js"]
  }
}
```

### Option 3: Add required URL

```json
# Before - empty URL
{
  "transport": {
    "type": "sse",
    "url": ""
  }
}

# After - has URL
{
  "transport": {
    "type": "sse",
    "url": "http://localhost:3000/sse"
  }
}
```

### Option 4: Fix URL format

```json
# Before - invalid URL
{
  "transport": {
    "type": "sse",
    "url": "localhost"
  }
}

# After - valid URL
{
  "transport": {
    "type": "sse",
    "url": "http://localhost:3000"
  }
}
```

### Option 5: Use proper variable expansion

```json
# Before - simple variable syntax
{
  "command": "$HOME/bin/mcp"
}

# After - proper expansion syntax
{
  "command": "${HOME}/bin/mcp"
}
```

## Complete Examples

### Local Node.js MCP Server (stdio)

```json
{
  "mcpServers": {
    "local-tools": {
      "name": "local-tools",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["./mcp-servers/tools/index.js"],
        "env": {
          "LOG_LEVEL": "info"
        }
      }
    }
  }
}
```

### Python MCP Server (stdio)

```json
{
  "mcpServers": {
    "python-analyzer": {
      "name": "python-analyzer",
      "transport": {
        "type": "stdio",
        "command": "python",
        "args": ["-m", "mcp_analyzer"],
        "env": {
          "PYTHONPATH": "${PROJECT_ROOT}/lib"
        }
      }
    }
  }
}
```

### Remote MCP Server (sse)

```json
{
  "mcpServers": {
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

### Development vs Production

```json
{
  "mcpServers": {
    "app-server": {
      "name": "app-server",
      "transport": {
        "type": "sse",
        "url": "${MCP_SERVER_URL:-http://localhost:3000}",
        "env": {
          "NODE_ENV": "${NODE_ENV:-development}",
          "API_KEY": "${API_KEY}"
        }
      }
    }
  }
}
```

## Common Mistakes

### Mistake 1: Using unsupported transport type

```json
# Wrong - WebSocket not supported
{
  "transport": {
    "type": "websocket",
    "url": "ws://localhost:3000"
  }
}

# Correct - Use SSE for HTTP-based transport
{
  "transport": {
    "type": "sse",
    "url": "http://localhost:3000"
  }
}
```

### Mistake 2: Empty values in required fields

```json
# Wrong - command is empty string
{
  "transport": {
    "type": "stdio",
    "command": "",
    "args": ["server.js"]
  }
}

# Correct - command has value
{
  "transport": {
    "type": "stdio",
    "command": "node",
    "args": ["server.js"]
  }
}
```

### Mistake 3: Invalid URL format

```json
# Wrong - missing protocol
{
  "transport": {
    "type": "sse",
    "url": "localhost:3000"
  }
}

# Correct - full URL with protocol
{
  "transport": {
    "type": "sse",
    "url": "http://localhost:3000"
  }
}
```

### Mistake 4: Wrong transport type for use case

```json
# Wrong - trying to use stdio for remote server
{
  "transport": {
    "type": "stdio",
    "command": "http://remote-server.com"  // This is a URL, not a command
  }
}

# Correct - use SSE for remote servers
{
  "transport": {
    "type": "sse",
    "url": "http://remote-server.com/sse"
  }
}
```

## Validation Checklist

Before deploying MCP configurations, verify:

- [ ] Transport type is either "stdio" or "sse"
- [ ] stdio transport has non-empty command
- [ ] sse transport has non-empty, valid URL
- [ ] Variable expansion uses ${VAR} format
- [ ] Environment variables are properly formatted
- [ ] URLs include protocol (http:// or https://)
- [ ] Commands reference executable files or binaries

## Options

This rule does not have any configuration options.

## When Not To Use It

You should **never** disable this rule. Invalid transport configuration will cause:

- MCP server connection failures
- Runtime errors
- Silent failures with no MCP functionality
- Difficult debugging

Always fix transport configuration issues rather than disabling this rule.

## Configuration

This rule should not be disabled, but if absolutely necessary:

```json
{
  "rules": {
    "mcp-invalid-transport": "off"
  }
}
```

To change to a warning (not recommended):

```json
{
  "rules": {
    "mcp-invalid-transport": "warning"
  }
}
```

## Related Rules

- [mcp-invalid-server](./mcp-invalid-server.md) - MCP server configuration validation
- [mcp-invalid-env-var](./mcp-invalid-env-var.md) - Environment variable validation

## Resources

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [MCP Transport Types](https://spec.modelcontextprotocol.io/specification/architecture/#transports)
- [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

## Version

Available since: v1.0.0
