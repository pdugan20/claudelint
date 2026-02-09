# claudelint

[![CI](https://github.com/pdugan20/claudelint/workflows/CI/badge.svg)](https://github.com/pdugan20/claudelint/actions)
[![npm version](https://img.shields.io/npm/v/claude-code-lint?logo=npm)](https://www.npmjs.com/package/claude-code-lint)
[![codecov](https://codecov.io/gh/pdugan20/claudelint/branch/main/graph/badge.svg)](https://codecov.io/gh/pdugan20/claudelint)
[![Node.js](https://img.shields.io/node/v/claude-code-lint?logo=node.js)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A linter for Claude Code projects. Validates CLAUDE.md files, skills, settings, hooks, MCP servers, plugins, and more.

## Quick Start

### npm

Use the npm package for CI/CD pipelines, pre-commit hooks, and automation scripts.

```bash
npm install --save-dev claude-code-lint
npx claudelint init       # Creates .claudelintrc.json and .claudelintignore
npx claudelint check-all  # Validate your project
```

### Claude Code Plugin

Install as a plugin for interactive validation during Claude Code sessions.

```bash
/plugin install github:pdugan20/claudelint
/claudelint:validate-all
```

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

- [Getting Started](docs/getting-started.md)
- [Configuration](docs/configuration.md)
- [Validation Reference](docs/validation-reference.md)
- [Plugin Usage](docs/plugin-usage.md)
- [Programmatic API](docs/api/README.md)
- [Hooks](docs/hooks.md)
- [Custom Rules](docs/custom-rules.md)
- [Auto-fix Guide](docs/auto-fix.md)
- [Formatting Tools](docs/formatting-tools.md)
- [Monorepo Support](docs/monorepo.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
