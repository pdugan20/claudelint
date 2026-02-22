---
description: Understand how claudelint automatically discovers Claude Code configuration files across project layouts, monorepos, and plugin directories.
---

# File Discovery

claudelint automatically discovers project-level and plugin-level Claude Code configuration files using predefined glob patterns. Global user configurations (`~/.claude/`) are out of scope.

Discovery respects `.claudelintignore`, `.gitignore` patterns, and always excludes `node_modules/` and `.git/`.

## File Type Reference

| File Type | Locations | Validator | Recursive |
|---|---|---|---|
| CLAUDE.md | `CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md` | claude-md | Yes (`**/`) |
| Rules | `.claude/rules/**/*.md` | claude-md | Yes |
| Skills | `.claude/skills/<name>/SKILL.md`, `skills/<name>/SKILL.md` | skills | Yes (`**/`) for `.claude/` |
| Agents | `.claude/agents/<name>.md`, `agents/<name>.md` | agents | No |
| Output Styles | `.claude/output-styles/<name>/*.md`, `output-styles/<name>/*.md` | output-styles | No |
| Settings | `.claude/settings.json`, `.claude/settings.local.json` | settings | No |
| Hooks | `hooks/hooks.json` (plugin, auto-loaded) | hooks | No |
| MCP | `.mcp.json` | mcp | No |
| LSP | `.claude/lsp.json`, `.lsp.json` | lsp | No |
| Plugin | `plugin.json`, `.claude-plugin/plugin.json` | plugin | No |
| Commands | `.claude/commands/**/*`, `commands/**/*` | commands | Yes |

Recursive patterns (`**/`) find files in nested directories, supporting monorepo layouts where packages have their own `.claude/` directories.

## Monorepo Support

claudelint supports monorepo-style projects where multiple packages each have their own Claude Code configuration. All `CLAUDE.md` and `CLAUDE.local.md` files are discovered recursively, and skills inside `.claude/skills/` are discovered within nested packages.

For workspace detection, config inheritance, and per-package validation, see [Monorepo Support](/integrations/monorepos).

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

claudelint detects both the standard `.claude/` project structure and the plugin root structure. See [Plugin Manifest: Auto-discovery](/api/schemas/plugin#auto-discovery) for how Claude Code loads plugin config files.

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
