# Rule: skill-deep-nesting

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Enforces that skill directories don't exceed 4 levels of nesting depth to maintain navigability and reduce cognitive overhead.

## Rule Details

This rule triggers when skill directories exceed 4 levels of nesting depth (counted from the skill root). Deep directory structures make navigation difficult, create long import paths, increase cognitive overhead, and make relative paths harder to understand. Flat structures are easier to browse, have simpler import paths, and reduce mental mapping of directory hierarchies.

The maximum depth of 4 levels provides enough structure for organization (like `lib/`, `tests/`, `bin/`) while preventing over-complicated hierarchies. Files beyond the 4th level should be moved up and renamed with contextual prefixes instead of relying on deep nesting for organization.

### Incorrect

Skill with excessive nesting (6 levels):

```text
.claude/skills/deploy/
├── SKILL.md
└── src/                    (1)
    └── core/               (2)
        └── deployment/     (3)
            └── strategies/ (4)
                └── cloud/  (5)
                    └── aws/  (6)  Too deep
                        └── ec2.sh
```

Difficult relative imports:

```bash
# With deep nesting - difficult to reference
source ../../../lib/utils/helpers/format.sh
```

### Correct

Well-organized skill with flat structure (3 levels max):

```text
.claude/skills/deploy/
├── SKILL.md
├── deploy.sh
├── lib/                    (1)
│   ├── deployment.sh
│   └── strategies/         (2)
│       ├── aws-ec2.sh      (3) ✓ Within limit
│       └── aws-lambda.sh   (3)
└── tests/                  (1)
    └── deploy-test.sh      (2)
```

Easier relative imports:

```bash
# Easier to reference
source ../lib/format.sh
```

## How To Fix

1. **Move files up and rename with context**: Change `src/core/deployment/strategies/cloud/aws/ec2.sh` to `lib/aws-ec2.sh`
2. **Use descriptive file names instead of deep nesting**: Change `strategies/cloud/provider/aws/compute/ec2.sh` to `strategies/aws-ec2.sh`
3. **Update import paths**: Adjust all `source` statements in scripts after moving files
4. **Test thoroughly**: Ensure skill still works after reorganization

**Example Refactoring:**

```bash
# Before (6 levels)
src/core/deployment/strategies/cloud/aws/ec2.sh

# After (2 levels) - file name includes context
lib/aws-ec2-deployment.sh
```

## Options

This rule does not have configuration options. The maximum depth of 4 levels is fixed.

## When Not To Use It

Consider disabling if you're mirroring an external project structure or following a specific framework convention. However, flatter structures are generally easier to maintain.

## Related Rules

- [skill-too-many-files](./skill-too-many-files.md) - Too many files at root level
- [skill-naming-inconsistent](./skill-naming-inconsistent.md) - Inconsistent file naming

## Resources

- [Implementation](../../../src/validators/skills.ts)
- [Tests](../../../tests/validators/skills.test.ts)

## Version

Available since: v1.0.0
