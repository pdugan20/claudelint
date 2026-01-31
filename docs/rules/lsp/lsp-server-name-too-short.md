# Rule: lsp-server-name-too-short

**Severity**: Warning
**Fixable**: No
**Validator**: LSP
**Category**: Schema Validation

LSP server names should be descriptive

## Rule Details

LSP server names should be descriptive to improve readability and maintainability of configuration files. Single-character or very short names like "a", "ts", or "py" make configuration harder to understand and maintain, especially in projects with multiple language servers.

This rule enforces a minimum length for server names (default: 2 characters). Using descriptive names like "typescript-language-server" or "rust-analyzer" makes the configuration self-documenting and easier to debug.

### Incorrect

Single-character server names:

```json
{
  "servers": {
    "t": {
      "command": "typescript-language-server",
      "args": ["--stdio"]
    },
    "p": {
      "command": "pylsp"
    }
  }
}
```

Very short server names:

```json
{
  "servers": {
    "ts": {
      "command": "typescript-language-server",
      "args": ["--stdio"]
    }
  }
}
```

### Correct

Descriptive server names:

```json
{
  "servers": {
    "typescript-language-server": {
      "command": "typescript-language-server",
      "args": ["--stdio"]
    },
    "python-lsp": {
      "command": "pylsp"
    }
  }
}
```

Multi-word descriptive names:

```json
{
  "servers": {
    "rust-analyzer": {
      "command": "rust-analyzer"
    },
    "gopls-language-server": {
      "command": "gopls",
      "args": ["serve"]
    }
  }
}
```

## How To Fix

To fix server names that are too short:

1. **Use descriptive names** - Match the actual language server name:
   - `"t"` → `"typescript-language-server"`
   - `"py"` → `"python-lsp"`
   - `"rs"` → `"rust-analyzer"`

2. **Include context** - Add language or purpose:
   - `"ts"` → `"typescript-language-server"`
   - `"go"` → `"gopls-server"`

3. **Verify configuration**:

```bash
claude-code-lint check-lsp
```

## Options

This rule has configurable options:

### `minLength`

Minimum length for server names (default: 2). Set this to require longer, more descriptive names.

**Schema:**

```typescript
{
  minLength: number (positive integer)
}
```

**Default Options:**

```json
{
  "minLength": 2
}
```

**Example Configuration:**

Require minimum 5-character names:

```json
{
  "rules": {
    "lsp-server-name-too-short": ["warn", { "minLength": 5 }]
  }
}
```

With this configuration:

```json
{
  "servers": {
    "ts": {
      "command": "typescript-language-server"
    }
  }
}
```

Would fail because "ts" (2 characters) is less than the required 5 characters.

## When Not To Use It

Disable this rule if you prefer short, abbreviated server names or have established conventions using brief identifiers. However, descriptive names are recommended for maintainability.

## Related Rules

- [lsp-invalid-transport](./lsp-invalid-transport.md) - Validates transport types
- [lsp-command-not-in-path](./lsp-command-not-in-path.md) - Validates server commands

## Resources

- [Rule Implementation](../../src/rules/lsp/lsp-server-name-too-short.ts)
- [Rule Tests](../../tests/rules/lsp/lsp-server-name-too-short.test.ts)
- [Language Server Protocol Specification](https://microsoft.github.io/language-server-protocol/)

## Version

Available since: v1.0.0
