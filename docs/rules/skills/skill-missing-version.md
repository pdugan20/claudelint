# Missing Version

Skill frontmatter should include a version field.

## Rule Details

This rule enforces that Claude Code skills include a `version` field in their SKILL.md frontmatter. Version numbers help users and Claude track skill updates, ensure compatibility, and understand when breaking changes occur.

Without a version field:

- Users can't tell which version of the skill they're using
- It's unclear if the skill has been updated
- Compatibility issues are harder to diagnose
- Change management becomes difficult

**Category**: Skills
**Severity**: warning
**Fixable**: Yes (auto-fix available with `--fix`)
**Since**: v1.0.0

### Violation Example

SKILL.md frontmatter without version:

```yaml
---
name: deploy
description: Automated deployment skill
user-invocable: true
---
```

### Correct Example

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

### Option 1: Auto-fix with claudelint

```bash
claudelint check-all --fix
```

This will automatically add `version: "1.0.0"` to the frontmatter.

### Option 2: Manual fix

Add a version field to your SKILL.md frontmatter:

```yaml
---
name: your-skill
description: Your skill description
version: "1.0.0"
---
```

## Semantic Versioning

Follow [Semantic Versioning](https://semver.org/) (SemVer) format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Incompatible API changes (2.0.0)
- **MINOR**: New functionality, backwards compatible (1.1.0)
- **PATCH**: Bug fixes, backwards compatible (1.0.1)

Examples:

```yaml
version: "1.0.0"   # Initial release
version: "1.1.0"   # Added new features
version: "1.1.1"   # Fixed bugs
version: "2.0.0"   # Breaking changes
```

## Version Management Workflow

1. **Start with 1.0.0** for initial release
2. **Increment PATCH** for bug fixes: `1.0.0` → `1.0.1`
3. **Increment MINOR** for new features: `1.0.1` → `1.1.0`
4. **Increment MAJOR** for breaking changes: `1.1.0` → `2.0.0`
5. **Update CHANGELOG.md** with each version change

Example workflow:

```bash
# After fixing a bug
# 1. Update version in SKILL.md: 1.0.0 → 1.0.1
# 2. Document in CHANGELOG.md
# 3. Commit changes
git add .claude/skills/deploy/SKILL.md
git add .claude/skills/deploy/CHANGELOG.md
git commit -m "fix(deploy): handle network timeouts - v1.0.1"
```

## Why It Matters

Version numbers are essential for:

1. **Dependency Management**: Know which version you're using
2. **Compatibility**: Ensure skill works with your setup
3. **Update Decisions**: Understand if update has breaking changes
4. **Bug Tracking**: Report issues with specific versions
5. **Professional Standards**: Shows mature software practices

## Options

This rule does not have any configuration options.

## When Not To Use It

You might disable this rule if:

- Your skill is experimental and version tracking isn't needed yet
- You use a different versioning system
- Your organization has alternative version management requirements

However, version fields are a best practice even for experimental skills.

## Configuration

To disable this rule:

```json
{
  "rules": {
    "skill-missing-version": "off"
  }
}
```

To escalate to an error:

```json
{
  "rules": {
    "skill-missing-version": "error"
  }
}
```

## Related Rules

- [skill-missing-changelog](./skill-missing-changelog.md) - Track version history in CHANGELOG

## Resources

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

## Version

Available since: v1.0.0
