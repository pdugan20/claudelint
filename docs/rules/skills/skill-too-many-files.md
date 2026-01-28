# Rule: skill-too-many-files

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Enforces that skill directories don't have more than 10 files at the root level to maintain navigability and organization.

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

## How To Fix

1. **Create subdirectories**: Use standard structure (`bin/`, `lib/`, `tests/`, `config/`)
2. **Move files to logical groups**: Organize by function (executable, library, test, config)
3. **Update import paths**: Change `source ./utils.sh` to `source ./lib/utils.sh`
4. **Update SKILL.md**: Document new structure
5. **Test**: Ensure skill still works after reorganization

**Standard Structure:**

```bash
.claude/skills/your-skill/
├── SKILL.md            # Required documentation
├── main-script.sh      # Main entry point
├── bin/                # Executable scripts
├── lib/                # Shared libraries/utilities
├── tests/              # Test scripts
└── config/             # Configuration files
```

**Alternative: Group by functionality:**

```bash
.claude/skills/deploy/
├── SKILL.md
├── deploy.sh           # Main orchestrator
├── deployment/         # Deployment operations
├── backup/             # Backup operations
└── utilities/          # Shared utilities
```

**Excluded from count:** `SKILL.md`, `README.md`, `CHANGELOG.md`, `.gitignore`, `.DS_Store`

## Options

This rule does not have configuration options. The threshold of 10 files is fixed.

## When Not To Use It

Consider disabling if your skill genuinely needs many root-level files, you're following a specific project structure convention, or you're mid-reorganization. However, organization improves all projects, so restructuring is preferred over disabling.

## Related Rules

- [skill-deep-nesting](./skill-deep-nesting.md) - Excessive directory nesting
- [skill-naming-inconsistent](./skill-naming-inconsistent.md) - Inconsistent file naming

## Resources

- [Implementation](../../../src/validators/skills.ts)
- [Tests](../../../tests/validators/skills.test.ts)
- [Shell Script Organization](https://google.github.io/styleguide/shellguide.html)

## Version

Available since: v1.0.0
