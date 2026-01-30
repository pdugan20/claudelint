# Rule: skill-missing-version

**Severity**: Warning
**Fixable**: Yes
**Validator**: Skills
**Category**: Cross-Reference

Skill frontmatter lacks version field

## Rule Details

This rule triggers when SKILL.md frontmatter lacks a `version` field. Version numbers help users and Claude track skill updates, ensure compatibility, understand when breaking changes occur, and enable proper dependency management. Without versions, users can't tell which version they're using, compatibility issues are harder to diagnose, and change management becomes difficult.

The rule checks for a `version` field in the YAML frontmatter at the top of SKILL.md. The version should follow semantic versioning (SemVer) format: `MAJOR.MINOR.PATCH`. This rule is auto-fixable and will add `version: "1.0.0"` if missing.

### Incorrect

SKILL.md frontmatter without version:

```yaml
---
name: deploy
description: Automated deployment skill
user-invocable: true
---
```

### Correct

SKILL.md frontmatter with version:

```yaml
---
name: deploy
description: Automated deployment skill
version: "1.0.0"
user-invocable: true
---
```

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if your skill is experimental and version tracking isn't needed yet, you use a different versioning system, or your organization has alternative version management. However, version fields are a best practice even for experimental skills.

## Related Rules

- [skill-missing-changelog](./skill-missing-changelog.md) - Track version history in CHANGELOG

## How To Fix

Add a version field to SKILL.md frontmatter:

1. Open SKILL.md
2. Add `version: "1.0.0"` to frontmatter
3. Use semantic versioning format
4. Update version when making changes

Example fix:

```markdown
---
name: deploy
description: Deploys applications
version: "1.0.0"          # Add this line
user-invocable: true
---
```

This rule is auto-fixable and will add `version: "1.0.0"` if run with the `--fix` flag.

## Resources

- [Rule Implementation](../../src/rules/skills/skill-missing-version.ts)
- [Rule Tests](../../tests/rules/skills/skill-missing-version.test.ts)
- [Semantic Versioning](https://semver.org/)

## Version

Available since: v1.0.0
