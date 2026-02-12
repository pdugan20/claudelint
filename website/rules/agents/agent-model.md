# agent-model

<RuleHeader description="Agent model must be one of: sonnet, opus, haiku, inherit" severity="error" :fixable="false" category="Agents" />

## Rule Details

This rule enforces that the `model` field in agent markdown frontmatter is one of the allowed values: `sonnet`, `opus`, `haiku`, or `inherit`. Using an unrecognized model name will cause the agent framework to fail at initialization. Validation is delegated to the AgentFrontmatterSchema.shape.model Zod schema which uses the ModelNames enum. The `inherit` option tells the agent to use the parent conversation model.

### Incorrect

Invalid model name

```yaml
---
name: code-review
description: Reviews code for quality
model: gpt-4
---
```

Model name with wrong casing

```yaml
---
name: code-review
description: Reviews code for quality
model: Sonnet
---
```

### Correct

Valid model name

```yaml
---
name: code-review
description: Reviews code for quality
model: sonnet
---
```

Using inherit to match the parent model

```yaml
---
name: code-review
description: Reviews code for quality
model: inherit
---
```

## How To Fix

Set the `model` field to one of: `sonnet`, `opus`, `haiku`, or `inherit`. Model names are case-sensitive and must be lowercase.

## Options

This rule does not have any configuration options.

## Related Rules

- [`agent-name`](/rules/agents/agent-name)
- [`agent-description`](/rules/agents/agent-description)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-model.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-model.test.ts)

## Version

Available since: v0.2.0
