# Rule: commands-migrate-to-skills

**Severity**: Warn
**Fixable**: No
**Validator**: Commands
**Recommended**: Yes

Migration guidance for deprecated Commands

## Rule Details

This rule complements `commands-deprecated-directory` by providing detailed, actionable migration instructions when a `.claude/commands` directory is detected. It walks through the four steps needed to convert each command into a properly structured skill: creating the skill directory, moving scripts, adding SKILL.md with frontmatter, and updating plugin.json references.

### Incorrect

Legacy command file in .claude/commands

````markdown
# .claude/commands/deploy.md
Run the deployment script.

```bash
./scripts/deploy.sh
```
````

### Correct

Equivalent skill with proper structure

```markdown
# .claude/skills/deploy/SKILL.md
---
name: deploy
description: Run the deployment script
---

## Usage

Invoke with `/deploy` to run the deployment pipeline.
```

## How To Fix

1. Create a skill directory: `.claude/skills/<skill-name>/`
2. Move command scripts to `<skill-name>/<skill-name>.sh`
3. Add a `SKILL.md` with YAML frontmatter (name, description) and documentation
4. Update `plugin.json` to reference skills instead of commands
5. Remove the old command file from `.claude/commands/`

## Options

This rule does not have any configuration options.

## Related Rules

- [`commands-deprecated-directory`](/rules/commands/commands-deprecated-directory)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/commands/commands-migrate-to-skills.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/commands/commands-migrate-to-skills.test.ts)

## Version

Available since: v1.0.0
