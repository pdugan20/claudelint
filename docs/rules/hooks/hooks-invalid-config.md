# Rule: hooks-invalid-config

**Severity**: Error
**Fixable**: No
**Validator**: Hooks
**Category**: Schema Validation

Validates that hook configurations have valid types (command, prompt, or agent) with all required fields present and properly formatted.

## Rule Details

Each hook must specify a valid type and include the corresponding required field for that type. The three hook types are: `command` (executes shell command), `prompt` (displays custom prompt), and `agent` (launches subagent). Optional matchers must have valid tool names and regex patterns.

This rule detects invalid hook types, missing required fields for the specified type, invalid tool names in matchers, and malformed regex patterns. Each type has specific required fields that must be present and non-empty.

### Incorrect

Missing required field:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command"
    }
  ]
}
```

Invalid regex in matcher:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "echo 'test'",
      "matcher": {
        "pattern": "[invalid("
      }
    }
  ]
}
```

### Correct

Valid command hook:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "./scripts/pre-tool.sh"
    }
  ]
}
```

Hook with valid matcher:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "./scripts/validate-bash.sh",
      "matcher": {
        "tool": "Bash",
        "pattern": "^npm"
      }
    }
  ]
}
```

## How To Fix

1. **Use valid hook type**: Must be `"command"`, `"prompt"`, or `"agent"`
2. **Add required fields**: Command hooks need `command`, prompt hooks need `prompt`, agent hooks need `agent`
3. **Fix regex patterns**: Ensure matcher patterns are valid regex (escape special characters, close brackets)
4. **Use valid tool names**: Matcher tool names must match available Claude tools (e.g., `"Bash"`, `"Read"`, `"Write"`)
5. **Ensure non-empty values**: All required fields must have non-empty string values

**Hook Types:**

- `command`: Executes shell command (requires `command` field)
- `prompt`: Displays custom prompt (requires `prompt` field with template variables like `{{tool}}`)
- `agent`: Launches subagent (requires `agent` field with agent identifier)

**Matcher Structure (optional):**

```json
{
  "matcher": {
    "tool": "Bash",
    "pattern": "^git"
  }
}
```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid hook configuration causes runtime failures, silent errors, unexpected behavior, and difficult debugging. Always fix configuration issues rather than disabling validation.

## Related Rules

- [hooks-invalid-event](./hooks-invalid-event.md) - Hook event name validation
- [hooks-missing-script](./hooks-missing-script.md) - Hook script file validation

## Resources

- [Implementation](../../../src/validators/hooks.ts)
- [Tests](../../../tests/validators/hooks.test.ts)
- [Hooks Documentation](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
