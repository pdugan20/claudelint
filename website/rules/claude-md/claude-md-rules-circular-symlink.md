# claude-md-rules-circular-symlink

<RuleHeader description="Circular symlink detected in import path" severity="error" :fixable="false" :configurable="true" category="CLAUDE.md" />

## Rule Details

Symbolic links can create cycles where a symlink points to a path that eventually resolves back to itself. When Claude Code attempts to resolve `@import` directives, a circular symlink would cause infinite recursion. This rule checks each imported file to determine if it is a symlink and, if so, follows the symlink chain up to the configured maximum depth (default: 100). If the chain revisits a path or exceeds the depth limit, a circular symlink is reported.

### Incorrect

An import that resolves to a circular symlink

```markdown
# CLAUDE.md

@import .claude/rules/shared.md

# Where shared.md is a symlink:
# shared.md -> ../other/rules.md -> ../../.claude/rules/shared.md
```

### Correct

An import that resolves to a regular file or a non-circular symlink

```markdown
# CLAUDE.md

@import .claude/rules/coding-standards.md
```

## How To Fix

Remove or recreate the symlink so it points to the correct target without creating a cycle. Use `ls -la` to inspect the symlink chain and `readlink -f` to see the final resolved path. Replace the circular symlink with a regular file or a symlink that terminates at a real file.

## Options

Default options:

```json
{
  "maxSymlinkDepth": 100
}
```

Reduce the symlink depth limit to detect cycles faster:

```json
{
  "maxSymlinkDepth": 50
}
```

## When Not To Use It

Disable this rule only if your project does not use symlinks for any imported files.

## Related Rules

- [`claude-md-import-circular`](/rules/claude-md/claude-md-import-circular)
- [`claude-md-import-missing`](/rules/claude-md/claude-md-import-missing)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-rules-circular-symlink.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-rules-circular-symlink.test.ts)

## Version

Available since: v0.2.0
