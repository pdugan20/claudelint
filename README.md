# claude-code-lint

[![CI Status](https://github.com/pdugan20/claude-code-lint/workflows/CI/badge.svg)](https://github.com/pdugan20/claude-code-lint/actions)
[![npm version](https://badge.fury.io/js/%40pdugan20%2Fclaudelint.svg)](https://www.npmjs.com/package/claude-code-lint)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive linter for Claude Code projects. Validates CLAUDE.md files, skills, settings, hooks, MCP servers, plugins, and more.

## Beta Release Notice

This is a beta release (v0.2.0-beta.0). The package is fully functional but being tested before the stable 0.2.0 release.

**What this means:**

- All features are implemented and tested
- API may change based on beta feedback
- Please report any issues on [GitHub](https://github.com/pdugan20/claude-code-lint/issues)
- Suitable for testing and feedback, use with caution in production

**Installation:**

```bash
# Install the beta version
npm install -g claude-code-lint@beta

# Or for project use
npm install --save-dev claude-code-lint@beta
```

**Known Limitations:**

- Package name will change from `claude-code-lint` to `claude-code-lint` in stable release
- Some documentation still references the old package name
- Migration guide will be provided when stable releases

## Quick Start

```bash
# Install globally
npm install -g claude-code-lint

# Initialize configuration (interactive)
claude-code-lint init

# Or use defaults (non-interactive)
claude-code-lint init --yes

# Validate your project
claude-code-lint check-all
```

**As Claude Code plugin:**

```bash
/plugin marketplace add pdugan20/claude-code-lint
/plugin install claude-code-lint
```

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
- **Interactive Setup** - `claude-code-lint init` wizard for easy configuration
- **Multiple Formats** - Stylish (default), JSON, and compact output

### Rules & Configuration

- **105 Validation Rules** - Comprehensive checks across 10 categories
- **Per-rule Documentation** - Detailed docs for each rule
- **Inline Disable Comments** - Fine-grained control with `<!-- claude-code-lint-disable -->`
- **Auto-fix** - Automatically fix common issues (`--fix` flag)
- **Rule Registry** - Browse rules with `claude-code-lint list-rules`

### Developer Tools

- **Config Debugging** - `print-config`, `resolve-config`, `validate-config` commands
- **Custom Rules** - Extend claude-code-lint with your own validation rules
- **Strict Mode** - `--strict` flag for zero-tolerance validation
- **Warning Limits** - `--max-warnings` to prevent accumulation

## Performance

claude-code-lint is optimized for speed without sacrificing thoroughness:

### Benchmarks

```bash
# First run (cold cache)
time claude-code-lint check-all
# ~204ms total

# Subsequent runs (warm cache)
time claude-code-lint check-all
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
  - Cache location: `.claude-code-lint-cache/` (configurable)

- **Fast Execution**
  - Typical project: <200ms total
  - Large projects (100+ files): <500ms
  - CI environments: Parallel + no cache overhead

### Cache Management

```bash
# Cache is automatic (enabled by default)
claude-code-lint check-all

# Clear cache if needed (after upgrade, config changes)
claude-code-lint cache-clear

# Disable cache temporarily
claude-code-lint check-all --no-cache

# Custom cache location
claude-code-lint check-all --cache-location /tmp/cache
```

## Philosophy: Complementary Tools

claude-code-lint follows the **separation of concerns** pattern used by ESLint and Prettier. It focuses exclusively on Claude-specific validation and works alongside existing tools:

- **claude-code-lint** - Claude configuration validation (this tool)
- **markdownlint** - Generic markdown structure and formatting
- **prettier** - Code formatting and whitespace

This approach ensures:

- **Clear responsibility** - Each tool does one thing well
- **User control** - Configure tools independently
- **Performance** - Specialized tools are faster
- **No conflicts** - Tools complement rather than compete

### What claude-code-lint Validates

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

For complete validation, use claude-code-lint with complementary tools:

```bash
# Install all tools
npm install --save-dev claude-code-lint markdownlint-cli prettier

# Run validation
markdownlint '**/*.md'              # Generic markdown rules
prettier --check '**/*.{md,json}'   # Formatting
claude-code-lint check-all                # Claude-specific validation
```

See [Formatting Tools](#formatting-tools) below for the complete ecosystem.

## Dependencies

claude-code-lint automatically bundles most formatting tools. You don't need to install them separately.

### Bundled (Automatic)

These tools are included when you install claude-code-lint:

- **Prettier** - Code formatting for markdown, JSON, YAML
- **Markdownlint** - Markdown linting and validation
- **Chalk** - Colored terminal output

No additional installation required - these work out of the box.

### Optional (Install Separately)

These system-level tools enhance claude-code-lint but aren't required:

- **ShellCheck** - Shell script linting (recommended for `.sh` files)
  - macOS: `brew install shellcheck`
  - Linux: `apt install shellcheck` or `snap install shellcheck`
  - Windows: [Download from GitHub](https://github.com/koalaman/shellcheck#installing)

claude-code-lint detects and uses ShellCheck automatically if available. The `claude-code-lint format` command will show helpful install instructions if ShellCheck is missing.

## Formatting Tools

claude-code-lint provides **shareable configs** for formatting Claude-specific files. These configs use **scoped overrides** to avoid conflicts with your existing project formatters.

### Why Shareable Configs?

Following industry standards (like `eslint-config-airbnb`), we provide configs that:

- Apply ONLY to Claude files (`.claude/`, `CLAUDE.md`)
- Don't conflict with your existing formatting setup
- Stay updated when you upgrade packages
- Can be customized per-project

### Three Tiers of Tools

#### Tier 1: Bundled with claude-code-lint

**1. Prettier & Markdownlint** (bundled)

These tools are included automatically when you install claude-code-lint. No separate installation needed.

```bash
# Check formatting
claude-code-lint format --check

# Fix formatting issues
claude-code-lint format --fix
```

**2. ShellCheck** (optional)

Lints shell scripts in skills and hooks (finds bugs, security issues). Install separately:

```bash
# macOS
brew install shellcheck

# Linux
apt install shellcheck
```

Once installed, `claude-code-lint format` will automatically detect and use ShellCheck.

#### Tier 2: Recommended (Should Have)

##### 4. shfmt

Formats shell scripts consistently.

```bash
npm install --save-dev shfmt
```

##### 5. ESLint for JSON/YAML

Advanced JSON/YAML linting (key ordering, duplicate detection).

```bash
npm install --save-dev eslint eslint-plugin-jsonc eslint-plugin-yml
```

#### Tier 3: Optional (Nice to Have)

**6. Vale** - Prose quality for documentation
**7. black + ruff** - Python skill linting/formatting
**8. TypeScript/ESLint** - JavaScript/TypeScript skill linting

See [docs/formatting-tools.md](docs/formatting-tools.md) for complete setup guides.

### Quick Start: Format Command

For convenience, use the `claude-code-lint format` command (automatically scoped to Claude files):

```bash
# Check formatting
claude-code-lint format --check

# Fix formatting
claude-code-lint format --fix
```

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
npm install -g claude-code-lint

# Project installation
npm install --save-dev claude-code-lint
```

After installation, run the init wizard to set up your project:

```bash
# Interactive setup
claude-code-lint init

# Or use defaults (non-interactive, good for CI/scripts)
claude-code-lint init --yes
```

This creates `.claudelintrc.json` (config), `.claudelintignore` (ignore patterns), and optionally adds npm scripts to `package.json`.

See [Getting Started](docs/getting-started.md) for a complete guide.

### As Claude Code Plugin

```bash
# Add marketplace
/plugin marketplace add pdugan20/claude-code-lint

# Install plugin
/plugin install claude-code-lint
```

## Usage

### CLI Usage

```bash
# Validate everything
claude-code-lint check-all

# Validate specific components
claude-code-lint check-claude-md
claude-code-lint validate-skills
claude-code-lint validate-settings
claude-code-lint validate-hooks
claude-code-lint validate-mcp

# With options
claude-code-lint check-all --verbose
claude-code-lint check-all --warnings-as-errors
claude-code-lint check-all --strict
claude-code-lint check-all --max-warnings 10
claude-code-lint validate-skills --path .claude/skills

# List available rules
claude-code-lint list-rules
claude-code-lint list-rules --category Skills
claude-code-lint list-rules --format json

# Auto-fix issues
claude-code-lint check-all --fix-dry-run    # Preview fixes
claude-code-lint check-all --fix            # Apply fixes
claude-code-lint check-all --fix --fix-type errors  # Fix only errors
```

**Auto-fix:**

claude-code-lint can automatically fix certain issues:

```bash
# Preview what would be fixed
claude-code-lint check-all --fix-dry-run

# Apply all fixes
claude-code-lint check-all --fix

# Fix only errors or warnings
claude-code-lint check-all --fix --fix-type errors
```

**Fixable rules:**

- `skill-missing-shebang` - Adds `#!/usr/bin/env bash` to shell scripts
- `skill-missing-version` - Adds `version: "1.0.0"` to skill frontmatter
- `skill-missing-changelog` - Creates CHANGELOG.md with template

See [Auto-fix Guide](docs/auto-fix.md) for details.

**Progress indicators:**

claude-code-lint automatically shows validation progress with timing:

```text
⠋ Validating CLAUDE.md files...
✓ Validated CLAUDE.md files (45ms)
⠋ Validating skills...
✓ Validated skills (120ms)
```

Progress indicators automatically detect CI environments (GitHub Actions, GitLab CI, etc.) and switch to plain text output.

### As Claude Code Skill

```bash
# Validate everything
/validate

# Validate specific components
/validate-claude-md
/validate-skills
/validate-settings
```

### As Claude Code Hook

Automatically validate at session start by creating `.claude/hooks/hooks.json`:

```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "claude-code-lint check-all --format compact",
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
    - id: claude-code-lint-check-all
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
    "validate:claude": "claude-code-lint check-all",
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
- **[Plugin Usage](docs/plugin-usage.md)** - Using claude-code-lint as a Claude Code plugin
- **[Hooks](docs/hooks.md)** - Automatic validation with SessionStart hooks
- **[Architecture](docs/architecture.md)** - System design and validator architecture
- **[Formatting Tools](docs/formatting-tools.md)** - Complementary tools ecosystem
- **[Contributing](CONTRIBUTING.md)** - Development setup and contributing guidelines
- **[Changelog](CHANGELOG.md)** - Version history

## Development Status

Want to see what's being worked on? Check out our active projects and roadmap:

- **[Project Status Dashboard](docs/projects/STATUS.md)** - Overview of all active and archived projects
- **[npm Release Setup](docs/projects/npm-release-setup/README.md)** - Release automation (Planning)
- **[VitePress Documentation Site](docs/projects/vitepress-docs/README.md)** - docs.claude-code-lint.dev (Planning)
- **[Skills Quality Validation](docs/projects/skills-quality-validation/README.md)** - 41 new rules (Planning)

See [docs/projects/](docs/projects/) for complete project documentation.

## Troubleshooting

### Installation Issues

**Problem**: `claude-code-lint: command not found`

**Solution**:

```bash
# Global install
npm install -g claude-code-lint

# Or use npx
npx claude-code-lint check-all

# Or project install
npm install --save-dev claude-code-lint
./node_modules/.bin/claude-code-lint check-all
```

**Problem**: Permission denied when installing globally

**Solution**:

```bash
# Use sudo (macOS/Linux)
sudo npm install -g claude-code-lint

# Or configure npm to install without sudo
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
npm install -g claude-code-lint
```

### Exit Code Changes (v1.0 Breaking Change)

**Problem**: CI scripts expecting exit code 2 for errors

**What Changed**:

- **Before v1.0**: Exit 2 for errors, exit 1 for warnings
- **After v1.0**: Exit 1 for any linting issues (errors OR warnings), exit 0 for success, exit 2 only for fatal errors (crashes, invalid config)

**Why**: Follows POSIX standard and industry conventions (ESLint, markdownlint, prettier all use this pattern)

**Migration**:

```bash
# Most CI systems check for non-zero exit, so no changes needed
claude-code-lint check-all || exit 1

# If you were specifically checking for exit code 2:
# Before: if [ $? -eq 2 ]; then ...
# After:  if [ $? -eq 1 ]; then ...
```

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
```

**Problem**: False positive errors

**Solution**: Use inline disable comments:

```markdown
<!-- claude-code-lint-disable-next-line import-missing -->

@import non-existent-file.md
```

**Problem**: Want detailed explanation of errors

**Solution**: Use the `--explain` flag:

```bash
claude-code-lint check-all --explain
```

### Plugin Issues

**Problem**: Plugin skills don't appear in Claude Code

**Solution**:

1. Check plugin is installed: `/plugin list`
2. Reinstall: `/plugin uninstall claude-code-lint` then `/plugin install claude-code-lint`
3. Restart Claude Code session

**Problem**: Hook doesn't run at session start

**Solution**:

1. Verify `.claude/hooks/hooks.json` exists
2. Validate: `claude-code-lint validate-hooks`
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
   ```

2. Use `--fast` mode: `claude-code-lint check-all --fast`
3. Check timing: `claude-code-lint check-all --verbose`

### Configuration Issues

**Problem**: Config file not found

**Solution**:

- claude-code-lint searches for config files starting from current directory
- Supported files: `.claudelintrc.json`, `package.json` (with `claude-code-lint` key)
- Specify config: `claude-code-lint check-all --config /path/to/config.json`

**Problem**: Rules not being applied

**Solution**:

- Verify config syntax: `cat .claudelintrc.json | jq`
- Check rule names match exactly (e.g., `size-error` not `sizeError`)
- Use `--verbose` to see which config file is loaded

### Getting Help

If you encounter issues:

1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/pdugan20/claude-code-lint/issues)
3. Open a [new issue](https://github.com/pdugan20/claude-code-lint/issues/new) with:
   - Command you ran
   - Error message
   - OS and Node version
   - Output of `claude-code-lint check-all --verbose`

## License

MIT
