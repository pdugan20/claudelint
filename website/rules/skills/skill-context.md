---
description: "Skill context must be \"fork\""
---

# skill-context

<RuleHeader description="Skill context must be &quot;fork&quot;" severity="error" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

The `context` field controls how a skill is executed. The only documented value is `fork`, which runs the skill in a separate subagent process. When using `fork`, the `agent` field must also be specified. If you don't need a separate agent, omit the `context` field entirely. This rule delegates to the Zod schema for validation.

### Incorrect

Invalid context value

```yaml
---
name: deploy
description: Deploys the application
context: background
---
```

Misspelled context value

```yaml
---
name: deploy
description: Deploys the application
context: forked
---
```

### Correct

Using fork context with agent

```yaml
---
name: deploy
description: Deploys the application
context: fork
agent: deploy-agent
---
```

No context field (runs inline by default)

```yaml
---
name: lint
description: Runs linting checks
---
```

## How To Fix

Set the `context` field to `fork` and specify an `agent` field, or omit `context` entirely to run the skill inline in the current conversation.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-agent`](/rules/skills/skill-agent)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-context.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-context.test.ts)

## Version

Available since: v0.2.0
