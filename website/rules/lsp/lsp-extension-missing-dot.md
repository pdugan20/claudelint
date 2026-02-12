# lsp-extension-missing-dot

<RuleHeader description="LSP extension mappings must start with a dot" severity="error" :fixable="false" :configurable="false" category="LSP" />

## Rule Details

This rule validates keys in the `extensionToLanguage` mapping of each LSP server entry in `lsp.json`. File extensions must begin with a dot (e.g., `.ts`, `.py`) to be recognized by the LSP system. Extensions without a leading dot will fail to match files correctly, causing language server features like code completion and diagnostics to not activate.

### Incorrect

Extension keys missing the leading dot

```json
{
  "typescript-server": {
    "command": "/usr/bin/tsserver",
    "extensionToLanguage": {
      "ts": "typescript",
      "tsx": "typescriptreact"
    }
  }
}
```

### Correct

Extension keys with leading dot

```json
{
  "typescript-server": {
    "command": "/usr/bin/tsserver",
    "extensionToLanguage": {
      ".ts": "typescript",
      ".tsx": "typescriptreact"
    }
  }
}
```

## How To Fix

Add a leading dot to each extension key in the `extensionToLanguage` mapping. For example, change `"ts"` to `".ts"` and `"py"` to `".py"`.

## Options

This rule does not have any configuration options.

## Related Rules

- [`lsp-language-id-empty`](/rules/lsp/lsp-language-id-empty)
- [`lsp-language-id-not-lowercase`](/rules/lsp/lsp-language-id-not-lowercase)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/lsp/lsp-extension-missing-dot.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/lsp/lsp-extension-missing-dot.test.ts)

## Version

Available since: v0.2.0
