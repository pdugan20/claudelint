---
description: "Imported file does not exist"
---

# claude-md-import-missing

<RuleHeader description="Imported file does not exist" severity="error" :fixable="false" :configurable="false" category="CLAUDE.md" />

## Rule Details

When a CLAUDE.md file uses `@import` to include another file, the referenced file must exist on disk. A missing import means Claude Code will silently skip the content, leading to incomplete instructions being loaded. This rule resolves each import path relative to the importing file and verifies the target exists. Common causes include typos in the path, renamed files, or files that were deleted but not removed from imports.

### Incorrect

An @import referencing a file that does not exist

```markdown
# CLAUDE.md

@import .claude/rules/coding-standarts.md
```

### Correct

An @import referencing a file that exists on disk

```markdown
# CLAUDE.md

@import .claude/rules/coding-standards.md
```

## How To Fix

Verify the import path is correct and the target file exists. Check for typos in the filename or directory. If the file was moved or renamed, update the `@import` path to match. If the file was intentionally deleted, remove the `@import` directive.

## Options

This rule does not have any configuration options.

## When Not To Use It

There is no reason to disable this rule. Broken imports always indicate a problem that should be resolved.

## Related Rules

- [`claude-md-import-circular`](/rules/claude-md/claude-md-import-circular)
- [`claude-md-import-read-failed`](/rules/claude-md/claude-md-import-read-failed)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-import-missing.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-import-missing.test.ts)

## Version

Available since: v0.2.0
