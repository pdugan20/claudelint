---
description: "Skills must use SKILL.md, not README.md"
---

# skill-readme-forbidden

<RuleHeader description="Skills must use SKILL.md, not README.md" severity="error" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

Anthropic explicitly requires skills to use SKILL.md as their primary documentation file, not README.md. Having both files creates ambiguity about which one is the source of truth for the skill definition. This rule checks whether a README.md exists in the same directory as a SKILL.md and reports an error if found. If a skill has complex documentation needs, consolidate all content into SKILL.md rather than splitting across multiple files.

### Incorrect

Skill directory containing both SKILL.md and README.md

```text
my-skill/
  SKILL.md
  README.md
  run.sh
```

### Correct

Skill directory with only SKILL.md

```text
my-skill/
  SKILL.md
  run.sh
```

## How To Fix

Remove the README.md file from the skill directory. Migrate any useful content from README.md into SKILL.md.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-referenced-file-not-found`](/rules/skills/skill-referenced-file-not-found)
- [`skill-too-many-files`](/rules/skills/skill-too-many-files)
- [`skill-deep-nesting`](/rules/skills/skill-deep-nesting)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-readme-forbidden.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-readme-forbidden.test.ts)

## Version

Available since: v0.3.0
