# Rule: hooks-invalid-event

**Severity**: Error
**Fixable**: No
**Validator**: Hooks
**Category**: Schema Validation

Validates that hook configurations use recognized event names from the Claude Code lifecycle.

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

1. **Fix typos**: Correct capitalization errors (e.g., `PreTooluse` → `PreToolUse`)
2. **Use valid event names**: Replace incorrect names with events from the valid list above
3. **Check case sensitivity**: Ensure exact capitalization matches (`PreToolUse` not `pretooluse`)
4. **Remove invalid hooks**: Delete hooks referencing non-existent events
5. **Verify event exists**: Cross-reference with the 13 valid events listed in Rule Details

**Event Categories:**

- Tool execution: Pre/post tool use and failures
- Permissions: Permission requests
- User interaction: Prompt submission, notifications, stop
- Agent lifecycle: Subagent start/stop
- System: Context compaction, setup
- Session: Session start/end

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid event names cause hooks to never fire, silent failures, configuration errors, and wasted development time. Always use valid event names rather than disabling validation.

## Related Rules

- [hooks-missing-script](./hooks-missing-script.md) - Hook script file validation
- [hooks-invalid-config](./hooks-invalid-config.md) - Hook configuration validation

## Resources

- [Implementation](../../../src/validators/hooks.ts)
- [Tests](../../../tests/validators/hooks.test.ts)
- [Hooks Documentation](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
