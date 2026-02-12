# mcp-sse-empty-url

<RuleHeader description="MCP SSE transport URL cannot be empty" severity="error" :fixable="false" category="MCP" />

## Rule Details

This rule checks that MCP servers configured with type "sse" include a url field that is present and non-empty. A missing or blank URL means Claude Code cannot connect to the SSE endpoint. Note that the SSE transport itself is deprecated in favor of HTTP; consider migrating to the http transport type.

### Incorrect

SSE server with an empty URL string

```json
{
  "mcpServers": {
    "remote": {
      "type": "sse",
      "url": ""
    }
  }
}
```

SSE server with the url field missing

```json
{
  "mcpServers": {
    "remote": {
      "type": "sse"
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

## How To Fix

Add a non-empty url field to the SSE server configuration. Consider migrating to the http transport type, as SSE is deprecated.

## Options

This rule does not have any configuration options.

## Related Rules

- [`mcp-sse-invalid-url`](/rules/mcp/mcp-sse-invalid-url)
- [`mcp-sse-transport-deprecated`](/rules/mcp/mcp-sse-transport-deprecated)
- [`mcp-invalid-server`](/rules/mcp/mcp-invalid-server)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/mcp/mcp-sse-empty-url.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/mcp/mcp-sse-empty-url.test.ts)

## Version

Available since: v0.2.0
