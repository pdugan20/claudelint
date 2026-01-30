# Rule: claude-md-size-warning

**Severity**: Warning
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: File System

CLAUDE.md file is approaching size limit

## Rule Details

This rule warns when a CLAUDE.md file reaches 35KB (35,840 bytes). This is a proactive warning before hitting the hard limit of 40KB that would trigger a size-error. Large files cause slower context loading, harder maintenance and navigation, difficulty understanding overall structure, and risk of soon exceeding the 40KB limit.

This warning gives you time to reorganize your content before it becomes an error. Files between 35KB and 40KB will trigger this warning but still validate. Once a file exceeds 40KB, it will fail validation entirely with size-error.

### Incorrect

CLAUDE.md file approaching the limit:

```text
# File size: 37KB (37,888 bytes)
[WARNING] File approaching size limit

This file is getting large and should be split soon.
You have about 3KB before hitting the error threshold.
```

### Correct

Well-organized CLAUDE.md with imports:

```markdown
# File size: 12KB
✓ No warning

# Project Guidelines

Import: @.claude/rules/coding-standards.md
Import: @.claude/rules/git-workflow.md
Import: @.claude/rules/deployment.md
```

## Options

This rule does not have configuration options. The 35KB threshold is fixed.

## When Not To Use It

Consider disabling if you're actively working on splitting the file and want to suppress warnings temporarily, or your file size is stable just above 35KB and you've decided not to split yet. However, it's recommended to address the warning rather than disable it, as the file will eventually hit the 40KB error limit.

## Related Rules

- [size-error](./size-error.md) - Error when file exceeds 40KB hard limit

## Resources

- [Implementation](../../../src/validators/claude-md.ts)
- [Tests](../../../tests/validators/claude-md.test.ts)

## Version

Available since: v1.0.0
