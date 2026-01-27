# Missing CHANGELOG

Skills should include a CHANGELOG.md file to track changes over time.

## Rule Details

This rule enforces that Claude Code skills include a `CHANGELOG.md` file in the skill directory. A changelog helps users and developers understand what changed between versions, making it easier to track the evolution of the skill, debug issues, and decide whether to update.

Without a changelog:

- Users don't know what changed in updates
- It's harder to track when bugs were introduced
- Contributors can't see the history of changes
- Debugging version-specific issues becomes difficult

**Category**: Skills
**Severity**: warning
**Fixable**: Yes (auto-fix available with `--fix`)
**Since**: v1.0.0

### Violation Example

Skill directory structure missing CHANGELOG.md:

```text
.claude/skills/deploy/
├── SKILL.md          
├── deploy.sh         
└── README.md         
# Missing CHANGELOG.md ❌
```

### Correct Example

Skill directory with proper documentation:

```text
.claude/skills/deploy/
├── SKILL.md          
├── CHANGELOG.md       Present
├── deploy.sh         
└── README.md         
```

Sample `CHANGELOG.md` content:

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

### Option 1: Auto-fix with claudelint

```bash
claudelint check-all --fix
```

This will automatically create a CHANGELOG.md file with a standard template based on [Keep a Changelog](https://keepachangelog.com/).

### Option 2: Manual creation

Create a `CHANGELOG.md` file in your skill directory:

```bash
cd .claude/skills/your-skill
touch CHANGELOG.md
```

Add initial content:

```markdown
# Changelog

All notable changes to your-skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial skill implementation

## [1.0.0] - 2026-01-27

### Added
- Initial release
```

## Changelog Best Practices

Follow [Keep a Changelog](https://keepachangelog.com/) format:

- **Guiding Principles**: Changelogs are for humans, not machines
- **Format**: Use markdown with semantic versioning
- **Sections**: Added, Changed, Deprecated, Removed, Fixed, Security
- **Dates**: Use ISO 8601 format (YYYY-MM-DD)
- **Versions**: Link to version tags when possible

Example entry:

```markdown
## [1.2.0] - 2026-02-15

### Added
- New --verbose flag for detailed output
- Support for custom deployment targets

### Fixed
- Fixed race condition in parallel deployments
- Corrected error handling for network timeouts

### Security
- Updated dependencies to patch CVE-2026-1234
```

## Why It Matters

A changelog is essential for:

1. **User Communication**: Users need to know what changed
2. **Debugging**: Track when issues were introduced or fixed
3. **Version Management**: Understand breaking changes before updating
4. **Project History**: Maintain institutional knowledge
5. **Professional Standards**: Shows maturity and care for users

## Options

This rule does not have any configuration options.

## When Not To Use It

You might disable this rule if:

- Your skill is in very early development (pre-alpha)
- You use a different change tracking system (e.g., GitHub Releases only)
- Your skill is a simple wrapper with no expected changes

However, even simple skills benefit from changelogs as they evolve.

## Configuration

To disable this rule:

```json
{
  "rules": {
    "skill-missing-changelog": "off"
  }
}
```

To escalate to an error:

```json
{
  "rules": {
    "skill-missing-changelog": "error"
  }
}
```

## Related Rules

- [skill-missing-version](./skill-missing-version.md) - Skills should have version numbers
- [skill-missing-examples](./skill-missing-examples.md) - Skills should have usage examples

## Resources

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

## Version

Available since: v1.0.0
