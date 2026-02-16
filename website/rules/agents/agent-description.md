# agent-description

<RuleHeader description="Agent description must be at least 10 characters" severity="error" :fixable="false" :configurable="false" category="Agents" />

## Rule Details

This rule enforces a minimum length on the description field in agent markdown frontmatter. The description must be at least 10 characters. Validation is delegated to the AgentFrontmatterSchema.shape.description Zod schema. Agent descriptions may include XML-style tags like `<example>` and `<commentary>` which are conventional for trigger matching.

### Incorrect

Agent description that is too short

```yaml
---
name: code-review
description: Reviews
---
```

### Correct

Descriptive agent description

```yaml
---
name: code-review
description: Handles code reviews for pull requests and suggests improvements
---
```

## How To Fix

Write a description of at least 10 characters that clearly explains what the agent does and when it should be triggered.

## Options

This rule does not have any configuration options.

## Related Rules

- [`agent-name`](/rules/agents/agent-name)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-description.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-description.test.ts)

## Version

Available since: v0.2.0
