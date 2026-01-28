# Rule: settings-invalid-schema

**Severity**: Error
**Fixable**: No
**Validator**: Settings
**Category**: Schema Validation

Validates that settings.json conforms to Claude Code's expected JSON schema with correct field types, required properties, and valid values.

## Rule Details

Settings files must be valid JSON conforming to the Claude Code schema. This includes correct data types (string vs array vs object), valid enum values for fields like `model` and `action`, no unknown fields, and proper nested structure for permissions, hooks, and other configuration objects.

This rule catches invalid JSON syntax (comments, trailing commas, single quotes), wrong data types, invalid enum values, unknown fields, missing required fields, and incorrect nested structure. Invalid schema causes settings to be ignored and fallback to defaults.

### Incorrect

Invalid JSON syntax:

```json
{
  "model": "sonnet",  # Comments not allowed
  "permissions": [
    {
      "tool": "Bash"
      "action": "allow"
    }
  ]
}
```

Wrong data types:

```json
{
  "model": ["sonnet"],
  "permissions": "allow-all"
}
```

### Correct

Valid settings.json:

```json
{
  "model": "sonnet",
  "permissions": [
    {
      "tool": "Bash",
      "action": "allow",
      "pattern": "npm *"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "API_URL": "https://api.example.com"
  }
}
```

Minimal valid settings:

```json
{
  "model": "sonnet"
}
```

## How To Fix

1. **Validate JSON syntax**: Use `jq empty settings.json` or `python -m json.tool settings.json` to check
2. **Fix data types**: Ensure `model` is string, `permissions` is array, `env` is object, etc.
3. **Use valid enum values**: Model must be `sonnet`/`opus`/`haiku`/`inherit`, action must be `allow`/`deny`/`ask`
4. **Remove unknown fields**: Delete unrecognized fields not in the schema
5. **Fix common JSON errors**: Remove comments, trailing commas, use double quotes, avoid `undefined`

**Valid Top-Level Fields:**

- `model`: `"sonnet" | "opus" | "haiku" | "inherit"`
- `permissions`: Array of permission rules
- `env`: Object with environment variables
- `apiKeyHelper`: String path to helper script
- `hooks`: Array of hook definitions
- `attribution`, `statusLine`, `outputStyle`, `sandbox`, `enabledPlugins`, etc.

**Permission Rule Structure:**

```typescript
{
  tool: string,
  action: "allow" | "deny" | "ask",
  pattern?: string,
  prompt?: string
}
```

**Hook Structure:**

```typescript
{
  event: string,
  type: "command" | "prompt" | "agent",
  command?: string,  // if type is "command"
  prompt?: string,   // if type is "prompt"
  agent?: string,    // if type is "agent"
  matcher?: { tool?: string, pattern?: string }
}
```

**Common JSON Errors:**

- ❌ `// comments` → Remove comments
- ❌ `"field": value,}` → Remove trailing commas
- ❌ `'field': 'value'` → Use double quotes
- ❌ `undefined` → Use `null` or remove field

## Options

This rule does not have configuration options. Schema validation is always enabled.

## When Not To Use It

Never disable this rule. Invalid JSON causes Claude Code to fail loading settings, resulting in settings being ignored, fallback to defaults, unexpected behavior, and configuration errors. Always fix schema violations rather than disabling validation.

## Related Rules

- [settings-invalid-permission](./settings-invalid-permission.md) - Permission rule validation
- [settings-invalid-env-var](./settings-invalid-env-var.md) - Environment variable validation

## Resources

- [Implementation](../../../src/validators/settings.ts)
- [Tests](../../../tests/validators/settings.test.ts)
- [Settings Documentation](https://github.com/anthropics/claude-code)
- [JSON Validator](https://jsonlint.com/)

## Version

Available since: v1.0.0
