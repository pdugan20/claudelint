# lsp-language-id-not-lowercase

<RuleHeader description="LSP language IDs should be lowercase" severity="warn" :fixable="false" :configurable="false" category="LSP" />

## Rule Details

This rule checks the values in the `extensionToLanguage` mapping of each LSP server entry in `lsp.json` and warns when a language ID contains uppercase characters. The LSP specification convention is to use lowercase language IDs (e.g., `typescript` not `TypeScript`). Using inconsistent casing can cause mismatches between editor expectations and server behavior.

### Incorrect

Language IDs with uppercase characters

```json
{
  "my-server": {
    "command": "/usr/bin/my-server",
    "extensionToLanguage": {
      ".ts": "TypeScript",
      ".py": "Python"
    }
  }
}
```

### Correct

Lowercase language IDs

```json
{
  "my-server": {
    "command": "/usr/bin/my-server",
    "extensionToLanguage": {
      ".ts": "typescript",
      ".py": "python"
    }
  }
}
```

## How To Fix

Convert all language ID values to lowercase. For example, change `"TypeScript"` to `"typescript"` and `"Python"` to `"python"`.

## Options

This rule does not have any configuration options.

## Related Rules

- [`lsp-language-id-empty`](/rules/lsp/lsp-language-id-empty)
- [`lsp-extension-missing-dot`](/rules/lsp/lsp-extension-missing-dot)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/lsp/lsp-language-id-not-lowercase.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/lsp/lsp-language-id-not-lowercase.test.ts)

## Version

Available since: v0.2.0
