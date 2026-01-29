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

All notable changes to deploy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
