# claudelint

[![CI Status](https://github.com/pdugan20/claudelint/workflows/CI/badge.svg)](https://github.com/pdugan20/claudelint/actions)
[![npm version](https://badge.fury.io/js/claude-code-lint.svg)](https://www.npmjs.com/package/claude-code-lint)
[![npm downloads](https://img.shields.io/npm/dm/claude-code-lint.svg)](https://www.npmjs.com/package/claude-code-lint)
[![codecov](https://codecov.io/gh/pdugan20/claudelint/branch/main/graph/badge.svg)](https://codecov.io/gh/pdugan20/claudelint)
[![Node.js Version](https://img.shields.io/node/v/claude-code-lint.svg)](https://nodejs.org)
[![Bundle Size](https://img.shields.io/bundlephobia/min/claude-code-lint.svg)](https://bundlephobia.com/package/claude-code-lint)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/pdugan20/claudelint.svg)](https://github.com/pdugan20/claudelint/stargazers)

A comprehensive linter for Claude Code projects. Validates CLAUDE.md files, skills, settings, hooks, MCP servers, plugins, and more.

## Beta Release Notice

This is a beta release (v0.2.0-beta.0). The package is fully functional but being tested before the stable 0.2.0 release.

**What this means:**

- All features are implemented and tested
- API may change based on beta feedback
- Please report any issues on [GitHub](https://github.com/pdugan20/claudelint/issues)
- Suitable for testing and feedback, use with caution in production

**Installation:**

```bash
# Install in your project (recommended)
npm install --save-dev claude-code-lint@beta

# Or globally
npm install -g claude-code-lint@beta
```

**Known Limitations:**

- Package name will change from `claudelint` to `claudelint` in stable release
- Some documentation still references the old package name
- Migration guide will be provided when stable releases

## Quick Start

### CLI Installation (for CI/CD, automation, pre-commit hooks)

```bash
# Install in your project (recommended)
npm install --save-dev claude-code-lint

# Initialize configuration (interactive)
npx claudelint init

# Or use defaults (non-interactive)
npx claudelint init --yes

# Validate your project
npx claudelint check-all
```

### Plugin Installation (for interactive Claude Code sessions)

```bash
# Install from GitHub
/plugin install github:pdugan20/claudelint

# Or install locally for development
/plugin install --source /path/to/claudelint

# Use skills with namespace
/claudelint:validate-all
/claudelint:validate-cc-md
/claudelint:optimize-cc-md
/claudelint:format-cc
```

**For plugin-only users**: See [Plugin README](.claude-plugin/README.md) for detailed plugin documentation focused on interactive Claude sessions.

**Available Skills:**

- `validate-all` - Comprehensive validation of all project files
- `validate-cc-md` - Validate CLAUDE.md files
- `validate-skills` - Validate skill structure and content
- `validate-settings` - Validate settings.json files
- `validate-hooks` - Validate hooks.json configuration
- `validate-mcp` - Validate MCP server configuration
- `validate-plugin` - Validate plugin.json manifest
- `format-cc` - Format Claude Code files
- `optimize-cc-md` - Interactively optimize CLAUDE.md files (NEW)

## Installation Methods Comparison

| Feature          | npm Package                               | Claude Code Plugin                           |
| ---------------- | ----------------------------------------- | -------------------------------------------- |
| **Use Case**     | CI/CD, automation, scripts                | Interactive Claude sessions                  |
| **Installation** | `npm install --save-dev claude-code-lint` | `/plugin install github:pdugan20/claudelint` |
| **CLI Commands** | Yes - All commands available              | Yes - Available if npm installed in repo     |
| **Skills**       | No - Not available                        | Yes - All 9 skills via `/claudelint:*`       |
| **Updates**      | `npm update -g`                           | `/plugin update claudelint`                  |
| **Best For**     | Automated workflows                       | Claude helping you fix issues                |

## Monorepo Support

claudelint supports monorepo projects with workspace detection, configuration inheritance, and per-package validation. Supports pnpm, npm, and Yarn workspaces.

See [Monorepo documentation](docs/monorepo.md) for complete guide.

## Programmatic API

Use ClaudeLint programmatically in your Node.js applications, build tools, or editor extensions:

```typescript
import { ClaudeLint } from 'claude-code-lint';

const linter = new ClaudeLint({ fix: true });
const results = await linter.lintFiles(['**/*.md']);

const hasErrors = results.some((r) => r.errorCount > 0);
if (hasErrors) {
  const formatter = await linter.loadFormatter('stylish');
  console.log(formatter.format(results));
  process.exit(1);
}
```

**Or use the functional API for simpler tasks:**

```typescript
import { lint, formatResults } from 'claude-code-lint';

const results = await lint(['**/*.md'], { fix: true });
const output = await formatResults(results, 'stylish');
console.log(output);
```

See [Programmatic API documentation](docs/api/README.md) for complete reference.

## Features

### Validators

- **CLAUDE.md Validation** - Size limits, import syntax, frontmatter schema
- **Skills Validation** - Frontmatter, structure, referenced files, security checks
- **Settings Validation** - JSON schema, permission rules, tool names
- **Hooks Validation** - Event names, script existence, configuration
- **MCP Server Validation** - Server names, commands, environment variables
- **Plugin Validation** - Manifest schema, directory structure, cross-references

### Performance & UX

- **Parallel Validation** - Concurrent execution for ~3.5x speedup
- **Smart Caching** - mtime-based cache for ~2.4x speedup on warm cache
- **Progress Indicators** - Real-time feedback with timing (auto-detects CI)
- **Interactive Setup** - `claudelint init` wizard for easy configuration
- **Multiple Formats** - Stylish (default), JSON, and compact output

### Rules & Configuration

- **103 Validation Rules** - Comprehensive checks across 10 categories
- **Per-rule Documentation** - Detailed docs for each rule
- **Inline Disable Comments** - Fine-grained control with `<!-- claudelint-disable -->`
- **Auto-fix** - Automatically fix common issues (`--fix` flag)
- **Rule Registry** - Browse rules with `claudelint list-rules`

### Developer Tools

- **Config Debugging** - `print-config`, `resolve-config`, `validate-config` commands
- **Custom Rules** - Extend claudelint with your own validation rules
- **Strict Mode** - `--strict` flag for zero-tolerance validation
- **Warning Limits** - `--max-warnings` to prevent accumulation

## Performance

claudelint is optimized for speed with parallel validation (~3.5x speedup) and smart caching (~2.4x speedup on warm cache). Typical projects validate in <200ms.

```bash
# Clear cache if needed
claudelint cache-clear
```

## Philosophy

claudelint focuses exclusively on Claude Code validation and works alongside existing tools like markdownlint (generic markdown) and prettier (code formatting). This separation of concerns ensures clear responsibility, better performance, and no conflicts between tools.

## Dependencies

claudelint automatically bundles most formatting tools. You don't need to install them separately.

### Bundled (Automatic)

These tools are included when you install claudelint:

- **Prettier** - Code formatting for markdown, JSON, YAML
- **Markdownlint** - Markdown linting and validation
- **Chalk** - Colored terminal output

No additional installation required - these work out of the box.

### Optional (Install Separately)

These system-level tools enhance claudelint but aren't required:

- **ShellCheck** - Shell script linting (recommended for `.sh` files)
  - macOS: `brew install shellcheck`
  - Linux: `apt install shellcheck` or `snap install shellcheck`
  - Windows: [Download from GitHub](https://github.com/koalaman/shellcheck#installing)

claudelint detects and uses ShellCheck automatically if available. The `claudelint format` command will show helpful install instructions if ShellCheck is missing.

## Creating Skills

When creating custom Claude Code skills, avoid generic names that trigger on unrelated queries. Use specific, descriptive names like `validate-all` instead of `validate`, or `format-cc` instead of `format`.

claudelint enforces these best practices through the `skill-overly-generic-name` rule.

See [Skill Naming Guidelines](docs/skill-naming.md) for complete naming patterns and examples.

## Formatting

claudelint bundles Prettier and Markdownlint for formatting Claude-specific files. ShellCheck (optional) lints shell scripts.

```bash
# Check formatting
claudelint format --check

# Fix formatting
claudelint format --fix
```

claudelint detects and uses ShellCheck automatically if available. The `claudelint format` command will show helpful install instructions if ShellCheck is missing.

See [Formatting Tools documentation](docs/formatting-tools.md) for complete setup guide including ShellCheck, shfmt, and other optional tools.

## Installation

### As NPM Package

```bash
# Project installation (recommended)
npm install --save-dev claude-code-lint

# Or globally
npm install -g claude-code-lint
```

After installation, run the init wizard to set up your project:

```bash
# Interactive setup
npx claudelint init

# Or use defaults (non-interactive, good for CI/scripts)
npx claudelint init --yes
```

This creates `.claudelintrc.json` (config), `.claudelintignore` (ignore patterns), and optionally adds npm scripts to `package.json`.

See [Getting Started](docs/getting-started.md) for a complete guide.

### As Claude Code Plugin

```bash
# Add marketplace
/plugin marketplace add pdugan20/claudelint

# Install plugin
/plugin install claudelint
```

## Usage

### CLI Usage

```bash
# Validate everything
claudelint check-all

# Validate specific components
claudelint check-claude-md
claudelint validate-skills
claudelint validate-settings
claudelint validate-hooks
claudelint validate-mcp

# With options
claudelint check-all --verbose
claudelint check-all --warnings-as-errors
claudelint check-all --strict
claudelint check-all --max-warnings 10
claudelint validate-skills --path .claude/skills

# List available rules
claudelint list-rules
claudelint list-rules --category Skills
claudelint list-rules --format json

# Auto-fix issues
claudelint check-all --fix-dry-run    # Preview fixes
claudelint check-all --fix            # Apply fixes
claudelint check-all --fix --fix-type errors  # Fix only errors
```

**Auto-fix:**

claudelint can automatically fix certain issues:

```bash
# Preview what would be fixed
claudelint check-all --fix-dry-run

# Apply all fixes
claudelint check-all --fix

# Fix only errors or warnings
claudelint check-all --fix --fix-type errors
```

**Fixable rules:**

- `skill-missing-shebang` - Adds `#!/usr/bin/env bash` to shell scripts
- `skill-missing-version` - Adds `version: "1.0.0"` to skill frontmatter
- `skill-missing-changelog` - Creates CHANGELOG.md with template

See [Auto-fix Guide](docs/auto-fix.md) for details.

**Progress indicators:**

claudelint automatically shows validation progress with timing:

```text
⠋ Validating CLAUDE.md files...
✓ Validated CLAUDE.md files (45ms)
⠋ Validating skills...
✓ Validated skills (120ms)
```

Progress indicators automatically detect CI environments (GitHub Actions, GitLab CI, etc.) and switch to plain text output.

### As Claude Code Skill

After installing as a plugin, use skills with the `claudelint:` namespace:

```bash
# Validate everything
/claudelint:validate-all

# Validate specific components
/claudelint:validate-cc-md    # CLAUDE.md files
/claudelint:validate-skills   # Skill structure
/claudelint:validate-settings # settings.json
/claudelint:validate-hooks    # hooks.json
/claudelint:validate-mcp      # MCP servers
/claudelint:validate-plugin   # plugin.json

# Optimize and format
/claudelint:optimize-cc-md    # Interactively optimize CLAUDE.md
/claudelint:format-cc         # Format Claude Code files
```

Or simply ask Claude in natural language:

- "Check my Claude Code project"
- "Validate my CLAUDE.md"
- "Help me optimize my CLAUDE.md - it's too long"
- "Is my skill configured correctly?"

**optimize-cc-md interactive workflow:**

When you use `/claudelint:optimize-cc-md` or ask "optimize my CLAUDE.md", Claude will:

1. Run validation to identify issues
2. Read and analyze your CLAUDE.md
3. Explain violations conversationally
4. Identify bloat and suggest improvements
5. Ask what you want to fix first
6. Make edits with your approval (using Edit/Write tools)
7. Create @import files to split content if needed
8. Show before/after results

This is an interactive workflow - Claude guides you through optimization.

### As Claude Code Hook

Automatically validate at session start by creating `.claude/hooks/hooks.json`:

```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "claudelint check-all --format compact",
      "description": "Validate Claude Code project files at session start"
    }
  ]
}
```

This runs validation automatically when you start a Claude Code session (~20-120ms depending on project size).

See [docs/hooks.md](docs/hooks.md) for more hook examples and configuration options.

### In Pre-commit Hooks

Recommended setup with complementary tools:

```yaml
# .pre-commit-config.yaml

# Generic markdown validation
- repo: https://github.com/igorshubovych/markdownlint-cli
  rev: v0.39.0
  hooks:
    - id: markdownlint
      args: ['--config', '.markdownlint.json']

# Code formatting
- repo: https://github.com/pre-commit/mirrors-prettier
  rev: v3.1.0
  hooks:
    - id: prettier
      types_or: [markdown, json, yaml]

# Claude-specific validation
- repo: local
  hooks:
    - id: claudelint-check-all
      name: Validate Claude Configuration
      entry: npx claude-code-lint check-all
      language: node
      pass_filenames: false
      files: '^(CLAUDE\.md|\.claude/)'
```

### In npm Scripts

```json
{
  "scripts": {
    "lint:md": "markdownlint '**/*.md' --ignore node_modules",
    "format:check": "prettier --check '**/*.{md,json,yaml}'",
    "validate:claude": "claudelint check-all",
    "validate:all": "npm run lint:md && npm run format:check && npm run validate:claude"
  }
}
```

## Documentation

### API Documentation

- **[Programmatic API](docs/api/README.md)** - Use ClaudeLint in Node.js applications
- **[ClaudeLint Class](docs/api/claudelint-class.md)** - Class-based API reference
- **[Functional API](docs/api/functional-api.md)** - Stateless function reference
- **[Formatters](docs/api/formatters.md)** - Built-in and custom formatters
- **[TypeScript Types](docs/api/types.md)** - Type definitions
- **[Migration Guide](docs/api/migration.md)** - Migrate from CLI to API
- **[Examples](examples/)** - Complete usage examples

### CLI Documentation

- **[Validators](docs/validation-reference.md)** - Detailed information about each validator
- **[Configuration](docs/configuration.md)** - Customize validation rules and behavior
- **[Custom Rules](docs/custom-rules.md)** - Create your own validation rules
- **[Plugin Usage](docs/plugin-usage.md)** - Using claudelint as a Claude Code plugin
- **[Hooks](docs/hooks.md)** - Automatic validation with SessionStart hooks
- **[Architecture](docs/architecture.md)** - System design and validator architecture
- **[Formatting Tools](docs/formatting-tools.md)** - Complementary tools ecosystem
- **[Contributing](CONTRIBUTING.md)** - Development setup and contributing guidelines
- **[Changelog](CHANGELOG.md)** - Version history

## Development Status

Want to see what's being worked on? Check out our active projects and roadmap:

- **[Project Status Dashboard](docs/projects/STATUS.md)** - Overview of all active and archived projects
- **[npm Release Setup](docs/projects/npm-release-setup/README.md)** - Release automation (Planning)
- **[VitePress Documentation Site](docs/projects/vitepress-docs/README.md)** - docs.claudelint.dev (Planning)
- **[Skills Quality Validation](docs/projects/skills-quality-validation/README.md)** - 41 new rules (Planning)

See [docs/projects/](docs/projects/) for complete project documentation.

## Troubleshooting

**Common issues:**

- **Command not found**: Use `npx claude-code-lint` or install with `npm install --save-dev claude-code-lint`
- **Plugin skills don't appear**: Ensure npm package is installed, then `/plugin install --source ./node_modules/claude-code-lint`
- **Too many warnings**: Configure rules in `.claudelintrc.json`
- **Slow validation**: Add ignore patterns to `.claudelintignore`

See [Troubleshooting Guide](docs/troubleshooting.md) for complete solutions to installation, validation, plugin, performance, and configuration issues.

## License

MIT
