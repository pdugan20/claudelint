# Rule: agent-skills-not-found

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Category**: Cross-Reference

Referenced skill does not exist in .claude/skills directory

## Rule Details

This rule validates that all skills referenced in an agent's frontmatter actually exist in the project. Each skill listed in the `skills` array must have a corresponding SKILL.md file at `.claude/skills/{skill-name}/SKILL.md`.

Missing skill references cause runtime errors when Claude Code tries to load the agent. The agent won't have access to the expected skill functionality, leading to broken workflows.

### Incorrect

Agent referencing non-existent skill:

File: `.claude/agents/developer/AGENT.md`

```markdown
---
name: developer
description: Development assistance agent
skills:
  - git-commit
  - run-tests
  - deploy-app
---
```

But directory structure is missing deploy-app:

```text
.claude/
├── agents/
│   └── developer/
│       └── AGENT.md
└── skills/
    ├── git-commit/
    │   └── SKILL.md
    └── run-tests/
        └── SKILL.md
```

### Correct

Agent with valid skill references:

File: `.claude/agents/developer/AGENT.md`

```markdown
---
name: developer
description: Development assistance agent
skills:
  - git-commit
  - run-tests
---
```

And complete directory structure:

```text
.claude/
├── agents/
│   └── developer/
│       └── AGENT.md
└── skills/
    ├── git-commit/
    │   └── SKILL.md
    └── run-tests/
        └── SKILL.md
```

## How To Fix

To resolve missing skill references:

1. **Create the missing skill**: Add the skill directory and SKILL.md file
   ```bash
   mkdir -p .claude/skills/deploy-app
   touch .claude/skills/deploy-app/SKILL.md
   ```

2. **Remove the invalid reference**: Update the agent's frontmatter to remove non-existent skills
   ```markdown
   skills:
     - git-commit
     - run-tests
     # Removed: deploy-app (doesn't exist)
   ```

3. **Fix the skill name**: Ensure the referenced name matches the actual skill directory name exactly
   - Check for typos
   - Verify kebab-case formatting
   - Ensure exact case match

4. **Verify the file exists**: Confirm the SKILL.md file is present
   ```bash
   ls .claude/skills/*/SKILL.md
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Referencing non-existent skills causes:

- Runtime errors when agent initialization fails
- Missing functionality the agent expects to have
- Confusion about agent capabilities
- Broken workflows when skills are invoked

Always fix the references or create the missing skills instead of disabling validation.

## Related Rules

- [agent-skills](./agent-skills.md) - Validates skills array format
- [agent-hooks-invalid-schema](./agent-hooks-invalid-schema.md) - Validates agent hook configurations

## Resources

- [Rule Implementation](../../src/rules/agents/agent-skills-not-found.ts)
- [Rule Tests](../../tests/rules/agents/agent-skills-not-found.test.ts)

## Version

Available since: v1.0.0
