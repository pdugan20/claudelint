# Rule: agent-hooks

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Category**: Schema Validation

Agent hooks must be an array of valid hook objects

## Rule Details

The `hooks` field in agent frontmatter allows agents to define their own hook handlers inline. Each hook must be a valid hook object with the required fields based on its type (command, prompt, or agent).

Hooks in agent frontmatter follow the same schema as hooks in hooks.json but are scoped to the specific agent. They trigger on specified events and can filter based on tool names or patterns.

### Incorrect

Not an array:

```markdown
---
name: validator
description: Validates tool usage
hooks:
  event: PreToolUse
  type: command
  command: ./validate.sh
---
```

Invalid hook object:

```markdown
---
name: validator
description: Validates tool usage
hooks:
  - event: PreToolUse
    type: command
---
```

Missing required fields:

```markdown
---
name: validator
description: Validates tool usage
hooks:
  - type: prompt
---
```

### Correct

Valid command hook:

```markdown
---
name: validator
description: Validates tool usage before execution
hooks:
  - event: PreToolUse
    type: command
    command: ./scripts/validate-tool.sh
---
```

Multiple valid hooks:

```markdown
---
name: security-agent
description: Monitors and validates security-sensitive operations
hooks:
  - event: PreToolUse
    type: command
    command: ./scripts/check-security.sh
    matcher:
      tool: Bash
  - event: PostToolUse
    type: prompt
    prompt: Review the output for security issues
    matcher:
      pattern: "password|secret|key"
---
```

Hook with agent delegation:

```markdown
---
name: code-reviewer
description: Reviews code changes
hooks:
  - event: PreCommit
    type: agent
    agent: lint-checker
---
```

## How To Fix

To fix hooks configuration:

1. **Format as array**: Use YAML array syntax with hyphens

   ```yaml
   hooks:
     - event: PreToolUse
       type: command
       command: ./validate.sh
   ```

2. **Include required fields for hook type**:
   - `command` hooks: Must have `command` field
   - `prompt` hooks: Must have `prompt` field
   - `agent` hooks: Must have `agent` field

3. **Use valid event names**: Reference actual Claude Code event names

4. **Validate regex patterns**: If using matcher with pattern, ensure valid regex syntax

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid hooks configuration causes:

- Runtime errors when Claude Code tries to register hooks
- Hooks failing silently
- Unexpected agent behavior
- Difficult debugging

Always fix the hook configuration rather than disabling validation.

## Related Rules

- [agent-hooks-invalid-schema](./agent-hooks-invalid-schema.md) - Validates hooks in agents.json
- [hooks-invalid-config](../hooks/hooks-invalid-config.md) - Validates hooks.json structure

## Resources

- [Rule Implementation](../../src/rules/agents/agent-hooks.ts)
- [Rule Tests](../../tests/rules/agents/agent-hooks.test.ts)

## Version

Available since: v1.0.0
