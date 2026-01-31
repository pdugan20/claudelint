# Rule: lsp-config-file-relative-path

**Severity**: Warning
**Fixable**: No
**Validator**: LSP
**Category**: Best Practices

LSP configFile should use absolute or explicit relative paths

## Rule Details

LSP server config file paths should be explicit by starting with `/` (absolute) or `./` (relative) to avoid ambiguity and improve portability. Implicit relative paths (not starting with `./`) can be confusing and may resolve differently depending on the working directory.

This rule warns when a `configFile` path doesn't start with `/` or `.`, indicating it uses an implicit relative path. Using explicit paths makes it clear whether the path is relative to the project root or an absolute system path.

### Incorrect

Implicit relative paths:

```json
{
  "servers": {
    "typescript-language-server": {
      "command": "typescript-language-server",
      "configFile": "config/tsconfig.json"
    },
    "rust-analyzer": {
      "command": "rust-analyzer",
      "configFile": "rust-config.json"
    }
  }
}
```

Paths without directory prefix:

```json
{
  "servers": {
    "python-lsp": {
      "command": "pylsp",
      "configFile": "pylsp.json"
    }
  }
}
```

### Correct

Explicit relative paths:

```json
{
  "servers": {
    "typescript-language-server": {
      "command": "typescript-language-server",
      "configFile": "./config/tsconfig.json"
    },
    "rust-analyzer": {
      "command": "rust-analyzer",
      "configFile": "./rust-config.json"
    }
  }
}
```

Absolute paths:

```json
{
  "servers": {
    "python-lsp": {
      "command": "pylsp",
      "configFile": "/Users/username/.config/pylsp/config.json"
    },
    "gopls": {
      "command": "gopls",
      "configFile": "/etc/gopls/config.json"
    }
  }
}
```

## How To Fix

To fix implicit relative paths:

1. **Add `./` prefix** for project-relative paths:
   - `"config/tsconfig.json"` → `"./config/tsconfig.json"`
   - `"pylsp.json"` → `"./pylsp.json"`

2. **Or use absolute paths** for system-wide configs:
   - `"pylsp.json"` → `"/Users/username/.config/pylsp.json"`

3. **Update lsp.json**:

```json
{
  "servers": {
    "typescript-language-server": {
      "command": "typescript-language-server",
      "configFile": "./config/tsconfig.json"
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

Disable this rule if your environment guarantees consistent working directory resolution and you prefer shorter paths. However, explicit paths are recommended for clarity and portability across different execution contexts.

## Related Rules

- [lsp-config-file-not-json](./lsp-config-file-not-json.md) - Validates config file extension
- [lsp-command-not-in-path](./lsp-command-not-in-path.md) - Validates command paths

## Resources

- [Rule Implementation](../../src/rules/lsp/lsp-config-file-relative-path.ts)
- [Rule Tests](../../tests/rules/lsp/lsp-config-file-relative-path.test.ts)
- [Language Server Protocol Specification](https://microsoft.github.io/language-server-protocol/)

## Version

Available since: v1.0.0
