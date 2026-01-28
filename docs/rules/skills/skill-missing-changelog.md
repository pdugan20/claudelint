# Rule: skill-missing-changelog

**Severity**: Warning
**Fixable**: Yes
**Validator**: Skills
**Category**: Completeness

Enforces that Claude Code skills include a CHANGELOG.md file to track changes over time using the Keep a Changelog format.

## Rule Details

This rule triggers when a skill directory lacks a `CHANGELOG.md` file. Changelogs help users understand what changed between versions, track when bugs were introduced or fixed, decide whether to update, and maintain project history. Without a changelog, users don't know what changed in updates, debugging version-specific issues becomes difficult, and contributors can't see the history of changes.

The rule checks for the presence of `CHANGELOG.md` in the skill directory (case-insensitive). This rule is auto-fixable and will create a CHANGELOG.md with a standard template based on Keep a Changelog format including Unreleased section and initial version entry.

### Incorrect

Skill directory missing CHANGELOG.md:

```text
.claude/skills/deploy/
├── SKILL.md
├── deploy.sh
└── README.md
# Missing CHANGELOG.md 
```

### Correct

Skill directory with CHANGELOG.md:

```text
.claude/skills/deploy/
├── SKILL.md
├── CHANGELOG.md       ✓ Present
├── deploy.sh
└── README.md
```

Sample CHANGELOG.md content:

```markdown
# Changelog

All notable changes to deploy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Support for staging environment deployments

## [1.0.0] - 2026-01-27

### Added
- Initial release
- Automated deployment to production
- Rollback functionality
```

## How To Fix

1. **Auto-fix with claudelint**: Run `claudelint check-all --fix` to automatically create CHANGELOG.md with standard template
2. **Manual creation**: Create `CHANGELOG.md` in your skill directory with Keep a Changelog format
3. **Follow format**: Use sections: Added, Changed, Deprecated, Removed, Fixed, Security
4. **Use semantic versioning**: Version headers like `## [1.2.0] - 2026-02-15`
5. **Update regularly**: Document changes with each version increment

**Template Structure:**

```markdown
# Changelog

## [Unreleased]

### Added
- New features not yet released

## [1.0.0] - YYYY-MM-DD

### Added
- Initial release features

### Fixed
- Bug fixes

### Security
- Security updates
```

**Best Practices:**

- Changelogs are for humans, not machines
- Use markdown with semantic versioning
- Use ISO 8601 dates (YYYY-MM-DD)
- Group changes by type (Added, Changed, Fixed, etc.)
- Link to version tags when possible

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if your skill is in very early development (pre-alpha), you use a different change tracking system (GitHub Releases only), or your skill is a simple wrapper with no expected changes. However, even simple skills benefit from changelogs as they evolve.

## Related Rules

- [skill-missing-version](./skill-missing-version.md) - Skills should have version numbers
- [skill-missing-examples](./skill-missing-examples.md) - Skills should have usage examples

## Resources

- [Implementation](../../../src/validators/skills.ts)
- [Tests](../../../tests/validators/skills.test.ts)
- [Keep a Changelog](https://keepachangelog.com/)

## Version

Available since: v1.0.0
