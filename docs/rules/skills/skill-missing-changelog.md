# Rule: skill-missing-changelog

**Severity**: Warning
**Fixable**: Yes
**Validator**: Skills
**Category**: Cross-Reference

Skill directory lacks CHANGELOG.md

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

All notable changes to this skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added

- Initial release of deploy skill
- Support for production and staging environments
- Health check validation
- Rollback capability
```

## How To Fix

Create a CHANGELOG.md file in your skill directory:

1. Create `CHANGELOG.md` in the skill directory
2. Use Keep a Changelog format (v1.1.0)
3. Document all notable changes
4. Link to semantic versioning

A template is available at `.claude/skills/.templates/CHANGELOG.md` that you can copy.

This rule is auto-fixable and will create a CHANGELOG.md template if run with the `--fix` flag.

Example creation:

```bash
# Copy from template
cp .claude/skills/.templates/CHANGELOG.md .claude/skills/deploy/CHANGELOG.md

# Or create manually
cat > .claude/skills/deploy/CHANGELOG.md << 'EOF'
# Changelog

All notable changes to this skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added

- Initial release
EOF
```

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if your skill is in very early development (pre-alpha), you use a different change tracking system (GitHub Releases only), or your skill is a simple wrapper with no expected changes. However, even simple skills benefit from changelogs as they evolve.

## Related Rules

- [skill-missing-version](./skill-missing-version.md) - Skills should have version numbers
- [skill-missing-examples](./skill-missing-examples.md) - Skills should have usage examples

## Resources

- [Rule Implementation](../../src/rules/skills/skill-missing-changelog.ts)
- [Rule Tests](../../tests/rules/skills/skill-missing-changelog.test.ts)
- [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- [CHANGELOG Template](./../../../.claude/skills/.templates/CHANGELOG.md)

## Version

Available since: v0.2.0
