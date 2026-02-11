# Rule: skill-context

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill context must be one of: fork, inline, auto

## Rule Details

This rule validates that when a skill specifies a `context` field in its frontmatter, it must be one of the valid execution context modes. The context determines how the skill runs relative to the main conversation thread.

Valid context values are `fork` (creates new conversation thread), `inline` (executes in current thread), and `auto` (Claude Code decides based on skill complexity). The context field is optional and defaults to `auto`. Each mode has different isolation, state management, and performance characteristics.

### Incorrect

Invalid context values in SKILL.md frontmatter:

```markdown
---
name: deploy
description: Deploys applications
context: parallel           # Not a valid context
---
```

```markdown
---
name: deploy
description: Deploys applications
context: Fork               # Must be lowercase
---
```

```markdown
---
name: deploy
description: Deploys applications
context: background         # Not a valid context
---
```

```markdown
---
name: deploy
description: Deploys applications
context: thread             # Not a valid context
---
```

### Correct

Valid context specifications:

```markdown
---
name: long-analysis
description: Performs deep code analysis
context: fork               # Isolate in new thread
---
```

```markdown
---
name: quick-format
description: Formats code quickly
context: inline             # Run in current thread
---
```

```markdown
---
name: deploy
description: Deploys applications
context: auto               # Let Claude Code decide
---
```

Omit context for auto (also valid):

```markdown
---
name: deploy
description: Deploys applications
# No context field - defaults to auto
---
```

## How To Fix

Update the context field to use a valid execution mode:

1. Choose the appropriate context for your skill
2. Use lowercase: `fork`, `inline`, or `auto`
3. Consider isolation and performance needs
4. Use `auto` if unsure

Context selection guide:

- `fork` - Long-running tasks, isolated execution, independent state
- `inline` - Quick operations, shares conversation context, synchronous
- `auto` - Claude Code chooses based on complexity (recommended)

## Options

This rule does not have any configuration options.

## When Not To Use It

This is a critical validation rule that should never be disabled. The context field must use valid values for Claude Code to execute skills correctly. If you need different behavior:

- Use one of the three valid options
- Let Claude Code choose with `auto`
- Request new context modes from the Claude Code team

## Related Rules

- [skill-agent](./skill-agent.md) - Agent requirement for fork context
- [skill-model](./skill-model.md) - Model selection validation

## Resources

- [Rule Implementation](../../src/rules/skills/skill-context.ts)
- [Rule Tests](../../tests/rules/skills/skill-context.test.ts)

## Version

Available since: v1.0.0
