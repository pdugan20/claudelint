# mcp-sse-invalid-url

<RuleHeader description="MCP SSE transport URL must be valid" severity="error" :fixable="false" category="MCP" />

## Rule Details

This rule checks that the url field of MCP servers with type "sse" is a valid URL by attempting to parse it with the URL constructor. URLs containing variable expansions (${ or $) are skipped since they are resolved at runtime. An invalid URL will prevent Claude Code from connecting to the remote MCP server.

### Incorrect

SSE server with a malformed URL

```json
{
  "mcpServers": {
    "remote": {
      "type": "sse",
      "url": "not-a-valid-url"
    }
  }
}
```

### Correct

SSE server with a valid URL

```json
{
  "mcpServers": {
    "remote": {
      "type": "sse",
      "url": "https://mcp.example.com/sse"
    }
  }
}
```

SSE server with a variable-expanded URL (skipped)

```json
{
  "mcpServers": {
    "remote": {
      "type": "sse",
      "url": "${MCP_SSE_URL}"
    }
  }
}
```

## How To Fix

Provide a fully qualified URL including the scheme (http:// or https://). Ensure the URL is well-formed and reachable from the environment where Claude Code runs.

## Options

This rule does not have any configuration options.

## Related Rules

- [`mcp-sse-empty-url`](/rules/mcp/mcp-sse-empty-url)
- [`mcp-sse-transport-deprecated`](/rules/mcp/mcp-sse-transport-deprecated)
- [`mcp-invalid-server`](/rules/mcp/mcp-invalid-server)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/mcp/mcp-sse-invalid-url.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/mcp/mcp-sse-invalid-url.test.ts)

## Version

Available since: v0.2.0
