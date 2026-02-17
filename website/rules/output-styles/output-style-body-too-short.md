---
description: "Output style body content should meet minimum length requirements"
---

# output-style-body-too-short

<RuleHeader description="Output style body content should meet minimum length requirements" severity="warn" :fixable="false" :configurable="true" category="Output Styles" />

## Rule Details

This rule checks the body of output style markdown files (everything after the YAML frontmatter) and warns when the content is shorter than the configured minimum length. Output styles need substantive content including formatting examples, guidelines, and instructions to be effective. Very short body content suggests the style definition is incomplete or lacks enough detail to guide output formatting consistently.

### Incorrect

Output style with minimal body content

```markdown
---
name: concise
description: Concise output style
---

Be concise.
```

### Correct

Output style with substantive body content

```markdown
---
name: concise
description: Concise output style
---

# Concise Style

## Guidelines

- Use short, direct sentences
- Avoid filler words and unnecessary qualifiers
- Lead with the most important information
- Use bullet points for lists of 3+ items

## Examples

Instead of "It might be worth considering..." write "Consider..."
```

## How To Fix

Add more detail to the output style body. Include sections for guidelines, formatting rules, examples of correct and incorrect output, and any special instructions for applying the style.

## Options

Default options:

```json
{
  "minLength": 50
}
```

Require at least 100 characters of body content:

```json
{
  "minLength": 100
}
```

Allow shorter body content for simple styles:

```json
{
  "minLength": 20
}
```

## When Not To Use It

Disable this rule for intentionally minimal output styles that rely on a short description and a few key directives rather than extensive documentation.

## Related Rules

- [`output-style-missing-guidelines`](/rules/output-styles/output-style-missing-guidelines)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/output-styles/output-style-body-too-short.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/output-styles/output-style-body-too-short.test.ts)

## Version

Available since: v0.2.0
