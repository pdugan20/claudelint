# Rule: mcp-stdio-empty-command

**Severity**: Error
**Fixable**: No
**Validator**: MCP
**Category**: Schema Validation

MCP stdio transport command cannot be empty

## Rule Details

The stdio transport type connects to MCP servers by launching subprocess commands. The `command` field is required and must contain a non-empty executable name or path. An empty or whitespace-only command will cause the subprocess to fail to launch.

This rule validates that the `command` field in stdio transport configurations contains actual content, not empty strings or whitespace.

### Incorrect

Empty command string:

```json
{
  "mcpServers": {
    "local-server": {
      "name": "local-server",
      "transport": {
        "type": "stdio",
        "command": ""
      }
    }
  }
}
```

Whitespace-only command:

```json
{
  "mcpServers": {
    "python-server": {
      "name": "python-server",
      "transport": {
        "type": "stdio",
        "command": "   "
      }
    }
  }
}
```

Missing command property:

```json
{
  "mcpServers": {
    "node-server": {
      "name": "node-server",
      "transport": {
        "type": "stdio",
        "args": ["server.js"]
      }
    }
  }
}
```

### Correct

Simple command:

```json
{
  "mcpServers": {
    "node-server": {
      "name": "node-server",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["server.js"]
      }
    }
  }
}
```

Command with full path:

```json
{
  "mcpServers": {
    "python-server": {
      "name": "python-server",
      "transport": {
        "type": "stdio",
        "command": "/usr/bin/python3",
        "args": ["-m", "mcp_server"]
      }
    }
  }
}
```

Command with environment variable:

```json
{
  "mcpServers": {
    "custom-server": {
      "name": "custom-server",
      "transport": {
        "type": "stdio",
        "command": "${NODE_PATH}",
        "args": ["server.js"]
      }
    }
  }
}
```

Command with default fallback:

```json
{
  "mcpServers": {
    "flexible-server": {
      "name": "flexible-server",
      "transport": {
        "type": "stdio",
        "command": "${PYTHON_BIN:-python3}",
        "args": ["server.py"]
      }
    }
  }
}
```

Command without args:

```json
{
  "mcpServers": {
    "binary-server": {
      "name": "binary-server",
      "transport": {
        "type": "stdio",
        "command": "./bin/mcp-server"
      }
    }
  }
}
```

Command with environment variables:

```json
{
  "mcpServers": {
    "env-server": {
      "name": "env-server",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["server.js"],
        "env": {
          "NODE_ENV": "production",
          "PORT": "3000"
        }
      }
    }
  }
}
```

## How To Fix

To resolve empty command errors:

1. **Add a valid command** to the stdio transport:

   ```json
   # Before
   {
     "transport": {
       "type": "stdio",
       "command": ""
     }
   }

   # After
   {
     "transport": {
       "type": "stdio",
       "command": "node",
       "args": ["server.js"]
     }
   }
   ```

2. **Use the executable name** if it's in PATH:

   ```json
   {
     "transport": {
       "type": "stdio",
       "command": "python3",
       "args": ["-m", "mcp_server"]
     }
   }
   ```

3. **Use full path** for executables not in PATH:

   ```json
   {
     "transport": {
       "type": "stdio",
       "command": "/usr/local/bin/node",
       "args": ["server.js"]
     }
   }
   ```

4. **Use environment variable** for flexible configuration:

   ```json
   {
     "transport": {
       "type": "stdio",
       "command": "${NODE_BIN}",
       "args": ["server.js"]
     }
   }
   ```

5. **Include default value** for environment variables:

   ```json
   {
     "transport": {
       "type": "stdio",
       "command": "${NODE_BIN:-node}",
       "args": ["server.js"]
     }
   }
   ```

6. **Verify command exists**:

   ```bash
   # Check if command is in PATH
   which node
   which python3

   # Test command directly
   node --version
   python3 --version
   ```

7. **Run validation**:

   ```bash
   claudelint check-mcp
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. An empty command will cause the subprocess to fail to launch when Claude Code attempts to start the MCP server. Always provide a valid command rather than disabling validation.

## Related Rules

- [mcp-invalid-transport](./mcp-invalid-transport.md) - Transport configuration validation
- [mcp-invalid-env-var](./mcp-invalid-env-var.md) - Environment variable syntax

## Resources

- [Rule Implementation](../../src/rules/mcp/mcp-stdio-empty-command.ts)
- [Rule Tests](../../tests/rules/mcp/mcp-stdio-empty-command.test.ts)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## Version

Available since: v1.0.0
