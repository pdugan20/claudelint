---
description: "Output style name must be lowercase-with-hyphens, under 64 characters, with no XML tags"
---

# output-style-name

<RuleHeader description="Output style name must be lowercase-with-hyphens, under 64 characters, with no XML tags" severity="error" :fixable="false" :configurable="false" category="Output Styles" />

## Rule Details

This rule validates the `name` field in output style frontmatter. The name must be lowercase with hyphens (e.g., `concise-prose`), under 64 characters, and must not contain XML-style tags. This is enforced via the OutputStyleFrontmatterSchema which applies `lowercaseHyphens()`, `max(64)`, and `noXMLTags()` validators.

### Incorrect

Output style with uppercase name

```markdown
---
name: ConciseProse
description: A concise prose style
---
```

Output style with spaces in name

```markdown
---
name: concise prose
description: A concise prose style
---
```

### Correct

Output style with valid lowercase-hyphen name

```markdown
---
name: concise-prose
description: A concise prose style
---
```

## How To Fix

Rename the output style to use only lowercase letters and hyphens. Keep it under 64 characters and remove any XML tags.

## Options

This rule does not have any configuration options.

## Related Rules

- [`output-style-description`](/rules/output-styles/output-style-description)
- [`output-style-examples`](/rules/output-styles/output-style-examples)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/output-styles/output-style-name.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/output-styles/output-style-name.test.ts)

## Version

Available since: v0.2.0
