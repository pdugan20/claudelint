# Invalid Event

Hook event name is not recognized.

## Rule Details

This rule enforces that hook configurations in `hooks.json` use valid event names. Hooks allow you to execute custom code or prompts when specific events occur during Claude Code execution.

Valid hook events correspond to specific lifecycle points:

- Tool execution events
- Permission request events
- User interaction events
- Session lifecycle events
- Agent lifecycle events

**Category**: Hooks
**Severity**: error
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Unknown event name:

```json
{
  "hooks": [
    {
      "event": "BeforeToolExecution",   Invalid event name
      "type": "command",
      "command": "echo 'Running tool'"
    }
  ]
}
```text
Typo in event name:

```json
{
  "hooks": [
    {
      "event": "PreTooluse",   Should be "PreToolUse" (capital U)
      "type": "command",
      "command": "echo 'Before tool'"
    }
  ]
}
```text
Made-up event:

```json
{
  "hooks": [
    {
      "event": "OnFileChange",   Not a valid Claude Code event
      "type": "command",
      "command": "echo 'File changed'"
    }
  ]
}
```text
### Correct Examples

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
```text
Valid post-tool hook:

```json
{
  "hooks": [
    {
      "event": "PostToolUse",
      "type": "command",
      "command": "echo 'Tool completed successfully'"
    }
  ]
}
```text
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
```text
## Valid Hook Events

### Tool Execution Events

**PreToolUse**

Fires before a tool is executed.

```json
{
  "event": "PreToolUse",
  "type": "command",
  "command": "./scripts/pre-tool-check.sh"
}
```text
Use cases:

- Log tool usage
- Validate preconditions
- Set up environment

**PostToolUse**

Fires after a tool executes successfully.

```json
{
  "event": "PostToolUse",
  "type": "command",
  "command": "./scripts/post-tool-cleanup.sh"
}
```text
Use cases:

- Clean up resources
- Log results
- Trigger downstream actions

**PostToolUseFailure**

Fires when a tool execution fails.

```json
{
  "event": "PostToolUseFailure",
  "type": "command",
  "command": "./scripts/handle-tool-error.sh"
}
```text
Use cases:

- Error logging
- Alerting
- Cleanup after failures

### Permission Events

**PermissionRequest**

Fires when Claude requests permission to use a tool.

```json
{
  "event": "PermissionRequest",
  "type": "prompt",
  "prompt": "Requesting permission to execute {{tool}}"
}
```text
Use cases:

- Custom permission UI
- Audit logging
- Policy enforcement

### User Interaction Events

**UserPromptSubmit**

Fires when the user submits a prompt.

```json
{
  "event": "UserPromptSubmit",
  "type": "command",
  "command": "./scripts/log-prompt.sh"
}
```text
Use cases:

- Prompt logging
- Analytics
- Pre-processing

**Notification**

Fires when a notification is displayed.

```json
{
  "event": "Notification",
  "type": "command",
  "command": "./scripts/handle-notification.sh"
}
```text
Use cases:

- Custom notification handling
- Alert aggregation
- External integrations

**Stop**

Fires when execution is stopped.

```json
{
  "event": "Stop",
  "type": "command",
  "command": "./scripts/cleanup-on-stop.sh"
}
```text
Use cases:

- Cleanup
- Save state
- Cancel operations

### Agent Lifecycle Events

**SubagentStart**

Fires when a subagent starts.

```json
{
  "event": "SubagentStart",
  "type": "command",
  "command": "echo 'Subagent starting'"
}
```text
Use cases:

- Initialize subagent resources
- Logging
- Monitoring

**SubagentStop**

Fires when a subagent stops.

```json
{
  "event": "SubagentStop",
  "type": "command",
  "command": "echo 'Subagent stopped'"
}
```text
Use cases:

- Cleanup subagent resources
- Logging
- Performance tracking

### System Events

**PreCompact**

Fires before conversation context is compacted.

```json
{
  "event": "PreCompact",
  "type": "command",
  "command": "./scripts/save-context.sh"
}
```text
Use cases:

- Save important context
- Archive conversation
- Prepare for compaction

**Setup**

Fires during initial setup.

```json
{
  "event": "Setup",
  "type": "command",
  "command": "./scripts/initialize.sh"
}
```text
Use cases:

- Initialize environment
- Verify dependencies
- Configure settings

### Session Events

**SessionStart**

Fires when a new session starts.

```json
{
  "event": "SessionStart",
  "type": "command",
  "command": "./scripts/session-init.sh"
}
```text
Use cases:

- Session initialization
- Load preferences
- Start monitoring

**SessionEnd**

Fires when a session ends.

```json
{
  "event": "SessionEnd",
  "type": "command",
  "command": "./scripts/session-cleanup.sh"
}
```text
Use cases:

- Save session data
- Cleanup resources
- Generate reports

## How To Fix

### Option 1: Fix typos

```json
# Before - typo
{
  "event": "PreTooluse"  // Lowercase 'u'
}

# After - correct capitalization
{
  "event": "PreToolUse"  // Capital 'U'
}
```text
### Option 2: Use correct event name

```json
# Before - incorrect name
{
  "event": "BeforeToolExecution"
}

# After - valid event
{
  "event": "PreToolUse"
}
```text
### Option 3: Remove invalid hooks

```json
# Before - has invalid event
{
  "hooks": [
    {
      "event": "OnFileChange",  // Invalid
      "type": "command",
      "command": "echo 'test'"
    }
  ]
}

# After - removed
{
  "hooks": []
}
```text
## Complete Event List

Valid events (case-sensitive):

1. `PreToolUse`
2. `PostToolUse`
3. `PostToolUseFailure`
4. `PermissionRequest`
5. `UserPromptSubmit`
6. `Notification`
7. `Stop`
8. `SubagentStart`
9. `SubagentStop`
10. `PreCompact`
11. `Setup`
12. `SessionStart`
13. `SessionEnd`

## Options

This rule does not have any configuration options.

## When Not To Use It

You should **never** disable this rule. Invalid event names will cause:

- Hooks to never fire
- Silent failures
- Configuration errors
- Wasted development time

Always use valid event names rather than disabling this rule.

## Configuration

This rule should not be disabled, but if absolutely necessary:

```json
{
  "rules": {
    "hooks-invalid-event": "off"
  }
}
```text
To change to a warning (not recommended):

```json
{
  "rules": {
    "hooks-invalid-event": "warning"
  }
}
```text
## Related Rules

- [hooks-missing-script](./hooks-missing-script.md) - Hook script file must exist
- [hooks-invalid-config](./hooks-invalid-config.md) - Hook configuration must be valid

## Resources

- [Claude Code Hooks Documentation](https://github.com/anthropics/claude-code)
- [Event-Driven Architecture](https://en.wikipedia.org/wiki/Event-driven_architecture)

## Version

Available since: v1.0.0
