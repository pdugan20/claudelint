---
description: Disable claudelint rules for specific lines, blocks, or entire files using inline HTML comment syntax without changing your global configuration.
---

# Inline Disable Directives

claudelint supports inline comments to disable specific validation rules for parts of your files. Valid rule IDs can be found in the [Rules Reference](/rules/overview) or by running `claudelint list-rules`.

## Syntax

### Disable Entire File

Disable a specific rule for the entire file:

```markdown
<!-- claudelint-disable-file import-missing -->

@import non-existent-file.md
@import another-missing-file.md
```

Disable all rules for the entire file:

```markdown
<!-- claudelint-disable-file -->

This file won't be validated at all.
```

### Disable Next Line

Disable a specific rule for the next line only:

```markdown
<!-- claudelint-disable-next-line import-missing -->
@import non-existent-file.md

This line will still be validated.
```

Disable all rules for the next line:

```markdown
<!-- claudelint-disable-next-line -->
@import non-existent-file.md
```

### Disable Current Line

Disable a specific rule on the same line as the comment:

```markdown
<!-- claudelint-disable-line size-warning --> This is a very long line...
```

Disable all rules on the current line:

```markdown
<!-- claudelint-disable-line --> Any violation on this line is ignored
```

### Disable Range

Disable a specific rule for a block of lines:

```markdown
<!-- claudelint-disable import-missing -->
@import file1.md
@import file2.md
@import file3.md
<!-- claudelint-enable import-missing -->

Validation resumes here.
```

Disable all rules for a block:

```markdown
<!-- claudelint-disable -->
Content in this block won't be validated.
<!-- claudelint-enable -->
```

**Note:** Unclosed disable blocks extend to the end of the file.

## Unused Disable Detection

claudelint can warn about disable directives that don't suppress any violations:

```json
{
  "reportUnusedDisableDirectives": true
}
```

When enabled, unnecessary disables produce a warning:

```text
! Warning: Unused disable directive for 'size-error' [unused-disable]
  at: CLAUDE.md:3
  Fix: Remove the unused disable comment
```

This helps keep disable comments clean by catching stale directives left over after violations are fixed.

## Best Practices

- **Use sparingly** — if you're disabling rules frequently, consider adjusting your config in `.claudelintrc.json` instead
- **Be specific** — prefer `<!-- claudelint-disable-next-line import-missing -->` over `<!-- claudelint-disable-next-line -->` so only the necessary rule is suppressed
- **Document why** — add a comment above the disable explaining the reason:

  ```markdown
  <!-- Imported file will be created by build script -->
  <!-- claudelint-disable-next-line import-missing -->
  @import generated-content.md
  ```

- **Place close to the violation** — use `disable-next-line` rather than broad range disables
- **Enable `reportUnusedDisableDirectives`** to catch stale disables, especially in CI

## Advanced Examples

### Multiple Rules

Each rule needs its own disable comment:

```markdown
<!-- claudelint-disable-next-line import-missing -->
<!-- claudelint-disable-next-line size-warning -->
@import very-large-non-existent-file.md
```

### Nested Ranges

Range disables can overlap:

```markdown
<!-- claudelint-disable import-missing -->
@import file1.md

<!-- claudelint-disable size-warning -->
@import file2.md
<!-- claudelint-enable size-warning -->

@import file3.md
<!-- claudelint-enable import-missing -->
```

For troubleshooting inline disables (wrong line numbers, disables not working), see [Troubleshooting](./troubleshooting.md).

## See Also

- [Configuration Guide](/guide/configuration) - Complete configuration reference
- [Rules Reference](/rules/overview) - Available validation rules and their IDs
