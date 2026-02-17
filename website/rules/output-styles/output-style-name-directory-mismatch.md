---
description: "Output style name must match parent directory name"
---

# output-style-name-directory-mismatch

<RuleHeader description="Output style name must match parent directory name" severity="error" :fixable="false" :configurable="false" category="Output Styles" />

## Rule Details

This rule checks that the name field in the frontmatter of output style markdown files matches the name of the parent directory. This naming convention is required for proper organization and discovery of output styles. A mismatch means the output style may not be found when referenced by directory name, causing unexpected fallback behavior.

### Incorrect

Output style name does not match directory (file at styles/compact/README.md)

```yaml
---
name: verbose
---

Output style content here.
```

### Correct

Output style name matches directory (file at styles/compact/README.md)

```yaml
---
name: compact
---

Output style content here.
```

## How To Fix

Either rename the parent directory to match the name in frontmatter, or update the name in frontmatter to match the directory name.

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
