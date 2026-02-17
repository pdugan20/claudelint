---
description: "Skill context must be one of: fork, inline, auto"
---

# skill-context

<RuleHeader description="Skill context must be one of: fork, inline, auto" severity="error" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

The `context` field controls how a skill is executed. It must be one of the recognized modes: `fork` (runs in a separate agent process), `inline` (runs in the current conversation context), or `auto` (lets the system decide). Any other value is invalid and will cause the skill to fail at runtime. This rule delegates to the Zod schema for validation.

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

Using fork context

```yaml
---
name: deploy
description: Deploys the application
context: fork
agent: deploy-agent
---
```

Using inline context

```yaml
---
name: lint
description: Runs linting checks
context: inline
---
```

Using auto context

```yaml
---
name: test
description: Runs tests
context: auto
---
```

## How To Fix

Set the `context` field to one of the valid values: `fork`, `inline`, or `auto`. Use `fork` when the skill needs its own agent, `inline` when it should run in the current context, or `auto` to let the system choose.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-agent`](/rules/skills/skill-agent)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-context.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-context.test.ts)

## Version

Available since: v0.2.0
