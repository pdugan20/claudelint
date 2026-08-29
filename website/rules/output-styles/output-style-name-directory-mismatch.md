---
description: "Output style name must match the name its path implies"
---

# output-style-name-directory-mismatch

<RuleHeader description="Output style name must match the name its path implies" severity="error" :fixable="false" :configurable="false" category="Output Styles" />

## Rule Details

Output styles are flat markdown files, and the filename becomes the style name unless the frontmatter sets `name`. This rule checks that an explicit `name` agrees with the filename, so a file cannot appear to define one style while registering another. In a directory-per-style layout the containing directory supplies the name instead, and `name` is compared with that.

### Incorrect

Output style name does not match its filename (file at .claude/output-styles/compact.md)

```yaml
---
name: verbose
---

Output style content here.
```

### Correct

Output style name matches its filename (file at .claude/output-styles/compact.md)

```yaml
---
name: compact
---

Output style content here.
```

## How To Fix

Either rename the file to match the name in frontmatter, or update the name in frontmatter to match the filename. Omitting `name` entirely is also valid — the filename supplies it.

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
