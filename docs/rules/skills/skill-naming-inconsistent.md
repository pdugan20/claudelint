# Rule: skill-naming-inconsistent

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill has inconsistent file naming conventions

## Rule Details

Files within a skill directory should use a single naming convention: kebab-case (`deploy-app.sh`), snake_case (`deploy_app.sh`), or camelCase (`deployApp.sh`). Mixed conventions create confusion, make files harder to find, and look unprofessional. The recommended convention is **kebab-case** for shell scripts as it's most common in shell scripting, URL-friendly, and easy to read.

This rule triggers when a skill contains files using multiple naming styles. Consistency aids navigation, understanding, and maintenance. kebab-case works well with version control and doesn't require URL encoding.

### Incorrect

Mixed naming conventions:

```text
.claude/skills/deploy/
├── SKILL.md
├── deploy-app.sh       # kebab-case
├── health_check.sh     # snake_case
├── rollbackDeployment.sh  # camelCase
└── validate.sh
```

### Correct

Consistent kebab-case (recommended):

```text
.claude/skills/deploy/
├── SKILL.md
├── deploy-app.sh
├── health-check.sh
├── rollback-deployment.sh
└── validate.sh
```

Alternative - consistent snake_case:

```text
.claude/skills/deploy/
├── SKILL.md
├── deploy_app.sh
├── health_check.sh
├── rollback_deployment.sh
└── validate.sh
```

## When Not To Use It

Consider disabling if migrating from another system and can't rename yet, your organization has a different standard mixing conventions intentionally, or you're wrapping external tools that dictate naming. However, consistency improves all projects so plan a migration.

## Related Rules

- [skill-too-many-files](./skill-too-many-files.md) - File organization
- [skill-deep-nesting](./skill-deep-nesting.md) - Directory nesting

## How To Fix

Choose one naming convention and rename all files:

1. Audit existing file names
2. Choose a convention (kebab-case recommended)
3. Rename files consistently
4. Update references in scripts

Example renaming:

```bash
# Standardize to kebab-case
mv health_check.sh health-check.sh
mv rollbackDeployment.sh rollback-deployment.sh
```

## Options

### `minFiles`

Minimum number of files before checking for consistency.

Type: `number`
Default: `3`

Example configuration:

```json
{
  "rules": {
    "skill-naming-inconsistent": ["warn", { "minFiles": 5 }]
  }
}
```

## Resources

- [Rule Implementation](../../src/rules/skills/skill-naming-inconsistent.ts)
- [Rule Tests](../../tests/rules/skills/skill-naming-inconsistent.test.ts)
- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)

## Version

Available since: v1.0.0
