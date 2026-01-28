# Rule: rules-circular-symlink

**Severity**: Error
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: File System

Prevents circular symlink chains in imported files that would cause infinite loops.

## Rule Details

This rule triggers when Claude Code detects a circular symlink chain in imported files. A circular symlink occurs when a symlink points to itself (directly or indirectly), creating an infinite loop that would cause the import resolution to hang or crash.

The rule checks the entire symlink chain when resolving imports to ensure no file points back to itself. This protects Claude Code from infinite loops and makes file structure issues explicit.

### Incorrect

File structure with circular symlink:

```bash
# rules.md is a symlink pointing to docs.md
# docs.md is a symlink pointing back to rules.md
ln -s docs.md rules.md
ln -s rules.md docs.md
```

CLAUDE.md attempting to import:

```markdown
import rules.md
```

### Correct

File structure with proper symlinks:

```bash
# rules.md is a symlink pointing to actual content
ln -s ../shared/coding-standards.md rules.md
```

CLAUDE.md importing the symlink:

```markdown
import rules.md
```

## How To Fix

1. Identify which symlinks are involved in the circular chain
2. Break the cycle by removing one of the symlinks
3. Create proper symlink targets that point to actual files
4. Verify with `ls -l` that symlinks resolve correctly

## Options

This rule does not have any configuration options.

## When Not To Use It

You should not disable this rule. Circular symlinks will always cause problems in file resolution and should be fixed. Consider using relative imports or reorganizing your file structure instead.

## Related Rules

- [import-missing](./import-missing.md) - Validates that imported files exist
- [import-circular](./import-circular.md) - Detects circular import dependencies

## Resources

- [Rule Implementation](../../src/validators/claude-md.ts#L336)
- [Rule Tests](../../tests/validators/claude-md.test.ts)

## Version

Available since: v1.0.0
