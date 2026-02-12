# Inline Disable Directives

claudelint supports inline comments to disable specific validation rules for parts of your files.

## Overview

Use HTML comment syntax to disable rules:

- **File-level**: Disable rules for entire file
- **Next line**: Disable rules for the line immediately following the comment
- **Current line**: Disable rules for the line containing the comment
- **Range**: Disable rules for a block of lines

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

**Note:** Unclosed disable blocks extend to the end of the file:

```markdown
<!-- claudelint-disable size-warning -->
Rest of file won't check for size warnings.
```

## Rule IDs

Valid rule IDs depend on the validator. See [Rules Reference](/rules/overview) for the complete rule list or run `claudelint list-rules`.

## Unused Disable Detection

claudelint can warn about unnecessary disable directives that don't suppress any violations.

### Enabling Detection

Add to `.claudelintrc.json`:

```json
{
  "reportUnusedDisableDirectives": true
}
```

### Example

**File:**

```markdown
# My Project

<!-- claudelint-disable-next-line size-error -->
This line has no violations, so the disable is unnecessary.
```

**Output:**

```text
! Warning: Unused disable directive for 'size-error' [unused-disable]
  at: CLAUDE.md:3
  Fix: Remove the unused disable comment
```

### Why This Matters

Unused disable directives:

- Create confusion about which rules are actually active
- May hide that a violation was already fixed
- Make the codebase harder to maintain

Remove unused directives to keep your configuration clean.

## Best Practices

### Use Sparingly

Disable directives should be the exception, not the rule. If you're frequently disabling rules:

- Consider adjusting rule configuration in `.claudelintrc.json`
- Question whether the rule is appropriate for your project
- Look for patterns that could be fixed differently

### Be Specific

Prefer specific rule IDs over disabling all rules:

**Good:**

```markdown
<!-- claudelint-disable-next-line import-missing -->
@import future-file.md
```

**Bad:**

```markdown
<!-- claudelint-disable-next-line -->
@import future-file.md
```

Specific disables:

- Make intent clear
- Only suppress necessary violations
- Make code easier to review

### Document Why

Add a comment explaining why the disable is necessary:

```markdown
<!-- Imported file will be created by build script -->
<!-- claudelint-disable-next-line import-missing -->
@import generated-content.md
```

### Place Carefully

Put disable comments as close as possible to the violation:

**Good:**

```markdown
Normal content here.

<!-- claudelint-disable-next-line import-missing -->
@import missing-file.md

More content here.
```

**Bad:**

```markdown
<!-- claudelint-disable import-missing -->
Normal content here.

@import missing-file.md

More content here.
<!-- claudelint-enable import-missing -->
```

### Review Regularly

Disable directives can become outdated:

- Enable `reportUnusedDisableDirectives` to catch unused ones
- Review disables during code review
- Remove when violations are fixed

## Common Use Cases

### Temporary Files

For files that will be created later:

```markdown
<!-- File will be added in next PR -->
<!-- claudelint-disable-next-line import-missing -->
@import upcoming-feature.md
```

### Generated Content

For imports of generated files:

```markdown
<!-- Auto-generated during build -->
<!-- claudelint-disable-file import-missing -->

@import api-docs/generated.md
@import api-docs/models.md
```

### Legacy Code

For files being gradually fixed:

```markdown
<!-- TODO: Fix skills organization - tracked in #123 -->
<!-- claudelint-disable skill-too-many-files -->
```

### False Positives

When a rule incorrectly flags valid code:

```markdown
<!-- This import uses environment-specific path resolution -->
<!-- claudelint-disable-next-line import-missing -->
@import $PLATFORM/config.md
```

## Troubleshooting

### Disable Not Working

**Problem:** Rule still reports violations despite disable comment

**Checklist:**

1. Verify syntax: `<!-- claudelint-disable-next-line rule-id -->`
2. Check rule ID spelling: run `claudelint list-rules`
3. Confirm line placement: disable-next-line must be immediately before violation
4. Check whitespace: no extra lines between comment and violation

**Example:**

```markdown
<!-- Wrong: extra blank line -->
<!-- claudelint-disable-next-line import-missing -->

@import file.md


<!-- Correct: no blank lines -->
<!-- claudelint-disable-next-line import-missing -->
@import file.md
```

### Unused Disable Warnings

**Problem:** Getting warnings about unused disables

**Solutions:**

1. **Fix the underlying issue** instead of disabling
2. **Remove the disable** if it's no longer needed
3. **Disable unused detection** in config:

   ```json
   {
     "reportUnusedDisableDirectives": false
   }
   ```

### Wrong Line Numbers

**Problem:** Disable comment affects wrong lines

**Cause:** Line counting includes the disable comment itself

**Solution:**

```text
Line 1: This is the comment line
Line 2: claudelint-disable-next-line affects line 3
Line 3: This line is disabled
Line 4: This line is NOT disabled
```

Use `claudelint-disable-line` to disable the current line.

## Advanced Examples

### Multiple Rules

Disable multiple rules by using multiple disable comments:

```markdown
<!-- claudelint-disable-next-line import-missing -->
<!-- claudelint-disable-next-line size-warning -->
@import very-large-non-existent-file.md
```

**Note:** Cannot specify multiple rules in a single comment. Each rule needs its own comment.

### Nested Disables

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

### Skill Files

Disable directives work in `SKILL.md` files:

````markdown
---
name: my-skill
description: Test skill
---

<!-- claudelint-disable-next-line skill-missing-shebang -->
```bash
# This script intentionally has no shebang
echo "test"
```
````

## Configuration Reference

### reportUnusedDisableDirectives

**Type:** `boolean`

**Default:** `false`

When `true`, claudelint warns about disable directives that don't suppress any violations.

```json
{
  "reportUnusedDisableDirectives": true
}
```

**Recommendation:** Enable this in CI/CD to keep disable directives clean.

## See Also

- [Configuration Guide](/guide/configuration) - Complete configuration reference
- [Rules Reference](/rules/overview) - Available validation rules and their IDs
- [Getting Started](/guide/getting-started) - Setting up claudelint
