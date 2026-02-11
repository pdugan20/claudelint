# Rule: lsp-config-file-relative-path

**Severity**: Warn
**Fixable**: No
**Validator**: LSP

LSP configFile should use absolute or explicit relative paths (DEPRECATED: configFile is not in official spec)

## Rule Details

This deprecated rule checks the `configFile` property on LSP server entries and warns when the path does not start with `/` (absolute) or `.` (explicit relative like `./` or `../`). Implicit relative paths like `config/server.json` can resolve differently depending on the working directory, leading to inconsistent behavior. Note: the `configFile` property is not part of the official LSP specification and this rule is deprecated.

### Incorrect

Implicit relative path

```json
{
  "my-server": {
    "command": "/usr/bin/my-server",
    "configFile": "config/server.json"
  }
}
```

### Correct

Explicit relative path

```json
{
  "my-server": {
    "command": "/usr/bin/my-server",
    "configFile": "./config/server.json"
  }
}
```

Absolute path

```json
{
  "my-server": {
    "command": "/usr/bin/my-server",
    "configFile": "/home/user/.config/server.json"
  }
}
```

## How To Fix

Prefix the path with `./` to make it explicitly relative to the project root, or use an absolute path. For example, change `config/server.json` to `./config/server.json`.

## Options

This rule does not have any configuration options.

## When Not To Use It

This rule is deprecated because `configFile` is not part of the official LSP specification. Disable it if implicit relative paths are intentional in your setup.

## Related Rules

- [`lsp-config-file-not-json`](/rules/lsp/lsp-config-file-not-json)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/lsp/lsp-config-file-relative-path.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/lsp/lsp-config-file-relative-path.test.ts)

## Version

Available since: v1.0.0
