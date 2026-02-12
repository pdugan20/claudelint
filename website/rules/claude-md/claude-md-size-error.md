# claude-md-size-error

<RuleHeader description="CLAUDE.md exceeds maximum file size limit" severity="error" :fixable="false" category="CLAUDE.md" />

## Rule Details

Large CLAUDE.md files cause performance issues and may exceed context window limits when loaded by Claude Code. This rule triggers an error when the file reaches or exceeds 40KB (configurable). At this size, the file should be split into smaller, focused files under the `.claude/rules/` directory and referenced via `@import` directives. Keeping files under the limit ensures fast loading and reliable context injection.

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

Split the CLAUDE.md content into smaller, focused files inside the `.claude/rules/` directory. Then replace the inlined content with `@import` directives pointing to each extracted file. Each rule file should cover a single concern.

## Options

Default options:

```json
{
  "maxSize": 40000
}
```

Set a custom maximum file size of 50KB:

```json
{
  "maxSize": 50000
}
```

Use the default 40KB limit:

```json
{
  "maxSize": 40000
}
```

## When Not To Use It

This rule should always be enabled. Exceeding the size limit can cause Claude Code to fail to load the file or truncate instructions.

## Related Rules

- [`claude-md-size-warning`](/rules/claude-md/claude-md-size-warning)
- [`claude-md-import-missing`](/rules/claude-md/claude-md-import-missing)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-size-error.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-size-error.test.ts)

## Version

Available since: v0.2.0
