# Rule: lsp-config-file-not-json

**Severity**: Warn
**Fixable**: No
**Validator**: LSP

LSP configFile should end with .json extension (DEPRECATED: configFile is not in official spec)

## Rule Details

This deprecated rule checks the `configFile` property on LSP server entries in `lsp.json` and warns when the path does not end with `.json`. Config files using the JSON extension get better editor support with syntax highlighting and validation. Note: the `configFile` property is not part of the official LSP specification and this rule is deprecated.

### Incorrect

Config file without .json extension

```json
{
  "my-server": {
    "command": "/usr/bin/my-server",
    "configFile": "config/server.yaml"
  }
}
```

### Correct

Config file with .json extension

```json
{
  "my-server": {
    "command": "/usr/bin/my-server",
    "configFile": "config/server.json"
  }
}
```

## How To Fix

Rename the configuration file to use the `.json` extension and update the `configFile` path in `lsp.json` accordingly.

## Options

This rule does not have any configuration options.

## When Not To Use It

This rule is deprecated because `configFile` is not part of the official LSP specification. Disable it if your LSP server requires a non-JSON config format.

## Related Rules

- [`lsp-config-file-relative-path`](/rules/lsp/lsp-config-file-relative-path)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/lsp/lsp-config-file-not-json.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/lsp/lsp-config-file-not-json.test.ts)

## Version

Available since: v1.0.0
