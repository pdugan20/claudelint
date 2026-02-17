---
description: "Skill has inconsistent file naming conventions"
---

# skill-naming-inconsistent

<RuleHeader description="Skill has inconsistent file naming conventions" severity="warn" :fixable="false" :configurable="true" category="Skills" />

## Rule Details

Consistent file naming improves readability and predictability. This rule scans the skill directory for files using `.sh`, `.py`, `.js`, and `.md` extensions, classifies them as kebab-case, snake_case, or camelCase, and warns if multiple conventions are present. The check only fires when the total number of classifiable files reaches the configured minimum threshold (default: 3). Kebab-case is the recommended convention.

### Incorrect

Skill directory mixing kebab-case and snake_case

```text
my-skill/
  SKILL.md
  build-app.sh
  run_tests.sh
  deploy-prod.sh
```

### Correct

Skill directory using consistent kebab-case

```text
my-skill/
  SKILL.md
  build-app.sh
  run-tests.sh
  deploy-prod.sh
```

## How To Fix

Rename files to use a single naming convention. Kebab-case (e.g., `my-script.sh`) is recommended. Ensure all `.sh`, `.py`, `.js`, and `.md` files in the skill directory follow the same pattern.

## Options

Default options:

```json
{
  "minFiles": 3
}
```

Only check consistency when 5 or more files exist:

```json
{
  "minFiles": 5
}
```

## When Not To Use It

If the skill directory contains files from different ecosystems with established naming conventions (e.g., Python snake_case alongside shell kebab-case), you may disable this rule.

## Related Rules

- [`skill-name`](/rules/skills/skill-name)
- [`skill-too-many-files`](/rules/skills/skill-too-many-files)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-naming-inconsistent.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-naming-inconsistent.test.ts)

## Version

Available since: v0.2.0
