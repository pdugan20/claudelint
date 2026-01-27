# Invalid Environment Variable

Environment variable usage or expansion is invalid.

## Rule Details

This rule enforces that environment variables in MCP transport configurations use proper expansion syntax and don't have empty values. Environment variables are commonly used to provide dynamic configuration values like API keys, URLs, and paths.

This rule checks for:

- **Empty variable values**: Variables shouldn't be empty or whitespace-only
- **Malformed expansion syntax**: Variables should use proper `${VAR}` format
- **Invalid variable names**: Variable names should follow proper naming conventions

**Category**: MCP
**Severity**: warning
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Empty environment variable value:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "stdio",
        "command": "node server.js",
        "env": {
          "API_KEY": "",   Empty value
          "DATABASE_URL": "   "   Whitespace only
        }
      }
    }
  }
}
```

Simple variable expansion (warning):

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "stdio",
        "command": "$HOME/bin/server",   Use ${HOME} instead
        "env": {
          "PATH": "$PATH:/usr/local/bin"   Use ${PATH} instead
        }
      }
    }
  }
}
```

Invalid variable expansion:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["${}", "${VAR"]   Invalid syntax
      }
    }
  }
}
```

### Correct Examples

Proper variable expansion:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["server.js"],
        "env": {
          "API_KEY": "${API_KEY}",
          "DATABASE_URL": "${DATABASE_URL}",
          "LOG_LEVEL": "info"
        }  
      }
    }
  }
}
```

Variable expansion with defaults:

```json
{
  "mcpServers": {
    "my-server": {
      "name": "my-server",
      "transport": {
        "type": "sse",
        "url": "${MCP_URL:-http://localhost:3000}",
        "env": {
          "NODE_ENV": "${NODE_ENV:-development}",
          "DEBUG": "${DEBUG:-false}"
        }  
      }
    }
  }
}
```

Special plugin variables:

```json
{
  "mcpServers": {
    "plugin-server": {
      "name": "plugin-server",
      "transport": {
        "type": "stdio",
        "command": "${CLAUDE_PLUGIN_ROOT}/bin/server",  
        "env": {
          "PLUGIN_ROOT": "${CLAUDE_PLUGIN_ROOT}"
        }
      }
    }
  }
}
```

Non-empty literal values:

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
          "NODE_ENV": "production",
          "LOG_LEVEL": "info",
          "ENABLE_CACHE": "true"
        }  
      }
    }
  }
}
```

## Variable Expansion Syntax

### Valid Formats

**Basic expansion:**

```json
{
  "env": {
    "API_KEY": "${API_KEY}",
    "DATABASE_URL": "${DATABASE_URL}"
  }
}
```

**With default values:**

```json
{
  "env": {
    "PORT": "${PORT:-3000}",
    "HOST": "${HOST:-localhost}"
  }
}
```

**In commands and arguments:**

```json
{
  "command": "${MCP_BINARY}",
  "args": ["--config", "${CONFIG_PATH}"]
}
```

**In URLs:**

```json
{
  "url": "${MCP_SERVER_URL}/stream"
}
```

### Special Variables

**CLAUDE_PLUGIN_ROOT**: Automatically set by Claude Code for plugins

```json
{
  "command": "${CLAUDE_PLUGIN_ROOT}/bin/server",
  "env": {
    "DATA_DIR": "${CLAUDE_PLUGIN_ROOT}/data"
  }
}
```

### Simple Variable Warning

The validator warns about `$VAR` syntax (without braces) and recommends using `${VAR}`:

```text
$HOME         →  ${HOME}
$PATH         →  ${PATH}
$API_KEY      →  ${API_KEY}
```

This ensures consistent, unambiguous variable expansion across all shells and platforms.

## How To Fix

### Option 1: Remove empty variables

```json
# Before - has empty value
{
  "env": {
    "API_KEY": "",
    "DATABASE_URL": "${DATABASE_URL}"
  }
}

# After - empty variable removed
{
  "env": {
    "DATABASE_URL": "${DATABASE_URL}"
  }
}
```

### Option 2: Use variable expansion for secrets

```json
# Before - empty placeholder
{
  "env": {
    "API_KEY": ""
  }
}

# After - proper expansion
{
  "env": {
    "API_KEY": "${API_KEY}"
  }
}
```

### Option 3: Fix simple variable syntax

```json
# Before - simple $VAR syntax
{
  "command": "$HOME/bin/mcp-server",
  "env": {
    "PATH": "$PATH:/usr/local/bin"
  }
}

# After - proper ${VAR} syntax
{
  "command": "${HOME}/bin/mcp-server",
  "env": {
    "PATH": "${PATH}:/usr/local/bin"
  }
}
```

### Option 4: Add default values

```json
# Before - required variable
{
  "env": {
    "PORT": "${PORT}"
  }
}

# After - with fallback
{
  "env": {
    "PORT": "${PORT:-3000}"
  }
}
```

### Option 5: Use literal values for non-secrets

```json
# Before - unnecessary expansion
{
  "env": {
    "NODE_ENV": "${NODE_ENV}",
    "LOG_LEVEL": "${LOG_LEVEL}"
  }
}

# After - literal values for known configs
{
  "env": {
    "NODE_ENV": "production",
    "LOG_LEVEL": "info"
  }
}
```

## Complete Examples

### Development Configuration

```json
{
  "mcpServers": {
    "dev-tools": {
      "name": "dev-tools",
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["./dev/server.js"],
        "env": {
          "NODE_ENV": "development",
          "DEBUG": "true",
          "LOG_LEVEL": "verbose",
          "API_KEY": "${DEV_API_KEY}",
          "DATABASE_URL": "${DEV_DATABASE_URL:-postgresql://localhost/dev}"
        }
      }
    }
  }
}
```

### Production Configuration

```json
{
  "mcpServers": {
    "prod-tools": {
      "name": "prod-tools",
      "transport": {
        "type": "sse",
        "url": "${MCP_SERVER_URL}",
        "env": {
          "NODE_ENV": "production",
          "DEBUG": "false",
          "LOG_LEVEL": "error",
          "API_KEY": "${API_KEY}",
          "DATABASE_URL": "${DATABASE_URL}"
        }
      }
    }
  }
}
```

### Plugin Configuration

```json
{
  "mcpServers": {
    "plugin-tools": {
      "name": "plugin-tools",
      "transport": {
        "type": "stdio",
        "command": "${CLAUDE_PLUGIN_ROOT}/bin/server.sh",
        "env": {
          "PLUGIN_ROOT": "${CLAUDE_PLUGIN_ROOT}",
          "DATA_DIR": "${CLAUDE_PLUGIN_ROOT}/data",
          "CONFIG_FILE": "${CLAUDE_PLUGIN_ROOT}/config.json"
        }
      }
    }
  }
}
```

### Multi-Environment Configuration

```json
{
  "mcpServers": {
    "api-server": {
      "name": "api-server",
      "transport": {
        "type": "sse",
        "url": "${API_URL:-http://localhost:3000}",
        "env": {
          "NODE_ENV": "${NODE_ENV:-development}",
          "API_KEY": "${API_KEY}",
          "TIMEOUT": "${TIMEOUT:-30000}",
          "RETRY_ATTEMPTS": "${RETRY_ATTEMPTS:-3}"
        }
      }
    }
  }
}
```

## Environment Variable Best Practices

### 1. Use expansion for secrets and dynamic values

```json
{
  "env": {
    "API_KEY": "${API_KEY}",          // Secret
    "DATABASE_URL": "${DATABASE_URL}", // Dynamic
    "USER_HOME": "${HOME}"             // System variable
  }
}
```

### 2. Use literals for static configuration

```json
{
  "env": {
    "NODE_ENV": "production",         // Static
    "LOG_LEVEL": "info",              // Static
    "ENABLE_METRICS": "true"          // Static
  }
}
```

### 3. Provide defaults for optional variables

```json
{
  "env": {
    "PORT": "${PORT:-3000}",
    "HOST": "${HOST:-0.0.0.0}",
    "TIMEOUT": "${TIMEOUT:-5000}"
  }
}
```

### 4. Keep sensitive values out of config files

```json
# Don't do this
{
  "env": {
    "API_KEY": "sk-1234567890abcdef"  // Hardcoded secret
  }
}

# Do this instead
{
  "env": {
    "API_KEY": "${API_KEY}"  // References environment
  }
}
```

Then set in your shell:

```bash
export API_KEY="sk-1234567890abcdef"
```

### 5. Document required variables

Create a `.env.example` file:

```bash
# Required MCP server environment variables

# API Configuration
API_KEY=your-api-key-here
DATABASE_URL=postgresql://localhost/mydb

# Optional Configuration (with defaults)
PORT=3000
LOG_LEVEL=info
DEBUG=false
```

## Common Mistakes

### Mistake 1: Empty variable values

```json
# Wrong - empty values provide no information
{
  "env": {
    "API_KEY": "",
    "DATABASE_URL": ""
  }
}

# Correct - either use expansion or remove
{
  "env": {
    "API_KEY": "${API_KEY}"
  }
}
```

### Mistake 2: Inconsistent expansion syntax

```json
# Wrong - mixing styles
{
  "command": "$HOME/bin/server",
  "env": {
    "PATH": "$PATH:/bin",
    "API_KEY": "${API_KEY}"
  }
}

# Correct - consistent ${VAR} style
{
  "command": "${HOME}/bin/server",
  "env": {
    "PATH": "${PATH}:/bin",
    "API_KEY": "${API_KEY}"
  }
}
```

### Mistake 3: Hardcoding secrets

```json
# Wrong - secrets in config file
{
  "env": {
    "API_KEY": "sk-1234567890",
    "DB_PASSWORD": "MyPassword123"
  }
}

# Correct - reference environment
{
  "env": {
    "API_KEY": "${API_KEY}",
    "DB_PASSWORD": "${DB_PASSWORD}"
  }
}
```

### Mistake 4: Missing defaults for optional vars

```json
# Wrong - will fail if variable not set
{
  "env": {
    "OPTIONAL_FEATURE": "${OPTIONAL_FEATURE}"
  }
}

# Correct - provide sensible default
{
  "env": {
    "OPTIONAL_FEATURE": "${OPTIONAL_FEATURE:-false}"
  }
}
```

## Validation Checklist

Before deploying MCP configurations, verify:

- [ ] No empty or whitespace-only environment variable values
- [ ] Variable expansion uses `${VAR}` format, not `$VAR`
- [ ] Secrets use variable expansion, not hardcoded values
- [ ] Optional variables have default values
- [ ] Required variables are documented
- [ ] Variable names follow conventions (UPPERCASE_WITH_UNDERSCORES)

## Options

This rule does not have any configuration options.

## When Not To Use It

You might disable this rule if:

- You're using a configuration system that doesn't support variable expansion
- You have non-standard variable expansion needs
- You're generating configurations programmatically

However, following standard variable expansion practices benefits all projects.

## Configuration

To disable this rule:

```json
{
  "rules": {
    "mcp-invalid-env-var": "off"
  }
}
```

To escalate to an error:

```json
{
  "rules": {
    "mcp-invalid-env-var": "error"
  }
}
```

## Related Rules

- [mcp-invalid-transport](./mcp-invalid-transport.md) - Transport configuration validation
- [mcp-invalid-server](./mcp-invalid-server.md) - Server configuration validation
- [settings-invalid-env-var](../settings/settings-invalid-env-var.md) - Settings environment variable validation

## Resources

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Environment Variables Best Practices](https://12factor.net/config)
- [Bash Parameter Expansion](https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html)

## Version

Available since: v1.0.0
