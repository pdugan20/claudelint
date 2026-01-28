# Rule: commands-in-plugin-deprecated

**Severity**: Warning
**Fixable**: No
**Validator**: Plugin
**Category**: Deprecation

Warns that the "commands" field in plugin.json is deprecated and should be replaced with "skills".

## Rule Details

This rule triggers when a plugin.json file contains a `commands` field. The commands system in Claude Code plugins has been deprecated in favor of the Skills system, which provides better structure, versioning, and documentation capabilities.

The `commands` field was used to register command scripts with Claude Code, but the Skills system offers a more robust alternative with integrated documentation, versioning, and metadata.

### Incorrect

plugin.json with deprecated commands field:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "commands": [
    "deploy",
    "test",
    "build"
  ]
}
```

### Correct

plugin.json using skills field:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "skills": [
    "deploy",
    "test",
    "build"
  ]
}
```

With corresponding skill structure:

```text
.claude/
└── skills/
    ├── deploy/
    │   ├── SKILL.md
    │   └── deploy.sh
    ├── test/
    │   ├── SKILL.md
    │   └── test.sh
    └── build/
        ├── SKILL.md
        └── build.sh
```

## How To Fix

1. Ensure all commands have been migrated to skills (see [commands-migrate-to-skills](../commands/commands-migrate-to-skills.md))
2. In plugin.json, change `"commands"` to `"skills"`
3. Verify the skill names match the directories in `.claude/skills/`
4. Test the plugin to ensure skills are loaded correctly
5. Run `claudelint check-all` to verify the migration

## Options

This rule does not have any configuration options.

## When Not To Use It

Consider disabling this rule if you're maintaining a legacy plugin that must remain compatible with older Claude Code versions. However, modern Claude Code versions support Skills, so migration is recommended.

## Related Rules

- [commands-deprecated-directory](../commands/commands-deprecated-directory.md) - Warns about deprecated commands directory
- [commands-migrate-to-skills](../commands/commands-migrate-to-skills.md) - Provides migration instructions
- [skill-invalid-schema](../skills/skill-invalid-schema.md) - Validates SKILL.md structure

## Resources

- [Rule Implementation](../../src/validators/plugin.ts#L61)
- [Rule Tests](../../tests/validators/plugin.test.ts)
- [Skills Documentation](https://docs.anthropic.com/claude-code/skills)

## Version

Available since: v1.0.0
