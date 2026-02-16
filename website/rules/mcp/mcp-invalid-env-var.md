# mcp-invalid-env-var

<RuleHeader description="Environment variables must use proper expansion syntax" severity="warn" :fixable="false" :configurable="true" category="MCP" />

## Rule Details

This rule checks that environment variable references in MCP transport fields (command, args, url, headers, and env values) use proper ${VAR} expansion syntax and that variable names match a configurable naming pattern. It warns on empty env values, empty expansion syntax like ${}, variable names that do not match the expected pattern, and bare $VAR references that should use the ${VAR} format. The special variable ${CLAUDE_PLUGIN_ROOT} is always excluded from pattern validation.

### Incorrect

Bare variable reference without braces

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "env": {
        "API_KEY": "$MY_API_KEY"
      }
    }
  }
}
```

Empty environment variable value

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "env": {
        "API_KEY": ""
      }
    }
  }
}
```

### Correct

Proper variable expansion with braces

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "env": {
        "API_KEY": "${MY_API_KEY}"
      }
    }
  }
}
```

## How To Fix

Use the ${VAR_NAME} format for environment variable references. Ensure variable names match the expected pattern (default: uppercase letters, digits, and underscores starting with a letter or underscore). Provide non-empty values for all env entries.

## Options

Default options:

```json
{
  "pattern": "^[A-Z_][A-Z0-9_]*$"
}
```

Allow lowercase environment variable names:

```json
{
  "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
}
```

## Related Rules

- [`mcp-stdio-empty-command`](/rules/mcp/mcp-stdio-empty-command)
- [`mcp-http-invalid-url`](/rules/mcp/mcp-http-invalid-url)
- [`mcp-sse-invalid-url`](/rules/mcp/mcp-sse-invalid-url)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/mcp/mcp-invalid-env-var.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/mcp/mcp-invalid-env-var.test.ts)

## Version

Available since: v0.2.0
