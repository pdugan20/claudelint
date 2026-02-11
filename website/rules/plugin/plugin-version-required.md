# Rule: plugin-version-required

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Recommended**: Yes

Plugin version is required and cannot be empty

## Rule Details

This rule checks that the plugin.json file has a version property that is a non-empty string. The version is used for dependency management and marketplace distribution. A missing or empty version prevents proper version tracking, update detection, and may cause installation failures.

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

Add a version field to plugin.json with a non-empty string value, ideally following semver format (e.g., "1.0.0").

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-invalid-manifest`](/rules/plugin/plugin-invalid-manifest)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-version-required.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-version-required.test.ts)

## Version

Available since: v1.0.0
