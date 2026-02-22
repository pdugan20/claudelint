---
description: Install claudelint and run your first validation of Claude Code project files including CLAUDE.md, skills, hooks, and MCP servers.
outline: 2
---

# Getting Started

claudelint is a linter for Claude Code projects. It validates CLAUDE.md files, skills, settings, hooks, MCP servers, plugins, agents, and more — surfacing misconfigurations and standardizing your setup before issues cause silent failures.

## Set Up with Claude

Let Claude walk you through setup. Copy this prompt into a Claude Code session:

```text
Set up claudelint for this project to validate my Claude Code files.
Follow the setup guide at https://claudelint.com/setup-guide.md
```

Claude will read the guide, create a task list, and walk you through each step — install location, rule preset, hooks, validation, and plugin installation.

## Manual Setup

If you prefer to install and configure claudelint yourself, follow these steps.

### 1. Install

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

### 2. Configure

```bash
claudelint init
```

This creates `.claudelintrc.json` with the recommended preset and `.claudelintignore` for excluding files. Add `.claudelint-cache/` to your `.gitignore` if it isn't there already -- claudelint uses this directory for caching and it should not be committed. See [Configuration](/guide/configuration) for presets, per-rule overrides, and advanced options.

### 3. Validate

```bash
claudelint
```

That's it. claudelint scans your project and reports any issues. See the [CLI Reference](/guide/cli-reference) for all available commands and flags.

### 4. Optional: Claude Code Plugin

Install the claudelint plugin for slash commands like `/validate-all` and `/optimize-cc-md` directly inside Claude Code sessions. See the [Plugin Guide](/integrations/claude-code-plugin) for installation.

### 5. Optional: SessionStart Hook

Automatically validate your project every time a Claude Code session begins:

```bash
claudelint init --hooks
```

See [Hooks](/integrations/hooks) for details and alternative hook types.

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

## Next Steps

- **[Configuration](/guide/configuration)** - Presets, per-rule overrides, ignore patterns
- **[Rules Overview](/rules/overview)** - Browse all <RuleCount category="total" /> rules
- **[CI/CD Integration](/integrations/ci)** - GitHub Actions, GitLab CI, SARIF output
- **[Auto-fix](/guide/auto-fix)** - Automatically fix common issues
- **[Custom Rules](/development/custom-rules)** - Write your own validation rules
- **[Why claudelint?](/guide/why-claudelint)** - What problems it solves and how
