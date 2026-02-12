# agent-skills

<RuleHeader description="Agent skills must be an array of skill names" severity="error" :fixable="false" category="Agents" />

## Rule Details

This rule enforces that the `skills` field in agent markdown frontmatter is a valid array of strings. Each entry should be a skill name corresponding to a directory under `.claude/skills/`. Validation is delegated to the AgentFrontmatterSchema.shape.skills Zod schema. Proper formatting ensures the agent framework can correctly resolve and load skill definitions.

### Incorrect

Skills as a single string instead of array

```yaml
---
name: deploy-agent
description: Handles deployment pipelines
skills: run-tests
---
```

Skills with non-string entries

```yaml
---
name: deploy-agent
description: Handles deployment pipelines
skills:
  - 42
  - true
---
```

### Correct

Skills as a valid array of skill names

```yaml
---
name: deploy-agent
description: Handles deployment pipelines
skills:
  - run-tests
  - deploy
---
```

## How To Fix

Ensure `skills` is formatted as a YAML array of strings. Each entry should be the name of a skill directory under `.claude/skills/`.

## Options

This rule does not have any configuration options.

## Related Rules

- [`agent-skills-not-found`](/rules/agents/agent-skills-not-found)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-skills.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-skills.test.ts)

## Version

Available since: v0.2.0
