# skill-reference-not-linked

<RuleHeader description="File reference in backticks should be a markdown link" severity="warn" :fixable="true" :configurable="false" category="Skills" />

## Rule Details

SKILL.md files often reference supporting files in directories like `references/`, `examples/`, `scripts/`, and `templates/`. When these paths appear in backticks (e.g., `references/guide.md`) but are not proper markdown links, the `skill-referenced-file-not-found` rule cannot validate that the files exist. This rule detects backtick-enclosed file paths targeting those directories and suggests converting them to markdown links. It provides an auto-fix that converts the backtick reference to `[path](./path)` format.

### Incorrect

File reference in backticks without a markdown link

```markdown
---
name: deploy-app
description: Deploys the application
---

See `references/deploy-guide.md` for details.
```

### Correct

File reference as a proper markdown link

```markdown
---
name: deploy-app
description: Deploys the application
---

See [references/deploy-guide.md](./references/deploy-guide.md) for details.
```

## How To Fix

Convert backtick-enclosed file paths to markdown links. For example, change `references/guide.md` to `[references/guide.md](./references/guide.md)`. The auto-fixer will perform this conversion automatically.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-referenced-file-not-found`](/rules/skills/skill-referenced-file-not-found)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-reference-not-linked.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-reference-not-linked.test.ts)

## Version

Available since: v0.2.0
