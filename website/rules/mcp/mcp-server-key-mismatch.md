# Rule: mcp-server-key-mismatch

**Severity**: Warn
**Fixable**: No
**Validator**: MCP

Server key should match server name property (deprecated: names are now object keys)

## Rule Details

This rule is deprecated and no longer performs any validation. In earlier versions of the MCP configuration schema, servers had a separate name property that was expected to match the object key. Server names are now derived from the object key itself, so there is no name property to mismatch.

### Incorrect

Older config format with mismatched name (no longer applicable)

```json
{
  "mcpServers": {
    "my-server": {
      "name": "other-name",
      "command": "npx",
      "args": ["-y", "@my/mcp-server"]
    }
  }
}
```

### Correct

Current config format using object key as server name

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@my/mcp-server"]
    }
  }
}
```

## Options

This rule does not have any configuration options.

## When Not To Use It

This rule is deprecated and can always be safely disabled. It performs no validation.

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/mcp/mcp-server-key-mismatch.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/mcp/mcp-server-key-mismatch.test.ts)

## Version

Available since: v1.0.0
