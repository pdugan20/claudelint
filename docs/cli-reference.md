# CLI Reference

Complete reference for all claude-code-lint commands, options, and usage patterns.

## Table of Contents

- [Primary Commands](#primary-commands)
  - [check-all](#check-all) - Run all validators (main command)
  - [init](#init) - Initialize configuration
- [Config Management](#config-management)
  - [print-config](#print-config) - View resolved configuration
  - [resolve-config](#resolve-config) - Config for specific file
  - [validate-config](#validate-config) - Validate config file
- [Rule Management](#rule-management)
  - [list-rules](#list-rules) - Browse available rules
- [Cache Management](#cache-management)
  - [cache-clear](#cache-clear) - Clear validation cache
- [Individual Validators](#individual-validators)
  - [check-claude-md](#check-claude-md) - Validate CLAUDE.md
  - [validate-skills](#validate-skills) - Validate skills
  - [validate-settings](#validate-settings) - Validate settings
  - [validate-hooks](#validate-hooks) - Validate hooks
  - [validate-mcp](#validate-mcp) - Validate MCP
  - [validate-plugin](#validate-plugin) - Validate plugins
- [Formatting](#formatting)
  - [format](#format) - Format files
- [Exit Codes](#exit-codes)
- [Examples](#examples)

---

## Primary Commands

### check-all

Run all validators on your Claude Code project. This is the primary command you'll use most often.

**Usage:**

```bash
claude-code-lint check-all [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-v, --verbose` | Show detailed output including file counts and timing | `false` |
| `--format <format>` | Output format: `stylish`, `json`, or `compact` | `stylish` |
| `--config <path>` | Path to custom config file | Auto-detect |
| `--strict` | Exit with error on any issues (errors, warnings, or info) | `false` |
| `--max-warnings <number>` | Fail if warning count exceeds this limit | Unlimited |
| `--warnings-as-errors` | Treat all warnings as errors | `false` |
| `--explain` | Show detailed explanations and fix suggestions | `false` |
| `--fix` | Automatically fix problems | `false` |
| `--fix-dry-run` | Preview fixes without applying them | `false` |
| `--fix-type <type>` | Fix `errors`, `warnings`, or `all` | `all` |
| `--cache` | Enable validation caching | `true` |
| `--no-cache` | Disable validation caching | - |
| `--cache-location <path>` | Cache directory location | `.claude-code-lint-cache` |
| `--color` | Force color output | Auto-detect |
| `--no-color` | Disable color output | - |
| `--debug-config` | Show configuration loading debug info | `false` |
| `--show-docs-url` | Show documentation URLs for rules | `false` |
| `--fast` | Fast mode: skip expensive checks | `false` |

**Examples:**

```bash
# Basic validation
claude-code-lint check-all

# Verbose output with timing
claude-code-lint check-all --verbose

# Strict mode (fail on any warnings)
claude-code-lint check-all --strict

# Limit warnings to 5
claude-code-lint check-all --max-warnings 5

# JSON output (for CI/CD)
claude-code-lint check-all --format json

# Compact output (one line per issue)
claude-code-lint check-all --format compact

# Show detailed explanations
claude-code-lint check-all --explain

# Preview auto-fixes
claude-code-lint check-all --fix-dry-run

# Apply auto-fixes
claude-code-lint check-all --fix

# Fix only errors
claude-code-lint check-all --fix --fix-type errors

# Custom config file
claude-code-lint check-all --config custom.json

# Disable caching
claude-code-lint check-all --no-cache

# Debug config loading
claude-code-lint check-all --debug-config

# Show rule documentation URLs
claude-code-lint check-all --show-docs-url

# Combine flags
claude-code-lint check-all --strict --max-warnings 0 --format json
```

**Exit Codes:**

- `0` - No issues found
- `1` - Issues found (errors or warnings)
- `2` - Fatal error (invalid config, command failure)

---

### init

Initialize claude-code-lint configuration for your project. Interactive wizard that detects your project structure and generates appropriate config files.

**Usage:**

```bash
claude-code-lint init [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `-y, --yes` | Use default configuration without prompts (non-interactive mode) |

**Examples:**

```bash
# Interactive setup (recommended)
claude-code-lint init

# Non-interactive with defaults
claude-code-lint init --yes
```

**What it creates:**

- `.claudelintrc.json` - Configuration file with rules
- `.claudelintignore` - Patterns for files to ignore
- Optional: npm scripts in `package.json`

---

## Config Management

### print-config

Display the resolved configuration that claude-code-lint is using. Useful for debugging config file loading and cascading.

**Usage:**

```bash
claude-code-lint print-config [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--format <format>` | Output format: `json` or `table` | `json` |
| `--config <path>` | Path to config file to print | Auto-detect |

**Examples:**

```bash
# Print config as JSON
claude-code-lint print-config

# Print config as table
claude-code-lint print-config --format table

# Print specific config file
claude-code-lint print-config --config custom.json
```

---

### resolve-config

Show the effective configuration for a specific file. Takes into account config file cascading, overrides, and file-specific rules.

**Usage:**

```bash
claude-code-lint resolve-config <file> [options]
```

**Arguments:**

- `<file>` - Path to the file to resolve config for

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--format <format>` | Output format: `json` or `table` | `json` |
| `--config <path>` | Path to config file | Auto-detect |

**Examples:**

```bash
# Resolve config for CLAUDE.md
claude-code-lint resolve-config .claude/CLAUDE.md

# Resolve config for a skill
claude-code-lint resolve-config .claude/skills/test/test.sh

# Table format
claude-code-lint resolve-config .claude/CLAUDE.md --format table
```

---

### validate-config

Validate a configuration file against the claude-code-lint schema. Checks for unknown rules, invalid options, and schema violations.

**Usage:**

```bash
claude-code-lint validate-config [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--config <path>` | Path to config file to validate | Auto-detect |

**Examples:**

```bash
# Validate default config
claude-code-lint validate-config

# Validate specific config
claude-code-lint validate-config --config custom.json
```

---

## Rule Management

### list-rules

List all available validation rules with their metadata (severity, category, fixable status).

**Usage:**

```bash
claude-code-lint list-rules [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--category <category>` | Filter by category: `CLAUDE.md`, `Skills`, `Settings`, `Hooks`, `MCP`, `Plugin` | All |
| `--format <format>` | Output format: `stylish` or `json` | `stylish` |

**Examples:**

```bash
# List all rules
claude-code-lint list-rules

# List only Skills rules
claude-code-lint list-rules --category Skills

# JSON output
claude-code-lint list-rules --format json

# Filter and output as JSON
claude-code-lint list-rules --category CLAUDE.md --format json
```

**Output includes:**

- Rule ID
- Rule name
- Description
- Category
- Severity (error, warning)
- Fixable status

---

## Cache Management

### cache-clear

Clear the validation cache. Use this if you're seeing stale validation results or after upgrading claude-code-lint.

**Usage:**

```bash
claude-code-lint cache-clear [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--cache-location <path>` | Cache directory to clear | `.claude-code-lint-cache` |

**Examples:**

```bash
# Clear default cache
claude-code-lint cache-clear

# Clear custom cache location
claude-code-lint cache-clear --cache-location /tmp/my-cache
```

**When to use:**

- After upgrading claude-code-lint
- After changing rules or config
- If seeing stale validation results
- Before CI/CD runs (optional)

---

## Individual Validators

Run specific validators individually instead of all at once.

### check-claude-md

Validate CLAUDE.md files only.

**Usage:**

```bash
claude-code-lint check-claude-md [options]
```

**Options:**

Same as `check-all` but only runs CLAUDE.md validator.

**Example:**

```bash
claude-code-lint check-claude-md --verbose
```

---

### validate-skills

Validate Claude Code skills only.

**Usage:**

```bash
claude-code-lint validate-skills [options]
```

**Options:**

Same as `check-all` but only runs skills validator.

**Example:**

```bash
claude-code-lint validate-skills --fix
```

---

### validate-settings

Validate settings.json files only.

**Usage:**

```bash
claude-code-lint validate-settings [options]
```

**Options:**

Same as `check-all` but only runs settings validator.

**Example:**

```bash
claude-code-lint validate-settings
```

---

### validate-hooks

Validate hooks.json files only.

**Usage:**

```bash
claude-code-lint validate-hooks [options]
```

**Options:**

Same as `check-all` but only runs hooks validator.

**Example:**

```bash
claude-code-lint validate-hooks
```

---

### validate-mcp

Validate MCP server configuration files only.

**Usage:**

```bash
claude-code-lint validate-mcp [options]
```

**Options:**

Same as `check-all` but only runs MCP validator.

**Example:**

```bash
claude-code-lint validate-mcp
```

---

### validate-plugin

Validate plugin manifest files only.

**Usage:**

```bash
claude-code-lint validate-plugin [options]
```

**Options:**

Same as `check-all` but only runs plugin validator.

**Example:**

```bash
claude-code-lint validate-plugin
```

---

## Formatting

### format

Format Claude Code files using markdownlint, prettier, and shellcheck.

**Usage:**

```bash
claude-code-lint format [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--fix` | Apply formatting fixes | `false` |

**Example:**

```bash
# Preview formatting issues
claude-code-lint format

# Apply formatting
claude-code-lint format --fix
```

---

## Exit Codes

claude-code-lint uses standard POSIX exit codes:

| Exit Code | Meaning | When It Happens |
|-----------|---------|-----------------|
| `0` | Success | No issues found, all checks passed |
| `1` | Issues found | Errors or warnings detected (depending on flags) |
| `2` | Fatal error | Invalid config, command failure, or internal error |

**Exit code 1 is returned when:**

- Any errors are found (always)
- Warnings are found AND `--warnings-as-errors` is set
- Any issues are found AND `--strict` is set
- Warning count exceeds `--max-warnings` threshold

**Exit code 0 is returned when:**

- No errors or warnings found
- Only warnings found (without `--warnings-as-errors` or `--strict`)
- Warnings found but under `--max-warnings` threshold

**Exit code 2 is returned when:**

- Config file is invalid or cannot be loaded
- Command syntax is incorrect
- Internal error or exception occurs

---

## Examples

### Basic Workflows

**Initial setup:**

```bash
# Install claude-code-lint
npm install -g claude-code-lint

# Initialize project
cd my-claude-project
claude-code-lint init

# Run validation
claude-code-lint check-all
```

**Daily development:**

```bash
# Quick check
claude-code-lint check-all

# With auto-fix
claude-code-lint check-all --fix

# Check specific validator
claude-code-lint validate-skills
```

**Pre-commit validation:**

```bash
# Fast validation without cache
claude-code-lint check-all --no-cache --strict
```

### CI/CD Integration

**GitHub Actions:**

```bash
# Fail on any issues, JSON output
claude-code-lint check-all --strict --format json
```

**GitLab CI:**

```bash
# Limit warnings, compact output
claude-code-lint check-all --max-warnings 10 --format compact
```

**Jenkins:**

```bash
# Verbose output for debugging
claude-code-lint check-all --verbose --format json
```

### Advanced Usage

**Debugging configuration:**

```bash
# See what config is loaded
claude-code-lint print-config

# See config for specific file
claude-code-lint resolve-config .claude/skills/test/test.sh

# Debug config loading process
claude-code-lint check-all --debug-config

# Validate config file
claude-code-lint validate-config
```

**Performance optimization:**

```bash
# First run (creates cache)
claude-code-lint check-all

# Subsequent runs (uses cache, ~2.4x faster)
claude-code-lint check-all

# Clear cache if needed
claude-code-lint cache-clear

# Disable cache temporarily
claude-code-lint check-all --no-cache
```

**Auto-fixing:**

```bash
# Preview all fixes
claude-code-lint check-all --fix-dry-run

# Apply all fixes
claude-code-lint check-all --fix

# Fix only errors, not warnings
claude-code-lint check-all --fix --fix-type errors

# Fix only warnings
claude-code-lint check-all --fix --fix-type warnings
```

**Custom configurations:**

```bash
# Use different config file
claude-code-lint check-all --config strict.json

# Override cache location
claude-code-lint check-all --cache-location /tmp/cache

# Combine with other flags
claude-code-lint check-all --config strict.json --strict --max-warnings 0
```

### Rule Exploration

```bash
# List all available rules
claude-code-lint list-rules

# See only Skills rules
claude-code-lint list-rules --category Skills

# Get JSON for scripting
claude-code-lint list-rules --format json | jq '.[] | select(.fixable == true)'

# Find all error-level rules
claude-code-lint list-rules --format json | jq '.[] | select(.severity == "error")'
```

### Output Formats

**Stylish (default) - Human-readable:**

```bash
claude-code-lint check-all
```

**JSON - For CI/CD and scripting:**

```bash
claude-code-lint check-all --format json | jq '.'
```

**Compact - One line per issue:**

```bash
claude-code-lint check-all --format compact
```

### Error Handling

**Exit on any issues:**

```bash
claude-code-lint check-all --strict
echo $?  # 1 if any issues, 0 if clean
```

**Treat warnings as errors:**

```bash
claude-code-lint check-all --warnings-as-errors
```

**Limit warnings:**

```bash
claude-code-lint check-all --max-warnings 5
```

**Combine for zero-tolerance:**

```bash
claude-code-lint check-all --strict --max-warnings 0 --warnings-as-errors
```

---

## Common Patterns

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run claude-code-lint with strict mode
claude-code-lint check-all --strict --no-cache

# Exit with same code
exit $?
```

### npm Scripts

```json
{
  "scripts": {
    "lint": "claude-code-lint check-all",
    "lint:fix": "claude-code-lint check-all --fix",
    "lint:strict": "claude-code-lint check-all --strict",
    "lint:ci": "claude-code-lint check-all --format json --strict"
  }
}
```

### Makefile

```makefile
.PHONY: lint lint-fix lint-strict

lint:
 claude-code-lint check-all

lint-fix:
 claude-code-lint check-all --fix

lint-strict:
 claude-code-lint check-all --strict --max-warnings 0
```

---

## Tips and Best Practices

### Performance

- **Use caching**: Default behavior, provides ~2.4x speedup
- **Run validators in parallel**: Automatic, provides ~3.5x speedup
- **Clear cache after upgrades**: `claude-code-lint cache-clear`
- **Use `--fast` mode**: Skip expensive checks in development

### Configuration

- **Start with defaults**: Use `claude-code-lint init --yes`
- **Gradually enable rules**: Start permissive, tighten over time
- **Use `.claudelintignore`**: Exclude generated files, dependencies
- **Document custom rules**: Add comments to config file

### CI/CD

- **Use `--format json`**: Easier to parse in CI
- **Set `--max-warnings`**: Prevent warning accumulation
- **Disable cache in CI**: `--no-cache` for clean runs
- **Use `--strict` for PRs**: Catch all issues early

### Development

- **Run before commit**: Catch issues early
- **Use auto-fix**: Save time with `--fix-dry-run` then `--fix`
- **Check specific validators**: Faster feedback with individual commands
- **Use `--explain`**: Understand why rules trigger

---

## Troubleshooting

### Config not loading

```bash
# Debug config loading
claude-code-lint check-all --debug-config

# Validate config file
claude-code-lint validate-config

# Print resolved config
claude-code-lint print-config
```

### Stale validation results

```bash
# Clear cache
claude-code-lint cache-clear

# Run without cache
claude-code-lint check-all --no-cache
```

### Unexpected exit codes

```bash
# Check what's causing failures
claude-code-lint check-all --verbose

# See exit code directly
claude-code-lint check-all
echo $?
```

### Performance issues

```bash
# Check if cache is being used
claude-code-lint check-all --verbose

# Clear and rebuild cache
claude-code-lint cache-clear
claude-code-lint check-all

# Use fast mode
claude-code-lint check-all --fast
```

---

## See Also

- [Configuration Guide](./configuration.md) - Detailed config options
- [Rules Catalog](./rules/) - All 66 validation rules
- [Auto-fix Guide](./auto-fix.md) - Using auto-fix safely
- [Caching Guide](./caching.md) - Cache configuration
- [Debugging Guide](./debugging.md) - Troubleshooting
