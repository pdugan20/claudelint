# Rule: hooks-invalid-config

**Severity**: Error
**Fixable**: No
**Validator**: Hooks
**Category**: Schema Validation

Hook configuration must be valid

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

To resolve hook configuration errors:

1. **Invalid hook type**: Change `type` to one of: `command`, `prompt`, or `agent`

2. **Missing required field for type**:
   - If `type: "command"` - add `"command": "./path/to/script.sh"`
   - If `type: "prompt"` - add `"prompt": "Your prompt text here"`
   - If `type: "agent"` - add `"agent": "agent-name"`

3. **Invalid regex pattern**: Fix the regex in `matcher.pattern` using valid regex syntax

4. **Invalid tool name in matcher**: Use a valid tool name from Claude Code's tool registry

Verify your hooks.json is valid JSON and all required fields are present for each hook.

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid hook configuration causes runtime failures, silent errors, unexpected behavior, and difficult debugging. Always fix configuration issues rather than disabling validation.

## Related Rules

- [hooks-invalid-event](./hooks-invalid-event.md) - Hook event name validation
- [hooks-missing-script](./hooks-missing-script.md) - Hook script file validation

## Resources

- [Rule Implementation](../../src/rules/hooks/hooks-invalid-config.ts)
- [Rule Tests](../../tests/validators/hooks.test.ts)
- [Hooks Documentation](https://github.com/anthropics/claude-code)

## Version

Available since: v0.2.0
