# Rule: commands-deprecated-directory

**Severity**: Warning
**Fixable**: No
**Validator**: Commands
**Category**: Deprecation

Commands directory is deprecated, migrate to Skills

## Rule Details

This rule triggers when Claude Code detects a `.claude/commands` directory in your project. The commands directory was an early feature in Claude Code but has been superseded by the Skills system, which provides better structure, versioning, documentation, and reusability.

Skills offer several advantages over commands:
- **Structured format**: SKILL.md with frontmatter and documentation
- **Versioning**: Track changes with semantic versions
- **Documentation**: Rich markdown docs integrated with the skill
- **Examples**: Include usage examples directly in the skill
- **Metadata**: Specify requirements, dependencies, and more

Continuing to use commands prevents you from leveraging these benefits and may lead to compatibility issues in future Claude Code versions.

### Incorrect

Project with deprecated commands directory:

```text
my-project/
└── .claude/
    └── commands/
        ├── deploy.sh
        ├── test.sh
        └── build.sh
```

### Correct

Project migrated to skills:

```text
my-project/
└── .claude/
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

## Options

This rule does not have any configuration options.

## When Not To Use It

Consider disabling this rule if you're maintaining a legacy project that cannot be updated yet. However, migration is recommended for all projects to benefit from the Skills system improvements.

## Related Rules

- [commands-migrate-to-skills](./commands-migrate-to-skills.md) - Provides migration instructions
- [commands-in-plugin-deprecated](./commands-in-plugin-deprecated.md) - Warns about commands field in plugin.json

## Resources

- [Rule Implementation](../../src/validators/commands.ts#L41)
- [Rule Tests](../../tests/validators/commands.test.ts)
- [Skills Documentation](https://docs.anthropic.com/claude-code/skills)

## Version

Available since: v1.0.0
