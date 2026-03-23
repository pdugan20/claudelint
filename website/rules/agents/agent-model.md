---
description: "Agent model should be a known alias or valid model ID"
---

# agent-model

<RuleHeader description="Agent model should be a known alias or valid model ID" severity="warn" :fixable="false" :configurable="false" category="Agents" />

## Rule Details

This rule checks that the `model` field in agent markdown frontmatter is either a known alias (`sonnet`, `opus`, `haiku`, `inherit`) or a full Claude model ID (e.g. `claude-opus-4-6`). The `inherit` option tells the agent to use the parent conversation model. Unrecognized values produce a warning since Claude Code accepts arbitrary model strings.

### Incorrect

Non-Claude model name

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

Valid model alias

```yaml
---
name: code-review
description: Reviews code for quality
model: sonnet
---
```

Full model ID

```yaml
---
name: code-review
description: Reviews code for quality
model: claude-opus-4-6
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

Set the `model` field to a known alias (`sonnet`, `opus`, `haiku`, `inherit`) or a full Claude model ID (e.g. `claude-opus-4-6`).

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
