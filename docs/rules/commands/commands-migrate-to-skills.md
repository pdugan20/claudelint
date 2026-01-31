# Rule: commands-migrate-to-skills

**Severity**: Warning
**Fixable**: No
**Validator**: Commands
**Category**: Deprecation

Migration guidance for deprecated Commands

## Rule Details

This rule triggers alongside [commands-deprecated-directory](./commands-deprecated-directory.md) when a `.claude/commands` directory is detected. It provides detailed migration instructions to help you convert your commands to the modern Skills format.

The migration process involves:

1. Creating skill directories with proper structure
2. Moving command scripts to skill directories
3. Creating SKILL.md files with documentation
4. Updating plugin configurations

This guidance ensures a smooth transition from the deprecated commands system to Skills.

### Incorrect

Project still using deprecated commands directory:

```text
.claude/
├── commands/
│   ├── deploy.sh
│   └── test.sh
└── plugin.json (with "commands" field)
```

### Correct

Project properly using skills:

```text
.claude/
├── skills/
│   ├── deploy/
│   │   ├── SKILL.md
│   │   └── deploy.sh
│   └── test/
│       ├── SKILL.md
│       └── test.sh
└── plugin.json (with "skills" field)
```

## How To Fix

To migrate from commands to skills:

1. **Create skill directories**: For each command script, create a directory: `.claude/skills/<command-name>/`

2. **Move command scripts**: Move each script from `.claude/commands/<command-name>.sh` to `.claude/skills/<command-name>/<command-name>.sh`

3. **Add SKILL.md with frontmatter**: Create `.claude/skills/<command-name>/SKILL.md`:

   ```markdown
   ---
   name: command-name
   version: 1.0.0
   description: Brief description of what this skill does
   ---

   # Command Name

   Documentation here...
   ```

4. **Update plugin.json**: Change `"commands": ["my-command"]` to `"skills": ["my-command"]`

5. **Remove old directory**: Delete `.claude/commands/` once migration is complete

## Options

This rule does not have any configuration options.

## When Not To Use It

This rule provides helpful migration guidance and should generally remain enabled. It only triggers when deprecated commands are detected, so it won't show warnings in projects already using Skills.

## Related Rules

- [commands-deprecated-directory](./commands-deprecated-directory.md) - Warns about deprecated commands directory
- [commands-in-plugin-deprecated](./commands-in-plugin-deprecated.md) - Warns about commands field in plugin.json
- [skill-invalid-schema](../skills/skill-invalid-schema.md) - Validates SKILL.md structure

## Resources

- [Rule Implementation](../../src/rules/commands/commands-migrate-to-skills.ts)
- [Rule Tests](../../tests/validators/commands.test.ts)
- [Skills Documentation](https://docs.anthropic.com/claude-code/skills)

## Version

Available since: v1.0.0
