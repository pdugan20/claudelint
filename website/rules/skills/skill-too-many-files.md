---
description: "Skill directory has too many files at root level"
---

# skill-too-many-files

<RuleHeader description="Skill directory has too many files at root level" severity="warn" :fixable="false" :configurable="true" category="Skills" />

## Rule Details

Skill directories with a large number of loose files become difficult to navigate and maintain. This rule counts files at the root level of the skill directory (excluding known documentation files like SKILL.md, README.md, CHANGELOG.md, .gitignore, and .DS_Store) and warns when the count exceeds the configured threshold (default: 10). The suggestion is to organize scripts into subdirectories such as `bin/`, `lib/`, and `tests/`.

### Incorrect

Skill directory with too many root-level files

```text
my-skill/
  SKILL.md
  build.sh
  test.sh
  deploy.sh
  lint.sh
  format.sh
  validate.sh
  setup.sh
  clean.sh
  migrate.sh
  backup.sh
  restore.sh
```

### Correct

Skill directory organized into subdirectories

```text
my-skill/
  SKILL.md
  bin/
    build.sh
    deploy.sh
    clean.sh
  lib/
    format.sh
    validate.sh
  tests/
    test.sh
    lint.sh
```

Simple skill with few files (under threshold)

```text
my-skill/
  SKILL.md
  run.sh
  config.json
```

## How To Fix

Organize files into subdirectories. Common patterns include `bin/` for executables, `lib/` for libraries, and `tests/` for test scripts.

## Options

Default options:

```json
{
  "maxFiles": 10
}
```

Allow up to 15 root-level files before warning:

```json
{
  "maxFiles": 15
}
```

## When Not To Use It

If the skill intentionally provides many standalone scripts that are each invoked independently, you may increase the threshold or disable this rule.

## Related Rules

- [`skill-naming-inconsistent`](/rules/skills/skill-naming-inconsistent)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-too-many-files.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-too-many-files.test.ts)

## Version

Available since: v0.2.0
