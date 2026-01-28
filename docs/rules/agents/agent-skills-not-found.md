# Rule: agent-skills-not-found

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Category**: References

Validates that skills referenced in agent configurations actually exist in the .claude/skills directory.

## Rule Details

This rule triggers when an agent's `skills` array references a skill name that doesn't have a corresponding SKILL.md file. Each skill listed in an agent's configuration must have a valid skill directory with a SKILL.md file at `.claude/skills/{skill-name}/SKILL.md`.

Missing skill references cause runtime errors when Claude Code tries to load the agent. The agent won't have access to the expected skill functionality, leading to broken workflows.

### Incorrect

agents.json referencing non-existent skill:

```json
{
  "agents": [
    {
      "name": "developer",
      "skills": [
        "git-commit",
        "run-tests",
        "deploy-app"
      ]
    }
  ]
}
```

But directory structure is missing deploy-app:

```text
.claude/
└── skills/
    ├── git-commit/
    │   └── SKILL.md
    └── run-tests/
        └── SKILL.md
```

### Correct

agents.json with valid skill references:

```json
{
  "agents": [
    {
      "name": "developer",
      "skills": [
        "git-commit",
        "run-tests"
      ]
    }
  ]
}
```

And complete directory structure:

```text
.claude/
└── skills/
    ├── git-commit/
    │   └── SKILL.md
    └── run-tests/
        └── SKILL.md
```

## How To Fix

1. Check the skill name in your agents.json for typos
2. Verify the skill directory exists at `.claude/skills/{skill-name}/`
3. Verify the SKILL.md file exists in the skill directory
4. If the skill doesn't exist, either:
   - Remove the reference from agents.json
   - Create the skill directory and SKILL.md file
5. Ensure skill names match exactly (case-sensitive on Linux)

## Options

This rule does not have any configuration options.

## When Not To Use It

You should not disable this rule. Referencing non-existent skills will always cause runtime errors. Fix the references or create the missing skills instead.

## Related Rules

- [agent-hooks-invalid-schema](./agent-hooks-invalid-schema.md) - Validates agent hook configurations
- [skill-invalid-schema](../skills/skill-invalid-schema.md) - Validates SKILL.md structure

## Resources

- [Rule Implementation](../../src/validators/agents.ts#L167)
- [Rule Tests](../../tests/validators/agents.test.ts)

## Version

Available since: v1.0.0
