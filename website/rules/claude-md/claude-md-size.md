---
description: "CLAUDE.md exceeds maximum file size limit"
---

# claude-md-size

<RuleHeader description="CLAUDE.md exceeds maximum file size limit" severity="warn" :fixable="false" :configurable="true" category="CLAUDE.md" />

## Rule Details

Claude Code warns when a CLAUDE.md file reaches 40KB, signaling that performance will degrade. This rule catches files at or above that threshold (configurable via `maxSize`). To fix, split content into smaller files under `.claude/rules/` and reference them via `@import` directives. You can also set a lower threshold to get warned earlier, before reaching the 40KB limit.

### Incorrect

A CLAUDE.md file that exceeds 40KB with all instructions inlined

```markdown
# CLAUDE.md

<!-- 40,000+ bytes of inlined instructions -->
## Coding Standards
...(thousands of lines)...
## Testing Guidelines
...(thousands of lines)...
## Deployment Procedures
...(thousands of lines)...
```

### Correct

A well-organized CLAUDE.md that imports separate rule files to stay under the limit

```markdown
# CLAUDE.md

Core project instructions go here.

@import .claude/rules/coding-standards.md
@import .claude/rules/testing-guidelines.md
@import .claude/rules/deployment-procedures.md
```

## How To Fix

Split the CLAUDE.md content into smaller, focused files inside the `.claude/rules/` directory. Then replace the inlined content with `@import` directives pointing to each extracted file. Each rule file should cover a single concern. Or use the `/optimize-cc-md` plugin skill for guided, interactive optimization.

## Options

Default options:

```json
{
  "maxSize": 40000
}
```

Catch size issues early — warn at 30KB before hitting the 40KB limit:

```json
{
  "maxSize": 30000
}
```

Allow larger files up to 50KB:

```json
{
  "maxSize": 50000
}
```

## When Not To Use It

This rule should always be enabled. Files exceeding the size limit cause Claude Code to warn about degraded performance and may truncate instructions.

## Related Rules

- [`claude-md-import-missing`](/rules/claude-md/claude-md-import-missing)
- [`claude-md-content-too-many-sections`](/rules/claude-md/claude-md-content-too-many-sections)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-size.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-size.test.ts)

## Version

Available since: v0.2.0
