---
description: "Plugin version is recommended and should not be empty"
---

# plugin-version-required

<RuleHeader description="Plugin version is recommended and should not be empty" severity="warn" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

This rule checks that the plugin.json file has a version property that is a non-empty string. The version is used for dependency management and marketplace distribution. While only `name` is strictly required by Claude Code, including a version is strongly recommended for version tracking and update detection.

### Incorrect

Plugin with missing version

```json
{
  "name": "my-plugin",
  "description": "A useful plugin"
}
```

Plugin with empty version

```json
{
  "name": "my-plugin",
  "version": ""
}
```

### Correct

Plugin with a valid version

```json
{
  "name": "my-plugin",
  "version": "1.0.0"
}
```

## How To Fix

Add a version field to plugin.json with a non-empty string value following semver format (e.g., "1.0.0"). While optional per the spec, it is strongly recommended.

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-invalid-manifest`](/rules/plugin/plugin-invalid-manifest)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-version-required.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-version-required.test.ts)

## Version

Available since: v0.2.0
