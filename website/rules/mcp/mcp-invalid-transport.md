# mcp-invalid-transport

<RuleHeader description="MCP transport type must be one of the supported values" severity="error" :fixable="false" :configurable="false" category="MCP" />

## Rule Details

This rule checks that the type field of each MCP server is one of the supported transport types: stdio, sse, http, or websocket. An unrecognized transport type will prevent Claude Code from establishing a connection to the MCP server. Servers without an explicit type field are skipped because the type can be inferred from the presence of a command field.

### Incorrect

Server with an unsupported transport type

```json
{
  "mcpServers": {
    "my-server": {
      "type": "grpc",
      "url": "https://mcp.example.com"
    }
  }
}
```

### Correct

Server with a valid HTTP transport type

```json
{
  "mcpServers": {
    "my-server": {
      "type": "http",
      "url": "https://mcp.example.com"
    }
  }
}
```

Server with a valid stdio transport type

```json
{
  "mcpServers": {
    "my-server": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@my/mcp-server"]
    }
  }
}
```

## How To Fix

Change the type field to one of the supported values: stdio, sse, http, or websocket. Note that sse is deprecated in favor of http.

## Options

This rule does not have any configuration options.

## Related Rules

- [`mcp-sse-transport-deprecated`](/rules/mcp/mcp-sse-transport-deprecated)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/mcp/mcp-invalid-transport.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/mcp/mcp-invalid-transport.test.ts)

## Version

Available since: v0.2.0
