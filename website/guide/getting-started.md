---
description: Install claudelint and run your first validation of Claude Code project files including CLAUDE.md, skills, hooks, and MCP servers.
---

# Introduction

claudelint is a comprehensive linter for Claude Code projects. It validates CLAUDE.md files, skills, settings, hooks, MCP servers, plugins, and more.

## Installation

<CodeTabs :tabs="[
  { label: 'npm', code: 'npm install --save-dev claude-code-lint' },
  { label: 'yarn', code: 'yarn add --dev claude-code-lint' },
  { label: 'pnpm', code: 'pnpm add --save-dev claude-code-lint' }
]" />

Or install globally:

<CodeTabs :tabs="[
  { label: 'npm', code: 'npm install -g claude-code-lint' },
  { label: 'yarn', code: 'yarn global add claude-code-lint' },
  { label: 'pnpm', code: 'pnpm add -g claude-code-lint' },
]" />

## Quick Start

```bash
# Initialize configuration
claudelint init

# Validate your project
claudelint
```

## What Gets Validated

claudelint checks <RuleCount category="categories" /> different aspects of your Claude Code project:

- **[CLAUDE.md](/validators/claude-md)** - File size, imports, paths, content structure
- **[Skills](/validators/skills)** - Names, descriptions, security, versioning
- **[Settings](/validators/settings)** - Permissions, environment variables
- **[Hooks](/validators/hooks)** - Event types, script references
- **[MCP Servers](/validators/mcp)** - Transport types, URLs, environment variables
- **[Plugins](/validators/plugin)** - Manifest structure, component references
- **[Agents](/validators/agents)** - Names, descriptions, tools, models
- **[LSP](/validators/lsp)** - Transport config, language IDs, extensions
- **[Output Styles](/validators/output-styles)** - Name validation
- **[Commands](/validators/commands)** - Migration checks

## Configuration

With no config file, claudelint uses the recommended preset. Run `claudelint init` to set up configuration interactively, or create a `.claudelintrc.json` with a built-in preset:

<CodeTabs :tabs="[
  { label: 'Recommended', code: JSON.stringify({ extends: 'claudelint:recommended' }, null, 2) },
  { label: 'Strict', code: JSON.stringify({ extends: 'claudelint:strict' }, null, 2) }
]" />

You can also add per-rule overrides:

<ConfigExample
  filename=".claudelintrc.json"
  :code='JSON.stringify({ extends: "claudelint:recommended", rules: { "skill-missing-changelog": "off", "skill-body-too-long": "error" } }, null, 2)'
  caption="Extend a preset and override specific rules"
/>

See the [Rules Overview](/rules/overview) for all available rules.

## Use with Claude Code

claudelint is also available as a Claude Code plugin, giving you slash commands directly inside Claude Code sessions.

**Quick setup:**

1. Install the npm package (if you haven't already):

   ```bash
   npm install -g claude-code-lint
   ```

2. Inside Claude Code, add the marketplace and install the plugin:

   ```text
   /plugin marketplace add pdugan20/claudelint
   /plugin install claudelint@pdugan20-plugins
   ```

Key skills include:

- `/claudelint:validate-all` — Run all validators at once
- `/claudelint:optimize-cc-md` — Interactively optimize your CLAUDE.md
- `/claudelint:format-cc` — Auto-format Claude Code files

See the [Claude Code Plugin Guide](/integrations/claude-code-plugin) for team setup, plugin scopes, and troubleshooting.
