---
description: Validate Claude Code skill definitions for naming conventions, required fields, shell script security, and documentation quality with the Skills validator.
---

# Skills Validator

The Skills validator checks Claude Code skill definitions for correctness, security, documentation quality, and best practices.

## What It Checks

- SKILL.md frontmatter schema compliance
- Required fields (name, description)
- Version format validation
- Shell script security (dangerous commands, eval usage)
- Referenced file existence
- Documentation quality (CHANGELOG, examples, README)
- Naming conventions

## Rules

This validator includes <RuleCount category="skills" /> rules. See the [Skills rules category](/rules/skills/skill-agent) for the complete list.

| Rule | Severity | Description |
|------|----------|-------------|
| [skill-missing-version](/rules/skills/skill-missing-version) | warn | Missing version field |
| [skill-name](/rules/skills/skill-name) | error | Invalid skill name format |
| [skill-description](/rules/skills/skill-description) | error | Missing or invalid description |
| [skill-dangerous-command](/rules/skills/skill-dangerous-command) | error | Dangerous shell command detected |
| [skill-missing-shebang](/rules/skills/skill-missing-shebang) | error | Shell script lacks shebang |

## CLI Usage

```bash
# Validate all skills
claudelint validate-skills

# Validate with auto-fix
claudelint validate-skills --fix

# Verbose output
claudelint validate-skills --verbose
```

## Plugin Skill

If you have the [claudelint plugin](/integrations/claude-code-plugin) installed, you can run this validator inside Claude Code with `/validate-skills` or by asking "Why is my skill not loading?"

## See Also

- [Claude Code Skills](https://code.claude.com/docs/en/skills) - Official skills documentation
- [Configuration](/guide/configuration) - Customize rule severity
