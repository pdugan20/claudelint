# Rule: mcp-invalid-env-var

**Severity**: Warning
**Fixable**: No
**Validator**: MCP
**Category**: Schema Validation

Environment variables must use proper expansion syntax

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
