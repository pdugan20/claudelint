# Rule: claude-md-size-warning

**Severity**: Warn
**Fixable**: No
**Validator**: CLAUDE.md
**Recommended**: Yes

CLAUDE.md file is approaching size limit

## Rule Details

This rule issues a warning when a CLAUDE.md file reaches or exceeds the warning threshold (default 35KB), signaling that the file is approaching the hard error limit of 40KB. The early warning gives you time to reorganize content into smaller files under `.claude/rules/` before hitting the error threshold. Proactive splitting avoids context window issues and keeps instructions well-organized.

### Incorrect

A CLAUDE.md file nearing 35KB with everything inlined

```markdown
# CLAUDE.md

<!-- ~35,000 bytes of content -->
## All Standards
...(many sections inlined)...
```

### Correct

A compact CLAUDE.md that delegates detail to imported rule files

```markdown
# CLAUDE.md

High-level project instructions.

@import .claude/rules/standards.md
@import .claude/rules/testing.md
```

## How To Fix

Begin splitting the CLAUDE.md content into smaller files inside `.claude/rules/`. Move the largest or most self-contained sections first, replacing them with `@import` directives. This reduces the file size below the warning threshold.

## Options

Default options:

```json
{
  "maxSize": 35000
}
```

Set a custom warning threshold of 30KB:

```json
{
  "maxSize": 30000
}
```

Use the default 35KB warning threshold:

```json
{
  "maxSize": 35000
}
```

## When Not To Use It

This rule should always be enabled. The early warning helps prevent the hard error triggered by claude-md-size-error.

## Related Rules

- [`claude-md-size-error`](/rules/claude-md/claude-md-size-error)
- [`claude-md-import-missing`](/rules/claude-md/claude-md-import-missing)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-size-warning.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-size-warning.test.ts)

## Version

Available since: v1.0.0
