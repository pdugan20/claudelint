# agent-description

<RuleHeader description="Agent description must be at least 10 characters, written in third person, with no XML tags" severity="error" :fixable="false" :configurable="false" category="Agents" />

## Rule Details

This rule enforces constraints on the description field in agent markdown frontmatter. The description must be at least 10 characters, written in third person, and must not contain XML tags. Validation is delegated to the AgentFrontmatterSchema.shape.description Zod schema. A clear description helps users understand the agent purpose when browsing available agents.

### Incorrect

Agent description that is too short

```yaml
---
name: code-review
description: Reviews
---
```

Agent description with XML tags

```yaml
---
name: code-review
description: <b>Handles</b> code reviews for pull requests
---
```

### Correct

Descriptive third-person agent description

```yaml
---
name: code-review
description: Handles code reviews for pull requests and suggests improvements
---
```

## How To Fix

Write a description of at least 10 characters in third person. Remove any XML tags and ensure the text clearly explains what the agent does.

## Options

This rule does not have any configuration options.

## Related Rules

- [`agent-name`](/rules/agents/agent-name)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-description.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-description.test.ts)

## Version

Available since: v0.2.0
