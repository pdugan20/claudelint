---
description: "Agent body content should meet minimum length requirements"
---

# agent-body-too-short

<RuleHeader description="Agent body content should meet minimum length requirements" severity="warn" :fixable="false" :configurable="true" category="Agents" />

## Rule Details

This rule checks that the markdown body of an agent file (the content after frontmatter) contains enough substantive text. Very short body content typically indicates an incomplete agent definition that lacks the detailed instructions needed for effective agent behavior. The minimum length is configurable via the `minLength` option.

### Incorrect

Agent body that is too short

```markdown
---
name: code-review
description: Reviews code for quality
---

Review code.
```

### Correct

Agent body with sufficient instructions

```markdown
---
name: code-review
description: Reviews code for quality
---

## System Prompt

You are a code review agent. Analyze pull requests for correctness, performance, and style issues. Provide actionable feedback with specific suggestions.
```

## How To Fix

Add more detailed instructions, guidelines, or context to the agent body content. Include a System Prompt section with clear behavioral directives.

## Options

Default options:

```json
{
  "minLength": 50
}
```

Require at least 100 characters of body content:

```json
{
  "agent-body-too-short": [
    "warn",
    {
      "minLength": 100
    }
  ]
}
```

Use a lower threshold for simple agents:

```json
{
  "agent-body-too-short": [
    "warn",
    {
      "minLength": 30
    }
  ]
}
```

## When Not To Use It

Disable this rule if your agents use an external system prompt source and the agent file body is intentionally minimal.

## Related Rules

- [`agent-name`](/rules/agents/agent-name)
- [`agent-description`](/rules/agents/agent-description)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-body-too-short.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-body-too-short.test.ts)

## Version

Available since: v0.2.0
