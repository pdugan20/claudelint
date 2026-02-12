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

This validator includes <RuleCount category="claude-md" /> rules. See the [CLAUDE.md rules category](/rules/claude-md/claude-md-content-too-many-sections) for the complete list.

| Rule | Severity | Description |
|------|----------|-------------|
| [claude-md-size-error](/rules/claude-md/claude-md-size-error) | error | File exceeds maximum size limit |
| [claude-md-size-warning](/rules/claude-md/claude-md-size-warning) | warn | File approaching size limit |
| [claude-md-import-missing](/rules/claude-md/claude-md-import-missing) | error | Imported file not found |
| [claude-md-import-circular](/rules/claude-md/claude-md-import-circular) | error | Circular import detected |
| [claude-md-file-not-found](/rules/claude-md/claude-md-file-not-found) | error | CLAUDE.md file not found |

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
