# claude-md-import-read-failed

<RuleHeader description="Failed to read imported file" severity="error" :fixable="false" category="CLAUDE.md" />

## Rule Details

This rule complements `claude-md-import-missing` by catching a different failure mode: the imported file exists on disk, but reading its contents fails. Common causes include insufficient file permissions, the file being a directory instead of a regular file, binary files that cannot be read as text, or filesystem-level errors. The rule first confirms the file exists (deferring to `claude-md-import-missing` otherwise), then attempts to read it and reports any errors encountered.

### Incorrect

Importing a file that exists but is not readable

```markdown
# CLAUDE.md

@import .claude/rules/secrets.md

# Where secrets.md has permissions set to 000 (no read access)
```

### Correct

Importing a file that exists and is readable

```markdown
# CLAUDE.md

@import .claude/rules/coding-standards.md
```

## How To Fix

Check the file permissions with `ls -la` and ensure the file is readable. If the file is a binary file, it should not be imported into CLAUDE.md. Verify the path does not point to a directory.

## Options

This rule does not have any configuration options.

## When Not To Use It

There is no reason to disable this rule. An unreadable import always indicates a problem that needs to be fixed.

## Related Rules

- [`claude-md-import-missing`](/rules/claude-md/claude-md-import-missing)
- [`claude-md-import-circular`](/rules/claude-md/claude-md-import-circular)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-import-read-failed.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-import-read-failed.test.ts)

## Version

Available since: v0.2.0
