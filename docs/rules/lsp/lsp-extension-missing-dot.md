# Rule: lsp-extension-missing-dot

**Severity**: Error
**Fixable**: No
**Validator**: LSP
**Category**: Schema Validation

LSP extension mappings must start with a dot

## Rule Details

File extensions in LSP extension mappings must start with a dot (e.g., `.ts` not `ts`) to be recognized correctly by the Language Server Protocol system. Extensions without the leading dot will fail to match files at runtime, causing the language server to not activate for those file types.

This rule enforces that all keys in the `extensionMapping` object start with a dot. Without this, the mapping won't work and you'll lose IDE features like autocomplete, diagnostics, and go-to-definition for those file types.

### Incorrect

Extensions without dots:

```json
{
  "extensionMapping": {
    "ts": "typescript",
    "tsx": "typescriptreact",
    "js": "javascript"
  }
}
```

Mixed correct and incorrect formats:

```json
{
  "extensionMapping": {
    ".py": "python",
    "rs": "rust",
    "go": "go"
  }
}
```

### Correct

Extensions with dots:

```json
{
  "extensionMapping": {
    ".ts": "typescript",
    ".tsx": "typescriptreact",
    ".js": "javascript"
  }
}
```

Multiple language extensions:

```json
{
  "extensionMapping": {
    ".py": "python",
    ".pyi": "python",
    ".rs": "rust",
    ".go": "go",
    ".mod": "go",
    ".md": "markdown"
  }
}
```

## How To Fix

To fix extension mapping errors:

1. **Add dot prefix** to all extensions:
   - `"ts"` → `".ts"`
   - `"py"` → `".py"`
   - `"rs"` → `".rs"`

2. **Update lsp.json**:

```json
{
  "extensionMapping": {
    ".ts": "typescript",
    ".tsx": "typescriptreact",
    ".js": "javascript",
    ".jsx": "javascriptreact"
  }
}
```

1. **Verify configuration**:

```bash
claudelint check-lsp
```

1. **Test file detection**:

```bash
# Open a .ts file and verify LSP features work
# Autocomplete, diagnostics, and hover should activate
```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Extensions without dots will not work correctly in LSP configurations. This is a requirement of the Language Server Protocol specification.

## Related Rules

- [lsp-language-id-empty](./lsp-language-id-empty.md) - Validates language IDs are not empty
- [lsp-language-id-not-lowercase](./lsp-language-id-not-lowercase.md) - Validates language ID case

## Resources

- [Rule Implementation](../../src/rules/lsp/lsp-extension-missing-dot.ts)
- [Rule Tests](../../tests/rules/lsp/lsp-extension-missing-dot.test.ts)
- [Language Server Protocol Specification](https://microsoft.github.io/language-server-protocol/)
- [LSP Text Document Identification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocumentItem)

## Version

Available since: v0.2.0
