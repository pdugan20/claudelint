# agent-name

<RuleHeader description="Agent name must be lowercase-with-hyphens, under 64 characters, with no XML tags" severity="error" :fixable="false" category="Agents" />

## Rule Details

This rule enforces naming constraints on the name field in agent markdown frontmatter. The name must be lowercase with hyphens, under 64 characters, and must not contain XML tags. Validation is delegated to the AgentFrontmatterSchema.shape.name Zod schema. Consistent naming ensures agents are easily discoverable and avoids conflicts with reserved syntax.

### Incorrect

Agent name with uppercase letters

```yaml
---
name: My-Agent
description: Handles code reviews
---
```

Agent name containing XML tags

```yaml
---
name: <agent>helper</agent>
description: Handles code reviews
---
```

### Correct

Agent name using lowercase and hyphens

```yaml
---
name: code-review-agent
description: Handles code reviews for pull requests
---
```

## How To Fix

Rename the agent to use only lowercase letters, digits, and hyphens. Ensure the name is under 64 characters and does not include any XML-style tags.

## Options

This rule does not have any configuration options.

## Related Rules

- [`agent-description`](/rules/agents/agent-description)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-name.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-name.test.ts)

## Version

Available since: v0.2.0
