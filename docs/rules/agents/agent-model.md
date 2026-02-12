# Rule: agent-model

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Category**: Schema Validation

Agent model must be one of: sonnet, opus, haiku, inherit

## Rule Details

The `model` field specifies which Claude model the agent should use. It must be one of the allowed model values: `sonnet`, `opus`, `haiku`, or `inherit`.

- `sonnet`: Use Claude Sonnet (balanced performance and cost)
- `opus`: Use Claude Opus (maximum capability)
- `haiku`: Use Claude Haiku (fastest, most cost-effective)
- `inherit`: Use the same model as the parent context

This field is optional, but when specified, it must use one of these exact values.

### Incorrect

Invalid model name:

```markdown
---
name: analyzer
description: Analyzes code structure
model: gpt-4
---
```

Typo in model name:

```markdown
---
name: analyzer
description: Analyzes code structure
model: sonnet-3.5
---
```

Wrong case:

```markdown
---
name: analyzer
description: Analyzes code structure
model: Sonnet
---
```

### Correct

Using Sonnet model:

```markdown
---
name: code-reviewer
description: Reviews code changes for quality
model: sonnet
---
```

Using Opus for complex tasks:

```markdown
---
name: architecture-analyzer
description: Analyzes and designs system architecture
model: opus
---
```

Using Haiku for simple tasks:

```markdown
---
name: linter
description: Runs fast code quality checks
model: haiku
---
```

Inheriting parent model:

```markdown
---
name: helper
description: Assists with current task
model: inherit
---
```

## How To Fix

To fix model configuration:

1. Use one of the allowed values: `sonnet`, `opus`, `haiku`, or `inherit`

2. Ensure lowercase spelling (all model names are lowercase)

3. Remove the field entirely if you want to use the default model

4. Choose the appropriate model based on task complexity:
   - **haiku**: Simple, fast tasks (linting, formatting, simple queries)
   - **sonnet**: General-purpose tasks (code review, documentation, analysis)
   - **opus**: Complex tasks requiring deep reasoning (architecture design, complex debugging)
   - **inherit**: When the agent should use whatever model invoked it

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid model names cause:

- Runtime errors when Claude Code tries to initialize the agent
- Agents failing to load
- Unexpected behavior or fallback to default models
- Cost and performance issues from using wrong models

Always use valid model names from the allowed list.

## Related Rules

- [agent-name](./agent-name.md) - Agent name format validation
- [skill-model](../skills/skill-model.md) - Skill model validation

## Resources

- [Rule Implementation](../../src/rules/agents/agent-model.ts)
- [Rule Tests](../../tests/rules/agents/agent-model.test.ts)

## Version

Available since: v0.2.0
