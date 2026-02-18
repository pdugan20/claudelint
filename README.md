# claudelint

[![CI](https://github.com/pdugan20/claudelint/workflows/CI/badge.svg)](https://github.com/pdugan20/claudelint/actions)
[![npm version](https://img.shields.io/npm/v/claude-code-lint?logo=npm)](https://www.npmjs.com/package/claude-code-lint)
[![docs](https://img.shields.io/badge/docs-claudelint.com-blue)](https://claudelint.com)
[![codecov](https://codecov.io/gh/pdugan20/claudelint/graph/badge.svg?token=DNB36W9D5A)](https://codecov.io/gh/pdugan20/claudelint)
[![Node.js](https://img.shields.io/node/v/claude-code-lint?logo=node.js)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A linter for Claude Code projects. Validates CLAUDE.md files, skills, settings, hooks, MCP servers, plugins, and more.

## Quick Start

### Install

```bash
npm install -g claude-code-lint
claudelint init       # Creates .claudelintrc.json and .claudelintignore
claudelint check-all  # Validate your project
```

Or install as a project dependency:

```bash
npm install --save-dev claude-code-lint
npx claudelint init
npx claudelint check-all
```

### Claude Code Plugin

Use claudelint as a Claude Code plugin for interactive validation via slash commands.

Inside Claude Code, add the marketplace and install the plugin:

```text
/plugin marketplace add pdugan20/claudelint
/plugin install claudelint@pdugan20-plugins
```

Or run `claudelint install-plugin` for guided setup.

See the [Plugin Guide](https://claudelint.com/integrations/claude-code-plugin) for team setup, plugin scopes, and troubleshooting.

## What It Checks

- **CLAUDE.md** -- Size limits, import syntax, circular references, frontmatter
- **Skills** -- Frontmatter schema, structure, referenced files, security
- **Settings** -- JSON schema, permissions, tool names, hook configuration
- **Hooks** -- Event names, script existence, type validation
- **MCP Servers** -- Transport types, URLs, environment variables
- **Plugins** -- Manifest schema, directory structure, cross-references

## CLI

```bash
claudelint check-all                    # Validate everything
claudelint check-all --fix              # Auto-fix issues
claudelint check-all --strict           # Zero-tolerance mode
claudelint validate-skills --path .     # Validate specific component
claudelint list-rules                   # Browse all rules
claudelint format --check               # Check formatting
```

## Plugin Skills

After installing as a plugin, use skills via `/claudelint:*` or natural language:

| Skill | Description |
|-------|-------------|
| `validate-all` | Validate all project files |
| `validate-cc-md` | Validate CLAUDE.md files |
| `validate-skills` | Validate skill structure and content |
| `validate-settings` | Validate settings.json |
| `validate-hooks` | Validate hooks.json |
| `validate-mcp` | Validate MCP server configuration |
| `validate-plugin` | Validate plugin.json manifest |
| `format-cc` | Format Claude Code files |
| `optimize-cc-md` | Interactively optimize CLAUDE.md |

## Documentation

Full documentation is available at **[claudelint.com](https://claudelint.com)**.

Rule documentation is auto-generated from inline metadata in each rule's source code. Run `npm run docs:generate` to regenerate pages after modifying rules.

### Quick Links

- [Getting Started](https://claudelint.com/guide/getting-started)
- [Configuration](https://claudelint.com/guide/configuration)
- [Rules Overview](https://claudelint.com/guide/rules-overview)
- [Plugin Usage](https://claudelint.com/integrations/claude-code-plugin)
- [Programmatic API](https://claudelint.com/api/overview)
- [Custom Rules](https://claudelint.com/development/custom-rules)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
