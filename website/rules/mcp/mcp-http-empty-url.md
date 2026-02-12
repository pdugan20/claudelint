# mcp-http-empty-url

<RuleHeader description="MCP HTTP transport URL cannot be empty" severity="error" :fixable="false" category="MCP" />

## Rule Details

This rule checks that MCP servers configured with type "http" include a url field that is present and non-empty. A missing or blank URL means Claude Code cannot connect to the remote MCP server, resulting in silent failures or confusing runtime errors.

### Incorrect

HTTP server with an empty URL string

```json
{
  "mcpServers": {
    "remote": {
      "type": "http",
      "url": ""
    }
  }
}
```

HTTP server with the url field missing entirely

```json
{
  "mcpServers": {
    "remote": {
      "type": "http"
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
      "url": "https://mcp.example.com/api"
    }
  }
}
```

## How To Fix

Add a non-empty url field to the MCP server configuration. The URL should be a fully qualified address including the scheme (http:// or https://).

## Options

This rule does not have any configuration options.

## Related Rules

- [`mcp-http-invalid-url`](/rules/mcp/mcp-http-invalid-url)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/mcp/mcp-http-empty-url.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/mcp/mcp-http-empty-url.test.ts)

## Version

Available since: v0.2.0
