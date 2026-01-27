# Deep Nesting

Skill directory has excessive directory nesting.

## Rule Details

This rule enforces that skill directories don't have excessive directory nesting. When directory structure exceeds 4 levels of depth, it becomes difficult to navigate, maintain, and understand where files are located.

Directory depth is counted from the skill root:

```text
skill/          (depth 0)
  lib/          (depth 1)
    utils/      (depth 2)
      helpers/  (depth 3)
        io/     (depth 4)
           Exceeds 4 levels
```text
**Category**: Skills
**Severity**: warning
**Fixable**: No
**Since**: v1.0.0

### Violation Example

Skill with excessive nesting (6 levels):

```text
.claude/skills/deploy/
├── SKILL.md
├── deploy.sh
└── src/                    (1)
    └── core/               (2)
        └── deployment/     (3)
            └── strategies/ (4)
                └── cloud/  (5)
                    └── aws/  (6)  Too deep
                        └── ec2.sh
```text
### Correct Example

Well-organized skill (3 levels max):

```text
.claude/skills/deploy/
├── SKILL.md
├── deploy.sh
├── lib/                    (1)
│   ├── deployment.sh
│   ├── rollback.sh
│   └── strategies/         (2)
│       ├── aws.sh          (3)
│       ├── gcp.sh          (3)
│       └── azure.sh        (3)
└── tests/                  (1)
    └── integration/        (2)
        └── deploy-test.sh  (3)
```text
## How To Fix

Flatten the directory structure by:

### Option 1: Consolidate deeply nested directories

```bash
# Before: 6 levels
src/core/deployment/strategies/cloud/aws/ec2.sh

# After: 2 levels
lib/aws-ec2.sh
```text
### Option 2: Use descriptive file names instead of deep nesting

```bash
# Before
strategies/
  cloud/
    provider/
      aws/
        compute/
          ec2.sh
          lambda.sh

# After
strategies/
  aws-ec2.sh
  aws-lambda.sh
```text
### Option 3: Reorganize by feature, not category

```bash
# Before: Deep hierarchy by type
lib/
  utils/
    helpers/
      formatters/
        json-formatter.sh

# After: Flat organization by purpose
lib/
  json-utils.sh
  string-utils.sh
  file-utils.sh
```text
### Option 4: Move subdirectories to root level

```bash
# Before
lib/
  core/
    main/
      deployment/
        scripts/
          deploy.sh

# After
deployment/
  deploy.sh
```text
## Maximum Depth Guidelines

#### Depth 0-2: Ideal
```text
skill/
├── main.sh
└── lib/
    └── utils.sh
```text
#### Depth 3: Good
```text
skill/
├── main.sh
└── lib/
    ├── utils/
    │   └── logging.sh
    └── config.sh
```text
#### Depth 4: Maximum (warning)
```text
skill/
├── main.sh
└── lib/
    └── utils/
        └── helpers/
            └── format.sh  #  At warning threshold
```text
#### Depth 5+: Too deep (violation)
```text
skill/
└── src/
    └── lib/
        └── utils/
            └── helpers/
                └── io/
                    └── file.sh  #  Too deep
```text
## Why Depth Matters

Excessive nesting causes:

1. **Navigation difficulty**: Hard to find files
2. **Long paths**: Cumbersome to type and reference
3. **Cognitive overhead**: Complex mental model
4. **Import path complexity**: Long relative imports
5. **Maintenance burden**: Harder to refactor

Example of import complexity:

```bash
# With deep nesting
source ../../../lib/utils/helpers/format.sh

# With flat structure
source ../lib/format.sh
```text
## Restructuring Example

**Before (6 levels deep):**

```text
.claude/skills/api-client/
└── src/
    └── main/
        └── api/
            └── client/
                └── http/
                    └── methods/
                        ├── get.sh
                        ├── post.sh
                        └── delete.sh
```text
**After (2 levels):**

```text
.claude/skills/api-client/
├── SKILL.md
├── api-client.sh        # Main entry point
└── http/
    ├── get.sh
    ├── post.sh
    └── delete.sh
```text
## Good Directory Patterns

### Pattern 1: Flat with logical grouping

```text
skill/
├── SKILL.md
├── main.sh
├── auth/
│   ├── login.sh
│   └── logout.sh
├── api/
│   ├── get.sh
│   └── post.sh
└── utils/
    ├── logging.sh
    └── config.sh
```text
### Pattern 2: Feature-based organization

```text
skill/
├── SKILL.md
├── deploy.sh
├── deployment-scripts/
│   ├── aws.sh
│   ├── gcp.sh
│   └── azure.sh
└── shared/
    ├── validation.sh
    └── logging.sh
```text
### Pattern 3: Minimal nesting

```text
skill/
├── SKILL.md
├── main.sh
├── lib-auth.sh
├── lib-api.sh
├── lib-utils.sh
└── tests/
    └── test-main.sh
```text
## Options

This rule does not have any configuration options. The maximum depth of 4 levels is fixed.

## When Not To Use It

You might disable this rule if:

- You're mirroring an external project structure
- You're following a specific framework convention
- Your organization has different nesting standards

However, flatter structures are generally easier to maintain.

## Configuration

To disable this rule:

```json
{
  "rules": {
    "skill-deep-nesting": "off"
  }
}
```text
To escalate to an error:

```json
{
  "rules": {
    "skill-deep-nesting": "error"
  }
}
```text
## Related Rules

- [skill-too-many-files](./skill-too-many-files.md) - Too many files at root level
- [skill-naming-inconsistent](./skill-naming-inconsistent.md) - Inconsistent file naming

## Resources

- [Flat vs Nested Folder Structures](https://hackernoon.com/flat-vs-nested-folder-structure-3-de96)
- [Project Structure Best Practices](https://github.com/kriasoft/Folder-Structure-Conventions)

## Version

Available since: v1.0.0
