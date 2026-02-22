---
description: "LSP server names should be descriptive"
---

# lsp-server-name-too-short

<RuleHeader description="LSP server names should be descriptive" severity="warn" :fixable="false" :configurable="true" category="LSP" />

## Rule Details

This rule checks the top-level keys in `lsp.json`, which serve as server names, and warns when any name is shorter than the configured minimum length. Descriptive names like `typescript-server` or `python-lsp` make configurations easier to maintain and debug.

### Incorrect

Server name that is too short

```json
{
  "t": {
    "command": "/usr/bin/tsserver"
  }
}
```

### Correct

Descriptive server name

```json
{
  "typescript-server": {
    "command": "/usr/bin/tsserver"
  }
}
```

## How To Fix

Rename the server key to a more descriptive name that identifies the language or purpose, such as `typescript-server`, `python-lsp`, or `rust-analyzer`.

## Options

Default options:

```json
{
  "minLength": 2
}
```

Require server names of at least 3 characters:

```json
{
  "minLength": 3
}
```

## When Not To Use It

Disable this rule if you have an established convention using short abbreviations for server names that are well-understood by your team.

## Related Rules

- [`lsp-command-bare-name`](/rules/lsp/lsp-command-bare-name)
- [`lsp-extension-missing-dot`](/rules/lsp/lsp-extension-missing-dot)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/lsp/lsp-server-name-too-short.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/lsp/lsp-server-name-too-short.test.ts)

## Version

Available since: v0.2.0
