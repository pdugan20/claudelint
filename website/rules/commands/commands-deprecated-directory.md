# commands-deprecated-directory

<RuleHeader description="Commands directory is deprecated, migrate to Skills" severity="warn" :fixable="false" category="Commands" />

## Rule Details

Commands were the original way to add custom slash commands to Claude Code, but they have been superseded by Skills. Skills provide better structure with YAML frontmatter, versioning, documentation, and reference file support. This rule fires when a `.claude/commands` directory exists in the project, prompting migration to the Skills format.

### Incorrect

Project with a .claude/commands directory

```text
.claude/
  commands/
    deploy.md
    test-all.md
```

### Correct

Project migrated to Skills

```text
.claude/
  skills/
    deploy/
      SKILL.md
      deploy.sh
    test-all/
      SKILL.md
      test-all.sh
```

## How To Fix

Create equivalent skills in `.claude/skills/` for each command in `.claude/commands/`. Each skill needs a directory with a SKILL.md file containing YAML frontmatter. After migrating all commands, remove the `.claude/commands/` directory.

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if you are intentionally maintaining legacy commands alongside skills during a gradual migration.

## Related Rules

- [`commands-migrate-to-skills`](/rules/commands/commands-migrate-to-skills)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/commands/commands-deprecated-directory.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/commands/commands-deprecated-directory.test.ts)

## Version

Available since: v0.2.0
