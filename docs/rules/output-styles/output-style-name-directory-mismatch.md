# Rule: output-style-name-directory-mismatch

**Severity**: Error
**Fixable**: No
**Validator**: Output Styles
**Category**: Best Practices

Output style name must match parent directory name

## Rule Details

The output style name defined in the frontmatter must exactly match the parent directory name. This ensures consistency between file structure and output style configuration, making output styles easier to discover and reference.

When OUTPUT_STYLE.md files are organized in directories, the directory name serves as the canonical identifier for the output style. The frontmatter name must match this identifier for proper organization and tooling support.

### Incorrect

Mismatched name and directory:

```json
{
  "filePath": ".claude/output_styles/code-style/OUTPUT_STYLE.md",
  "content": "---\nname: wrong-name\ndescription: Formats code output\n---\n# Style"
}
```

Case mismatch:

```json
{
  "filePath": ".claude/output_styles/minimal/OUTPUT_STYLE.md",
  "content": "---\nname: Minimal\ndescription: Minimal output\n---\n# Style"
}
```

### Correct

Name matches directory exactly:

```json
{
  "filePath": ".claude/output_styles/code-style/OUTPUT_STYLE.md",
  "content": "---\nname: code-style\ndescription: Formats code output\n---\n# Style"
}
```

Consistent naming with kebab-case:

```json
{
  "filePath": ".claude/output_styles/verbose-logs/OUTPUT_STYLE.md",
  "content": "---\nname: verbose-logs\ndescription: Verbose logging format\n---\n# Guidelines"
}
```

## How To Fix

To fix a name/directory mismatch, you have two options:

1. **Update the frontmatter name** to match the directory:
   - If directory is `code-style`, set `name: code-style`
   - Ensure exact match including case and hyphens

2. **Rename the directory** to match the frontmatter name:
   - Move OUTPUT_STYLE.md to a directory matching the name
   - Update any references to the old directory name

The name and directory must match exactly, including case sensitivity.

## Options

This rule does not have configuration options.

## When Not To Use It

This rule enforces a critical organizational requirement for output styles. Disabling it may cause output styles to be incorrectly referenced or fail to load. Only disable if you have a custom output style loading mechanism that doesn't rely on directory names.

## Related Rules

- [output-style-missing-guidelines](./output-style-missing-guidelines.md) - Validates presence of Guidelines section

## Resources

- [Rule Implementation](../../src/rules/output-styles/output-style-name-directory-mismatch.ts)
- [Rule Tests](../../tests/rules/output-styles/output-style-name-directory-mismatch.test.ts)
- [Documentation](https://github.com/pdugan20/claudelint/blob/main/docs/rules/output-styles/output-style-name-directory-mismatch.md)

## Version

Available since: v1.0.0
