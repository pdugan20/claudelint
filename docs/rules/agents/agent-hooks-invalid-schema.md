# Rule: agent-hooks-invalid-schema

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Category**: Configuration

Validates that hooks in agents.json have correct structure, valid event types, and required fields.

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

## How To Fix

1. **Invalid event name**: Use a valid event from the allowed list (check Claude Code documentation)
2. **Invalid hook type**: Use `command`, `prompt`, or `agent`
3. **Missing required field**: Add the field matching your hook type:
   - `command` type needs `"command": "script.sh"`
   - `prompt` type needs `"prompt": "Your prompt text"`
   - `agent` type needs `"agent": "agent-name"`
4. **Invalid regex pattern**: Fix the regular expression syntax in matcher.pattern
5. Test your regex patterns using a tool like regex101.com before adding them

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
