# Rule: plugin-description-required

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Category**: Best Practices

Plugin description is required and cannot be empty

## Rule Details

Every plugin must declare a `description` field in `plugin.json`. The description is a required field that explains what the plugin does to users. It must be a non-empty string that is not just whitespace.

The description field serves several purposes:

- **User discovery**: Helps users find relevant plugins in the marketplace
- **Installation decisions**: Users read descriptions before installing plugins
- **Search optimization**: Marketplace search indexes description text
- **Documentation**: First point of contact explaining plugin purpose
- **Marketplace requirements**: Required for marketplace submission and listing

This rule validates that `plugin.json` contains a `description` field that is a non-empty string. Empty strings, whitespace-only strings, and missing description fields all trigger an error.

### Incorrect

Missing description field:

```json
{
  "name": "my-plugin",
  "version": "1.0.0"
}
```

Empty description string:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": ""
}
```

Whitespace-only description:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "   "
}
```

Wrong type (non-string):

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": ["Plugin description"]
}
```

### Correct

Clear, concise description:

```json
{
  "name": "dev-tools",
  "version": "1.0.0",
  "description": "Essential development tools and utilities for building projects"
}
```

Description highlighting key features:

```json
{
  "name": "code-formatter",
  "version": "2.0.0",
  "description": "Automatically format code with support for TypeScript, Python, and Rust"
}
```

Description with problem statement:

```json
{
  "name": "test-runner",
  "version": "1.5.0",
  "description": "Run tests across multiple frameworks with parallel execution and coverage reporting"
}
```

## How To Fix

To add a required description field:

1. **Add description field** to plugin.json:

   ```json
   {
     "name": "my-plugin",
     "version": "1.0.0",
     "description": "A useful plugin that helps with development tasks"
   }
   ```

2. **Write clear, descriptive text** (1-2 sentences):

   ```bash
   # Good descriptions explain what and why
   "Format code automatically with Prettier, ESLint, and Black"
   "Run comprehensive test suites with coverage and parallel execution"
   "Generate TypeScript types from OpenAPI specifications"

   # Avoid vague descriptions
   "A plugin for development"  # Too vague
   "Plugin"                     # Meaningless
   ```

3. **Focus on user benefits**:

   ```json
   {
     "description": "Streamline your git workflow with automated commit messages and branch management"
   }
   ```

4. **Keep it concise** (typically 50-150 characters):

   ```bash
   # Check description length
   cat plugin.json | jq -r '.description | length'
   ```

5. **Update description** if needed:

   ```bash
   # Use jq to update description
   jq '.description = "New description text"' plugin.json > plugin.json.tmp
   mv plugin.json.tmp plugin.json
   ```

6. **Run validation**:

   ```bash
   claudelint check-plugin
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. The description field is mandatory for plugin functionality:

- Plugins without descriptions cannot be published to the marketplace
- Users cannot understand what the plugin does without a description
- Marketplace search relies on description text for discovery
- Installation decisions require clear description of functionality

Always include a meaningful description field rather than disabling validation.

## Related Rules

- [plugin-name-required](./plugin-name-required.md) - Validates plugin name field
- [plugin-version-required](./plugin-version-required.md) - Validates version field
- [plugin-invalid-manifest](./plugin-invalid-manifest.md) - Validates overall manifest structure

## Resources

- [Rule Implementation](../../src/rules/plugin/plugin-description-required.ts)
- [Rule Tests](../../tests/rules/plugin/plugin-description-required.test.ts)
- [Plugin Development Guide](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
