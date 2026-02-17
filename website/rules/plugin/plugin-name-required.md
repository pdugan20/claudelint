---
description: "Plugin name is required and cannot be empty"
---

# plugin-name-required

<RuleHeader description="Plugin name is required and cannot be empty" severity="error" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

This rule checks that the plugin.json file has a name property that is a non-empty string. The plugin name is the primary identifier used in the marketplace and by Claude Code when referencing the plugin. A missing or empty name prevents the plugin from being discovered, installed, or referenced correctly.

### Incorrect

Plugin with missing name

```json
{
  "version": "1.0.0",
  "description": "A useful plugin"
}
```

Plugin with empty name

```json
{
  "name": "",
  "version": "1.0.0"
}
```

### Correct

Plugin with a valid name

```json
{
  "name": "my-plugin",
  "version": "1.0.0"
}
```

## How To Fix

Add a name field to plugin.json with a descriptive, non-empty string value that identifies the plugin.

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-invalid-manifest`](/rules/plugin/plugin-invalid-manifest)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-name-required.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-name-required.test.ts)

## Version

Available since: v0.2.0
