---
description: "Referenced skill does not exist in .claude/skills directory"
---

# agent-skills-not-found

<RuleHeader description="Referenced skill does not exist in .claude/skills directory" severity="error" :fixable="false" :configurable="false" category="Agents" />

## Rule Details

This rule checks that every skill name listed in the `skills` array of agent frontmatter has a corresponding SKILL.md file at `.claude/skills/{skill-name}/SKILL.md`. Referencing a nonexistent skill causes the agent to fail when it tries to load or invoke the skill at runtime. The rule resolves the project root from the agent file path and checks each referenced skill directory.

### Incorrect

Agent references a skill that does not exist

```yaml
---
name: deploy-agent
description: Handles deployment pipelines
skills:
  - nonexistent-skill
---
```

### Correct

Agent references skills that exist at .claude/skills/

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

Create the missing skill directory and SKILL.md file at `.claude/skills/{skill-name}/SKILL.md`, or remove the nonexistent skill name from the `skills` array.

## Options

This rule does not have any configuration options.

## Related Rules

- [`agent-skills`](/rules/agents/agent-skills)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-skills-not-found.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-skills-not-found.test.ts)

## Version

Available since: v0.2.0
