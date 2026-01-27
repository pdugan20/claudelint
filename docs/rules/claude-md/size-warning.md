# File Size Warning

CLAUDE.md file is approaching the file size limit (35KB).

## Rule Details

This rule warns when a CLAUDE.md file reaches 35KB (35,840 bytes). This is a proactive warning before the file reaches the hard limit of 40KB.

Large CLAUDE.md files can cause:

- Slower context loading times
- Harder maintenance and navigation
- Difficulty understanding the overall structure
- Risk of soon exceeding the 40KB hard limit

This warning gives you time to reorganize your content before it becomes an error.

**Category**: CLAUDE.md
**Severity**: warning
**Fixable**: No
**Since**: v1.0.0

### Violation Example

A CLAUDE.md file approaching the limit:

```text
# File size: 37KB (37,888 bytes)
 Warning: File approaching size limit

This file is getting large and should be split soon.
You have about 3KB before hitting the error threshold.
```

### Correct Example

A well-organized CLAUDE.md file with imports:

```markdown
# File size: 12KB
 No warning

# Project Guidelines

Import: @.claude/rules/coding-standards.md
Import: @.claude/rules/git-workflow.md
Import: @.claude/rules/deployment.md
```

## How To Fix

Act now to avoid hitting the 40KB error limit:

1. **Create a rules directory:**

   ```bash
   mkdir -p .claude/rules
   ```

2. **Identify sections to extract:**

   Look for logical groups of related rules:
   - Git and version control rules
   - API and coding guidelines
   - Testing practices
   - Deployment procedures
   - Style guides

3. **Move sections to separate files:**

   ```bash
   # Create separate rule files
   touch .claude/rules/git.md
   touch .claude/rules/api.md
   touch .claude/rules/testing.md
   ```

4. **Update CLAUDE.md with imports:**

   ```markdown
   # CLAUDE.md

   # Project Overview

   Quick overview of the project.

   # Development Rules

   Import: @.claude/rules/git.md
   Import: @.claude/rules/api.md
   Import: @.claude/rules/testing.md
   ```

## Options

This rule does not have any configuration options. The 35KB threshold is fixed.

## When Not To Use It

You might disable this warning if:

- You're actively working on splitting the file and want to suppress warnings temporarily
- Your file size is stable just above 35KB and you've decided not to split it yet

However, it's recommended to address the warning rather than disable it, as the file will eventually hit the 40KB error limit.

## Configuration

To disable this warning:

```json
{
  "rules": {
    "size-warning": "off"
  }
}
```

To escalate to an error:

```json
{
  "rules": {
    "size-warning": "error"
  }
}
```

## Related Rules

- [size-error](./size-error.md) - Error when file exceeds 40KB hard limit

## Resources

- [Claude Code Documentation: CLAUDE.md Organization](https://github.com/anthropics/claude-code)
- [Best Practices for Large Context Files](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
