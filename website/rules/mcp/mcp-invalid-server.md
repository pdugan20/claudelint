# mcp-invalid-server

<RuleHeader description="MCP server names must be unique (deprecated: names are now object keys)" severity="error" :fixable="false" category="MCP" />

## Rule Details

This rule is deprecated and no longer performs any validation. It originally checked for duplicate MCP server names, but the configuration format was changed to use object keys for server names, making duplicates impossible at the JSON level. The rule is retained for backward compatibility but will be removed in a future version.

### Incorrect

Duplicate server names (no longer possible with object-key format)

```json
{
  "mcpServers": {
    "my-server": { "command": "npx", "args": ["server-a"] },
    "my-server": { "command": "npx", "args": ["server-b"] }
  }
}
```

### Correct

Unique server names as object keys

```json
{
  "mcpServers": {
    "server-a": { "command": "npx", "args": ["server-a"] },
    "server-b": { "command": "npx", "args": ["server-b"] }
  }
}
```

## Options

This rule does not have any configuration options.

## When Not To Use It

This rule is deprecated and performs no checks. It can be safely disabled.

## Related Rules

- [`mcp-invalid-transport`](/rules/mcp/mcp-invalid-transport)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/mcp/mcp-invalid-server.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/mcp/mcp-invalid-server.test.ts)

## Version

Available since: v0.2.0
