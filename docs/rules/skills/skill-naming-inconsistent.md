# Rule: skill-naming-inconsistent

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Enforces consistent file naming conventions within skill directories to improve navigability and professionalism.

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

## How To Fix

1. **Choose a convention**: Pick kebab-case (recommended), snake_case, or camelCase
2. **Rename files**: Use `git mv` to preserve history (e.g., `git mv deploy_app.sh deploy-app.sh`)
3. **Update imports**: Find and update all `source` statements referencing renamed files
4. **Update documentation**: Change references in README, SKILL.md, comments
5. **Update CI/CD**: Modify pipeline scripts that reference old names
6. **Test thoroughly**: Ensure skill still works after renaming

**Rename Script Example:**

```bash
# Convert snake_case to kebab-case
for file in *_*.sh; do
  new_name=$(echo "$file" | tr '_' '-')
  git mv "$file" "$new_name"
done
```

**Migration Checklist:**

- Use `git mv` to preserve history
- Update `source` statements in scripts
- Update documentation and guides
- Update CI/CD pipeline references
- Test skill functionality

**Naming Best Practices:**

- Be descriptive: `deploy-to-staging.sh` over `deploy.sh`
- Use verbs for actions: `validate-config.sh` not `config.sh`
- Avoid abbreviations: `health-check.sh` not `hc.sh`
- Follow ecosystem norms: kebab-case for shell, snake_case for Python

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if migrating from another system and can't rename yet, your organization has a different standard mixing conventions intentionally, or you're wrapping external tools that dictate naming. However, consistency improves all projects so plan a migration.

## Related Rules

- [skill-too-many-files](./skill-too-many-files.md) - File organization
- [skill-deep-nesting](./skill-deep-nesting.md) - Directory nesting

## Resources

- [Implementation](../../../src/validators/skills.ts)
- [Tests](../../../tests/validators/skills.test.ts)
- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)

## Version

Available since: v1.0.0
