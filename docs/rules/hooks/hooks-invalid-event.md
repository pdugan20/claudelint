# Rule: hooks-invalid-event

**Severity**: Warning
**Fixable**: No
**Validator**: Hooks
**Category**: Schema Validation

Hook events must be valid event names

## Rule Details

Hooks execute custom code or prompts when specific Claude Code events occur. Event names are case-sensitive and must match exactly from the list of 13 valid events covering tool execution, permissions, user interaction, session lifecycle, and agent lifecycle.

This rule detects typos in event names, unknown event names, and made-up events. Using invalid event names causes hooks to never fire, resulting in silent failures and wasted development effort.

**Valid Events (case-sensitive):**

Tool: `PreToolUse`, `PostToolUse`, `PostToolUseFailure`
Permission: `PermissionRequest`
User: `UserPromptSubmit`, `Notification`, `Stop`
Agent: `SubagentStart`, `SubagentStop`
System: `PreCompact`, `Setup`
Session: `SessionStart`, `SessionEnd`

### Incorrect

Typo in event name:

```json
{
  "hooks": [
    {
      "event": "PreTooluse",
      "type": "command",
      "command": "echo 'Before tool'"
    }
  ]
}
```

Unknown event:

```json
{
  "hooks": [
    {
      "event": "OnFileChange",
      "type": "command",
      "command": "echo 'File changed'"
    }
  ]
}
```

### Correct

Valid pre-tool hook:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "echo 'About to use tool'"
    }
  ]
}
```

Multiple valid hooks:

```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "echo 'Session started'"
    },
    {
      "event": "SessionEnd",
      "type": "command",
      "command": "echo 'Session ended'"
    }
  ]
}
```

## How To Fix

To fix invalid hook event names:

1. Check the event name for typos (events are case-sensitive)
2. Compare against the valid events list above
3. Replace the invalid event name with a valid one

Common mistakes:
- `PreTooluse` → `PreToolUse` (capital U)
- `pretooluse` → `PreToolUse` (wrong case)
- `OnFileChange` → Not a valid event (use appropriate lifecycle event)
- `BeforeToolUse` → `PreToolUse` (wrong prefix)

If you need an event that doesn't exist, consider:
- Using the closest existing event
- Combining multiple hooks for different events
- Using matchers to filter within an existing event

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid event names cause hooks to never fire, silent failures, configuration errors, and wasted development time. Always use valid event names rather than disabling validation.

## Related Rules

- [hooks-missing-script](./hooks-missing-script.md) - Hook script file validation
- [hooks-invalid-config](./hooks-invalid-config.md) - Hook configuration validation

## Resources

- [Rule Implementation](../../src/rules/hooks/hooks-invalid-event.ts)
- [Rule Tests](../../tests/validators/hooks.test.ts)
- [Hooks Documentation](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
