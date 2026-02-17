---
description: "Plugin version must follow semantic versioning format"
---

# plugin-invalid-version

<RuleHeader description="Plugin version must follow semantic versioning format" severity="error" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

This rule checks that the version field in plugin.json conforms to the Semantic Versioning (semver) specification. Valid formats include major.minor.patch (e.g., 1.0.0), optional pre-release identifiers (e.g., 2.1.0-beta.1), and optional build metadata (e.g., 1.0.0+build.42). Proper semver ensures consistent dependency resolution and clear communication about breaking changes.

### Incorrect

Version missing the patch number

```json
{
  "name": "my-plugin",
  "version": "1.0",
  "description": "A sample plugin"
}
```

Version with a leading v prefix

```json
{
  "name": "my-plugin",
  "version": "v2.1.0",
  "description": "A sample plugin"
}
```

### Correct

Standard semver version

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A sample plugin"
}
```

Pre-release version

```json
{
  "name": "my-plugin",
  "version": "2.1.0-beta.1",
  "description": "A sample plugin"
}
```

## How To Fix

Update the version field to follow the semver format: MAJOR.MINOR.PATCH. Optionally append a pre-release identifier with a hyphen (e.g., 1.0.0-beta) or build metadata with a plus sign (e.g., 1.0.0+build.1).

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-description-required`](/rules/plugin/plugin-description-required)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-invalid-version.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-invalid-version.test.ts)

## Version

Available since: v0.2.0
