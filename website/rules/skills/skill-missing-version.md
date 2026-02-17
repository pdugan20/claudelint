# skill-missing-version

<RuleHeader description="Skill frontmatter lacks version field" severity="warn" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

Version numbers help users and Claude track skill updates and ensure compatibility. This rule checks that the `version` field is present in the SKILL.md frontmatter. Without a version, users cannot tell which iteration of a skill they are running or whether an update has introduced breaking changes.

### Incorrect

Frontmatter without version field

```yaml
---
name: deploy
description: Deploys the application
---
```

### Correct

Frontmatter with version field

```yaml
---
name: deploy
description: Deploys the application
version: 1.0.0
---
```

Pre-release version

```yaml
---
name: deploy
description: Deploys the application
version: 0.1.0
---
```

## How To Fix

Add a `version` field to the frontmatter section of your SKILL.md file. Use semantic versioning (e.g., `version: 1.0.0`). Start with `0.1.0` for new skills that are not yet stable.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-missing-changelog`](/rules/skills/skill-missing-changelog)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-missing-version.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-missing-version.test.ts)

## Version

Available since: v0.2.0
