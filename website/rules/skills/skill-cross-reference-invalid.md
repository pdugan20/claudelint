# skill-cross-reference-invalid

<RuleHeader description="Cross-reference points to non-existent skill" severity="warn" :fixable="false" category="Skills" />

## Rule Details

Skills can link to other skills using relative markdown links (e.g., `[Other Skill](../other/SKILL.md)`). This rule checks that each cross-reference target actually exists on disk. Broken cross-references mislead users and the AI model, leading to confusion when referenced skills cannot be found. The rule matches markdown link syntax with relative paths ending in `SKILL.md`.

### Incorrect

Link to a skill that does not exist

```markdown
---
name: deploy
description: Deploys the application
---

## See Also

- [Build Skill](../build/SKILL.md)
```

### Correct

Link to a skill that exists on disk

```markdown
---
name: deploy
description: Deploys the application
---

## See Also

- [Test Skill](../test/SKILL.md)
```

## How To Fix

Verify the relative path in the markdown link points to an existing SKILL.md file. Fix any typos in the path or remove the link if the referenced skill was deleted.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-dependencies`](/rules/skills/skill-dependencies)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-cross-reference-invalid.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-cross-reference-invalid.test.ts)

## Version

Available since: v0.3.0
