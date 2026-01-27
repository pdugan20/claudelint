# Inconsistent Naming

Skill files use inconsistent naming conventions.

## Rule Details

This rule enforces consistent file naming conventions within a skill directory. When files use multiple naming styles (kebab-case, snake_case, camelCase), it creates confusion, makes files harder to find, and looks unprofessional.

This rule triggers when a skill directory contains files using more than one naming convention:

- **kebab-case**: `deploy-app.sh`, `health-check.sh`
- **snake_case**: `deploy_app.sh`, `health_check.sh`
- **camelCase**: `deployApp.sh`, `healthCheck.sh`

The recommended convention is **kebab-case** for shell scripts.

**Category**: Skills
**Severity**: warning
**Fixable**: No
**Since**: v1.0.0

### Violation Example

Mixed naming conventions:

```text
.claude/skills/deploy/
├── SKILL.md
├── deploy-app.sh       # kebab-case
├── health_check.sh     # snake_case
├── rollbackDeployment.sh  # camelCase
└── validate.sh
```

### Correct Example

Consistent kebab-case naming:

```text
.claude/skills/deploy/
├── SKILL.md
├── deploy-app.sh       # kebab-case
├── health-check.sh     # kebab-case
├── rollback-deployment.sh  # kebab-case
└── validate.sh         # kebab-case
```

Alternative - consistent snake_case:

```text
.claude/skills/deploy/
├── SKILL.md
├── deploy_app.sh       # snake_case
├── health_check.sh     # snake_case
├── rollback_deployment.sh  # snake_case
└── validate.sh         # snake_case
```

## Naming Convention Patterns

### Kebab-Case (Recommended)

**Pattern**: `word-word-word.sh`

**Benefits**:

- Most common in shell scripting
- URL-friendly (no encoding needed)
- Easy to read
- Works well with version control

**Examples**:

```text
deploy-to-production.sh
health-check-api.sh
rollback-deployment.sh
validate-config.sh
```

### Snake_Case

**Pattern**: `word_word_word.sh`

**Benefits**:

- Common in Python/Ruby ecosystems
- Clear word separation
- Easy to read

**Examples**:

```text
deploy_to_production.sh
health_check_api.sh
rollback_deployment.sh
validate_config.sh
```

### camelCase (Not Recommended for Shell)

**Pattern**: `wordWordWord.sh`

**Drawbacks**:

- Less common in shell scripting
- Case-sensitive filesystems can be problematic
- Harder to distinguish words at a glance

**Examples**:

```text
deployToProduction.sh
healthCheckApi.sh
rollbackDeployment.sh
validateConfig.sh
```

## How To Fix

### Option 1: Rename files to kebab-case

```bash
# Rename all files to kebab-case
mv deploy_app.sh deploy-app.sh
mv rollbackDeployment.sh rollback-deployment.sh
mv healthCheck.sh health-check.sh
```

### Option 2: Use a rename script

```bash
#!/usr/bin/env bash

# Convert snake_case to kebab-case
for file in *_*.sh; do
  new_name=$(echo "$file" | tr '_' '-')
  git mv "$file" "$new_name"
done

# Convert camelCase to kebab-case
# (more complex, may need manual renaming)
```

### Option 3: Standardize during code review

Add a guideline to your project:

```markdown
## File Naming Convention

All script files must use kebab-case:

-  `deploy-app.sh`
-  `deploy_app.sh`
-  `deployApp.sh`
```

## Impact of Renaming

**Consider these impacts before renaming:**

1. **Git history**: Use `git mv` to preserve history
2. **External references**: Update documentation and scripts
3. **Imports/sources**: Update `source` statements in scripts
4. **CI/CD**: Update pipeline references
5. **User instructions**: Update guides and examples

**Migration checklist:**

```bash
# 1. Rename files
git mv old-name.sh new-name.sh

# 2. Update imports
grep -r "source.*old-name" .
# Update each occurrence

# 3. Update documentation
grep -r "old-name" docs/
# Update references

# 4. Test thoroughly
./new-name.sh

# 5. Commit with clear message
git commit -m "refactor: rename old-name.sh to new-name.sh for consistency"
```

## Naming Best Practices

1. **Be descriptive**: `deploy-to-staging.sh` over `deploy.sh`
2. **Use verbs for actions**: `validate-config.sh`, not `config.sh`
3. **Avoid abbreviations**: `health-check.sh`, not `hc.sh`
4. **Be consistent**: Choose one convention and stick to it
5. **Follow ecosystem norms**: kebab-case for shell, snake_case for Python

## Good Examples

**Clear and consistent:**

```text
skill/
├── deploy-app.sh
├── rollback-app.sh
├── health-check.sh
├── validate-config.sh
└── cleanup-resources.sh
```

**Descriptive and hierarchical:**

```text
skill/
├── aws-deploy-ec2.sh
├── aws-deploy-lambda.sh
├── gcp-deploy-compute.sh
└── azure-deploy-vm.sh
```

## Bad Examples

**Inconsistent and unclear:**

```text
skill/
├── deploy.sh              # Too vague
├── rollback_Deployment.sh # Mixed case
├── hc.sh                  # Abbreviation
├── validateCfg.sh         # Mixed camelCase + abbrev
└── CLEANUP.sh             # ALL CAPS
```

## Options

This rule does not have any configuration options.

## When Not To Use It

You might disable this rule if:

- You're migrating from another system and can't rename yet
- Your organization has a different standard that mixes conventions intentionally
- You're wrapping external tools that dictate naming

However, consistency improves all projects. Consider planning a migration.

## Configuration

To disable this rule:

```json
{
  "rules": {
    "skill-naming-inconsistent": "off"
  }
}
```

To escalate to an error:

```json
{
  "rules": {
    "skill-naming-inconsistent": "error"
  }
}
```

## Related Rules

- [skill-too-many-files](./skill-too-many-files.md) - Organize files into directories
- [skill-deep-nesting](./skill-deep-nesting.md) - Avoid excessive directory nesting

## Resources

- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)
- [Naming Conventions in Programming](https://en.wikipedia.org/wiki/Naming_convention_(programming))

## Version

Available since: v1.0.0
