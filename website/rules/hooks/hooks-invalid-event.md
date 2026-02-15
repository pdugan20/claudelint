# hooks-invalid-event

<RuleHeader description="Hook events must be valid event names" severity="warn" :fixable="false" :configurable="false" category="Hooks" />

## Rule Details

This rule validates that the keys in the hooks object of settings.json correspond to recognized Claude Code hook events. Valid events are: PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest, UserPromptSubmit, Notification, Stop, SubagentStart, SubagentStop, PreCompact, SessionStart, SessionEnd, TeammateIdle, and TaskCompleted. An unrecognized event name means the hook will never fire, silently failing to provide the intended automation.

### Incorrect

Hook using a misspelled event name

```json
{
  "hooks": {
    "BeforeToolUse": [
      { "matcher": "*", "hooks": [{ "type": "command", "command": "./lint.sh" }] }
    ]
  }
}
```

### Correct

Hook using a valid event name

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "*", "hooks": [{ "type": "command", "command": "./lint.sh" }] }
    ]
  }
}
```

## How To Fix

Replace the invalid event name with one of the recognized hook events: PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest, UserPromptSubmit, Notification, Stop, SubagentStart, SubagentStop, PreCompact, SessionStart, SessionEnd, TeammateIdle, or TaskCompleted.

## Options

This rule does not have any configuration options.

## Related Rules

- [`hooks-missing-script`](/rules/hooks/hooks-missing-script)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/hooks/hooks-invalid-event.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/hooks/hooks-invalid-event.test.ts)

## Version

Available since: v0.2.0
