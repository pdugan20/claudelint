# Rule: output-style-missing-guidelines

**Severity**: Warn
**Fixable**: No
**Validator**: Output Styles
**Recommended**: Yes

Output style should include a "Guidelines" or "Format" section

## Rule Details

This rule checks the body of output style markdown files for a heading that matches "Guidelines", "Rules", or "Format" (case-insensitive, headings level 1-3). Output styles should document their formatting rules and guidelines in a dedicated section so that the instructions are clearly structured and easy to follow. Without such a section, the style definition may be ambiguous or difficult for models to apply consistently.

### Incorrect

Output style without a Guidelines or Format section

```markdown
---
name: technical
description: Technical writing style
---

# Technical Style

Write in a technical manner with precise language.
Use code blocks for examples.
```

### Correct

Output style with a Guidelines section

```markdown
---
name: technical
description: Technical writing style
---

# Technical Style

## Guidelines

- Use precise, unambiguous language
- Include code blocks for all examples
- Define acronyms on first use
```

Output style with a Format section

```markdown
---
name: report
description: Report output format
---

# Report Format

## Format

- Start with a summary paragraph
- Use numbered headings for sections
- End with recommendations
```

## How To Fix

Add a `## Guidelines`, `## Rules`, or `## Format` section to the output style body. Document the formatting rules, conventions, and any special instructions within that section.

## Options

This rule does not have any configuration options.

## Related Rules

- [`output-style-body-too-short`](/rules/output-styles/output-style-body-too-short)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/output-styles/output-style-missing-guidelines.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/output-styles/output-style-missing-guidelines.test.ts)

## Version

Available since: v1.0.0
