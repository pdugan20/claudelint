---
description: "LSP language IDs cannot be empty"
---

# lsp-language-id-empty

<RuleHeader description="LSP language IDs cannot be empty" severity="error" :fixable="false" :configurable="false" category="LSP" />

## Rule Details

This rule checks the values in the `extensionToLanguage` mapping of each LSP server entry in `lsp.json` and reports an error when a language ID is an empty string or contains only whitespace. Language IDs are used to identify the programming language for syntax highlighting, diagnostics, and other language server features. An empty language ID prevents proper language detection.

### Incorrect

Empty language ID value

```json
{
  "my-server": {
    "command": "/usr/bin/my-server",
    "extensionToLanguage": {
      ".ts": "",
      ".js": "   "
    }
  }
}
```

### Correct

Non-empty language IDs

```json
{
  "my-server": {
    "command": "/usr/bin/my-server",
    "extensionToLanguage": {
      ".ts": "typescript",
      ".js": "javascript"
    }
  }
}
```

## How To Fix

Provide a valid language ID string for each extension in the `extensionToLanguage` mapping. Common language IDs include `typescript`, `javascript`, `python`, `rust`, `go`, and `java`.

## Options

This rule does not have any configuration options.

## Related Rules

- [`lsp-language-id-not-lowercase`](/rules/lsp/lsp-language-id-not-lowercase)
- [`lsp-extension-missing-dot`](/rules/lsp/lsp-extension-missing-dot)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/lsp/lsp-language-id-empty.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/lsp/lsp-language-id-empty.test.ts)

## Version

Available since: v0.2.0
