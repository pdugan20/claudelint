# Rule: output-style-body-too-short

**Severity**: Warning
**Fixable**: No
**Validator**: Output Styles
**Category**: Best Practices

Output style body content should meet minimum length requirements

## Rule Details

Output styles should include substantive examples and guidelines beyond frontmatter. Very short body content suggests incomplete documentation that may not provide users with enough information to effectively apply the output style.

This rule validates that the body content (excluding frontmatter) meets a minimum character length threshold. By default, the minimum is 50 characters, but this can be configured based on your documentation standards.

### Incorrect

Empty or minimal body content:

```markdown
---
name: code-style
description: Formats code output
---

Short.
```

Very brief documentation:

```markdown
---
name: verbose-logs
description: Verbose logging format
---

Use verbose format.
```

### Correct

Comprehensive documentation with examples:

```markdown
---
name: code-style
description: Formats code output with syntax highlighting
---

# Guidelines

Format all code output with proper syntax highlighting and line numbers.
Use language-specific formatting and include context around code snippets.

# Examples

Here is an example of formatted code output with annotations.
```

Detailed formatting instructions:

```markdown
---
name: verbose-logs
description: Verbose logging format for debugging
---

# Format

Include timestamps, log levels, and context for each entry.
Organize logs by component and include stack traces when applicable.

# Examples

Example verbose log entry with full context and metadata.
```

## How To Fix

To fix this violation, add more substantive content to your output style .md file:

1. **Add a Guidelines or Format section** explaining how to use the style
2. **Include concrete Examples** demonstrating the style in practice
3. **Document formatting rules** that users should follow
4. **Provide context** on when and how to apply the style

The goal is to create documentation that helps users understand and correctly apply your output style.

## Options

This rule has the following configuration options:

### `minLength`

Minimum number of characters required in the body content (excluding frontmatter). Must be a positive integer.

**Type**: `number`
**Default**: `50`

**Schema**:

```json
{
  "minLength": {
    "type": "number",
    "minimum": 1
  }
}
```

**Example configuration**:

```json
{
  "rules": {
    "output-style-body-too-short": ["warn", { "minLength": 100 }]
  }
}
```

**Default options**:

```json
{
  "minLength": 50
}
```

## When Not To Use It

You might disable this rule if you intentionally use very minimal output styles with self-explanatory names and descriptions. However, comprehensive documentation is recommended for better maintainability and user understanding.

## Related Rules

- [output-style-missing-guidelines](./output-style-missing-guidelines.md) - Validates presence of Guidelines/Format section

## Resources

- [Rule Implementation](../../src/rules/output-styles/output-style-body-too-short.ts)
- [Rule Tests](../../tests/rules/output-styles/output-style-body-too-short.test.ts)
- [Documentation](https://github.com/pdugan20/claudelint/blob/main/docs/rules/output-styles/output-style-body-too-short.md)

## Version

Available since: v1.0.0
