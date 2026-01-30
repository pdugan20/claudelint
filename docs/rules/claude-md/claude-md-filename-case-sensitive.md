# Rule: claude-md-filename-case-sensitive

**Severity**: Error
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: Best Practices

Filename differs only in case from another file, causing conflicts on case-insensitive filesystems

## Rule Details

This rule triggers when files in your project have names that differ only in capitalization (e.g., "README.md" and "readme.md"). While Linux filesystems are case-sensitive and treat these as different files, macOS and Windows filesystems are case-insensitive and will treat them as the same file, causing conflicts.

The rule warns about these collisions to prevent cross-platform compatibility issues. When developers on different operating systems work on the same project, case-insensitive collisions can lead to file overwrites, git conflicts, and confusing behavior.

### Incorrect

File structure with case-sensitive collisions:

```bash
project/
  rules/
    Security.md    # Capital S
    security.md    # Lowercase s - collision!
```

### Correct

File structure with unique names:

```bash
project/
  rules/
    security-overview.md
    security-guidelines.md
```

## How To Fix

To resolve case-sensitive filename collisions:

1. **Identify the colliding files**:
   ```bash
   find . -iname "security.md"
   # Shows: Security.md and security.md
   ```

2. **Rename one or both files** to have unique names:
   ```bash
   mv Security.md security-overview.md
   # OR
   mv security.md security-implementation.md
   ```

3. **Update all imports** that reference the renamed file:
   ```markdown
   # Before
   Import: @.claude/rules/Security.md

   # After
   Import: @.claude/rules/security-overview.md
   ```

4. **Verify no collisions remain**:
   ```bash
   claudelint check-claude-md
   ```

Tip: Use descriptive names that differentiate the files by content, not just by case.

## Options

This rule does not have any configuration options.

## When Not To Use It

Consider disabling this rule if your project will only ever run on Linux systems with case-sensitive filesystems. However, this is rare - most projects benefit from cross-platform compatibility, and avoiding case-sensitive collisions is a best practice.

## Related Rules

- [import-missing](./import-missing.md) - Validates that imported files exist

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-filename-case-sensitive.ts)
- [Rule Tests](../../tests/validators/claude-md.test.ts)

## Version

Available since: v1.0.0
