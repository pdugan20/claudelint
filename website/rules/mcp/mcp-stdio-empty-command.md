# mcp-stdio-empty-command

<RuleHeader description="MCP stdio transport command cannot be empty" severity="error" :fixable="false" :configurable="false" category="MCP" />

## Rule Details

This rule validates that every MCP server using the stdio transport has a command property that is present, is a string, and is not empty or whitespace-only. A server is considered stdio if it has type set to "stdio" or has a command field. Without a valid command, the MCP server cannot be started, causing a runtime failure when Claude Code tries to connect.

### Incorrect

Stdio server with an empty command

```json
{
  "mcpServers": {
    "my-server": {
      "type": "stdio",
      "command": ""
    }
  }
}
```

Stdio server missing the command field entirely

```json
{
  "mcpServers": {
    "my-server": {
      "type": "stdio",
      "args": ["--port", "3000"]
    }
  }
}
```

### Correct

Stdio server with a valid command

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}
```

## How To Fix

Add a non-empty command string to the MCP server configuration. The command should be the executable that starts the MCP server process (e.g., "npx", "node", "python").

## Options

This rule does not have any configuration options.

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/mcp/mcp-stdio-empty-command.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/mcp/mcp-stdio-empty-command.test.ts)

## Version

Available since: v0.2.0
