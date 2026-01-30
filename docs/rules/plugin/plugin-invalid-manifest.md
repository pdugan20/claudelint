# Rule: plugin-invalid-manifest

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Category**: Schema Validation

marketplace.json must be valid and reference existing files

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

To fix invalid marketplace.json:

1. **Check JSON syntax**:
   ```bash
   # Validate JSON is parseable
   cat marketplace.json | jq .
   ```

2. **Add required fields** if missing:
   ```json
   {
     "name": "my-plugin",
     "version": "1.0.0",
     "description": "A useful plugin"
   }
   ```

3. **Fix empty or wrong-type fields**:
   ```bash
   # Remove empty strings
   # Change number to string for version
   # Change string to array for skills/agents/etc
   ```

4. **Ensure versions match** between plugin.json and marketplace.json:
   ```bash
   # Check both versions
   jq '.version' plugin.json
   jq '.version' marketplace.json
   # They must be identical
   ```

5. **Move to correct location** if needed:
   ```bash
   # marketplace.json must be at repository root
   mv .claude-plugin/marketplace.json ./marketplace.json
   ```

6. **Run validation**:
   ```bash
   claudelint check-plugin
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid plugin manifests cause installation failures, prevent Claude Code from recognizing the plugin, and result in marketplace submission rejection. Always fix manifest issues rather than disabling validation.

## Related Rules

- [plugin-invalid-version](./plugin-invalid-version.md) - Version format validation
- [plugin-missing-file](./plugin-missing-file.md) - Referenced file validation

## Resources

- [Rule Implementation](../../src/rules/plugin/plugin-invalid-manifest.ts)
- [Rule Tests](../../tests/rules/plugin/plugin-invalid-manifest.test.ts)
- [Plugin Development Guide](https://github.com/anthropics/claude-code)
- [Semantic Versioning](https://semver.org/)

## Version

Available since: v1.0.0
