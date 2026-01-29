# Rule: agent-hooks-invalid-schema

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Category**: Schema Validation

Hook configuration in agents.json violates schema requirements

## Rule Details

This rule triggers when a hook configuration in agents.json violates the schema requirements. Hooks must have valid event names, valid hook types, and the required fields for their type. The rule also validates that regex patterns in matchers are syntactically correct.

Hook validation checks:
- **Event name**: Must be one of the valid hook events (e.g., `user-prompt-submit`, `tool-call`, etc.)
- **Hook type**: Must be `command`, `prompt`, or `agent`
- **Required fields**: Command hooks need `command`, prompt hooks need `prompt`, agent hooks need `agent`
- **Matcher pattern**: If present, must be valid regex syntax

Invalid hook configurations cause runtime errors when Claude Code attempts to execute the hook.

### Incorrect

agents.json with invalid hook:

```json
{
  "agents": [
    {
      "name": "reviewer",
      "hooks": [
        {
          "event": "invalid-event",
          "type": "command",
          "command": "npm test"
        },
        {
          "event": "tool-call",
          "type": "prompt"
        },
        {
          "event": "tool-call",
          "type": "command",
          "matcher": {
            "pattern": "[invalid(regex"
          }
        }
      ]
    }
  ]
}
```

### Correct

agents.json with valid hooks:

```json
{
  "agents": [
    {
      "name": "reviewer",
      "hooks": [
        {
          "event": "user-prompt-submit",
          "type": "command",
          "command": "npm test"
        },
        {
          "event": "tool-call",
          "type": "prompt",
          "prompt": "Review this tool call",
          "matcher": {
            "tool": "Bash"
          }
        },
        {
          "event": "tool-call",
          "type": "agent",
          "agent": "security-reviewer",
          "matcher": {
            "pattern": ".*\\.ts$"
          }
        }
      ]
    }
  ]
}
```

## Options

This rule does not have any configuration options.

## When Not To Use It

You should not disable this rule. Invalid hook schemas will always cause runtime errors when Claude Code tries to execute the hooks. Fix the schema issues instead.

## Related Rules

- [agent-skills-not-found](./agent-skills-not-found.md) - Referenced skills must exist
- [hooks-invalid-schema](../hooks/hooks-invalid-schema.md) - Validates hooks.json structure

## Resources

- [Rule Implementation](../../src/validators/agents.ts#L177)
- [Validation Helper](../../src/utils/validation-helpers.ts#L100)
- [Rule Tests](../../tests/validators/agents.test.ts)

## Version

Available since: v1.0.0
