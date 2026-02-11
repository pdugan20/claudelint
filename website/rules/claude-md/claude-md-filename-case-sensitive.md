# Rule: claude-md-filename-case-sensitive

**Severity**: Error
**Fixable**: No
**Validator**: CLAUDE.md
**Recommended**: Yes

Filename differs only in case from another file, causing conflicts on case-insensitive filesystems

## Rule Details

On case-insensitive filesystems like macOS (HFS+/APFS) and Windows (NTFS), files named `Rules.md` and `rules.md` resolve to the same file. However, on Linux (ext4), they are distinct files. When a CLAUDE.md import tree contains paths that differ only in case, the project will behave differently depending on the operating system. This rule recursively walks the import tree and tracks all resolved paths in a case-insensitive map. If two imports resolve to paths that differ only in case, an error is reported.

### Incorrect

Two imports that differ only in case

```markdown
# CLAUDE.md

@import .claude/rules/Git-Workflow.md
@import .claude/rules/git-workflow.md
```

### Correct

Imports with consistent, unique casing

```markdown
# CLAUDE.md

@import .claude/rules/git-workflow.md
@import .claude/rules/code-style.md
```

## How To Fix

Rename one of the conflicting files so the names are distinct even when compared case-insensitively. Use a consistent naming convention (e.g., all lowercase with hyphens) for all imported files.

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule only if your project exclusively targets Linux and you intentionally maintain files that differ only in case. This is rare and generally discouraged.

## Related Rules

- [`claude-md-import-missing`](/rules/claude-md/claude-md-import-missing)
- [`claude-md-import-circular`](/rules/claude-md/claude-md-import-circular)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-filename-case-sensitive.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-filename-case-sensitive.test.ts)

## Version

Available since: v1.0.0
