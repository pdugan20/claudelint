# Rule: plugin-version-required

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Category**: Best Practices

Plugin version is required and cannot be empty

## Rule Details

Every plugin must declare a `version` field in `plugin.json`. The version is a required field used for dependency management, marketplace distribution, and update tracking. It must be a non-empty string that is not just whitespace.

The version field enables:
- **Dependency resolution**: Other plugins can specify version requirements
- **Update detection**: Claude Code can detect when updates are available
- **Marketplace distribution**: The marketplace uses versions to track releases
- **Compatibility checking**: Users can verify plugin compatibility with their setup
- **Change tracking**: Version history helps users understand plugin evolution

This rule validates that `plugin.json` contains a `version` field that is a non-empty string. Empty strings, whitespace-only strings, and missing version fields all trigger an error.

### Incorrect

Missing version field:

```json
{
  "name": "my-plugin",
  "description": "A useful plugin"
}
```

Empty version string:

```json
{
  "name": "my-plugin",
  "version": "",
  "description": "A useful plugin"
}
```

Whitespace-only version:

```json
{
  "name": "my-plugin",
  "version": "   ",
  "description": "A useful plugin"
}
```

Wrong type (number instead of string):

```json
{
  "name": "my-plugin",
  "version": 1.0,
  "description": "A useful plugin"
}
```

### Correct

Semantic version format:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A useful plugin"
}
```

With pre-release tag:

```json
{
  "name": "my-plugin",
  "version": "2.1.0-beta.1",
  "description": "A useful plugin"
}
```

With build metadata:

```json
{
  "name": "my-plugin",
  "version": "1.5.2+20230615",
  "description": "A useful plugin"
}
```

## How To Fix

To add a required version field:

1. **Add version field** to plugin.json:
   ```json
   {
     "name": "my-plugin",
     "version": "1.0.0",
     "description": "A useful plugin"
   }
   ```

2. **Use semantic versioning** format (MAJOR.MINOR.PATCH):
   ```text
   1.0.0 - Initial release
   1.1.0 - Added new features
   1.1.1 - Fixed bugs
   2.0.0 - Breaking changes
   ```

3. **Choose appropriate version** based on development stage:
   ```bash
   # For new plugins starting development
   "version": "0.1.0"

   # For first stable release
   "version": "1.0.0"

   # For beta/alpha releases
   "version": "1.0.0-beta.1"
   ```

4. **Update version** when making changes:
   ```bash
   # Use jq to update version
   jq '.version = "1.1.0"' plugin.json > plugin.json.tmp
   mv plugin.json.tmp plugin.json
   ```

5. **Run validation**:
   ```bash
   claudelint check-plugin
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. The version field is mandatory for plugin functionality:
- Plugins without versions cannot be published to the marketplace
- Dependency management requires version information
- Update checking relies on version comparison
- Claude Code may fail to load plugins without versions

Always include a valid version field rather than disabling validation.

## Related Rules

- [plugin-invalid-version](./plugin-invalid-version.md) - Validates version format follows semver
- [plugin-name-required](./plugin-name-required.md) - Validates plugin name field
- [plugin-description-required](./plugin-description-required.md) - Validates description field
- [plugin-invalid-manifest](./plugin-invalid-manifest.md) - Validates overall manifest structure

## Resources

- [Rule Implementation](../../src/rules/plugin/plugin-version-required.ts)
- [Rule Tests](../../tests/rules/plugin/plugin-version-required.test.ts)
- [Semantic Versioning](https://semver.org/)
- [Plugin Development Guide](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
