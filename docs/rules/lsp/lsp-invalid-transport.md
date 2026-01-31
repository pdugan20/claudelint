# Rule: lsp-invalid-transport

**Severity**: Error
**Fixable**: No
**Validator**: LSP
**Category**: Schema Validation

LSP transport type must be "stdio" or "socket"

## Rule Details

LSP server transport type must be either `"stdio"` (standard input/output) or `"socket"` (network socket). These are the only two communication mechanisms supported by the Language Server Protocol. Using an invalid transport type will cause runtime errors when attempting to start the language server.

This rule validates that the `transport` field in server configurations is one of the valid values. Most language servers use `"stdio"` by default, which is the recommended choice unless you specifically need socket-based communication.

### Incorrect

Invalid transport types:

```json
{
  "servers": {
    "typescript-language-server": {
      "command": "typescript-language-server",
      "transport": "http"
    },
    "rust-analyzer": {
      "command": "rust-analyzer",
      "transport": "pipe"
    }
  }
}
```

Misspelled transport types:

```json
{
  "servers": {
    "python-lsp": {
      "command": "pylsp",
      "transport": "standard-io"
    },
    "gopls": {
      "command": "gopls",
      "transport": "Socket"
    }
  }
}
```

### Correct

Standard input/output transport:

```json
{
  "servers": {
    "typescript-language-server": {
      "command": "typescript-language-server",
      "transport": "stdio",
      "args": ["--stdio"]
    },
    "rust-analyzer": {
      "command": "rust-analyzer",
      "transport": "stdio"
    }
  }
}
```

Socket transport:

```json
{
  "servers": {
    "custom-lsp": {
      "command": "custom-language-server",
      "transport": "socket",
      "port": 7658
    }
  }
}
```

Default transport (stdio is assumed):

```json
{
  "servers": {
    "python-lsp": {
      "command": "pylsp"
    }
  }
}
```

## How To Fix

To fix transport configuration errors:

1. **Use "stdio" for most servers** (default and recommended):

```json
{
  "servers": {
    "typescript-language-server": {
      "command": "typescript-language-server",
      "transport": "stdio"
    }
  }
}
```

1. **Use "socket" only when required**:

```json
{
  "servers": {
    "remote-lsp": {
      "command": "remote-language-server",
      "transport": "socket",
      "port": 8080
    }
  }
}
```

1. **Or omit transport entirely** (defaults to stdio):

```json
{
  "servers": {
    "rust-analyzer": {
      "command": "rust-analyzer"
    }
  }
}
```

1. **Verify configuration**:

```bash
claude-code-lint check-lsp
```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Only "stdio" and "socket" are valid transport types according to the LSP specification. Invalid transport values will cause runtime failures.

## Related Rules

- [lsp-server-name-too-short](./lsp-server-name-too-short.md) - Validates server names
- [lsp-command-not-in-path](./lsp-command-not-in-path.md) - Validates server commands

## Resources

- [Rule Implementation](../../src/rules/lsp/lsp-invalid-transport.ts)
- [Rule Tests](../../tests/rules/lsp/lsp-invalid-transport.test.ts)
- [Language Server Protocol Specification](https://microsoft.github.io/language-server-protocol/)
- [LSP Transport Documentation](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#implementationConsiderations)

## Version

Available since: v1.0.0
