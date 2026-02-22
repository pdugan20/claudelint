---
description: "LSP transport type must be \"stdio\" or \"socket\""
---

# lsp-invalid-transport

<RuleHeader description="LSP transport type must be &quot;stdio&quot; or &quot;socket&quot;" severity="error" :fixable="false" :configurable="false" category="LSP" />

## Rule Details

This rule checks the transport field of each server defined in lsp.json. Only "stdio" and "socket" are valid transport types. If the transport field is omitted, the server defaults to stdio, which is acceptable. An invalid transport type will cause a runtime error when Claude Code tries to start the LSP server, as it will not know how to communicate with the process.

### Incorrect

LSP server with an invalid transport type

```json
{
  "typescript": {
    "command": "typescript-language-server",
    "args": ["--stdio"],
    "transport": "http"
  }
}
```

### Correct

LSP server with stdio transport

```json
{
  "typescript": {
    "command": "typescript-language-server",
    "args": ["--stdio"],
    "transport": "stdio"
  }
}
```

LSP server with transport omitted (defaults to stdio)

```json
{
  "typescript": {
    "command": "typescript-language-server",
    "args": ["--stdio"]
  }
}
```

## How To Fix

Set the transport field to either "stdio" or "socket". If the server communicates over standard input/output, use "stdio". If it communicates over a TCP socket, use "socket". Omit the field entirely to default to "stdio".

## Options

This rule does not have any configuration options.

## Related Rules

- [`lsp-command-bare-name`](/rules/lsp/lsp-command-bare-name)
- [`lsp-extension-missing-dot`](/rules/lsp/lsp-extension-missing-dot)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/lsp/lsp-invalid-transport.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/lsp/lsp-invalid-transport.test.ts)

## Version

Available since: v0.2.0
