# Rule: claude-md-size-warning

**Severity**: Warning
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: File System

CLAUDE.md file is approaching size limit

## Rule Details

This rule warns when a CLAUDE.md file reaches the warning threshold (default: 35KB). This is a proactive warning before hitting the error limit (default: 40KB). Large files cause slower context loading, harder maintenance and navigation, difficulty understanding overall structure, and risk of soon exceeding the error limit.

This warning gives you time to reorganize your content before it becomes an error. Files between the warning and error thresholds will trigger this warning but still validate. Once a file exceeds the error limit, it will fail validation entirely with claude-md-size-error.

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

## How To Fix

To address files approaching the 35KB warning threshold:

1. **Evaluate current size**:

   ```bash
   ls -lh .claude/CLAUDE.md
   # Shows current size
   ```

2. **Identify large sections** to extract:
   - Long lists of guidelines
   - Detailed code examples
   - Reference documentation
   - Technology-specific instructions

3. **Create separate rule files**:

   ```bash
   mkdir -p .claude/rules
   # Extract sections to separate files
   ```

4. **Import the extracted files**:

   ```markdown
   # CLAUDE.md

   Import: @.claude/rules/extracted-section.md
   ```

5. **Verify the new size** is comfortably under 35KB

Proactively splitting your file before hitting 40KB is much easier than doing it under pressure when validation fails.

## Options

This rule has the following configuration options:

### `maxSize`

Maximum file size in bytes before triggering a warning. Must be a positive integer.

**Type**: `number`
**Default**: `35000` (35KB)

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
    "claude-md-size-warning": ["warn", { "maxSize": 30000 }]
  }
}
```

**Note**: The default 35KB threshold is set to warn 5KB before the error limit (40KB), giving you time to reorganize before validation fails.

## When Not To Use It

Consider disabling if you're actively working on splitting the file and want to suppress warnings temporarily, or your file size is stable just above 35KB and you've decided not to split yet. However, it's recommended to address the warning rather than disable it, as the file will eventually hit the 40KB error limit.

## Related Rules

- [size-error](./claude-md-size-error.md) - Error when file exceeds 40KB hard limit

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-size-warning.ts)
- [Rule Tests](../../tests/validators/claude-md.test.ts)

## Version

Available since: v1.0.0
