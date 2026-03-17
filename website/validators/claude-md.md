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

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin: 16px 0;">

<RuleCard
  rule-id="claude-md-size"
  description="CLAUDE.md exceeds the maximum allowed size (40KB default)"
  severity="warning"
  category="CLAUDE.md"
  link="/rules/claude-md/claude-md-size"
  :configurable="true"
/>

<RuleCard
  rule-id="claude-md-import-missing"
  description="Imported file does not exist at the specified path"
  severity="error"
  category="CLAUDE.md"
  link="/rules/claude-md/claude-md-import-missing"
/>

<RuleCard
  rule-id="claude-md-import-circular"
  description="Circular import chain detected between files"
  severity="error"
  category="CLAUDE.md"
  link="/rules/claude-md/claude-md-import-circular"
/>

<RuleCard
  rule-id="claude-md-file-not-found"
  description="CLAUDE.md file not found in expected location"
  severity="error"
  category="CLAUDE.md"
  link="/rules/claude-md/claude-md-file-not-found"
/>

</div>

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
