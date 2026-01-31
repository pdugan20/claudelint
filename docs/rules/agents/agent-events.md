# Rule: agent-events

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Category**: Schema Validation

Agent events must be an array of event names (max 3 items)

## Rule Details

The `events` field specifies which Claude Code events trigger this agent. It must be formatted as an array of valid event names and is limited to a maximum of 3 events to prevent over-subscription and performance issues.

Events allow agents to respond to specific triggers in the Claude Code workflow, such as before or after tool usage, or when specific conditions are met.

### Incorrect

Not an array:

```markdown
---
name: validator
description: Validates code before commits
events: PreToolUse
---
```

Too many events (more than 3):

```markdown
---
name: monitor
description: Monitors all activities
events:
  - PreToolUse
  - PostToolUse
  - PreCommit
  - PostCommit
---
```

Invalid format:

```markdown
---
name: validator
description: Validates code before commits
events:
  event1: PreToolUse
  event2: PostToolUse
---
```

### Correct

Valid single event:

```markdown
---
name: pre-commit-validator
description: Validates code before commits
events:
  - PreCommit
---
```

Multiple events (within limit):

```markdown
---
name: tool-monitor
description: Monitors tool usage
events:
  - PreToolUse
  - PostToolUse
---
```

Maximum allowed events:

```markdown
---
name: workflow-tracker
description: Tracks key workflow events
events:
  - PreCommit
  - PostCommit
  - PreToolUse
---
```

## How To Fix

To fix events configuration:

1. **Format as array**: Use YAML array syntax with hyphens

   ```yaml
   events:
     - PreToolUse
     - PostToolUse
   ```

2. **Limit to 3 events**: Remove excess events if you have more than 3
   - Consider splitting into multiple agents if you need more event coverage
   - Focus on the most critical events for your use case

3. **Use valid event names**: Reference actual Claude Code event names
   - PreToolUse
   - PostToolUse
   - PreCommit
   - PostCommit
   - (Check Claude Code documentation for complete list)

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid `events` configuration causes:

- Runtime errors when Claude Code tries to register event handlers
- Events not triggering when expected
- Performance degradation from excessive event subscriptions
- Confusion about when agents activate

The 3-event limit is a deliberate design constraint to prevent performance issues. If you need more event coverage, create multiple focused agents instead.

## Related Rules

- [agent-hooks](./agent-hooks.md) - Agent hooks configuration validation
- [agent-name](./agent-name.md) - Agent name format validation

## Resources

- [Rule Implementation](../../src/rules/agents/agent-events.ts)
- [Rule Tests](../../tests/rules/agents/agent-events.test.ts)

## Version

Available since: v1.0.0
