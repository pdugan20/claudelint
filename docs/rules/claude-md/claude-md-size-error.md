# Rule: claude-md-size-error

**Severity**: Error
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: File System

CLAUDE.md exceeds maximum file size limit

## Rule Details

This rule triggers an error when a CLAUDE.md file exceeds the maximum size limit (default: 40KB). Large files cause slow context loading times, difficult maintenance and navigation, poor developer experience, risk of context truncation, and performance degradation.

When your file exceeds the size limit, you should reorganize it for optimal performance. The default 40KB limit is based on Claude Code's performance characteristics and ensures fast context loading.

### Incorrect

CLAUDE.md file exceeding the limit:

```text
# File size: 42KB (43,008 bytes)
[ERROR] File exceeds size limit

This file is too large and must be split immediately.
Claude Code cannot process files over 40KB.
```

### Correct

Well-organized CLAUDE.md with imports:

```markdown
# File size: 8KB
✓ Within size limit

# Project Guidelines

Import: @.claude/rules/coding-standards.md
Import: @.claude/rules/git-workflow.md
Import: @.claude/rules/deployment.md
Import: @.claude/rules/testing.md
```

## How To Fix

To resolve files exceeding the 40KB limit:

1. **Split into multiple files** using imports:

   ```bash
   mkdir -p .claude/rules
   # Move sections to separate files
   mv large-section-1.txt .claude/rules/section-1.md
   mv large-section-2.txt .claude/rules/section-2.md
   ```

2. **Update CLAUDE.md** to import the files:

   ```markdown
   # Main Guidelines

   Import: @.claude/rules/section-1.md
   Import: @.claude/rules/section-2.md
   ```

3. **Verify the size**:

   ```bash
   ls -lh .claude/CLAUDE.md
   # Should show < 40KB
   ```

4. **Common splitting strategies**:
   - Split by topic (coding standards, git workflow, deployment)
   - Split by technology (frontend, backend, database)
   - Move reference material to separate files
   - Extract large code examples to dedicated files

## Options

This rule has the following configuration options:

### `maxSize`

Maximum file size in bytes before triggering an error. Must be a positive integer.

**Type**: `number`
**Default**: `40000` (40KB)

**Schema**:

```typescript
{
  maxSize: number // positive integer, bytes
}
```

**Example configuration**:

```json
{
  "rules": {
    "claude-md-size-error": ["error", { "maxSize": 50000 }]
  }
}
```

**Note**: While this option is configurable, the default 40KB limit is based on Claude Code's performance characteristics. Increasing it may cause slow context loading and poor performance.

## When Not To Use It

Never disable this rule. The 40KB limit is a technical constraint of Claude Code. Disabling the rule will not allow larger files to work - it will only hide the error while the file continues to fail at runtime. Always fix the issue by reorganizing your content rather than disabling the rule.

## Related Rules

- [size-warning](./claude-md-size-warning.md) - Warning when file approaches 35KB
- [import-missing](./claude-md-import-missing.md) - Imported files must exist
- [import-circular](./claude-md-import-circular.md) - Prevent circular import dependencies

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-size-error.ts)
- [Rule Tests](../../tests/validators/claude-md.test.ts)

## Version

Available since: v1.0.0
