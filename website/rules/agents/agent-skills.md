# Rule: agent-skills

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Category**: Schema Validation

Agent skills must be an array of skill names

## Rule Details

The `skills` field in agent frontmatter specifies which skills the agent can invoke. It must be formatted as an array of skill name strings. Skills extend agent capabilities by providing reusable, executable commands.

Each skill name should reference a valid skill directory at `.claude/skills/{skill-name}/SKILL.md`. While this rule validates the array format, the [agent-skills-not-found](./agent-skills-not-found.md) rule validates that referenced skills actually exist.

### Incorrect

Not an array:

```markdown
---
name: developer
description: Development assistance agent
skills: git-commit
---
```

Invalid object format:

```markdown
---
name: developer
description: Development assistance agent
skills:
  skill1: git-commit
  skill2: run-tests
---
```

Non-string values:

```markdown
---
name: developer
description: Development assistance agent
skills:
  - 123
  - true
  - git-commit
---
```

### Correct

Valid skills array:

```markdown
---
name: developer
description: Development assistance agent
skills:
  - git-commit
  - run-tests
  - deploy
---
```

Single skill:

```markdown
---
name: committer
description: Handles git commits
skills:
  - git-commit
---
```

Empty array (no skills):

```markdown
---
name: simple-agent
description: Basic agent without skills
skills: []
---
```

## How To Fix

To fix skills configuration:

1. **Format as array**: Use YAML array syntax with hyphens

   ```yaml
   skills:
     - git-commit
     - run-tests
   ```

2. **Use string values**: Each skill name must be a string

   ```yaml
   skills:
     - "git-commit"  # Quotes optional for simple strings
     - "run-tests"
   ```

3. **Reference valid skill names**: Use kebab-case skill names that match skill directories
   - Valid: `git-commit`, `run-tests`, `deploy-app`
   - Invalid: `gitCommit`, `run_tests`, `Deploy App`

4. **Verify skills exist**: After fixing the format, ensure each referenced skill has a corresponding directory at `.claude/skills/{skill-name}/SKILL.md`

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid `skills` configuration causes:

- Runtime errors when agent tries to load skills
- Skills not being available to the agent
- Type errors in Claude Code
- Confusion about agent capabilities

Always fix the array format rather than disabling validation.

## Related Rules

- [agent-skills-not-found](./agent-skills-not-found.md) - Validates that referenced skills exist
- [agent-tools](./agent-tools.md) - Validates tools array format
- [skill-name](../skills/skill-name.md) - Skill name validation

## Resources

- [Rule Implementation](../../src/rules/agents/agent-skills.ts)
- [Rule Tests](../../tests/rules/agents/agent-skills.test.ts)

## Version

Available since: v1.0.0
