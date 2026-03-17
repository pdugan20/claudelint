---
description: Validate Claude Code output style definitions for name consistency, directory matching, and required guidelines content using claudelint's Output Styles validator.
---

# Output Styles Validator

The Output Styles validator checks Claude Code output style definitions for name validation and content requirements.

## What It Checks

- OUTPUT_STYLE.md frontmatter schema
- Name and directory consistency
- Guidelines content requirements

## Rules

This validator includes <RuleCount category="output-styles" /> rules. See the [Output Styles rules category](/rules/output-styles/output-style-body-too-short) for the complete list.

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin: 16px 0;">

<RuleCard
  rule-id="output-style-name-directory-mismatch"
  description="Output style name does not match its directory"
  severity="error"
  category="Output Styles"
  link="/rules/output-styles/output-style-name-directory-mismatch"
/>

<RuleCard
  rule-id="output-style-missing-guidelines"
  description="Output style is missing guidelines content"
  severity="warning"
  category="Output Styles"
  link="/rules/output-styles/output-style-missing-guidelines"
/>

<RuleCard
  rule-id="output-style-body-too-short"
  description="Output style body content is too short"
  severity="warning"
  category="Output Styles"
  link="/rules/output-styles/output-style-body-too-short"
/>

</div>

## CLI Usage

```bash
# Validate all output styles
claudelint validate-output-styles

# Verbose output
claudelint validate-output-styles --verbose
```

## See Also

- [Claude Code Output Styles](https://code.claude.com/docs/en/output-styles) - Official output styles documentation
- [Configuration](/guide/configuration) - Customize rule severity
