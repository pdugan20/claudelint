# Rule: mcp-invalid-env-var

**Severity**: Warning
**Fixable**: No
**Validator**: MCP
**Category**: Best Practices

Environment variables must use proper expansion syntax

## Rule Details

MCP configurations support environment variable expansion in transport fields (command, args, url) and env objects. This rule enforces proper variable syntax to prevent runtime expansion errors and promote consistency.

Supported variable syntax:

- `${VAR}` - Expands to environment variable value
- `${VAR:-default}` - Expands to value or uses default if unset
- `${CLAUDE_PLUGIN_ROOT}` - Special variable for plugin paths (always allowed)

The rule warns about:

- Simple format `$VAR` without braces (suggest using `${VAR}`)
- Empty variable names `${}`
- Empty env values

### Incorrect

Simple variable expansion without braces:

```json
{
  "mcpServers": {
    "local-server": {
      "name": "local-server",
      "transport": {
        "type": "stdio",
        "command": "$HOME/bin/server"
      }
    }
  }
}
```

Empty environment variable value:

```json
{
  "mcpServers": {
    "api-server": {
      "name": "api-server",
      "transport": {
        "type": "stdio",
        "command": "node server.js",
        "env": {
          "API_KEY": ""
        }
      }
    }
  }
}
```

Whitespace-only env value:

```json
{
  "mcpServers": {
    "db-server": {
      "name": "db-server",
      "transport": {
        "type": "stdio",
        "command": "python db.py",
        "env": {
          "DB_TOKEN": "   "
        }
      }
    }
  }
}
```

Empty variable name:

```json
{
  "mcpServers": {
    "tools-server": {
      "name": "tools-server",
      "transport": {
        "type": "stdio",
        "command": "${}/bin/server"
      }
    }
  }
}
```

### Correct

Proper variable expansion with braces:

```json
{
  "mcpServers": {
    "local-server": {
      "name": "local-server",
      "transport": {
        "type": "stdio",
        "command": "${HOME}/bin/server"
      }
    }
  }
}
```

Variable with default value:

```json
{
  "mcpServers": {
    "node-server": {
      "name": "node-server",
      "transport": {
        "type": "stdio",
        "command": "${NODE_PATH:-/usr/local/bin/node}",
        "args": ["server.js"]
      }
    }
  }
}
```

CLAUDE_PLUGIN_ROOT special variable:

```json
{
  "mcpServers": {
    "plugin-server": {
      "name": "plugin-server",
      "transport": {
        "type": "stdio",
        "command": "${CLAUDE_PLUGIN_ROOT}/bin/server"
      }
    }
  }
}
```

Valid environment variables:

```json
{
  "mcpServers": {
    "api-server": {
      "name": "api-server",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["server.js"],
        "env": {
          "NODE_ENV": "production",
          "API_KEY": "abc123",
          "LOG_LEVEL": "info"
        }
      }
    }
  }
}
```

Variables in URLs:

```json
{
  "mcpServers": {
    "http-server": {
      "name": "http-server",
      "transport": {
        "type": "http",
        "url": "${API_URL:-http://localhost:8080}"
      }
    }
  }
}
```

Variables in args array:

```json
{
  "mcpServers": {
    "python-server": {
      "name": "python-server",
      "transport": {
        "type": "stdio",
        "command": "python",
        "args": ["-m", "server", "--config", "${CONFIG_PATH}"]
      }
    }
  }
}
```

## How To Fix

To resolve environment variable syntax issues:

1. **Use braces for variable expansion**:

   ```json
   # Before (warning)
   {
     "command": "$HOME/bin/server"
   }

   # After
   {
     "command": "${HOME}/bin/server"
   }
   ```

2. **Add default values** for optional variables:

   ```json
   {
     "command": "${NODE_PATH:-/usr/local/bin/node}"
   }
   ```

3. **Remove empty env values**:

   ```json
   # Before (error)
   {
     "env": {
       "API_KEY": "",
       "LOG_LEVEL": "info"
     }
   }

   # After
   {
     "env": {
       "LOG_LEVEL": "info"
     }
   }
   ```

4. **Or provide actual values**:

   ```json
   {
     "env": {
       "API_KEY": "${API_KEY}",
       "LOG_LEVEL": "info"
     }
   }
   ```

5. **Fix empty variable names**:

   ```json
   # Before (error)
   {
     "command": "${}/bin/server"
   }

   # After
   {
     "command": "${BIN_DIR}/bin/server"
   }
   ```

6. **Verify environment variables** are set:

   ```bash
   # Check if variable is set
   echo $HOME
   echo $NODE_PATH

   # Set variable if needed
   export NODE_PATH=/usr/local/bin/node
   ```

7. **Run validation**:

   ```bash
   claudelint check-mcp
   ```

## Options

This rule has the following configuration options:

### `pattern`

Regular expression pattern that environment variable names must match. This enforces consistent naming conventions for your environment variables.

**Type**: `string` (regex pattern)
**Default**: `^[A-Z_][A-Z0-9_]*$` (uppercase with underscores)

**Schema**:

```typescript
{
  pattern: string // valid regex pattern
}
```

**Example configurations**:

Default pattern (uppercase only):

```json
{
  "rules": {
    "mcp-invalid-env-var": "warn"
  }
}
```

Custom pattern (allow lowercase):

```json
{
  "rules": {
    "mcp-invalid-env-var": ["warn", { "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$" }]
  }
}
```

Project-specific prefix:

```json
{
  "rules": {
    "mcp-invalid-env-var": ["warn", { "pattern": "^MY_APP_[A-Z_][A-Z0-9_]*$" }]
  }
}
```

**Note**: The special variable `CLAUDE_PLUGIN_ROOT` is always allowed regardless of the pattern setting.

## When Not To Use It

This rule promotes consistency and prevents common expansion errors. However, you might disable it if:

- Working with legacy configurations using `$VAR` format consistently
- Your shell/environment handles both `$VAR` and `${VAR}` identically
- Testing configurations with intentionally empty env values

To disable:

```json
{
  "rules": {
    "mcp-invalid-env-var": "off"
  }
}
```

## Related Rules

- [mcp-stdio-empty-command](./mcp-stdio-empty-command.md) - Command validation
- [mcp-http-invalid-url](./mcp-http-invalid-url.md) - HTTP URL validation
- [mcp-websocket-invalid-url](./mcp-websocket-invalid-url.md) - WebSocket URL validation

## Resources

- [Rule Implementation](../../src/rules/mcp/mcp-invalid-env-var.ts)
- [Rule Tests](../../tests/rules/mcp/mcp-invalid-env-var.test.ts)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## Version

Available since: v0.2.0
