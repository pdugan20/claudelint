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

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin: 16px 0;">

<RuleCard
  rule-id="skill-dangerous-command"
  description="Skill contains potentially dangerous shell commands"
  severity="error"
  category="Skills"
  link="/rules/skills/skill-dangerous-command"
/>

<RuleCard
  rule-id="skill-missing-version"
  description="SKILL.md missing required version field in frontmatter"
  severity="warning"
  category="Skills"
  link="/rules/skills/skill-missing-version"
  :fixable="true"
/>

<RuleCard
  rule-id="skill-name"
  description="Skill name does not follow naming conventions"
  severity="error"
  category="Skills"
  link="/rules/skills/skill-name"
/>

<RuleCard
  rule-id="skill-missing-shebang"
  description="Shell script missing shebang line"
  severity="error"
  category="Skills"
  link="/rules/skills/skill-missing-shebang"
  :fixable="true"
/>

</div>

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
