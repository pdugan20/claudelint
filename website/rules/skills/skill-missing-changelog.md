# skill-missing-changelog

<RuleHeader description="Skill directory lacks CHANGELOG.md" severity="warn" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

A changelog helps users understand what changed between versions and track the evolution of a skill. This rule checks that a `CHANGELOG.md` file exists in the same directory as the SKILL.md file. Without a changelog, users have no reliable way to review the history of changes or assess the impact of upgrading to a newer version.

### Incorrect

Skill directory without CHANGELOG.md

```text
.claude/skills/deploy/
  SKILL.md
  deploy.sh
```

### Correct

Skill directory with CHANGELOG.md

```text
.claude/skills/deploy/
  SKILL.md
  CHANGELOG.md
  deploy.sh
```

## How To Fix

Create a `CHANGELOG.md` file in the skill directory alongside SKILL.md. Follow the [Keep a Changelog](https://keepachangelog.com/) format and document notable changes for each version of the skill.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-missing-version`](/rules/skills/skill-missing-version)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-missing-changelog.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-missing-changelog.test.ts)

## Version

Available since: v0.2.0
