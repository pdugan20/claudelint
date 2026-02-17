---
description: "Import depth exceeds maximum, possible circular import"
---

# claude-md-import-depth-exceeded

<RuleHeader description="Import depth exceeds maximum, possible circular import" severity="error" :fixable="false" :configurable="true" category="CLAUDE.md" />

## Rule Details

Deeply nested import chains make CLAUDE.md configurations difficult to understand and may indicate accidental circular dependencies that the circular-import rule has not yet caught. This rule tracks the depth of the import tree as it recursively resolves `@import` directives. When the depth exceeds the configured maximum (default: 5), an error is reported. A depth of 5 means file A imports B, which imports C, which imports D, which imports E, which imports F -- at that point the nesting is flagged.

### Incorrect

An import chain that is too deep (depth > 5)

```markdown
# CLAUDE.md
@import .claude/rules/a.md

# a.md imports b.md, b.md imports c.md,
# c.md imports d.md, d.md imports e.md,
# e.md imports f.md -- depth 6 exceeds the limit
```

### Correct

A flat import structure with minimal nesting

```markdown
# CLAUDE.md

@import .claude/rules/git.md
@import .claude/rules/testing.md
@import .claude/rules/api.md
```

## How To Fix

Flatten the import hierarchy by importing files directly from the main CLAUDE.md instead of chaining imports through intermediate files. If files genuinely need to share content, extract the shared content into a common file imported by both.

## Options

Default options:

```json
{
  "maxDepth": 5
}
```

Allow deeper nesting up to 10 levels:

```json
{
  "maxDepth": 10
}
```

Strict mode: limit to 3 levels of nesting:

```json
{
  "maxDepth": 3
}
```

## When Not To Use It

Disable this rule only if your project has a legitimate reason for deeply nested imports, such as a multi-team monorepo with layered configuration.

## Related Rules

- [`claude-md-import-circular`](/rules/claude-md/claude-md-import-circular)
- [`claude-md-import-missing`](/rules/claude-md/claude-md-import-missing)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-import-depth-exceeded.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-import-depth-exceeded.test.ts)

## Version

Available since: v0.2.0
