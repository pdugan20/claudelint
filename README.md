# claudelint

[![CI Status](https://github.com/pdugan20/claudelint/workflows/CI/badge.svg)](https://github.com/pdugan20/claudelint/actions)
[![npm version](https://badge.fury.io/js/%40pdugan20%2Fclaudelint.svg)](https://www.npmjs.com/package/@pdugan20/claudelint)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive linter for Claude Code projects. Validates CLAUDE.md files, skills, settings, hooks, MCP servers, plugins, and more.

## Quick Start

```bash
# Install globally
npm install -g @pdugan20/claudelint

# Initialize configuration (interactive)
claudelint init

# Or use defaults (non-interactive)
claudelint init --yes

# Validate your project
claudelint check-all
```text
**As Claude Code plugin:**

```bash
/plugin marketplace add pdugan20/claudelint
/plugin install claudelint
```text
## Features

### Validators

- **CLAUDE.md Validation** - Size limits, import syntax, frontmatter schema
- **Skills Validation** - Frontmatter, structure, referenced files, security checks
- **Settings Validation** - JSON schema, permission rules, tool names
- **Hooks Validation** - Event names, script existence, configuration
- **MCP Server Validation** - Server names, commands, environment variables
- **Plugin Validation** - Manifest schema, directory structure, cross-references

### Performance & UX

-  **Parallel Validation** - Concurrent execution for ~3.5x speedup
-  **Smart Caching** - mtime-based cache for ~2.4x speedup on warm cache
-  **Progress Indicators** - Real-time feedback with timing (auto-detects CI)
-  **Interactive Setup** - `claudelint init` wizard for easy configuration
-  **Multiple Formats** - Stylish (default), JSON, and compact output

### Rules & Configuration

-  **27 Validation Rules** - Comprehensive checks across 6 categories
-  **Per-rule Documentation** - Detailed docs for each rule
-  **Inline Disable Comments** - Fine-grained control with `<!-- claudelint-disable -->`
-  **Auto-fix** - Automatically fix common issues (`--fix` flag)
-  **Rule Registry** - Browse rules with `claudelint list-rules`

### Developer Tools

-  **Config Debugging** - `print-config`, `resolve-config`, `validate-config` commands
-  **Plugin System** - Extensible with custom validators
-  **Strict Mode** - `--strict` flag for zero-tolerance validation
-  **Warning Limits** - `--max-warnings` to prevent accumulation

## Performance

claudelint is optimized for speed without sacrificing thoroughness:

### Benchmarks

```bash
# First run (cold cache)
time claudelint check-all
# ~204ms total

# Subsequent runs (warm cache)
time claudelint check-all
# ~84ms total (~2.4x faster)
```

### Optimization Techniques

- **Parallel Validation** (~3.5x speedup)
  - All validators run concurrently using `Promise.all`
  - Independent validation = no blocking
  - Typical speedup: 63ms sequential → 18ms parallel

- **Smart Caching** (~2.4x speedup on warm cache)
  - mtime-based invalidation (changes detected automatically)
  - Version-aware (cache cleared on upgrade)
  - Cache location: `.claudelint-cache/` (configurable)

- **Fast Execution**
  - Typical project: <200ms total
  - Large projects (100+ files): <500ms
  - CI environments: Parallel + no cache overhead

### Cache Management

```bash
# Cache is automatic (enabled by default)
claudelint check-all

# Clear cache if needed (after upgrade, config changes)
claudelint cache-clear

# Disable cache temporarily
claudelint check-all --no-cache

# Custom cache location
claudelint check-all --cache-location /tmp/cache
```

## Philosophy: Complementary Tools

claudelint follows the **separation of concerns** pattern used by ESLint and Prettier. It focuses exclusively on Claude-specific validation and works alongside existing tools:

- **claudelint** - Claude configuration validation (this tool)
- **markdownlint** - Generic markdown structure and formatting
- **prettier** - Code formatting and whitespace

This approach ensures:

- **Clear responsibility** - Each tool does one thing well
- **User control** - Configure tools independently
- **Performance** - Specialized tools are faster
- **No conflicts** - Tools complement rather than compete

### What claudelint Validates

**In scope (Claude-specific):**

- CLAUDE.md file size limits (10MB context window constraint)
- `@import` syntax and referenced file existence
- Skill frontmatter schema (name, description, usage)
- Settings JSON schema and permission rules
- Hook event names and script references
- MCP server configuration and commands
- Plugin manifest and file cross-references

**Out of scope (use existing tools):**

- Generic markdown formatting (use markdownlint)
- Code formatting and whitespace (use prettier)
- Spelling and grammar (use Vale or similar)

### Recommended Setup

For complete validation, use claudelint with complementary tools:

```bash
# Install all tools
npm install --save-dev @pdugan20/claudelint markdownlint-cli prettier

# Run validation
markdownlint '**/*.md'              # Generic markdown rules
prettier --check '**/*.{md,json}'   # Formatting
claudelint check-all                # Claude-specific validation
```text
See [Formatting Tools](#formatting-tools) below for the complete ecosystem.

## Formatting Tools

claudelint provides **shareable configs** for formatting Claude-specific files. These configs use **scoped overrides** to avoid conflicts with your existing project formatters.

### Why Shareable Configs?

Following industry standards (like `eslint-config-airbnb`), we provide configs that:

- Apply ONLY to Claude files (`.claude/`, `CLAUDE.md`)
- Don't conflict with your existing formatting setup
- Stay updated when you upgrade packages
- Can be customized per-project

### Three Tiers of Tools

#### Tier 1: Critical (Must Have)

**1. markdownlint-config-claude**

Validates markdown structure in CLAUDE.md and SKILL.md files.

```bash
npm install --save-dev markdownlint-config-claude markdownlint-cli
```text
```json
// package.json
{
  "scripts": {
    "lint:md:claude": "markdownlint --config node_modules/markdownlint-config-claude 'CLAUDE.md' '.claude/**/*.md'"
  }
}
```text
**2. prettier-config-claude**

Formats markdown, JSON, and YAML in Claude files.

```bash
npm install --save-dev prettier-config-claude prettier
```text
```json
// .prettierrc.json
{
  "overrides": [
    {
      "files": ["CLAUDE.md", ".claude/**/*.{md,json,yaml}"],
      "options": "prettier-config-claude"
    }
  ]
}
```text
**3. ShellCheck**

Lints shell scripts in skills and hooks (finds bugs, security issues).

```bash
npm install --save-dev shellcheck
```text
```json
// package.json
{
  "scripts": {
    "lint:shell:claude": "shellcheck .claude/**/*.sh .claude/hooks/*"
  }
}
```text
#### Tier 2: Recommended (Should Have)

**4. shfmt**

Formats shell scripts consistently.

```bash
npm install --save-dev shfmt
```text
**5. eslint-config-claude**

Advanced JSON/YAML linting (key ordering, duplicate detection).

```bash
npm install --save-dev eslint-config-claude
```text
#### Tier 3: Optional (Nice to Have)

**6. Vale** - Prose quality for documentation
**7. black + ruff** - Python skill linting/formatting
**8. TypeScript/ESLint** - JavaScript/TypeScript skill linting

See [docs/formatting-tools.md](docs/formatting-tools.md) for complete setup guides.

### Quick Start: Format Command

For convenience, use the `claudelint format` command (automatically scoped to Claude files):

```bash
# Check formatting
claudelint format --check

# Fix formatting
claudelint format --fix
```text
This runs markdownlint, prettier, and shellcheck on ONLY your Claude files.

### No Conflicts Guarantee

All configs use **scoped targeting** (Prettier overrides, separate commands) so they:

- Apply ONLY to `.claude/` and `CLAUDE.md`
- Don't affect your existing project formatting
- Can coexist with your markdownlint/prettier/eslint configs

See [examples/integration/](examples/integration/) for complete working examples.

## Installation

### As NPM Package

```bash
# Global installation
npm install -g @pdugan20/claudelint

# Project installation
npm install --save-dev @pdugan20/claudelint
```text
After installation, run the init wizard to set up your project:

```bash
# Interactive setup
claudelint init

# Or use defaults (non-interactive, good for CI/scripts)
claudelint init --yes
```text
This creates `.claudelintrc.json` (config), `.claudelintignore` (ignore patterns), and optionally adds npm scripts to `package.json`.

See [Getting Started](docs/getting-started.md) for a complete guide.

### As Claude Code Plugin

```bash
# Add marketplace
/plugin marketplace add pdugan20/claudelint

# Install plugin
/plugin install claudelint
```text
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
```text
**Auto-fix:**

claudelint can automatically fix certain issues:

```bash
# Preview what would be fixed
claudelint check-all --fix-dry-run

# Apply all fixes
claudelint check-all --fix

# Fix only errors or warnings
claudelint check-all --fix --fix-type errors
```text
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
```text
Progress indicators automatically detect CI environments (GitHub Actions, GitLab CI, etc.) and switch to plain text output.

### As Claude Code Skill

```bash
# Validate everything
/validate

# Validate specific components
/validate-claude-md
/validate-skills
/validate-settings
```text
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
```text
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
      entry: npx claudelint check-all
      language: node
      pass_filenames: false
      files: '^(CLAUDE\.md|\.claude/)'
```text
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
```text
## Documentation

- **[Validators](docs/validators.md)** - Detailed information about each validator
- **[Configuration](docs/configuration.md)** - Customize validation rules and behavior
- **[Plugin Usage](docs/plugin-usage.md)** - Using claudelint as a Claude Code plugin
- **[Hooks](docs/hooks.md)** - Automatic validation with SessionStart hooks
- **[Architecture](docs/architecture.md)** - System design and validator architecture
- **[Formatting Tools](docs/formatting-tools.md)** - Complementary tools ecosystem
- **[Launch Plan](docs/launch.md)** - Release plan and future roadmap
- **[Contributing](CONTRIBUTING.md)** - Development setup and contributing guidelines
- **[Changelog](CHANGELOG.md)** - Version history

## Troubleshooting

### Installation Issues

**Problem**: `claudelint: command not found`

**Solution**:

```bash
# Global install
npm install -g @pdugan20/claudelint

# Or use npx
npx claudelint check-all

# Or project install
npm install --save-dev @pdugan20/claudelint
./node_modules/.bin/claudelint check-all
```text
**Problem**: Permission denied when installing globally

**Solution**:

```bash
# Use sudo (macOS/Linux)
sudo npm install -g @pdugan20/claudelint

# Or configure npm to install without sudo
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
npm install -g @pdugan20/claudelint
```text
### Exit Code Changes (v1.0 Breaking Change)

**Problem**: CI scripts expecting exit code 2 for errors

**What Changed**:

- **Before v1.0**: Exit 2 for errors, exit 1 for warnings
- **After v1.0**: Exit 1 for any linting issues (errors OR warnings), exit 0 for success, exit 2 only for fatal errors (crashes, invalid config)

**Why**: Follows POSIX standard and industry conventions (ESLint, markdownlint, prettier all use this pattern)

**Migration**:

```bash
# Most CI systems check for non-zero exit, so no changes needed
claudelint check-all || exit 1

# If you were specifically checking for exit code 2:
# Before: if [ $? -eq 2 ]; then ...
# After:  if [ $? -eq 1 ]; then ...
```text
### Validation Errors

**Problem**: Too many warnings

**Solution**: Configure rules in `.claudelintrc.json`:

```json
{
  "rules": {
    "skill-missing-changelog": "off",
    "size-warning": "off"
  }
}
```text
**Problem**: False positive errors

**Solution**: Use inline disable comments:

```markdown
<!-- claudelint-disable-next-line import-missing -->
@import non-existent-file.md
```text
**Problem**: Want detailed explanation of errors

**Solution**: Use the `--explain` flag:

```bash
claudelint check-all --explain
```text
### Plugin Issues

**Problem**: Plugin skills don't appear in Claude Code

**Solution**:

1. Check plugin is installed: `/plugin list`
2. Reinstall: `/plugin uninstall claudelint` then `/plugin install claudelint`
3. Restart Claude Code session

**Problem**: Hook doesn't run at session start

**Solution**:

1. Verify `.claude/hooks/hooks.json` exists
2. Validate: `claudelint validate-hooks`
3. Check event name is `"SessionStart"` (capital S)
4. Test command manually first

### Performance Issues

**Problem**: Validation is slow

**Solution**:

1. Use `.claudelintignore` to skip large directories:

   ```text
   node_modules/
   dist/
   coverage/
   ```text
2. Use `--fast` mode: `claudelint check-all --fast`
3. Check timing: `claudelint check-all --verbose`

### Configuration Issues

**Problem**: Config file not found

**Solution**:

- claudelint searches for config files starting from current directory
- Supported files: `.claudelintrc.json`, `package.json` (with `claudelint` key)
- Specify config: `claudelint check-all --config /path/to/config.json`

**Problem**: Rules not being applied

**Solution**:

- Verify config syntax: `cat .claudelintrc.json | jq`
- Check rule names match exactly (e.g., `size-error` not `sizeError`)
- Use `--verbose` to see which config file is loaded

### Getting Help

If you encounter issues:

1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/pdugan20/claudelint/issues)
3. Open a [new issue](https://github.com/pdugan20/claudelint/issues/new) with:
   - Command you ran
   - Error message
   - OS and Node version
   - Output of `claudelint check-all --verbose`

## License

MIT
