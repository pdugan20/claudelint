# agent-hooks-invalid-schema

<RuleHeader description="Hook configuration in agents.json violates schema requirements" severity="error" :fixable="false" :configurable="false" category="Agents" />

## Rule Details

This rule checks that hooks declared in agents.json have the correct structure and all required fields. Hook objects must include valid event names (e.g., PreToolUse, PostToolUse, SessionStart, TaskCompleted) and properly structured matchers. Validation is performed by AgentsValidator.validateFrontmatter() using the shared validateSettingsHooks() utility. Invalid hook schemas cause runtime failures when the agent framework attempts to register event handlers.

### Incorrect

Hook with missing required command field

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash" }
    ]
  }
}
```

Hook with invalid event name

```json
{
  "hooks": {
    "OnStart": [
      { "matcher": ".*", "command": "echo hi" }
    ]
  }
}
```

### Correct

Properly structured hook with all required fields

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash", "command": "echo pre-check" }
    ]
  }
}
```

## How To Fix

Ensure each hook entry has a valid event name key (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest, UserPromptSubmit, Notification, Stop, SubagentStart, SubagentStop, PreCompact, SessionStart, SessionEnd, TeammateIdle, or TaskCompleted) and that each matcher object includes the required fields.

## Options

This rule does not have any configuration options.

## Related Rules

- [`agent-hooks`](/rules/agents/agent-hooks)
- [`hooks-invalid-event`](/rules/hooks/hooks-invalid-event)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-hooks-invalid-schema.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-hooks-invalid-schema.test.ts)

## Version

Available since: v0.2.0
