# Rule: skill-version

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill version must follow semantic versioning format (e.g., 1.0.0)

## Rule Details

This rule validates that when a skill includes a `version` field in its frontmatter, it follows the semantic versioning (SemVer) format: `MAJOR.MINOR.PATCH`. Semantic versioning provides a clear, standardized way to communicate changes and compatibility.

The version field is optional, but when present it must be a valid SemVer string. This enables proper dependency management, clear communication about breaking changes, and version-based compatibility checks.

### Incorrect

Invalid version formats in SKILL.md frontmatter:

```markdown
---
name: deploy
description: Deploys applications to production
version: 1.0          # Missing patch version
---
```

```markdown
---
name: deploy
description: Deploys applications to production
version: v1.0.0       # Should not include 'v' prefix
---
```

```markdown
---
name: deploy
description: Deploys applications to production
version: latest       # Not a valid SemVer
---
```

### Correct

Valid semantic version:

```markdown
---
name: deploy
description: Deploys applications to production
version: "1.0.0"
---
```

With pre-release tag:

```markdown
---
name: deploy
description: Deploys applications to production
version: "1.0.0-beta.1"
---
```

With build metadata:

```markdown
---
name: deploy
description: Deploys applications to production
version: "1.0.0+20240115"
---
```

## How To Fix

Update the version field to follow semantic versioning:

1. Use three numbers separated by dots: `MAJOR.MINOR.PATCH`
2. Remove any `v` prefix
3. Optionally add pre-release identifiers: `1.0.0-alpha.1`
4. Optionally add build metadata: `1.0.0+build.123`

Examples:

- `1.0.0` - Initial release
- `1.1.0` - New feature (backwards compatible)
- `2.0.0` - Breaking change
- `1.0.1` - Bug fix

## Options

This rule does not have any configuration options.

## When Not To Use It

Consider disabling this rule if:

- Your project uses a different versioning scheme mandated by your organization
- You're working with auto-generated skills where versions are managed externally
- The skill is experimental and versioning hasn't been established yet

However, SemVer is the industry standard and recommended for all projects.

## Related Rules

- [skill-missing-version](./skill-missing-version.md) - Skill should have a version field
- [skill-missing-changelog](./skill-missing-changelog.md) - Track version changes in CHANGELOG

## Resources

- [Rule Implementation](../../src/rules/skills/skill-version.ts)
- [Rule Tests](../../tests/rules/skills/skill-version.test.ts)
- [Semantic Versioning Specification](https://semver.org/)

## Version

Available since: v1.0.0
