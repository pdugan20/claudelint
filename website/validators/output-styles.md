# Output Styles Validator

The Output Styles validator checks Claude Code output style definitions for name validation and content requirements.

## What It Checks

- OUTPUT_STYLE.md frontmatter schema
- Name and directory consistency
- Guidelines content requirements

## Rules

| Rule | Severity | Description |
|------|----------|-------------|
| [output-style-name-directory-mismatch](/rules/output-styles/output-style-name-directory-mismatch) | error | Name does not match directory |
| [output-style-missing-guidelines](/rules/output-styles/output-style-missing-guidelines) | warn | Missing guidelines content |
| [output-style-body-too-short](/rules/output-styles/output-style-body-too-short) | warn | Body content too short |

## CLI Usage

```bash
claudelint check-all
claudelint check-all --verbose
```

## See Also

- [Rules Reference](/rules/overview) - All validation rules
- [Configuration](/guide/configuration) - Customize rule severity
