---
description: Understand how claudelint automatically discovers Claude Code configuration files across project layouts, monorepos, and plugin directories.
---

# File Discovery

claudelint automatically discovers Claude Code configuration files throughout your project. This page explains which files are detected, where they can live, and how the discovery process works.

## Overview

When you run `claudelint` or `claudelint format`, the tool scans your project for Claude Code files using predefined glob patterns. All patterns are centralized in a single module (`src/utils/filesystem/patterns.ts`) so that validators, the format command, the watch command, and the init wizard all use the same discovery logic.

Discovery respects:

- `.claudelintignore` (same syntax as `.gitignore`)
- `.gitignore` patterns
- `node_modules/` and `.git/` are always excluded

::: tip Project Scope
claudelint validates project-level and plugin-level files. Global user configurations (`~/.claude/`) are out of scope. See [Design Philosophy](/development/design-philosophy#project-scoped-by-design) for details.
:::

## File Type Reference

| File Type | Official Locations | Validator | Recursive |
|---|---|---|---|
| CLAUDE.md | `CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md` | claude-md | Yes (`**/`) |
| Rules | `.claude/rules/**/*.md` | claude-md | Yes |
| Skills | `.claude/skills/<name>/SKILL.md`, `skills/<name>/SKILL.md` | skills | Yes (`**/`) for `.claude/` |
| Agents | `.claude/agents/<name>.md`, `agents/<name>.md` | agents | No |
| Output Styles | `.claude/output-styles/<name>/*.md`, `output-styles/<name>/*.md` | output-styles | No |
| Settings | `.claude/settings.json`, `.claude/settings.local.json` | settings | No |
| Hooks | `hooks/hooks.json` (plugin only) | hooks | No |
| MCP | `.mcp.json` | mcp | No |
| LSP | `.claude/lsp.json`, `.lsp.json` | lsp | No |
| Plugin | `plugin.json`, `.claude-plugin/plugin.json` | plugin | No |
| Commands | `.claude/commands/**/*`, `commands/**/*` | commands | Yes |

### Recursive vs Non-recursive

- **Recursive** patterns (prefixed with `**/`) find files in nested directories, supporting monorepo layouts where packages have their own `.claude/` directories.
- **Non-recursive** patterns only match at the project root.

## Monorepo Support

claudelint supports monorepo-style projects where multiple packages each have their own Claude Code configuration:

```text
my-monorepo/
  CLAUDE.md                         # Root CLAUDE.md
  .claude/settings.json             # Root settings
  .mcp.json                         # Root MCP config
  packages/
    api/
      CLAUDE.md                     # Package CLAUDE.md (discovered)
      .claude/
        skills/deploy/SKILL.md      # Package skill (discovered)
    web/
      CLAUDE.md                     # Package CLAUDE.md (discovered)
      CLAUDE.local.md               # Local overrides (discovered)
```

All `CLAUDE.md` and `CLAUDE.local.md` files are discovered recursively. Skills inside `.claude/skills/` are also discovered recursively within nested packages.

## Plugin File Discovery

When building a Claude Code plugin, files use a different directory structure at the plugin root:

```text
my-plugin/
  plugin.json                       # Plugin manifest
  skills/
    my-skill/SKILL.md               # Plugin skill
  agents/
    my-agent.md                     # Plugin agent
  hooks/
    hooks.json                      # Plugin hooks
  output-styles/
    concise/style.md                # Plugin output style
  commands/
    deploy.md                       # Plugin command
```

claudelint detects both the standard `.claude/` project structure and the plugin root structure.

## Ignoring Files

### .claudelintignore

Create a `.claudelintignore` file in your project root using `.gitignore` syntax:

```text
# Ignore build artifacts
dist/
build/

# Ignore a specific CLAUDE.md
packages/legacy/CLAUDE.md

# Ignore all files in a directory
experiments/**
```

### .gitignore

Patterns in `.gitignore` are also respected automatically. Files matched by `.gitignore` will not be discovered.

## Format Command Coverage

The `claudelint format` command processes all discovered Claude Code files:

| Category | Files Processed |
|---|---|
| Markdown | CLAUDE.md, CLAUDE.local.md, SKILL.md, agent .md files, output style .md, command .md |
| JSON | settings.json, settings.local.json, hooks.json (plugin), lsp.json, .lsp.json, .mcp.json, plugin.json |
| YAML | `.claude/**/*.{yaml,yml}` |
| Shell | `.claude/**/*.sh`, `skills/**/*.sh` |

The format pipeline applies three tiers of formatting:

1. **markdownlint** -- Fixes markdown style issues in `.md` files
2. **Prettier** -- Formats markdown, JSON, and YAML files
3. **ShellCheck** -- Lints shell scripts (requires system install)

Use `claudelint format --check` to see what needs formatting without making changes, or `claudelint format --fix-dry-run` to preview what would be changed.
