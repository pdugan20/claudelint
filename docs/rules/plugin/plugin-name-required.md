# Rule: plugin-name-required

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Category**: Best Practices

Plugin name is required and cannot be empty

## Rule Details

Every plugin must declare a `name` field in `plugin.json`. The name is a required field that uniquely identifies the plugin in the marketplace and dependency resolution. It must be a non-empty string that is not just whitespace.

The name field serves several critical purposes:

- **Unique identification**: Distinguishes the plugin from all other plugins
- **Marketplace listing**: Used as the primary identifier in plugin marketplace
- **Dependency resolution**: Other plugins reference this name in their dependencies
- **Installation**: Users install plugins by name using the Claude CLI
- **Display**: Shows in the Claude Code UI when listing installed plugins

This rule validates that `plugin.json` contains a `name` field that is a non-empty string. Empty strings, whitespace-only strings, and missing name fields all trigger an error.

### Incorrect

Missing name field:

```json
{
  "version": "1.0.0",
  "description": "A useful plugin"
}
```

Empty name string:

```json
{
  "name": "",
  "version": "1.0.0",
  "description": "A useful plugin"
}
```

Whitespace-only name:

```json
{
  "name": "   ",
  "version": "1.0.0",
  "description": "A useful plugin"
}
```

Wrong type (non-string):

```json
{
  "name": ["my-plugin"],
  "version": "1.0.0",
  "description": "A useful plugin"
}
```

### Correct

Clear, descriptive name:

```json
{
  "name": "dev-tools",
  "version": "1.0.0",
  "description": "Essential development tools and utilities"
}
```

Name with vendor prefix:

```json
{
  "name": "acme-code-formatter",
  "version": "1.0.0",
  "description": "ACME Corporation's code formatting plugin"
}
```

Name following conventions:

```json
{
  "name": "typescript-analyzer",
  "version": "2.0.0",
  "description": "Static analysis tools for TypeScript projects"
}
```

## How To Fix

To add a required name field:

1. **Add name field** to plugin.json:

   ```json
   {
     "name": "my-plugin",
     "version": "1.0.0",
     "description": "A useful plugin"
   }
   ```

2. **Follow naming conventions**:

   ```bash
   # Use lowercase with hyphens
   "name": "code-formatter"

   # Include scope/vendor if needed
   "name": "acme-dev-tools"

   # Be descriptive but concise
   "name": "typescript-test-runner"

   # Avoid special characters except hyphens
   # Good: "web-dev-tools"
   # Bad:  "web_dev_tools!"
   ```

3. **Choose a unique name**:

   ```bash
   # Search the marketplace to avoid conflicts
   claude plugin search "your-plugin-name"

   # Use a vendor prefix to ensure uniqueness
   "name": "mycompany-tools"
   ```

4. **Keep it concise** (typically 3-30 characters):

   ```bash
   # Check name length
   cat plugin.json | jq -r '.name | length'
   ```

5. **Update name** if needed:

   ```bash
   # Use jq to update name
   jq '.name = "new-plugin-name"' plugin.json > plugin.json.tmp
   mv plugin.json.tmp plugin.json
   ```

6. **Run validation**:

   ```bash
   claudelint check-plugin
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. The name field is mandatory for plugin functionality:

- Plugins without names cannot be installed or loaded by Claude Code
- Marketplace submission requires a valid name
- Dependency resolution relies on plugin names
- The Claude CLI uses names to manage plugins (install, uninstall, update)

Always include a valid name field rather than disabling validation. Choosing a good name is essential for plugin discoverability and usability.

## Related Rules

- [plugin-version-required](./plugin-version-required.md) - Validates version field
- [plugin-description-required](./plugin-description-required.md) - Validates description field
- [plugin-invalid-manifest](./plugin-invalid-manifest.md) - Validates overall manifest structure

## Resources

- [Rule Implementation](../../src/rules/plugin/plugin-name-required.ts)
- [Rule Tests](../../tests/rules/plugin/plugin-name-required.test.ts)
- [Plugin Development Guide](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
