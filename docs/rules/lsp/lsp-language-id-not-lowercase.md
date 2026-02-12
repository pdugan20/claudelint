# Rule: lsp-language-id-not-lowercase

**Severity**: Warning
**Fixable**: No
**Validator**: LSP
**Category**: Best Practices

LSP language IDs should be lowercase

## Rule Details

Language IDs in extension mappings should be lowercase to follow LSP conventions and ensure consistent behavior across different language servers and editors. While some LSP implementations may accept mixed-case language IDs, using lowercase is the standard convention recommended by the Language Server Protocol specification.

This rule warns when language IDs contain uppercase characters. Using consistent lowercase IDs improves compatibility and prevents potential issues with case-sensitive language server matching.

### Incorrect

Mixed-case language IDs:

```json
{
  "extensionMapping": {
    ".ts": "TypeScript",
    ".py": "Python",
    ".rs": "Rust"
  }
}
```

Uppercase language IDs:

```json
{
  "extensionMapping": {
    ".js": "JavaScript",
    ".jsx": "JavaScriptReact",
    ".go": "GO"
  }
}
```

### Correct

Lowercase language IDs:

```json
{
  "extensionMapping": {
    ".ts": "typescript",
    ".tsx": "typescriptreact",
    ".py": "python",
    ".rs": "rust"
  }
}
```

Standard LSP language identifiers:

```json
{
  "extensionMapping": {
    ".js": "javascript",
    ".jsx": "javascriptreact",
    ".go": "go",
    ".md": "markdown",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml"
  }
}
```

## How To Fix

To fix language ID case issues:

1. **Convert to lowercase**:
   - `"TypeScript"` → `"typescript"`
   - `"Python"` → `"python"`
   - `"Rust"` → `"rust"`
   - `"JavaScript"` → `"javascript"`

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

1. **Use standard identifiers** from LSP specification:

Common language IDs:

- TypeScript: `"typescript"` and `"typescriptreact"`
- JavaScript: `"javascript"` and `"javascriptreact"`
- Python: `"python"`
- Rust: `"rust"`
- Go: `"go"`
- C/C++: `"c"` and `"cpp"`
- Java: `"java"`
- Markdown: `"markdown"`

1. **Verify configuration**:

```bash
claudelint check-lsp
```

## Options

This rule does not have configuration options.

## When Not To Use It

Disable this rule if your language server explicitly requires mixed-case or uppercase language IDs (very rare). However, following the lowercase convention is strongly recommended for compatibility.

## Related Rules

- [lsp-language-id-empty](./lsp-language-id-empty.md) - Validates language IDs are not empty
- [lsp-extension-missing-dot](./lsp-extension-missing-dot.md) - Validates extension format

## Resources

- [Rule Implementation](../../src/rules/lsp/lsp-language-id-not-lowercase.ts)
- [Rule Tests](../../tests/rules/lsp/lsp-language-id-not-lowercase.test.ts)
- [Language Server Protocol Specification](https://microsoft.github.io/language-server-protocol/)
- [LSP Language Identifiers](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocumentItem)

## Version

Available since: v0.2.0
