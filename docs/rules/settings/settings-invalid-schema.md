# Invalid Schema

Settings file does not match the expected JSON schema.

## Rule Details

This rule enforces that `settings.json` files conform to Claude Code's expected schema. Settings files must be valid JSON with correct field types, required properties, and valid values.

Schema validation catches:

- Invalid JSON syntax
- Wrong data types (string vs number, etc.)
- Unknown fields
- Missing required fields
- Invalid enum values
- Incorrect nested structure

**Category**: Settings
**Severity**: error
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Invalid JSON syntax:

```json
{
  "model": "sonnet",  # Comments not allowed in JSON
  "permissions": [
    {
      "tool": "Bash"
      "action": "allow"   Missing comma
    }
  ]
}
```

Wrong data type:

```json
{
  "model": ["sonnet"],   Should be string, not array
  "permissions": "allow-all"   Should be array, not string
}
```

Invalid enum value:

```json
{
  "model": "gpt-4",   Invalid value, must be: sonnet, opus, haiku, or inherit
  "permissions": [
    {
      "tool": "Bash",
      "action": "grant"   Invalid, must be: allow, deny, or ask
    }
  ]
}
```

Unknown fields:

```json
{
  "model": "sonnet",
  "debugMode": true,   Unknown field
  "maxTokens": 1000   Unknown field
}
```

### Correct Examples

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

Complete valid settings:

```json
{
  "model": "sonnet",
  "permissions": [
    {
      "tool": "Bash",
      "action": "allow",
      "pattern": "npm *"
    },
    {
      "tool": "Write",
      "action": "ask",
      "pattern": "src/**/*.ts"
    }
  ],
  "env": {
    "NODE_ENV": "development",
    "DEBUG": "true"
  },
  "apiKeyHelper": "./scripts/get-api-key.sh",
  "hooks": [
    {
      "event": "beforeToolUse",
      "type": "command",
      "command": "echo 'Running tool'"
    }
  ],
  "statusLine": "custom",
  "outputStyle": "./styles/output.css",
  "sandbox": {
    "enabled": true
  },
  "enabledPlugins": {
    "my-plugin": true
  }
}
```

## Valid Schema Structure

### Top-Level Fields

- `model`: `"sonnet" | "opus" | "haiku" | "inherit"`
- `permissions`: Array of permission rules
- `env`: Object with environment variables
- `apiKeyHelper`: String path to helper script
- `hooks`: Array of hook definitions
- `attribution`: Attribution settings
- `statusLine`: String or status line config
- `outputStyle`: String path to CSS file
- `sandbox`: Sandbox configuration
- `enabledPlugins`: Object mapping plugin names to enabled state
- `extraKnownMarketplaces`: Marketplace configurations
- `strictKnownMarketplaces`: Boolean

### Permission Rule Schema

```typescript
{
  tool: string,         // Required: tool name
  action: "allow" | "deny" | "ask",  // Required
  pattern?: string,     // Optional: glob pattern
  prompt?: string       // Optional: custom prompt
}
```

### Hook Schema

```typescript
{
  event: string,        // Required: hook event name
  type: "command" | "prompt" | "agent",  // Required
  command?: string,     // Required if type is "command"
  prompt?: string,      // Required if type is "prompt"
  agent?: string,       // Required if type is "agent"
  matcher?: {           // Optional: conditional execution
    tool?: string,
    pattern?: string
  }
}
```

## How To Fix

### Option 1: Validate JSON syntax

Use a JSON validator:

```bash
# Use jq to validate
jq empty settings.json

# Or use Python
python -m json.tool settings.json
```

### Option 2: Check field types

```json
# Before - wrong types
{
  "model": ["sonnet"],  // Wrong: array
  "permissions": "allow"  // Wrong: string
}

# After - correct types
{
  "model": "sonnet",  // Correct: string
  "permissions": []  // Correct: array
}
```

### Option 3: Fix enum values

```json
# Before - invalid values
{
  "model": "gpt-4",  // Invalid
  "permissions": [{
    "action": "grant"  // Invalid
  }]
}

# After - valid values
{
  "model": "sonnet",  // Valid: sonnet, opus, haiku, inherit
  "permissions": [{
    "action": "allow"  // Valid: allow, deny, ask
  }]
}
```

### Option 4: Remove unknown fields

```json
# Before - has unknown fields
{
  "model": "sonnet",
  "debug": true,  // Unknown
  "timeout": 5000  // Unknown
}

# After - only valid fields
{
  "model": "sonnet"
}
```

## Common Schema Errors

### 1. Comments in JSON

```json
 Invalid:
{
  // This is a comment
  "model": "sonnet"
}

 Valid:
{
  "model": "sonnet"
}
```

### 2. Trailing commas

```json
 Invalid:
{
  "model": "sonnet",
  "env": {},
}

 Valid:
{
  "model": "sonnet",
  "env": {}
}
```

### 3. Single quotes

```json
 Invalid:
{
  'model': 'sonnet'
}

 Valid:
{
  "model": "sonnet"
}
```

### 4. Undefined values

```json
 Invalid:
{
  "model": undefined
}

 Valid:
{
  "model": "sonnet"
}
```

## Options

This rule does not have any configuration options. Schema validation is always enabled.

## When Not To Use It

You should **never** disable this rule. Invalid JSON will cause Claude Code to fail loading settings, resulting in:

- Settings being ignored
- Fallback to defaults
- Unexpected behavior
- Configuration errors

Always fix schema violations rather than disabling this rule.

## Configuration

This rule should not be disabled, but if absolutely necessary:

```json
{
  "rules": {
    "settings-invalid-schema": "off"
  }
}
```

To change to a warning (not recommended):

```json
{
  "rules": {
    "settings-invalid-schema": "warning"
  }
}
```

## Related Rules

- [settings-invalid-permission](./settings-invalid-permission.md) - Invalid permission rules
- [settings-invalid-env-var](./settings-invalid-env-var.md) - Invalid environment variables

## Resources

- [Claude Code Settings Documentation](https://github.com/anthropics/claude-code)
- [JSON Schema](https://json-schema.org/)
- [JSON Validator](https://jsonlint.com/)

## Version

Available since: v1.0.0
