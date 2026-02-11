# Rule: lsp-command-not-in-path

**Severity**: Warning
**Fixable**: No
**Validator**: LSP
**Category**: Best Practices

LSP server commands should be in PATH or use absolute paths

## Rule Details

LSP server commands should either exist in the system PATH or use explicit paths (absolute paths starting with `/` or relative paths starting with `./`). Commands without explicit paths that aren't in PATH will fail at runtime with "command not found" errors.

This rule warns when a command doesn't start with `/` (absolute path) or `./` (relative path), indicating it relies on being in PATH. While PATH-based commands work when properly installed, explicit paths provide better portability and clearer error messages when dependencies are missing.

### Incorrect

Commands relying on PATH without verification:

```json
{
  "servers": {
    "typescript-language-server": {
      "command": "typescript-language-server --stdio"
    },
    "rust-analyzer": {
      "command": "rust-analyzer"
    }
  }
}
```

Implicit relative paths (not recommended):

```json
{
  "servers": {
    "custom-server": {
      "command": "node_modules/.bin/custom-lsp"
    }
  }
}
```

### Correct

Absolute paths:

```json
{
  "servers": {
    "typescript-language-server": {
      "command": "/usr/local/bin/typescript-language-server",
      "args": ["--stdio"]
    },
    "rust-analyzer": {
      "command": "/Users/username/.cargo/bin/rust-analyzer"
    }
  }
}
```

Explicit relative paths:

```json
{
  "servers": {
    "custom-server": {
      "command": "./node_modules/.bin/custom-lsp"
    },
    "local-server": {
      "command": "./.claude/bin/language-server"
    }
  }
}
```

## How To Fix

To fix command path issues:

1. **Find the command location**:

```bash
which typescript-language-server
# Output: /usr/local/bin/typescript-language-server
```

1. **Use the absolute path** in lsp.json:

```json
{
  "servers": {
    "typescript-language-server": {
      "command": "/usr/local/bin/typescript-language-server"
    }
  }
}
```

1. **Or use explicit relative paths** for project-local tools:

```json
{
  "servers": {
    "local-tool": {
      "command": "./node_modules/.bin/tool-name"
    }
  }
}
```

1. **Verify configuration**:

```bash
claudelint check-lsp
```

## Options

This rule does not have configuration options.

## When Not To Use It

Disable this rule if you have strict control over system PATH across all environments and prefer shorter command names. However, explicit paths are recommended for portability and debugging.

## Related Rules

- [lsp-server-name-too-short](./lsp-server-name-too-short.md) - Validates server names
- [lsp-config-file-relative-path](./lsp-config-file-relative-path.md) - Validates config file paths

## Resources

- [Rule Implementation](../../src/rules/lsp/lsp-command-not-in-path.ts)
- [Rule Tests](../../tests/rules/lsp/lsp-command-not-in-path.test.ts)
- [Language Server Protocol Specification](https://microsoft.github.io/language-server-protocol/)

## Version

Available since: v1.0.0
