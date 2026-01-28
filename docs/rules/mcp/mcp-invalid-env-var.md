# Rule: mcp-invalid-env-var

**Severity**: Warning
**Fixable**: No
**Validator**: MCP
**Category**: Schema Validation

Detects invalid environment variable usage in MCP server configurations, including empty values, malformed expansion syntax, and improper variable naming.

## Rule Details

Environment variables in MCP transport configurations must use proper expansion syntax and cannot be empty. This rule ensures consistent, secure handling of configuration values like API keys, URLs, and paths across different shells and platforms.

The rule checks for empty or whitespace-only values, malformed `${VAR}` expansion syntax, and recommends using `${VAR}` instead of simple `$VAR` format for consistency.

### Incorrect

Empty environment variable value:

```json
{
  "mcpServers": {
    "my-server": {
      "transport": {
        "type": "stdio",
        "command": "node server.js",
        "env": {
          "API_KEY": "",
          "DATABASE_URL": "   "
        }
      }
    }
  }
}
```

Simple variable expansion (should use braces):

```json
{
  "mcpServers": {
    "my-server": {
      "transport": {
        "type": "stdio",
        "command": "$HOME/bin/server",
        "env": {
          "PATH": "$PATH:/usr/local/bin"
        }
      }
    }
  }
}
```

### Correct

Proper variable expansion with defaults:

```json
{
  "mcpServers": {
    "my-server": {
      "transport": {
        "type": "stdio",
        "command": "${HOME}/bin/server",
        "env": {
          "API_KEY": "${API_KEY}",
          "PORT": "${PORT:-3000}",
          "NODE_ENV": "production"
        }
      }
    }
  }
}
```

Using special plugin variables:

```json
{
  "mcpServers": {
    "plugin-server": {
      "transport": {
        "type": "stdio",
        "command": "${CLAUDE_PLUGIN_ROOT}/bin/server",
        "env": {
          "PLUGIN_ROOT": "${CLAUDE_PLUGIN_ROOT}",
          "DATA_DIR": "${CLAUDE_PLUGIN_ROOT}/data"
        }
      }
    }
  }
}
```

## How To Fix

1. **Remove empty variables** or replace with proper expansion syntax `${VAR}`
2. **Update simple variable syntax** from `$VAR` to `${VAR}` for consistency
3. **Add default values** for optional variables using `${VAR:-default}` syntax
4. **Use literal values** for non-secret static configuration instead of variable expansion
5. **Keep secrets out of config** by using variable expansion to reference environment

**Variable Expansion Syntax:**

- Basic: `${API_KEY}`
- With default: `${PORT:-3000}`
- Special: `${CLAUDE_PLUGIN_ROOT}` (auto-set by Claude Code for plugins)

## Options

This rule does not have configuration options.

## When Not To Use It

Disable this rule if you're using a configuration system that doesn't support variable expansion or if you're generating configurations programmatically with custom variable handling. However, following standard variable expansion practices benefits most projects.

## Related Rules

- [mcp-invalid-transport](./mcp-invalid-transport.md) - Transport configuration validation
- [mcp-invalid-server](./mcp-invalid-server.md) - Server configuration validation
- [settings-invalid-env-var](../settings/settings-invalid-env-var.md) - Settings environment variable validation

## Resources

- [Implementation](../../../src/validators/mcp.ts)
- [Tests](../../../tests/validators/mcp.test.ts)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Environment Variables Best Practices](https://12factor.net/config)

## Version

Available since: v1.0.0
