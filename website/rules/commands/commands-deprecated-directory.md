---
description: "Commands directory is deprecated, migrate to Skills"
---

# commands-deprecated-directory

<RuleHeader description="Commands directory is deprecated, migrate to Skills" severity="warn" :fixable="false" :configurable="false" category="Commands" />

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

Legacy command file in .claude/commands

````markdown
# .claude/commands/deploy.md
Run the deployment script.

```bash
./scripts/deploy.sh
```
````

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

Create a `.claude/skills/<skill-name>/` directory with a `SKILL.md` (YAML frontmatter for name and description) and move command scripts into it. Then remove the old `.claude/commands/` directory. See the [Skills documentation](https://code.claude.com/docs/en/skills) for the full format.

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if you are intentionally maintaining legacy commands alongside skills during a gradual migration.

## Related Rules

- [`plugin-commands-deprecated`](/rules/plugin/plugin-commands-deprecated)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/commands/commands-deprecated-directory.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/commands/commands-deprecated-directory.test.ts)

## Version

Available since: v0.2.0
