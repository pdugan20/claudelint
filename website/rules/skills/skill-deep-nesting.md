# Rule: skill-deep-nesting

**Severity**: Warn
**Fixable**: No
**Validator**: Skills

Skill directory has excessive directory nesting

## Rule Details

This rule measures the maximum directory nesting depth within a skill directory starting from where the SKILL.md file resides. Deeply nested directories are harder to navigate, slower to scan, and often indicate an overly complex structure that should be flattened. The `node_modules` directory is excluded from the depth calculation.

### Incorrect

Skill directory with 4 levels of nesting (exceeds default max of 3)

```text
my-skill/
  SKILL.md
  src/
    utils/
      helpers/
        deep/
          file.ts
```

### Correct

Skill directory with flat structure

```text
my-skill/
  SKILL.md
  run.sh
  references/
    api.md
```

## How To Fix

Flatten the directory structure by reducing unnecessary nesting levels. Move deeply nested files closer to the skill root or consolidate subdirectories.

## Options

Default options:

```json
{
  "maxDepth": 3
}
```

Allow up to 5 levels of nesting:

```json
{
  "maxDepth": 5
}
```

Enforce strict 2-level nesting limit:

```json
{
  "maxDepth": 2
}
```

## When Not To Use It

Disable this rule if your skill has a legitimate reason for deep nesting, such as mirroring an external project structure that cannot be flattened.

## Related Rules

- [`skill-body-too-long`](/rules/skills/skill-body-too-long)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-deep-nesting.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-deep-nesting.test.ts)

## Version

Available since: v1.0.0
