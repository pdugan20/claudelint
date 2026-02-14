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

# Validate your project (check-all is the default command)
claudelint
```

## What Gets Validated

claudelint checks <RuleCount category="categories" /> different aspects of your Claude Code project:

- **CLAUDE.md** - File size, imports, paths, content structure
- **Skills** - Names, descriptions, security, versioning
- **Settings** - Permissions, environment variables
- **Hooks** - Event types, script references
- **MCP Servers** - Transport types, URLs, environment variables
- **Plugins** - Manifest structure, component references
- **Agents** - Names, descriptions, tools, models
- **LSP** - Transport config, language IDs, extensions
- **Output Styles** - Name validation
- **Commands** - Migration checks

## Configuration

Create a `.claudelintrc.json` in your project root:

<ConfigExample
  filename=".claudelintrc.json"
  :code='JSON.stringify({ rules: { "claude-md-size-error": "error", "skill-name": "error", "skill-description": "warning" } }, null, 2)'
  caption="Override rule severity levels per project"
/>

See the [Rules Overview](/guide/rules-overview) for all available rules.

## Use with Claude Code

claudelint is also available as a Claude Code plugin, giving you slash commands like `/claudelint:validate-all` and `/claudelint:validate-skills` directly inside Claude Code sessions. The plugin wraps the CLI, so the npm package must be installed first.

```bash
claudelint install-plugin
```

See the [Claude Code Plugin Guide](/integrations/claude-code-plugin) for setup instructions.
