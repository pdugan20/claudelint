# Rule: size-warning

**Severity**: Warning
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: Best Practices

CLAUDE.md file is approaching the size limit (35KB), warning before reaching the 40KB hard limit.

## Rule Details

This rule warns when a CLAUDE.md file reaches 35KB (35,840 bytes). This is a proactive warning before hitting the hard limit of 40KB that would trigger a size-error. Large files cause slower context loading, harder maintenance and navigation, difficulty understanding overall structure, and risk of soon exceeding the 40KB limit.

This warning gives you time to reorganize your content before it becomes an error. Files between 35KB and 40KB will trigger this warning but still validate. Once a file exceeds 40KB, it will fail validation entirely with size-error.

### Incorrect

CLAUDE.md file approaching the limit:

```text
# File size: 37KB (37,888 bytes)
⚠ Warning: File approaching size limit

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

## How To Fix

Act now to avoid hitting the 40KB error limit:

1. **Create rules directory**: `mkdir -p .claude/rules`
2. **Identify sections to extract**: Look for logical groups (git/version control, API/coding guidelines, testing, deployment, style guides)
3. **Create separate files**: `touch .claude/rules/git.md .claude/rules/api.md .claude/rules/testing.md`
4. **Move content**: Cut sections from CLAUDE.md and paste into appropriate rule files
5. **Add imports**: Replace moved content with import directives in CLAUDE.md

**Example:**

```markdown
# CLAUDE.md (now 12KB)

# Project Overview
Quick overview of the project.

# Development Rules
Import: @.claude/rules/git.md
Import: @.claude/rules/api.md
Import: @.claude/rules/testing.md
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
