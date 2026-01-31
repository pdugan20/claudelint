# Rule: lsp-config-file-not-json

**Severity**: Warning
**Fixable**: No
**Validator**: LSP
**Category**: Schema Validation

LSP configFile should end with .json extension

## Rule Details

LSP server configuration files should use the `.json` extension to indicate their format and enable proper editor support. Config files without the `.json` extension may not receive JSON syntax highlighting, validation, or auto-completion in editors.

This rule validates that any `configFile` paths specified in LSP server configurations end with `.json`. Using the correct extension improves the developer experience and prevents confusion about file formats.

### Incorrect

Config files without .json extension:

```json
{
  "servers": {
    "typescript-language-server": {
      "command": "typescript-language-server",
      "configFile": ".claude/tsconfig"
    },
    "rust-analyzer": {
      "command": "rust-analyzer",
      "configFile": "./rust-config.txt"
    }
  }
}
```

Config files with wrong extensions:

```json
{
  "servers": {
    "python-lsp": {
      "command": "pylsp",
      "configFile": "./.claude/pylsp.config"
    }
  }
}
```

### Correct

Config files with .json extension:

```json
{
  "servers": {
    "typescript-language-server": {
      "command": "typescript-language-server",
      "configFile": ".claude/tsconfig.json"
    },
    "rust-analyzer": {
      "command": "rust-analyzer",
      "configFile": "./rust-analyzer.json"
    }
  }
}
```

Relative and absolute JSON paths:

```json
{
  "servers": {
    "python-lsp": {
      "command": "pylsp",
      "configFile": "./.claude/pylsp-config.json"
    },
    "gopls": {
      "command": "gopls",
      "configFile": "/Users/username/.config/gopls/config.json"
    }
  }
}
```

## How To Fix

To fix config file extension issues:

1. **Rename the file** to use .json extension:

```bash
mv .claude/tsconfig .claude/tsconfig.json
```

1. **Update the lsp.json reference**:

```json
{
  "servers": {
    "typescript-language-server": {
      "command": "typescript-language-server",
      "configFile": ".claude/tsconfig.json"
    }
  }
}
```

1. **Verify the file contains valid JSON**:

```bash
cat .claude/tsconfig.json | jq .
```

1. **Run validation**:

```bash
claudelint check-lsp
```

## Options

This rule does not have configuration options.

## When Not To Use It

Disable this rule if your LSP server uses a custom configuration format that intentionally doesn't use `.json` extension. However, most modern LSP servers expect JSON configuration files.

## Related Rules

- [lsp-config-file-relative-path](./lsp-config-file-relative-path.md) - Validates config file path format
- [lsp-invalid-transport](./lsp-invalid-transport.md) - Validates transport configuration

## Resources

- [Rule Implementation](../../src/rules/lsp/lsp-config-file-not-json.ts)
- [Rule Tests](../../tests/rules/lsp/lsp-config-file-not-json.test.ts)
- [Language Server Protocol Specification](https://microsoft.github.io/language-server-protocol/)

## Version

Available since: v1.0.0
