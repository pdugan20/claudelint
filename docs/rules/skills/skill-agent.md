# Rule: skill-agent

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

When skill context is "fork", agent field is required to specify which agent to use

## Rule Details

This rule enforces that skills using `context: fork` must specify an `agent` field. When a skill runs in a forked context (separate conversation thread), Claude Code needs to know which agent configuration to use for executing that thread.

The agent field is required only when `context: fork` is set. For `inline` or `auto` contexts, the agent field is optional. The agent value should reference a defined agent configuration that specifies the agent's capabilities, tools, and behavior.

### Incorrect

Fork context without agent field:

```markdown
---
name: long-analysis
description: Performs deep code analysis
context: fork               # Fork requires agent
# Missing agent field!
---
```

Fork context with empty agent:

```markdown
---
name: long-analysis
description: Performs deep code analysis
context: fork
agent:                      # Empty agent not allowed
---
```

### Correct

Fork context with agent specified:

```markdown
---
name: long-analysis
description: Performs deep code analysis
context: fork
agent: code-analyzer        # Agent specified for fork
---
```

Inline context (agent optional):

```markdown
---
name: quick-format
description: Formats code quickly
context: inline
# Agent field optional for inline context
---
```

Auto context (agent optional):

```markdown
---
name: deploy
description: Deploys applications
context: auto
# Agent field optional for auto context
---
```

Auto context with agent (also valid):

```markdown
---
name: deploy
description: Deploys applications
context: auto
agent: deployment-agent     # Optional but allowed
---
```

## How To Fix

Add an agent field when using fork context:

1. Identify the appropriate agent for your skill
2. Add the `agent` field to frontmatter
3. Reference an existing agent configuration
4. Ensure the agent has necessary permissions

Example fix:

```markdown
---
name: background-task
description: Runs task in background
context: fork
agent: task-executor        # Add this line
---
```

## Options

This rule does not have any configuration options.

## When Not To Use It

This is a critical validation rule that should never be disabled. The agent field is required for fork context to function correctly. If validation fails:

- Add an agent field with a valid agent name
- Change context from `fork` to `inline` or `auto` if fork isn't needed
- Create an agent configuration if one doesn't exist

## Related Rules

- [skill-context](./skill-context.md) - Context mode validation
- [skill-model](./skill-model.md) - Model selection validation

## Resources

- [Rule Implementation](../../src/rules/skills/skill-agent.ts)
- [Rule Tests](../../tests/rules/skills/skill-agent.test.ts)

## Version

Available since: v0.2.0
