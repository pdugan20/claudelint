---
description: "LSP server commands should use explicit paths instead of bare names"
---

# lsp-command-bare-name

<RuleHeader description="LSP server commands should use explicit paths instead of bare names" severity="warn" :fixable="false" :configurable="false" category="LSP" />

## Rule Details

This rule checks each LSP server entry in `lsp.json` for its `command` field and warns when the command does not start with `/` (absolute path) or `./` (explicit relative path). Commands that rely on being in the system PATH may fail in environments where PATH is configured differently, such as CI systems, containers, or other developers' machines.

### Incorrect

Server command uses a bare name instead of explicit path

```json
{
  "typescript-server": {
    "command": "typescript-language-server --stdio"
  }
}
```

### Correct

Server command uses absolute path

```json
{
  "typescript-server": {
    "command": "/usr/local/bin/typescript-language-server --stdio"
  }
}
```

Server command uses explicit relative path

```json
{
  "typescript-server": {
    "command": "./node_modules/.bin/typescript-language-server --stdio"
  }
}
```

## How To Fix

Replace bare command names with absolute paths (e.g., `/usr/local/bin/my-server`) or explicit relative paths (e.g., `./node_modules/.bin/my-server`). You can find the absolute path with `which <command>`.

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if you have consistent PATH configuration across all environments and prefer shorter command references.

## Related Rules

- [`lsp-server-name-too-short`](/rules/lsp/lsp-server-name-too-short)
- [`lsp-extension-missing-dot`](/rules/lsp/lsp-extension-missing-dot)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/lsp/lsp-command-bare-name.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/lsp/lsp-command-bare-name.test.ts)

## Version

Available since: v0.2.0
