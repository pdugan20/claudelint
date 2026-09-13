---
description: "Legacy output style name must match its directory"
---

# output-style-name-directory-mismatch

<RuleHeader description="Legacy output style name must match its directory" severity="error" :fixable="false" :configurable="false" category="Output Styles" />

## Rule Details

Claude Code output styles are flat markdown files. An explicit frontmatter `name` overrides the filename and does not need to match it. This rule skips flat styles. For compatibility, it still checks names in legacy directory-per-style layouts. It is not included in the recommended preset.

### Incorrect

Legacy output style name differs from its directory (file at output-styles/compact/style.md)

```yaml
---
name: verbose
---

Output style content here.
```

### Correct

Flat output styles may override the filename (file at output-styles/compact.md)

```yaml
---
name: Diagrams first
---

Output style content here.
```

## How To Fix

Use a flat file in output-styles/ with any frontmatter name. For a legacy nested layout, align the name with its containing directory or disable this convention rule.

## Options

This rule does not have any configuration options.

## Related Rules

- [`output-style-body-too-short`](/rules/output-styles/output-style-body-too-short)
- [`output-style-missing-guidelines`](/rules/output-styles/output-style-missing-guidelines)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/output-styles/output-style-name-directory-mismatch.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/output-styles/output-style-name-directory-mismatch.test.ts)

## Version

Available since: v0.2.0
