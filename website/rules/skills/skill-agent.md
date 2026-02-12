# skill-agent

<RuleHeader description="When skill context is &quot;fork&quot;, agent field is required to specify which agent to use" severity="error" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

When a skill sets `context: fork`, it runs in a separate agent process. The `agent` field must be specified to tell the system which agent to use for the forked context. Without this field, the system cannot determine which agent should handle the skill execution. This rule performs cross-field validation between `context` and `agent` to catch this misconfiguration.

### Incorrect

Fork context without agent field

```yaml
---
name: deploy
description: Deploys the app to production
context: fork
---
```

### Correct

Fork context with agent specified

```yaml
---
name: deploy
description: Deploys the app to production
context: fork
agent: deploy-agent
---
```

Inline context does not require agent

```yaml
---
name: lint
description: Runs linting on the project
context: inline
---
```

## How To Fix

Add an `agent` field to your SKILL.md frontmatter specifying which agent to use. If you do not need a separate agent process, change `context` to `inline` or `auto` instead.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-context`](/rules/skills/skill-context)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-agent.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-agent.test.ts)

## Version

Available since: v0.2.0
