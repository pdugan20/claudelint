# Rule: skill-too-many-files

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: File System

Skill directory has too many files at root level

## Rule Details

When a skill directory contains more than 10 files at the root level (excluding `SKILL.md`, `README.md`, `CHANGELOG.md`, `.gitignore`, `.DS_Store`), it becomes difficult to navigate, maintain, and understand. Files should be organized into logical subdirectories like `bin/`, `lib/`, `tests/`, or functional groupings.

This rule counts non-documentation files at the root level. Exceeding 10 files indicates poor organization that harms maintainability. Proper structure makes skills easier to navigate, understand at a glance, and update.

### Incorrect

15 files at root level:

```text
.claude/skills/deploy/
├── SKILL.md
├── deploy.sh
├── rollback.sh
├── health-check.sh
├── validate.sh
├── notify.sh
├── backup.sh
├── restore.sh
├── config.sh
├── utils.sh
├── logging.sh
├── monitoring.sh
├── cleanup.sh
├── setup.sh
├── teardown.sh
└── verify.sh

14 script files at root (>10)
```

### Correct

Well-organized with subdirectories:

```text
.claude/skills/deploy/
├── SKILL.md
├── deploy.sh           # Main entry point
├── bin/                # Executable scripts
│   ├── rollback.sh
│   ├── health-check.sh
│   └── validate.sh
├── lib/                # Library/utility scripts
│   ├── config.sh
│   ├── utils.sh
│   ├── logging.sh
│   └── monitoring.sh
└── tests/              # Test scripts
    ├── test-deploy.sh
    └── test-rollback.sh

3 files at root (<10)
```

## Options

This rule does not have configuration options. The threshold of 10 files is fixed.

## When Not To Use It

Consider disabling if your skill genuinely needs many root-level files, you're following a specific project structure convention, or you're mid-reorganization. However, organization improves all projects, so restructuring is preferred over disabling.

## Related Rules

- [skill-deep-nesting](./skill-deep-nesting.md) - Excessive directory nesting
- [skill-naming-inconsistent](./skill-naming-inconsistent.md) - Inconsistent file naming

## How To Fix

Organize files into logical subdirectories:

1. Create subdirectories: `bin/`, `lib/`, `tests/`, `docs/`
2. Move scripts to appropriate directories
3. Keep only essential files at root (SKILL.md, main script, README.md)
4. Update references in scripts and documentation

Example restructuring:

```bash
# Before: 15 files at root
.claude/skills/deploy/*.sh

# After: Organized structure
mkdir -p bin lib tests
mv *-check.sh *-validate.sh bin/
mv utils.sh config.sh logging.sh lib/
mv *-test.sh tests/
```

## Options

### `maxFiles`

Maximum number of files allowed at root level before warning.

Type: `number`
Default: `10`

Example configuration:

```json
{
  "rules": {
    "skill-too-many-files": ["warn", { "maxFiles": 15 }]
  }
}
```

## Resources

- [Rule Implementation](../../src/rules/skills/skill-too-many-files.ts)
- [Rule Tests](../../tests/rules/skills/skill-too-many-files.test.ts)
- [Shell Script Organization](https://google.github.io/styleguide/shellguide.html)

## Version

Available since: v1.0.0
