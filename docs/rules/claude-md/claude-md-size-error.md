# Rule: claude-md-size-error

**Severity**: Error
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: File System

CLAUDE.md exceeds maximum file size limit

## Rule Details

This rule triggers an error when a CLAUDE.md file exceeds 40KB (40,960 bytes). This is a hard limit enforced by Claude Code to ensure optimal context loading. Large files cause slow context loading times, difficult maintenance and navigation, poor developer experience, risk of context truncation, and performance degradation.

When your file exceeds 40KB, you must reorganize it before Claude Code will validate successfully. Disabling the rule will not allow larger files to work - it will only hide the error while the file continues to fail at runtime. The 40KB limit is a technical constraint that cannot be changed.

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

## Options

This rule does not have configuration options. The 40KB limit is a hard constraint and cannot be changed.

## When Not To Use It

Never disable this rule. The 40KB limit is a technical constraint of Claude Code. Disabling the rule will not allow larger files to work - it will only hide the error while the file continues to fail at runtime. Always fix the issue by reorganizing your content rather than disabling the rule.

## Related Rules

- [size-warning](./size-warning.md) - Warning when file approaches 35KB
- [import-missing](./import-missing.md) - Imported files must exist
- [import-circular](./import-circular.md) - Prevent circular import dependencies

## Resources

- [Implementation](../../../src/validators/claude-md.ts)
- [Tests](../../../tests/validators/claude-md.test.ts)

## Version

Available since: v1.0.0
