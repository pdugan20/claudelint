# skill-multi-script-missing-readme

<RuleHeader description="Skills with multiple scripts should include a README.md" severity="warn" :fixable="false" category="Skills" />

## Rule Details

Complex skills that contain many script files (`.sh`, `.py`, `.js`, etc.) benefit from a README.md that documents setup, usage, dependencies, and troubleshooting. This rule counts the script files in the skill directory and warns if the count exceeds the configured threshold (default: 3) without a README.md present. A README helps contributors and users navigate multi-file skills.

### Incorrect

Skill directory with 4 scripts and no README.md

```text
my-skill/
  SKILL.md
  build.sh
  test.sh
  deploy.sh
  lint.sh
```

### Correct

Skill directory with 4 scripts and a README.md

```text
my-skill/
  SKILL.md
  README.md
  build.sh
  test.sh
  deploy.sh
  lint.sh
```

Skill directory with few scripts (under threshold)

```text
my-skill/
  SKILL.md
  run.sh
  setup.sh
```

## How To Fix

Add a README.md to the skill directory documenting setup instructions, usage examples for each script, dependencies, and troubleshooting guidance.

## Options

Default options:

```json
{
  "maxScripts": 3
}
```

Require README only when more than 5 scripts exist:

```json
{
  "maxScripts": 5
}
```

## When Not To Use It

If your multi-script skill is self-documenting through SKILL.md alone and the scripts have clear names, you may disable this rule.

## Related Rules

- [`skill-too-many-files`](/rules/skills/skill-too-many-files)
- [`skill-missing-examples`](/rules/skills/skill-missing-examples)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-multi-script-missing-readme.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-multi-script-missing-readme.test.ts)

## Version

Available since: v0.2.0
