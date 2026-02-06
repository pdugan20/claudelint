# Rule: skill-readme-forbidden

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill directory must not contain README.md (use SKILL.md instead)

## Rule Details

This rule triggers when a skill directory contains a `README.md` file. Anthropic's skill specification requires that all skill documentation must be in `SKILL.md`, not `README.md`. The distinction is important because:

1. **Standardization**: All skills must use SKILL.md for consistency across the skill ecosystem
2. **Framework Integration**: The Claude Code framework specifically looks for and loads SKILL.md files
3. **Metadata Access**: SKILL.md's YAML frontmatter provides critical metadata (name, version, description, dependencies, etc.) that README.md cannot provide
4. **Skill Discovery**: The skill system indexes SKILL.md files, not README files, making your skill undiscoverable if it only has README.md

If you have documentation in README.md, move it to SKILL.md and delete README.md.

### Incorrect

Skill directory with forbidden README.md:

```text
.claude/skills/deploy/
├── SKILL.md
├── README.md           # Not allowed - use only SKILL.md
├── deploy.sh
└── references/
```

### Correct

Skill directory with only SKILL.md:

```text
.claude/skills/deploy/
├── SKILL.md            # Single source of truth
├── deploy.sh
└── references/         # Additional docs in references/ if needed
```

SKILL.md with complete documentation:

```markdown
---
name: deploy
description: Deploys applications to production servers
version: 1.0.0
---

# Deploy Skill

Your complete skill documentation here (not in README.md).

## Usage

Instructions and examples go directly in SKILL.md.

## Additional Resources

For extended documentation:
- See `references/api-guide.md` for detailed API reference
- See `references/examples.md` for advanced examples
```

## How To Fix

If you have a README.md in your skill directory:

1. **Copy content to SKILL.md** (if not already there)
2. **Add YAML frontmatter** if missing
3. **Delete README.md**

Example:

```bash
# If README.md exists alongside SKILL.md
rm .claude/skills/deploy/README.md

# If only README.md exists, rename it
mv .claude/skills/deploy/README.md .claude/skills/deploy/SKILL.md

# Then add required YAML frontmatter at the top:
# ---
# name: deploy
# description: Deploys applications
# version: 1.0.0
# ---
```

## Options

This rule does not have any configuration options.

## When Not To Use It

This is a critical validation rule that should never be disabled. README.md files break skill discovery and framework integration. Always use SKILL.md instead.

If you have documentation that was in README.md, consolidate it into SKILL.md and use the `references/` directory for detailed content that exceeds 500 lines.

## Related Rules

- [skill-missing-changelog](./skill-missing-changelog.md) - Skills should have CHANGELOG.md
- [skill-body-too-long](./skill-body-too-long.md) - SKILL.md body should follow progressive disclosure
- [skill-description](./skill-description.md) - Skill descriptions must be valid

## Resources

- [Rule Implementation](../../src/rules/skills/skill-readme-forbidden.ts)
- [Rule Tests](../../tests/rules/skills/skill-readme-forbidden.test.ts)
- [Anthropic Skills Specification](https://www.anthropic.com/news/building-effective-agents)

## Version

Available since: v0.3.0
