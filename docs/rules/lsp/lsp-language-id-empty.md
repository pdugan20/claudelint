# Rule: lsp-language-id-empty

**Severity**: Error
**Fixable**: No
**Validator**: LSP
**Category**: Schema Validation

LSP language IDs cannot be empty

## Rule Details

Language IDs in extension mappings must be non-empty strings to properly identify the programming language for syntax highlighting and language server features. Empty or whitespace-only language IDs will prevent the LSP system from recognizing files and activating the appropriate language server.

This rule validates that all values in the `extensionMapping` object are non-empty strings after trimming whitespace. Without valid language IDs, IDE features like autocomplete, diagnostics, and go-to-definition won't work.

### Incorrect

Empty language IDs:

```json
{
  "extensionMapping": {
    ".ts": "",
    ".js": "  ",
    ".py": ""
  }
}
```

Mixed empty and valid IDs:

```json
{
  "extensionMapping": {
    ".rs": "rust",
    ".go": "",
    ".md": "markdown",
    ".txt": "   "
  }
}
```

### Correct

Valid language IDs:

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

Multiple languages:

```json
{
  "extensionMapping": {
    ".py": "python",
    ".pyi": "python",
    ".rs": "rust",
    ".go": "go",
    ".mod": "go",
    ".sum": "go",
    ".md": "markdown",
    ".json": "json"
  }
}
```

## How To Fix

To fix empty language ID errors:

1. **Replace empty strings** with valid language identifiers:
   - `""` → `"typescript"` (for .ts files)
   - `""` → `"python"` (for .py files)
   - `""` → `"rust"` (for .rs files)

2. **Use standard language IDs** from LSP specification:

```json
{
  "extensionMapping": {
    ".ts": "typescript",
    ".py": "python",
    ".rs": "rust",
    ".go": "go"
  }
}
```

1. **Remove mapping entirely** if language ID is unknown:

```json
{
  "extensionMapping": {
    ".ts": "typescript"
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

Never disable this rule. Empty language IDs will break LSP functionality. If you don't want a language server for a file type, remove the extension mapping entirely rather than using an empty language ID.

## Related Rules

- [lsp-extension-missing-dot](./lsp-extension-missing-dot.md) - Validates extension format
- [lsp-language-id-not-lowercase](./lsp-language-id-not-lowercase.md) - Validates language ID case

## Resources

- [Rule Implementation](../../src/rules/lsp/lsp-language-id-empty.ts)
- [Rule Tests](../../tests/rules/lsp/lsp-language-id-empty.test.ts)
- [Language Server Protocol Specification](https://microsoft.github.io/language-server-protocol/)
- [LSP Language Identifiers](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocumentItem)

## Version

Available since: v1.0.0
