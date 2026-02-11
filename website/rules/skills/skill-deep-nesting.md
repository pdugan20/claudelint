# Rule: skill-deep-nesting

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill directory has excessive directory nesting

## Rule Details

This rule triggers when skill directories exceed the maximum nesting depth (default: 3 levels, counted from the skill root). Deep directory structures make navigation difficult, create long import paths, increase cognitive overhead, and make relative paths harder to understand. Flat structures are easier to browse, have simpler import paths, and reduce mental mapping of directory hierarchies.

The default maximum depth of 3 levels provides enough structure for organization (like `lib/`, `tests/`, `bin/`) while preventing over-complicated hierarchies. Files beyond the maximum depth should be moved up and renamed with contextual prefixes instead of relying on deep nesting for organization.

### Incorrect

Skill with excessive nesting (5 levels):

```text
.claude/skills/deploy/
├── SKILL.md
└── src/                    (1)
    └── core/               (2)
        └── deployment/     (3)
            └── strategies/ (4)
                └── aws/    (5)  Too deep (exceeds default max of 3)
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

## Options

This rule has the following configuration options:

### `maxDepth`

Maximum directory nesting depth before triggering a warning. Must be a positive integer.

**Type**: `number`
**Default**: `3`

**Schema**:

```typescript
{
  maxDepth: number // positive integer
}
```

**Example configuration**:

```json
{
  "rules": {
    "skill-deep-nesting": ["warn", { "maxDepth": 4 }]
  }
}
```

## When Not To Use It

Consider disabling if you're mirroring an external project structure or following a specific framework convention. However, flatter structures are generally easier to maintain.

## Related Rules

- [skill-too-many-files](./skill-too-many-files.md) - Too many files at root level
- [skill-naming-inconsistent](./skill-naming-inconsistent.md) - Inconsistent file naming

## Resources

- [Rule Implementation](../../src/rules/skills/skill-deep-nesting.ts)
- [Rule Tests](../../tests/rules/skills/skill-deep-nesting.test.ts)

## Version

Available since: v1.0.0
