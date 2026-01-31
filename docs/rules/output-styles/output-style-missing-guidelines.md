# Rule: output-style-missing-guidelines

**Severity**: Warning
**Fixable**: No
**Validator**: OutputStyles
**Category**: Cross-Reference

Output style should include a "Guidelines" or "Format" section

## Rule Details

Output styles should document formatting rules and guidelines to ensure consistent application of the style across different contexts. Guidelines help users understand when and how to apply the output style correctly.

This rule checks for the presence of a markdown section with a heading matching "Guidelines", "Guideline", "Rules", "Rule", or "Format" (case-insensitive). The section can use any heading level (H1, H2, or H3).

### Incorrect

Missing guidelines section:

```markdown
---
name: code-style
description: Formats code output
---

# Examples

Here are some examples of code formatting.
```

Only frontmatter, no guidelines:

```markdown
---
name: minimal
description: Minimal output style
---

Brief description without formatting guidelines.
```

### Correct

Guidelines section with H1 heading:

```markdown
---
name: code-style
description: Formats code output with syntax highlighting
---

# Guidelines

- Use syntax highlighting for all code snippets
- Include line numbers for multi-line code
- Add language identifier to code blocks
- Provide context comments when needed

# Examples

Example code with proper formatting.
```

Format section with H2 heading:

```markdown
---
name: verbose-logs
description: Verbose logging format
---

## Format

All log entries should include:
- ISO 8601 timestamp
- Log level (INFO, DEBUG, WARN, ERROR)
- Component name
- Message with context
```

Rules section variation:

```markdown
---
name: minimal
description: Minimal output
---

### Rules

Keep output concise and focused on essential information only.
```

Case-insensitive heading:

```markdown
---
name: structured
description: Structured data output
---

## GUIDELINES

Format all data as JSON with consistent indentation.
```

## How To Fix

To fix this violation, add a Guidelines, Format, or Rules section to your OUTPUT_STYLE.md file:

1. **Add a section heading** using "Guidelines", "Format", or "Rules" as the title
2. **Document formatting rules** that users should follow
3. **Use appropriate heading level** (H1, H2, or H3 all work)
4. **Explain when to use** the output style and how to apply it consistently

Example fix:

```markdown
# Guidelines

Follow these rules when using this output style:

- Guideline 1: [Description]
- Guideline 2: [Description]
- Guideline 3: [Description]
```

Or use Format heading:

```markdown
## Format

Structure your output as follows:

[Format description]
```

## Options

This rule does not have configuration options.

## When Not To Use It

You might disable this rule if your output styles are simple enough that explicit guidelines aren't needed, or if formatting rules are documented elsewhere. However, including guidelines directly in OUTPUT_STYLE.md improves consistency and makes the style easier to use correctly.

## Related Rules

- [output-style-missing-examples](./output-style-missing-examples.md) - Validates presence of Examples section
- [output-style-body-too-short](./output-style-body-too-short.md) - Validates minimum body content length

## Resources

- [Rule Implementation](../../src/rules/output-styles/output-style-missing-guidelines.ts)
- [Rule Tests](../../tests/rules/output-styles/output-style-missing-guidelines.test.ts)
- [Documentation](https://github.com/pdugan20/claudelint/blob/main/docs/rules/output-styles/output-style-missing-guidelines.md)

## Version

Available since: v1.0.0
