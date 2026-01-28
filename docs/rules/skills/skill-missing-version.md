# Rule: skill-missing-version

**Severity**: Warning
**Fixable**: Yes
**Validator**: Skills
**Category**: Completeness

Enforces that Claude Code skills include a `version` field in SKILL.md frontmatter using semantic versioning.

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

## How To Fix

1. **Auto-fix with claudelint**: Run `claudelint check-all --fix` to automatically add `version: "1.0.0"` to the frontmatter
2. **Manual fix**: Add a version field to your SKILL.md frontmatter following semantic versioning
3. **Start with 1.0.0**: Use this for initial stable release
4. **Increment appropriately**: PATCH for bug fixes (1.0.0 → 1.0.1), MINOR for new features (1.0.1 → 1.1.0), MAJOR for breaking changes (1.1.0 → 2.0.0)
5. **Update CHANGELOG.md**: Document version changes in CHANGELOG.md

**Semantic Versioning Format:**

- `MAJOR`: Incompatible API changes (2.0.0)
- `MINOR`: New functionality, backwards compatible (1.1.0)
- `PATCH`: Bug fixes, backwards compatible (1.0.1)

**Example Workflow:**

```bash
# After fixing a bug, update version: 1.0.0 → 1.0.1
# 1. Edit SKILL.md frontmatter
# 2. Document in CHANGELOG.md
# 3. Commit changes
git add .claude/skills/deploy/SKILL.md .claude/skills/deploy/CHANGELOG.md
git commit -m "fix(deploy): handle network timeouts - v1.0.1"
```

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if your skill is experimental and version tracking isn't needed yet, you use a different versioning system, or your organization has alternative version management. However, version fields are a best practice even for experimental skills.

## Related Rules

- [skill-missing-changelog](./skill-missing-changelog.md) - Track version history in CHANGELOG

## Resources

- [Implementation](../../../src/validators/skills.ts)
- [Tests](../../../tests/validators/skills.test.ts)
- [Semantic Versioning](https://semver.org/)

## Version

Available since: v1.0.0
