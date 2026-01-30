# Rule: skill-model

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill model must be one of: sonnet, opus, haiku, inherit

## Rule Details

This rule validates that when a skill specifies a `model` field in its frontmatter, it must be one of the valid Claude model names. The model field determines which Claude model variant executes the skill, affecting capabilities, performance, and cost.

Valid model values are `sonnet` (balanced performance and capability), `opus` (highest capability), `haiku` (fastest and most cost-effective), and `inherit` (use the model from the calling context). The model field is optional and defaults to inheriting the user's selected model.

### Incorrect

Invalid model values in SKILL.md frontmatter:

```markdown
---
name: deploy
description: Deploys applications
model: gpt-4              # Not a Claude model
---
```

```markdown
---
name: deploy
description: Deploys applications
model: claude-3-sonnet    # Use short name, not full model ID
---
```

```markdown
---
name: deploy
description: Deploys applications
model: Sonnet             # Must be lowercase
---
```

```markdown
---
name: deploy
description: Deploys applications
model: fast               # Not a valid model name
---
```

### Correct

Valid model specifications:

```markdown
---
name: deploy
description: Deploys applications
model: sonnet             # Balanced model
---
```

```markdown
---
name: code-review
description: Reviews code for issues
model: opus               # Highest capability
---
```

```markdown
---
name: quick-check
description: Quick validation checks
model: haiku              # Fastest model
---
```

```markdown
---
name: format
description: Formats code
model: inherit            # Use caller's model
---
```

Omit model to inherit (also valid):

```markdown
---
name: deploy
description: Deploys applications
# No model field - inherits from context
---
```

## How To Fix

Update the model field to use a valid Claude model name:

1. Choose the appropriate model for your skill's needs
2. Use lowercase short names: `sonnet`, `opus`, `haiku`, or `inherit`
3. Consider complexity and response time requirements
4. Use `inherit` if the skill works well with any model

Model selection guide:

- `opus` - Complex reasoning, code generation, analysis
- `sonnet` - General purpose, balanced performance
- `haiku` - Simple tasks, quick responses, high volume
- `inherit` - Flexible, works with any model

## Options

This rule does not have any configuration options.

## When Not To Use It

This is a critical validation rule that should never be disabled. The model field must use valid values for Claude Code to execute skills correctly. If you need a different model:

- Use one of the four valid options
- Request support for new models from the Claude Code team
- Use `inherit` to let users choose the model

## Related Rules

- [skill-context](./skill-context.md) - Execution context validation
- [skill-agent](./skill-agent.md) - Agent requirement for fork context

## Resources

- [Rule Implementation](../../src/rules/skills/skill-model.ts)
- [Rule Tests](../../tests/rules/skills/skill-model.test.ts)
- [Claude Model Comparison](https://www.anthropic.com/claude)

## Version

Available since: v1.0.0
