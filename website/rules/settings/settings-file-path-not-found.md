# Rule: settings-file-path-not-found

**Severity**: Warning
**Fixable**: No
**Validator**: Settings
**Category**: Cross-Reference

Referenced file path does not exist

## Rule Details

Settings can reference external files through fields like `apiKeyHelper` (custom API key scripts) and `outputStyle` (custom output formatting). This rule validates that referenced files actually exist on disk.

The rule checks:

- **apiKeyHelper**: Script path for custom API key retrieval
- **outputStyle**: Path to custom output style markdown files

Paths with variable expansion (`${VAR}` syntax) are skipped since they can't be validated at lint time. Missing files cause runtime errors when Claude Code tries to load them.

### Incorrect

API key helper script doesn't exist:

```json
{
  "apiKeyHelper": "./.claude/scripts/get-api-key.sh"
}
```

Output style file doesn't exist:

```json
{
  "outputStyle": "./.claude/output-styles/custom-format.md"
}
```

Multiple missing files:

```json
{
  "apiKeyHelper": "./scripts/api-helper.sh",
  "outputStyle": "./styles/custom.md"
}
```

### Correct

Files exist at specified paths:

```json
{
  "apiKeyHelper": "./.claude/scripts/get-api-key.sh",
  "outputStyle": "./.claude/output-styles/custom-format.md"
}
```

Directory structure:

```text
.claude/
├── settings.json
├── scripts/
│   └── get-api-key.sh
└── output-styles/
    └── custom-format.md
```

Using variable expansion (not validated):

```json
{
  "apiKeyHelper": "${API_SCRIPT_PATH}",
  "outputStyle": "${CUSTOM_STYLE}"
}
```

## How To Fix

To resolve missing file errors:

1. **Create the missing file** at the specified path:

   ```bash
   mkdir -p .claude/scripts
   touch .claude/scripts/get-api-key.sh
   chmod +x .claude/scripts/get-api-key.sh
   ```

2. **Fix the path** if the file exists elsewhere:

   ```json
   {
     "apiKeyHelper": "./correct/path/to/script.sh"
   }
   ```

3. **Use variable expansion** if the path is dynamic:

   ```json
   {
     "apiKeyHelper": "${API_KEY_HELPER_SCRIPT}"
   }
   ```

4. **Remove the field** if you don't need the custom file:

   ```json
   {
     "permissions": [...],
     "env": {...}
   }
   ```

Ensure all referenced files exist and paths are relative to the settings.json location (typically `.claude/settings.json`).

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if you're dynamically generating files or using environment-specific paths that may not exist during linting. However, it's better to use variable expansion for such cases.

## Related Rules

- [settings-invalid-schema](./settings-invalid-env-var.md) - Settings file schema validation
- [skill-referenced-file-not-found](../skills/skill-referenced-file-not-found.md) - Similar file validation for skills

## Resources

- [Rule Implementation](../../src/rules/settings/settings-file-path-not-found.ts)
- [Rule Tests](../../tests/validators/settings.test.ts)

## Version

Available since: v1.0.0
