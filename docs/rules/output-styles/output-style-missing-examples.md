# Rule: output-style-missing-examples

**Severity**: Warning
**Fixable**: No
**Validator**: OutputStyles
**Category**: Cross-Reference

Output style should include an "Examples" section

## Rule Details

Output styles should include concrete examples demonstrating the desired formatting and structure. Examples help users understand how to apply the output style in practice and provide clear guidance on the expected format.

This rule checks for the presence of a markdown section with a heading matching "Example" or "Examples" (case-insensitive). The section can use any heading level (H1, H2, or H3).

### Incorrect

Missing Examples section:

```markdown
---
name: code-style
description: Formats code output
---

# Guidelines

Follow these formatting guidelines for code output.
```

Only frontmatter, no Examples:

```markdown
---
name: minimal
description: Minimal output style
---

Brief description without examples.
```

### Correct

Examples section with H1 heading:

```markdown
---
name: code-style
description: Formats code output with syntax highlighting
---

# Examples

Here are some examples of the code style:

```

function hello() {
  console.log("Hello, world!");
}

```
```

Examples section with H2 heading:

```markdown
---
name: verbose-logs
description: Verbose logging format
---

## Format

Include timestamps and context.

## Examples

[2024-01-30 10:30:45] INFO: Application started
[2024-01-30 10:30:46] DEBUG: Loading configuration
```

Case-insensitive variations:

```markdown
---
name: minimal
description: Minimal output
---

### EXAMPLE

This is an example of the minimal style.
```

## How To Fix

To fix this violation, add an Examples section to your OUTPUT_STYLE.md file:

1. **Add a section heading** with "Examples" or "Example" as the title
2. **Include concrete examples** showing the output style in practice
3. **Use appropriate heading level** (H1, H2, or H3 all work)
4. **Demonstrate key features** of the style with real examples

Example fix:

```markdown
# Examples

Here is an example showing how to use this output style:

[Your example content here]
```

## Options

This rule does not have configuration options.

## When Not To Use It

You might disable this rule if your output styles are self-explanatory from their descriptions, or if you document examples in separate external files. However, including examples directly in OUTPUT_STYLE.md provides better user experience and discoverability.

## Related Rules

- [output-style-missing-guidelines](./output-style-missing-guidelines.md) - Validates presence of Guidelines/Format section
- [output-style-body-too-short](./output-style-body-too-short.md) - Validates minimum body content length
- [output-style-examples](./output-style-examples.md) - Validates Examples frontmatter field

## Resources

- [Rule Implementation](../../src/rules/output-styles/output-style-missing-examples.ts)
- [Rule Tests](../../tests/rules/output-styles/output-style-missing-examples.test.ts)
- [Documentation](https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/output-styles/output-style-missing-examples.md)

## Version

Available since: v1.0.0
