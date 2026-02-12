# claude-md-file-not-found

<RuleHeader description="Specified CLAUDE.md file path does not exist" severity="error" :fixable="false" category="CLAUDE.md" />

## Rule Details

This rule verifies that the CLAUDE.md file targeted for linting actually exists on disk. Without a CLAUDE.md file, Claude Code has no project-level instructions to load, which means the AI assistant operates without any custom guidance. This is the most fundamental check: if the file is missing, no other rules can run against it.

### Incorrect

Running claudelint when CLAUDE.md does not exist

```text
$ claudelint
Error: File not found: /path/to/project/CLAUDE.md
```

### Correct

A project with a CLAUDE.md file present at the root

```markdown
# CLAUDE.md

Project instructions for Claude Code.
```

## How To Fix

Create a CLAUDE.md file at the project root (or at the path specified in your configuration). Add project-specific instructions that guide Claude Code behavior.

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule only if you are intentionally running claudelint against a path that may not yet have a CLAUDE.md file, such as during project scaffolding.

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-file-not-found.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-file-not-found.test.ts)

## Version

Available since: v0.2.0
