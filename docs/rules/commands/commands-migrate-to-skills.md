# Rule: commands-migrate-to-skills

**Severity**: Warning
**Fixable**: No
**Validator**: Commands
**Category**: Deprecation

Provides step-by-step instructions for migrating from deprecated commands to Skills.

## Rule Details

This rule triggers alongside [commands-deprecated-directory](./commands-deprecated-directory.md) when a `.claude/commands` directory is detected. It provides detailed migration instructions to help you convert your commands to the modern Skills format.

The migration process involves:
1. Creating skill directories with proper structure
2. Moving command scripts to skill directories
3. Creating SKILL.md files with documentation
4. Updating plugin configurations

This guidance ensures a smooth transition from the deprecated commands system to Skills.

### Migration Steps

```text
Step 1: Create skill directories
For each command in .claude/commands/my-command.sh:
  Create .claude/skills/my-command/

Step 2: Move command scripts
  Move: .claude/commands/my-command.sh
  To:   .claude/skills/my-command/my-command.sh

Step 3: Add SKILL.md with frontmatter
  Create: .claude/skills/my-command/SKILL.md
  With:
    ---
    name: my-command
    version: 1.0.0
    description: Brief description
    ---

    # My Command

    Documentation here...

Step 4: Update plugin.json
  Change: "commands": ["my-command"]
  To:     "skills": ["my-command"]
```

### Before Migration

```text
.claude/
├── commands/
│   ├── deploy.sh
│   └── test.sh
└── plugin.json (with "commands" field)
```

### After Migration

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

Follow the migration steps provided in the warning message:

1. **Create skill directories**: For each command, create `.claude/skills/<skill-name>/`
2. **Move scripts**: Move `commands/<name>.sh` to `skills/<name>/<name>.sh`
3. **Add SKILL.md**: Create documentation file with:
   - Frontmatter with name, version, description
   - Markdown documentation explaining the skill
   - Usage examples and requirements
4. **Update plugin.json**: Change `"commands"` array to `"skills"` array
5. **Test**: Run `claudelint check-all` to verify the migration
6. **Remove**: Delete the old `.claude/commands` directory

## Options

This rule does not have any configuration options.

## When Not To Use It

This rule provides helpful migration guidance and should generally remain enabled. It only triggers when deprecated commands are detected, so it won't show warnings in projects already using Skills.

## Related Rules

- [commands-deprecated-directory](./commands-deprecated-directory.md) - Warns about deprecated commands directory
- [commands-in-plugin-deprecated](./commands-in-plugin-deprecated.md) - Warns about commands field in plugin.json
- [skill-invalid-schema](../skills/skill-invalid-schema.md) - Validates SKILL.md structure

## Resources

- [Rule Implementation](../../src/validators/commands.ts#L49)
- [Rule Tests](../../tests/validators/commands.test.ts)
- [Skills Documentation](https://docs.anthropic.com/claude-code/skills)

## Version

Available since: v1.0.0
