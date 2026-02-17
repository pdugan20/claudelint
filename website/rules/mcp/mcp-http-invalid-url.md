---
description: "MCP HTTP transport URL must be valid"
---

# mcp-http-invalid-url

<RuleHeader description="MCP HTTP transport URL must be valid" severity="error" :fixable="false" :configurable="false" category="MCP" />

## Rule Details

This rule checks that the url field of MCP servers with type "http" is a valid URL by attempting to parse it with the URL constructor. URLs containing variable expansions (${ or $) are skipped since they are resolved at runtime. An invalid URL will prevent Claude Code from connecting to the remote MCP server, causing silent failures or error messages at runtime.

### Incorrect

HTTP server with a malformed URL

```json
{
  "mcpServers": {
    "remote": {
      "type": "http",
      "url": "not-a-valid-url"
    }
  }
}
```

### Correct

HTTP server with a valid URL

```json
{
  "mcpServers": {
    "remote": {
      "type": "http",
      "url": "https://mcp.example.com/sse"
    }
  }
}
```

## How To Fix

Provide a fully qualified URL including the scheme (http:// or https://). Ensure the URL is well-formed and reachable from the environment where Claude Code runs.

## Options

This rule does not have any configuration options.

## Related Rules

- [`mcp-http-empty-url`](/rules/mcp/mcp-http-empty-url)
- [`mcp-sse-invalid-url`](/rules/mcp/mcp-sse-invalid-url)
- [`mcp-websocket-invalid-url`](/rules/mcp/mcp-websocket-invalid-url)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/mcp/mcp-http-invalid-url.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/mcp/mcp-http-invalid-url.test.ts)

## Version

Available since: v0.2.0
