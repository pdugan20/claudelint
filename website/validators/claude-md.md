---
description: Validate your CLAUDE.md files for size limits, import integrity, circular imports, and content structure using claudelint's CLAUDE.md validator rules.
---

# CLAUDE.md Validator

The CLAUDE.md validator checks your project's CLAUDE.md files for correctness, size limits, import integrity, and content structure.

## What It Checks

- File size limits (40KB default)
- `@import` directive syntax and referenced file existence
- Circular import detection
- Import depth limits (max 5 levels)
- YAML frontmatter in `.claude/rules/*.md` files
- `paths` glob pattern validity

## Rules

This validator includes <RuleCount category="claude-md" /> rules. See the [CLAUDE.md rules category](/rules/claude-md/claude-md-content-too-many-sections) for the complete list.

| Rule | Severity | Description |
|------|----------|-------------|
| [claude-md-size](/rules/claude-md/claude-md-size) | warn | File exceeds maximum size limit (40KB default) |
| [claude-md-import-missing](/rules/claude-md/claude-md-import-missing) | error | Imported file not found |
| [claude-md-import-circular](/rules/claude-md/claude-md-import-circular) | error | Circular import detected |
| [claude-md-file-not-found](/rules/claude-md/claude-md-file-not-found) | error | CLAUDE.md file not found |

## CLI Usage

```bash
# Validate CLAUDE.md files only
claudelint validate-claude-md

# With verbose output
claudelint validate-claude-md --verbose

# With auto-fix
claudelint validate-claude-md --fix
```

## Plugin Skill

If you have the [claudelint plugin](/integrations/claude-code-plugin) installed, you can run this validator inside Claude Code with `/validate-cc-md` or by asking "Is my CLAUDE.md ok?"

## See Also

- [Claude Code Memory](https://code.claude.com/docs/en/memory) - Official CLAUDE.md documentation
- [Configuration](/guide/configuration) - Customize rule severity
- [Troubleshooting](/guide/troubleshooting) - Common issues
