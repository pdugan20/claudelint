# Rule: plugin-dependency-invalid-version

**Severity**: Warning
**Fixable**: No
**Validator**: Plugin
**Category**: Schema Validation

Plugin dependency versions must use valid semver ranges

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

To fix invalid dependency versions:

1. **Identify invalid versions** in plugin.json dependencies

2. **Replace "latest"** with specific version ranges:

   ```json
   # Before
   "dependencies": {
     "plugin-utils": "latest"
   }

   # After
   "dependencies": {
     "plugin-utils": "^2.0.0"
   }
   ```

3. **Fix incomplete versions**:

   ```json
   # Before: "1.0" (missing patch)
   # After: "1.0.0" or "~1.0.0"
   ```

4. **Remove "v" prefix**:

   ```json
   # Before: "v1.2.3"
   # After: "1.2.3"
   ```

5. **Use valid semver ranges**:
   - `^1.0.0` - Compatible with 1.x.x
   - `~1.2.3` - Patch updates only
   - `>=1.0.0 <2.0.0` - Range
   - `1.x` - Any 1.x version

6. **Run validation**:

   ```bash
   claude-code-lint check-plugin
   ```

## Options

This rule does not have any configuration options.

## When Not To Use It

Consider disabling this rule if you're using a custom version scheme that doesn't follow semver. However, this is not recommended - semver is the standard for plugin versioning and ensures predictable dependency resolution.

## Related Rules

- [plugin-circular-dependency](./plugin-circular-dependency.md) - Detects circular dependency chains
- [plugin-invalid-version](./plugin-invalid-version.md) - Validates the plugin's own version number

## Resources

- [Rule Implementation](../../src/rules/plugin/plugin-dependency-invalid-version.ts)
- [Rule Tests](../../tests/rules/plugin/plugin-dependency-invalid-version.test.ts)
- [Semantic Versioning](https://semver.org/)

## Version

Available since: v1.0.0
