# Rule: claude-md-glob-pattern-backslash

**Severity**: Warning
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: Best Practices

Path pattern uses backslashes instead of forward slashes

## Rule Details

This rule warns when path patterns in the frontmatter `paths` field of `.claude/rules/*.md` files use backslashes (`\`) instead of forward slashes (`/`). Path patterns should always use forward slashes for cross-platform compatibility, even on Windows.

Glob patterns, file paths, and directory separators in configuration files should use forward slashes as the standard. While Windows traditionally uses backslashes for file paths, modern tools and glob libraries expect forward slashes. Using backslashes can cause:

- Path matching failures on Unix-based systems (macOS, Linux)
- Confusion between path separators and escape sequences
- Inconsistent behavior across different operating systems
- Errors in glob pattern matching libraries

This rule only applies to `.claude/rules/*.md` files that contain frontmatter with a `paths` field.

### Incorrect

Using backslashes in path patterns:

```markdown
---
paths:
  - src\**\*.ts
  - tests\unit\**\*.test.ts
  - docs\guides\*.md
---

# Rule Documentation
```

Mixed separators:

```markdown
---
paths:
  - src/components\*.tsx
  - lib\utils/**/*.ts
---
```

Windows-style paths:

```markdown
---
paths:
  - C:\Users\Project\src\**\*.ts
---
```

### Correct

Using forward slashes in all path patterns:

```markdown
---
paths:
  - src/**/*.ts
  - tests/unit/**/*.test.ts
  - docs/guides/*.md
---

# Rule Documentation
```

Consistent forward slashes:

```markdown
---
paths:
  - src/components/*.tsx
  - lib/utils/**/*.ts
  - config/**/*.json
---
```

Relative paths with forward slashes:

```markdown
---
paths:
  - ./**/*.md
  - ./src/**/*.ts
---
```

## How To Fix

To fix backslash usage in path patterns:

1. **Replace all backslashes with forward slashes**:

   ```markdown
   # Wrong
   ---
   paths:
     - src\components\*.tsx
   ---

   # Correct
   ---
   paths:
     - src/components/*.tsx
   ---
   ```

2. **Update Windows-style absolute paths** to use forward slashes:

   ```markdown
   # Wrong
   ---
   paths:
     - C:\Projects\app\src\*.ts
   ---

   # Correct (relative paths preferred)
   ---
   paths:
     - src/*.ts
   ---
   ```

3. **Use find/replace** to update all patterns in the file:
   - Find: `\`
   - Replace: `/`
   - In: frontmatter `paths` field only

4. **Verify pattern matching** after fixing:

   ```bash
   claudelint check-claude-md
   ```

5. **Test the glob patterns** to ensure they still match the intended files:

   ```bash
   # Example: test if pattern matches expected files
   ls -la src/**/*.ts
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Backslashes in path patterns cause cross-platform compatibility issues and pattern matching failures. Always use forward slashes in glob patterns and file paths within configuration files.

The only exception would be if you have literal backslashes in file names (which is extremely rare and not recommended), but even then, glob patterns should use forward slashes for directory separators.

## Related Rules

- [claude-md-glob-pattern-too-broad](./claude-md-glob-pattern-too-broad.md) - Overly broad patterns
- [claude-md-paths](./claude-md-paths.md) - Path format validation

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-glob-pattern-backslash.ts)
- [Rule Tests](../../tests/validators/claude-md.test.ts)

## Version

Available since: v0.2.0
