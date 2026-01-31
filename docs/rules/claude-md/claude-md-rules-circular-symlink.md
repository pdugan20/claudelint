# Rule: claude-md-rules-circular-symlink

**Severity**: Error
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: Cross-Reference

Circular symlink detected in import path

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

To resolve circular symlink errors:

1. **Identify the symlink chain**:

   ```bash
   ls -la .claude/rules/
   # Shows symlink targets
   ```

2. **Break the circular reference** by removing one of the symlinks:

   ```bash
   rm .claude/rules/circular-link.md
   ```

3. **Replace with a proper link**:

   ```bash
   # Point to the actual file, not another symlink
   ln -s ../../shared/actual-content.md .claude/rules/rules.md
   ```

4. **Or copy the content** instead of using symlinks:

   ```bash
   cp ../shared/content.md .claude/rules/content.md
   ```

5. **Verify no circular symlinks remain**:

   ```bash
   find .claude -type l -exec sh -c 'readlink -f {} || echo "Circular: {}"' \;
   ```

6. **Run validation**:

   ```bash
   claude-code-lint check-claude-md
   ```

Tip: Prefer relative imports over symlinks when possible for clearer file relationships.

## Options

### `maxSymlinkDepth`

Maximum number of symlinks to follow before considering it circular.

- Type: `number`
- Default: `100`

Example configuration:

```json
{
  "rules": {
    "claude-md-rules-circular-symlink": ["error", { "maxSymlinkDepth": 50 }]
  }
}
```

To allow deeper symlink chains:

```json
{
  "rules": {
    "claude-md-rules-circular-symlink": ["error", { "maxSymlinkDepth": 200 }]
  }
}
```

## When Not To Use It

You should not disable this rule. Circular symlinks will always cause problems in file resolution and should be fixed. Consider using relative imports or reorganizing your file structure instead.

## Related Rules

- [import-missing](./claude-md-import-missing.md) - Validates that imported files exist
- [import-circular](./claude-md-import-circular.md) - Detects circular import dependencies

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-rules-circular-symlink.ts)
- [Rule Tests](../../tests/rules/claude-md/claude-md-rules-circular-symlink.test.ts)

## Version

Available since: v1.0.0
