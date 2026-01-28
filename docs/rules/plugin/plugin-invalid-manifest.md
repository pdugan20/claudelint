# Rule: plugin-invalid-manifest

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Category**: Schema Validation

Validates that plugin manifest files (`plugin.json`) follow the required schema with all mandatory fields present and properly formatted.

## Rule Details

Plugin manifests must be valid JSON at the repository root with three required fields: `name`, `version`, and `description`. The manifest describes the plugin's metadata, components, and dependencies. All field values must be non-empty, use correct types, and follow naming conventions.

This rule detects missing or empty required fields, invalid JSON syntax (comments, trailing commas), wrong field types (e.g., string instead of array), and manifests in incorrect locations (`.claude-plugin/` instead of root).

### Incorrect

Missing required fields:

```json
{
  "name": "my-plugin"
}
```

Empty or wrong-type fields:

```json
{
  "name": "",
  "version": 1.0,
  "description": "   ",
  "skills": "single-skill"
}
```

### Correct

Minimal valid manifest:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A plugin that provides useful tools"
}
```

Complete manifest with optional fields:

```json
{
  "name": "development-tools",
  "version": "2.1.0",
  "description": "Essential development tools and utilities",
  "author": "Jane Developer",
  "repository": "https://github.com/example/dev-tools",
  "license": "MIT",
  "skills": ["format-code", "run-tests"],
  "agents": ["code-reviewer"],
  "hooks": ["pre-commit"],
  "commands": ["build"],
  "mcpServers": ["local-analyzer"],
  "dependencies": {
    "prettier": "^3.0.0",
    "eslint": "^8.0.0"
  }
}
```

## How To Fix

1. **Add missing required fields**: Ensure `name`, `version`, and `description` are present
2. **Fill empty values**: Replace empty strings or whitespace-only values with actual content
3. **Fix field types**: Use strings for name/version/description, arrays for skills/agents/hooks/commands/mcpServers
4. **Move to repository root**: Place `plugin.json` at root, not in `.claude-plugin/` directory
5. **Clean JSON syntax**: Remove comments and trailing commas to ensure valid JSON

**Required Fields:**

- `name` (string): Unique identifier, use kebab-case
- `version` (string): Semantic version (e.g., `"1.0.0"`)
- `description` (string): Clear description of plugin functionality

**Optional Fields:**

`author`, `repository`, `license`, `skills`, `agents`, `hooks`, `commands`, `mcpServers`, `dependencies`

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid plugin manifests cause installation failures, prevent Claude Code from recognizing the plugin, and result in marketplace submission rejection. Always fix manifest issues rather than disabling validation.

## Related Rules

- [plugin-invalid-version](./plugin-invalid-version.md) - Version format validation
- [plugin-missing-file](./plugin-missing-file.md) - Referenced file validation

## Resources

- [Implementation](../../../src/validators/plugin.ts)
- [Tests](../../../tests/validators/plugin.test.ts)
- [Plugin Development Guide](https://github.com/anthropics/claude-code)
- [Semantic Versioning](https://semver.org/)

## Version

Available since: v1.0.0
