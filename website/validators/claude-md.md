# CLAUDE.md Validator

The CLAUDE.md validator checks your project's CLAUDE.md files for correctness, size limits, import integrity, and content structure.

## What It Checks

- File size limits (warning at 35KB, error at 40KB)
- `@import` directive syntax and referenced file existence
- Circular import detection
- Import depth limits (max 5 levels)
- YAML frontmatter in `.claude/rules/*.md` files
- `paths` glob pattern validity

## Rules

| Rule | Severity | Fixable | Description |
|------|----------|---------|-------------|
| [claude-md-size-error](/rules/claude-md/claude-md-size-error) | error | No | File exceeds maximum size limit |
| [claude-md-size-warning](/rules/claude-md/claude-md-size-warning) | warn | No | File approaching size limit |
| [claude-md-import-missing](/rules/claude-md/claude-md-import-missing) | error | No | Imported file not found |
| [claude-md-import-circular](/rules/claude-md/claude-md-import-circular) | error | No | Circular import detected |
| [claude-md-import-depth-exceeded](/rules/claude-md/claude-md-import-depth-exceeded) | error | No | Too many nested imports |
| [claude-md-import-in-code-block](/rules/claude-md/claude-md-import-in-code-block) | warn | No | Import directive inside code block |
| [claude-md-import-read-failed](/rules/claude-md/claude-md-import-read-failed) | error | No | Failed to read imported file |
| [claude-md-file-not-found](/rules/claude-md/claude-md-file-not-found) | error | No | CLAUDE.md file not found |
| [claude-md-glob-pattern-too-broad](/rules/claude-md/claude-md-glob-pattern-too-broad) | warn | No | Glob pattern matches too many files |
| [claude-md-paths](/rules/claude-md/claude-md-paths) | error | No | Invalid paths in frontmatter |
| [claude-md-npm-script-not-found](/rules/claude-md/claude-md-npm-script-not-found) | warn | No | Referenced npm script not found |
| [claude-md-rules-circular-symlink](/rules/claude-md/claude-md-rules-circular-symlink) | error | No | Circular symlink in rules directory |

## CLI Usage

```bash
# Validate CLAUDE.md files only
claudelint check-claude-md

# With verbose output
claudelint check-claude-md --verbose

# With auto-fix
claudelint check-claude-md --fix
```

## See Also

- [Rules Reference](/rules/overview) - All validation rules
- [Configuration](/guide/configuration) - Customize rule severity
- [Troubleshooting](/guide/troubleshooting) - Common issues
