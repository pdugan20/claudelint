---
description: "Output style examples must be an array of strings"
---

# output-style-examples

<RuleHeader description="Output style examples must be an array of strings" severity="error" :fixable="false" :configurable="false" category="Output Styles" />

## Rule Details

This rule validates the `examples` field in output style frontmatter. The field must be an array of strings, where each string demonstrates the style in action. This is enforced via the OutputStyleFrontmatterSchema which validates the field as an array of strings.

### Incorrect

Examples as a single string instead of array

```markdown
---
name: concise-prose
description: A concise prose style
examples: "Be brief."
---
```

### Correct

Examples as an array of strings

```markdown
---
name: concise-prose
description: A concise prose style
examples:
  - "Use short sentences."
  - "Lead with the key point."
---
```

## How To Fix

Change the `examples` field to a YAML array of strings. Each entry should be a short demonstration of the output style.

## Options

This rule does not have any configuration options.

## Related Rules

- [`output-style-name`](/rules/output-styles/output-style-name)
- [`output-style-description`](/rules/output-styles/output-style-description)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/output-styles/output-style-examples.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/output-styles/output-style-examples.test.ts)

## Version

Available since: v0.2.0
