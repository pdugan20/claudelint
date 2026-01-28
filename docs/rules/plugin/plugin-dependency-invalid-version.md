# Rule: plugin-dependency-invalid-version

**Severity**: Warning
**Fixable**: No
**Validator**: Plugin
**Category**: Dependencies

Validates that plugin dependency versions use valid semantic versioning (semver) syntax.

## Rule Details

This rule triggers when a plugin's dependency version doesn't conform to semantic versioning standards. Dependency versions should use valid semver format or semver ranges to ensure predictable plugin loading and version resolution.

Valid formats include:
- Exact versions: `1.0.0`, `2.3.4`
- Range operators: `^1.0.0` (compatible), `~1.2.3` (patch updates)
- Comparison: `>=1.0.0`, `<2.0.0`
- Wildcards: `1.x`, `1.2.x`
- Combined ranges: `>=1.0.0 <2.0.0`

Invalid formats cause dependency resolution to fail or behave unpredictably.

### Incorrect

plugin-manifest.json with invalid version syntax:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "dependencies": {
    "plugin-utils": "latest",
    "plugin-helpers": "1.0",
    "plugin-core": "v1.2.3",
    "plugin-lib": "1.x.x.x"
  }
}
```

### Correct

plugin-manifest.json with valid semver:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "dependencies": {
    "plugin-utils": "^2.0.0",
    "plugin-helpers": "~1.2.3",
    "plugin-core": ">=1.0.0 <2.0.0",
    "plugin-lib": "1.x"
  }
}
```

## How To Fix

1. Replace `latest` with a specific semver range like `^1.0.0`
2. Add missing patch version: `1.0` → `1.0.0`
3. Remove `v` prefix: `v1.2.3` → `1.2.3`
4. Fix wildcard syntax: `1.x.x.x` → `1.x`
5. Use valid range operators:
   - `^` for compatible versions (recommended)
   - `~` for patch updates only
   - `>=` and `<` for explicit ranges
6. Test version ranges using semver.npmjs.com

## Options

This rule does not have any configuration options.

## When Not To Use It

Consider disabling this rule if you're using a custom version scheme that doesn't follow semver. However, this is not recommended - semver is the standard for plugin versioning and ensures predictable dependency resolution.

## Related Rules

- [plugin-circular-dependency](./plugin-circular-dependency.md) - Detects circular dependency chains
- [plugin-invalid-version](./plugin-invalid-version.md) - Validates the plugin's own version number

## Resources

- [Rule Implementation](../../src/validators/plugin.ts#L241)
- [Rule Tests](../../tests/validators/plugin.test.ts)
- [Semantic Versioning](https://semver.org/)

## Version

Available since: v1.0.0
