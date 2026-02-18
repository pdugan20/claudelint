---
description: Complete reference for all claudelint CLI commands, flags, options, exit codes, and usage examples including check-all, init, explain, and more.
---

# CLI Reference

Complete reference for all claudelint commands, options, and usage patterns.

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
  - [explain](#explain) - Full documentation for a rule
- [Deprecation Management](#deprecation-management)
  - [check-deprecated](#check-deprecated) - Check for deprecated rules
  - [migrate](#migrate) - Migrate deprecated rules
- [Cache Management](#cache-management)
  - [cache-clear](#cache-clear) - Clear validation cache
- [Individual Validators](#individual-validators)
  - [validate-claude-md](#validate-claude-md) - Validate CLAUDE.md
  - [validate-skills](#validate-skills) - Validate skills
  - [validate-settings](#validate-settings) - Validate settings
  - [validate-hooks](#validate-hooks) - Validate hooks
  - [validate-mcp](#validate-mcp) - Validate MCP
  - [validate-plugin](#validate-plugin) - Validate plugins
  - [validate-agents](#validate-agents) - Validate agents
  - [validate-lsp](#validate-lsp) - Validate LSP
  - [validate-output-styles](#validate-output-styles) - Validate output styles
  - [validate-commands](#validate-commands) - Validate commands
- [Formatting](#formatting)
  - [format](#format) - Format files
- [Development](#development)
  - [watch](#watch) - Watch for changes and re-validate
  - [install-plugin](#install-plugin) - Plugin installation guide
- [Exit Codes](#exit-codes)

## Primary Commands

### check-all

Run all validators on your Claude Code project. This is the **default command** -- running `claudelint` with no arguments is equivalent to `claudelint check-all`.

**Usage:**

```bash
# These are equivalent:
claudelint
claudelint check-all [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-v, --verbose` | Show detailed output including skipped validators and timing | `false` |
| `-q, --quiet` | Suppress warnings, show only errors | `false` |
| `--format <format>` | Output format: `stylish`, `json`, `compact`, `sarif`, or `github` | `stylish` |
| `--config <path>` | Path to custom config file | Auto-detect |
| `--strict` | Exit with error on any issues (errors, warnings, or info) | `false` |
| `--max-warnings <number>` | Fail if warning count exceeds this limit | Unlimited |
| `--no-collapse` | Show all issues without collapsing repeated rules | `false` |
| `--warnings-as-errors` | Treat all warnings as errors | `false` |
| `--explain` | Show Why: and Fix: lines under each issue (Tier 2 progressive disclosure) | `false` |
| `--fix` | Automatically fix problems | `false` |
| `--fix-dry-run` | Preview fixes without applying them | `false` |
| `--fix-type <type>` | Fix `errors`, `warnings`, or `all` | `all` |
| `--cache` | Enable validation caching | `true` |
| `--no-cache` | Disable validation caching | - |
| `--cache-location <path>` | Cache directory location | `.claudelint-cache` |
| `--color` | Force color output | Auto-detect |
| `--no-color` | Disable color output | - |
| `--debug-config` | Show configuration loading debug info | `false` |
| `--show-docs-url` | Show documentation URLs for rules | `false` |
| `--fast` | Fast mode: skip expensive checks | `false` |
| `--no-deprecated-warnings` | Suppress warnings about deprecated rules | `false` |
| `--error-on-deprecated` | Treat usage of deprecated rules as errors | `false` |
| `--timing` | Show per-validator timing breakdown | `false` |
| `--allow-empty-input` | Exit 0 when no files are found to check | `false` |
| `-o, --output-file <path>` | Write results to file (in addition to stdout) | - |
| `--ignore-pattern <pattern>` | Additional pattern to ignore (repeatable) | - |
| `--no-ignore` | Disable ignore file and pattern processing | `false` |
| `--rule <rule:severity>` | Override rule severity from CLI (repeatable) | - |
| `--cache-strategy <strategy>` | Cache invalidation strategy: `metadata` or `content` | `metadata` |
| `--changed` | Only check files with uncommitted git changes | `false` |
| `--since <ref>` | Only check files changed since a git ref (branch, tag, or SHA) | - |
| `--stats` | Include per-rule statistics in output | `false` |
| `--stdin` | Read input from stdin instead of files | `false` |
| `--stdin-filename <path>` | Provide filename context for stdin input (e.g., `CLAUDE.md`) | - |
| `--workspace <name>` | Validate specific workspace package by name | - |
| `--workspaces` | Validate all workspace packages | `false` |

**Examples:**

```bash
# Basic validation
claudelint check-all

# Verbose output with timing
claudelint check-all --verbose

# Strict mode (fail on any warnings)
claudelint check-all --strict

# Limit warnings to 5
claudelint check-all --max-warnings 5

# Show all issues without collapsing repeated rules
claudelint check-all --no-collapse

# JSON output (for CI/CD)
claudelint check-all --format json

# Compact output (one line per issue)
claudelint check-all --format compact

# Show detailed explanations
claudelint check-all --explain

# Preview auto-fixes
claudelint check-all --fix-dry-run

# Apply auto-fixes
claudelint check-all --fix

# Fix only errors
claudelint check-all --fix --fix-type errors

# Custom config file
claudelint check-all --config custom.json

# Disable caching
claudelint check-all --no-cache

# Debug config loading
claudelint check-all --debug-config

# Show rule documentation URLs
claudelint check-all --show-docs-url

# Suppress warnings (show only errors)
claudelint check-all --quiet

# Show per-validator timing
claudelint check-all --timing

# GitHub Actions annotations
claudelint check-all --format github

# Pipe JSON output (status messages go to stderr)
claudelint check-all --format json | jq '.[]'

# Allow empty input (useful with lint-staged)
claudelint check-all --allow-empty-input

# Write results to a file
claudelint check-all --format json --output-file report.json

# Override a rule severity from the CLI
claudelint check-all --rule skill-name:error --rule claude-md-size:off

# Only check files with uncommitted changes
claudelint check-all --changed

# Only check files changed since a branch or tag
claudelint check-all --since main
claudelint check-all --since v0.1.0

# Validate from stdin (editor integration)
cat CLAUDE.md | claudelint check-all --stdin --stdin-filename CLAUDE.md

# Use content-based cache invalidation
claudelint check-all --cache-strategy content

# Combine flags
claudelint check-all --strict --max-warnings 0 --format json
```

**Exit Codes:**

- `0` - No issues found
- `1` - Issues found (errors or warnings)
- `2` - Fatal error (invalid config, command failure)

### init

Initialize claudelint configuration for your project. Interactive wizard that detects your project structure and generates appropriate config files.

**Usage:**

```bash
claudelint init [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `-y, --yes` | Use default configuration without prompts (non-interactive mode) |
| `--force` | Overwrite existing configuration files |

**Examples:**

```bash
# Interactive setup (recommended)
claudelint init

# Non-interactive with defaults
claudelint init --yes

# Overwrite existing config
claudelint init --yes --force
```

**What it creates:**

- `.claudelintrc.json` - Configuration file with rules
- `.claudelintignore` - Patterns for files to ignore
- Optional: npm scripts in `package.json`

## Config Management

### print-config

Display the resolved configuration that claudelint is using. Useful for debugging config file loading and cascading.

**Usage:**

```bash
claudelint print-config [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--format <format>` | Output format: `json` or `table` | `json` |
| `--config <path>` | Path to config file to print | Auto-detect |

**Examples:**

```bash
# Print config as JSON
claudelint print-config

# Print config as table
claudelint print-config --format table

# Print specific config file
claudelint print-config --config custom.json
```

### resolve-config

Show the effective configuration for a specific file. Takes into account config file cascading, overrides, and file-specific rules.

**Usage:**

```bash
claudelint resolve-config <file> [options]
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
claudelint resolve-config .claude/CLAUDE.md

# Resolve config for a skill
claudelint resolve-config .claude/skills/test/test.sh

# Table format
claudelint resolve-config .claude/CLAUDE.md --format table
```

### validate-config

Validate a configuration file against the claudelint schema. Checks for unknown rules, invalid options, and schema violations.

**Usage:**

```bash
claudelint validate-config [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--config <path>` | Path to config file to validate | Auto-detect |

**Examples:**

```bash
# Validate default config
claudelint validate-config

# Validate specific config
claudelint validate-config --config custom.json
```

## Rule Management

### list-rules

List all available validation rules with their metadata (severity, category, fixable status).

**Usage:**

```bash
claudelint list-rules [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--category <category>` | Filter by category: `CLAUDE.md`, `Skills`, `Settings`, `Hooks`, `MCP`, `Plugin` | All |
| `--fixable` | Show only rules that support auto-fix | `false` |
| `--format <format>` | Output format: `table` or `json` | `table` |

**Examples:**

```bash
# List all rules
claudelint list-rules

# List only Skills rules
claudelint list-rules --category Skills

# List only fixable rules
claudelint list-rules --fixable

# Combine filters
claudelint list-rules --category Skills --fixable

# JSON output
claudelint list-rules --format json
```

**Output includes:**

- Rule ID
- Rule name
- Description
- Category
- Severity (error, warning)
- Fixable status

### explain

Display the full documentation for a specific rule, including summary, details, examples, fix instructions, and metadata. This is Tier 3 of the progressive disclosure model.

**Usage:**

```bash
claudelint explain <rule-id>
```

**Arguments:**

- `<rule-id>` - The ID of the rule to explain (e.g., `skill-name`, `claude-md-size`)

**Examples:**

```bash
# Show full docs for a rule
claudelint explain skill-frontmatter-unknown-keys

# Show docs for a CLAUDE.md rule
claudelint explain claude-md-import-missing
```

**Output includes:**

- Rule title and summary
- Detailed explanation
- How to fix
- Incorrect and correct examples
- Metadata (severity, category, fixable, since version, docs URL)
- When not to use (if applicable)
- Related rules

**Exit Codes:**

- `0` - Rule found and documentation displayed
- `1` - Rule not found (shows available rule categories)

**Progressive disclosure model:**

| Tier | Command | What it shows |
|------|---------|---------------|
| 1 | `claudelint check-all` | Problem + rule ID (table format) |
| 2 | `claudelint check-all --explain` | Why: + Fix: lines per issue |
| 3 | `claudelint explain <rule-id>` | Full documentation page |

## Deprecation Management

### check-deprecated

Check your configuration file for deprecated rules that need to be updated or removed.

**Usage:**

```bash
claudelint check-deprecated [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--config <path>` | Path to config file | Auto-detect |
| `--format <format>` | Output format: `table` or `json` | `table` |

**Examples:**

```bash
# Check current config for deprecated rules
claudelint check-deprecated

# Check specific config file
claudelint check-deprecated --config .claudelintrc.json

# JSON output for CI/CD
claudelint check-deprecated --format json
```

**Output includes:**

- Rule ID
- Deprecation reason
- Replacement rule(s)
- Deprecated since version
- Removal version (if scheduled)
- Migration guide URL (if available)

**Exit codes:**

- `0` - No deprecated rules found
- `1` - Deprecated rules found (needs attention)
- `2` - Error (invalid config, file not found, etc.)

**Example output:**

```text
Found 2 deprecated rule(s) in your configuration:

plugin-dependency-invalid-version
  Reason: The "dependencies" field was removed from plugin.json spec
  Deprecated since: 0.2.0
  Will be removed in: 1.0.0

agent-model
  Reason: Field was renamed to "defaultModel" in official spec
  Use: agent-default-model
  Deprecated since: 0.3.0
  Will be removed in: 1.0.0

Migration steps:
  1. Update your config file to replace deprecated rules
  2. Run validation to test the new configuration
  3. Remove deprecated rule entries from config
```

### migrate

Automatically migrate deprecated rules in your configuration file.

**Usage:**

```bash
claudelint migrate [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--config <path>` | Path to config file | Auto-detect |
| `--dry-run` | Preview changes without writing to file | `false` |
| `--format <format>` | Output format: `table` or `json` | `table` |

**How it works:**

1. **1:1 Replacement** - Auto-replaces when there's a single replacement rule
   - Preserves rule config (severity + options)
   - Writes changes to config file
2. **1:Many Replacement** - Warns when there are multiple replacements
   - Requires manual intervention
   - Shows which rules to use
3. **No Replacement** - Suggests removal when rule has no replacement
   - Rule should be removed from config

**Examples:**

```bash
# Preview changes (dry run)
claudelint migrate --dry-run

# Apply migrations to current config
claudelint migrate

# Migrate specific config file
claudelint migrate --config .claudelintrc.json

# JSON output for scripting
claudelint migrate --format json
```

**Exit codes:**

- `0` - Successfully migrated (or no deprecated rules found)
- `1` - Manual intervention needed (multiple replacements)
- `2` - Error (invalid config, file not found, etc.)

**Example output (dry run):**

```text
Migration preview for: /path/to/.claudelintrc.json
(Dry run - no changes will be written)

2 rule(s) will be replaced:

  agent-model → agent-default-model
  Reason: Field was renamed to "defaultModel" in official spec

  skill-naming → skill-name-format
  Reason: Rule was renamed for clarity

1 rule(s) require manual intervention:

  plugin-validation
  Reason: Rule was split into three focused rules. Split into: plugin-name-required, plugin-name-format, plugin-name-length

Warnings:
  Rule 'plugin-validation' has multiple replacements (plugin-name-required, plugin-name-format, plugin-name-length). Please update manually.

Next steps:
  1. Run without --dry-run to apply changes
  2. Review the updated config file
  3. Run validation to test the new configuration
  4. Manually update rules requiring intervention
```

**Example output (applied):**

```text
Migrating config: /path/to/.claudelintrc.json

2 rule(s) will be replaced:

  agent-model → agent-default-model
  Reason: Field was renamed to "defaultModel" in official spec

  skill-naming → skill-name-format
  Reason: Rule was renamed for clarity

Config migrated successfully!

Next steps:
  1. Review the updated config file
  2. Run validation to test the new configuration
```

**Supported config formats:**

- `.claudelintrc.json`
- `package.json` (with `claudelint` field)

**Notes:**

- Preserves JSON formatting (2-space indent)
- Maintains trailing newline
- Preserves rule severity and options
- Handles extends and overrides correctly

## Cache Management

### cache-clear

Clear the validation cache. Use this if you're seeing stale validation results or after upgrading claudelint.

**Usage:**

```bash
claudelint cache-clear [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--cache-location <path>` | Cache directory to clear | `.claudelint-cache` |

**Examples:**

```bash
# Clear default cache
claudelint cache-clear

# Clear custom cache location
claudelint cache-clear --cache-location /tmp/my-cache
```

**When to use:**

- After upgrading claudelint
- After changing rules or config
- If seeing stale validation results
- Before CI/CD runs (optional)

## Individual Validators

Run specific validators individually instead of all at once.

### validate-claude-md

Validate CLAUDE.md files only.

**Usage:**

```bash
claudelint validate-claude-md [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--path <path>` | Custom path to CLAUDE.md | Auto-detect |
| `-v, --verbose` | Verbose output | `false` |
| `--warnings-as-errors` | Treat warnings as errors | `false` |
| `-c, --config <path>` | Path to configuration file | Auto-detect |
| `--no-config` | Disable configuration file loading | - |
| `--max-warnings <number>` | Fail if warning count exceeds this limit | Unlimited |
| `--no-collapse` | Show all issues without collapsing repeated rules | `false` |
| `--explain` | Show Why: and Fix: lines under each issue (Tier 2 progressive disclosure) | `false` |

**Examples:**

```bash
# Basic validation
claudelint validate-claude-md

# Verbose with explanations
claudelint validate-claude-md --verbose --explain

# Custom path
claudelint validate-claude-md --path ./projects/app/CLAUDE.md
```

### validate-skills

Validate Claude Code skills only.

**Usage:**

```bash
claudelint validate-skills [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--path <path>` | Custom path to skills directory | Auto-detect |
| `-v, --verbose` | Verbose output | `false` |
| `--warnings-as-errors` | Treat warnings as errors | `false` |
| `-c, --config <path>` | Path to configuration file | Auto-detect |
| `--no-config` | Disable configuration file loading | - |
| `--max-warnings <number>` | Fail if warning count exceeds this limit | Unlimited |
| `--no-collapse` | Show all issues without collapsing repeated rules | `false` |
| `--skill <name>` | Validate a specific skill by name | All skills |

**Examples:**

```bash
# Validate all skills
claudelint validate-skills

# Validate a specific skill
claudelint validate-skills --skill my-skill

# Custom skills directory
claudelint validate-skills --path ./custom/skills
```

### validate-settings

Validate settings.json files only.

**Usage:**

```bash
claudelint validate-settings [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--path <path>` | Custom path to settings.json | Auto-detect |
| `-v, --verbose` | Verbose output | `false` |
| `--warnings-as-errors` | Treat warnings as errors | `false` |
| `-c, --config <path>` | Path to configuration file | Auto-detect |
| `--no-config` | Disable configuration file loading | - |
| `--max-warnings <number>` | Fail if warning count exceeds this limit | Unlimited |
| `--no-collapse` | Show all issues without collapsing repeated rules | `false` |

**Example:**

```bash
claudelint validate-settings --verbose
```

### validate-hooks

Validate hooks.json files only.

**Usage:**

```bash
claudelint validate-hooks [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--path <path>` | Custom path to hooks.json | Auto-detect |
| `-v, --verbose` | Verbose output | `false` |
| `--warnings-as-errors` | Treat warnings as errors | `false` |
| `-c, --config <path>` | Path to configuration file | Auto-detect |
| `--no-config` | Disable configuration file loading | - |
| `--max-warnings <number>` | Fail if warning count exceeds this limit | Unlimited |
| `--no-collapse` | Show all issues without collapsing repeated rules | `false` |

**Example:**

```bash
claudelint validate-hooks --verbose
```

### validate-mcp

Validate MCP server configuration files only.

**Usage:**

```bash
claudelint validate-mcp [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--path <path>` | Custom path to MCP config file | Auto-detect |
| `-v, --verbose` | Verbose output | `false` |
| `--warnings-as-errors` | Treat warnings as errors | `false` |
| `-c, --config <path>` | Path to configuration file | Auto-detect |
| `--no-config` | Disable configuration file loading | - |
| `--max-warnings <number>` | Fail if warning count exceeds this limit | Unlimited |
| `--no-collapse` | Show all issues without collapsing repeated rules | `false` |

**Example:**

```bash
claudelint validate-mcp --verbose
```

### validate-plugin

Validate plugin manifest files only.

**Usage:**

```bash
claudelint validate-plugin [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--path <path>` | Custom path to plugin directory | Auto-detect |
| `-v, --verbose` | Verbose output | `false` |
| `--warnings-as-errors` | Treat warnings as errors | `false` |
| `-c, --config <path>` | Path to configuration file | Auto-detect |
| `--no-config` | Disable configuration file loading | - |
| `--max-warnings <number>` | Fail if warning count exceeds this limit | Unlimited |
| `--no-collapse` | Show all issues without collapsing repeated rules | `false` |

**Example:**

```bash
claudelint validate-plugin --verbose
```

### validate-agents

Validate Claude agent structure and frontmatter only.

**Usage:**

```bash
claudelint validate-agents [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--path <path>` | Custom path to agents directory | Auto-detect |
| `-v, --verbose` | Verbose output | `false` |
| `--warnings-as-errors` | Treat warnings as errors | `false` |
| `-c, --config <path>` | Path to configuration file | Auto-detect |
| `--no-config` | Disable configuration file loading | - |
| `--max-warnings <number>` | Fail if warning count exceeds this limit | Unlimited |
| `--no-collapse` | Show all issues without collapsing repeated rules | `false` |

**Example:**

```bash
claudelint validate-agents --verbose
```

### validate-lsp

Validate LSP configuration files only.

**Usage:**

```bash
claudelint validate-lsp [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--path <path>` | Custom path to lsp.json | Auto-detect |
| `-v, --verbose` | Verbose output | `false` |
| `--warnings-as-errors` | Treat warnings as errors | `false` |
| `-c, --config <path>` | Path to configuration file | Auto-detect |
| `--no-config` | Disable configuration file loading | - |
| `--max-warnings <number>` | Fail if warning count exceeds this limit | Unlimited |
| `--no-collapse` | Show all issues without collapsing repeated rules | `false` |

**Example:**

```bash
claudelint validate-lsp --verbose
```

### validate-output-styles

Validate output style structure and frontmatter only.

**Usage:**

```bash
claudelint validate-output-styles [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--path <path>` | Custom path to output styles directory | Auto-detect |
| `-v, --verbose` | Verbose output | `false` |
| `--warnings-as-errors` | Treat warnings as errors | `false` |
| `-c, --config <path>` | Path to configuration file | Auto-detect |
| `--no-config` | Disable configuration file loading | - |
| `--max-warnings <number>` | Fail if warning count exceeds this limit | Unlimited |
| `--no-collapse` | Show all issues without collapsing repeated rules | `false` |

**Example:**

```bash
claudelint validate-output-styles --verbose
```

### validate-commands

Detect deprecated Commands usage and suggest migration to Skills.

**Usage:**

```bash
claudelint validate-commands [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--path <path>` | Custom path to commands directory | Auto-detect |
| `-v, --verbose` | Verbose output | `false` |
| `--warnings-as-errors` | Treat warnings as errors | `false` |
| `-c, --config <path>` | Path to configuration file | Auto-detect |
| `--no-config` | Disable configuration file loading | - |
| `--max-warnings <number>` | Fail if warning count exceeds this limit | Unlimited |
| `--no-collapse` | Show all issues without collapsing repeated rules | `false` |

**Example:**

```bash
claudelint validate-commands --verbose
```

## Formatting

### format

Format Claude Code files using a three-tier formatting pipeline:

1. **markdownlint** - CLAUDE.md and skill markdown files
2. **prettier** - Markdown, JSON, and YAML files
3. **shellcheck** - Shell scripts (optional, requires system install)

**Usage:**

```bash
claudelint format [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--check` | Check formatting without making changes | `false` |
| `--fix` | Apply formatting fixes | `true` |
| `--fix-dry-run` | Preview what would be fixed without writing | `false` |
| `-v, --verbose` | Show detailed output per file | `false` |

**Modes:**

- **Default** (no flags): Apply fixes and write corrected files
- `--check`: Report pass/fail without modifying files
- `--fix-dry-run`: Report which files would change, without writing

**Examples:**

```bash
# Check formatting (no changes)
claudelint format --check

# Preview what would be fixed
claudelint format --fix-dry-run

# Apply formatting fixes
claudelint format --fix

# Verbose output to see per-file results
claudelint format --verbose
```

See [File Discovery](/guide/file-discovery#format-command-coverage) for the full list of file patterns and the formatting pipeline.

## Optimization

### optimize-cc-md

Interactively optimize CLAUDE.md files through a guided 3-phase workflow. Available as a [Claude Code plugin skill](/integrations/claude-code-plugin).

**Phases:**

1. **Validate** — Runs claudelint validation and reads the CLAUDE.md file
2. **Assess** — Evaluates quality against five criteria: specificity, completeness, clarity, organization, and maintenance
3. **Improve** — Walks you through targeted fixes, creating `@import` files and reorganizing content

**Usage (inside Claude Code):**

```bash
/claudelint:optimize-cc-md
/claudelint:optimize-cc-md CLAUDE.md
/claudelint:optimize-cc-md --verbose
```

**What it does:**

- Reduces file size by extracting content into `@import` files
- Removes generic or obvious instructions
- Reorganizes content by concern
- Explains each suggestion conversationally
- Asks before making any changes
- Verifies improvements after each change

**When to use:** After `claudelint check-all` flags `claude-md-size` violations, or when your CLAUDE.md has grown large and needs restructuring.

See the [Claude Code Plugin Guide](/integrations/claude-code-plugin) for setup instructions.

## Development

### watch

Watch for file changes and automatically re-validate. Runs an initial full validation, then monitors the working directory and triggers only the relevant validators when files change.

**Usage:**

```bash
claudelint watch [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-v, --verbose` | Verbose output | `false` |
| `--warnings-as-errors` | Treat warnings as errors | `false` |
| `-c, --config <path>` | Path to configuration file | Auto-detect |
| `--no-config` | Disable configuration file loading | - |
| `--debounce <ms>` | Debounce interval in milliseconds | `300` |

**File triggers:**

Changes to specific files trigger only the relevant validator:

| File Pattern | Validator Triggered |
|-------------|-------------------|
| `CLAUDE.md` | CLAUDE.md validator |
| `SKILL.md`, `*.sh` | Skills validator |
| `settings.json` | Settings validator |
| `hooks.json` | Hooks validator |
| `.mcp.json` | MCP validator |
| `plugin.json` | Plugin validator |

Changes to other `.md`, `.json`, or `.sh` files trigger all validators. Files in `node_modules/` and `.claudelint-cache/` are ignored.

**Examples:**

```bash
# Start watching with defaults
claudelint watch

# Custom debounce for slower file systems
claudelint watch --debounce 500

# Watch with specific config
claudelint watch --config strict.json

# Watch with warnings treated as errors
claudelint watch --warnings-as-errors
```

Press `Ctrl+C` to stop watching.

### install-plugin

Show instructions for installing claudelint as a Claude Code plugin. Auto-detects whether claudelint is installed locally in `node_modules` and shows the appropriate installation command.

**Usage:**

```bash
claudelint install-plugin
```

**No options.** This is an informational command that prints installation instructions.

**Output varies based on context:**

- Shows `claude --plugin-dir ./node_modules/claude-code-lint` for local loading
- Shows marketplace install syntax for distribution

See the [Claude Code Plugin Guide](/integrations/claude-code-plugin) for detailed setup instructions.

## Output Streams

claudelint separates data output from status messages for clean piping:

- **stdout**: Lint results (formatted output from `--format json`, `--format sarif`, `--format github`)
- **stderr**: Status messages, progress indicators, timing info, "Using config file: ..."

This enables piping to other tools:

```bash
# Pipe JSON to jq
claudelint check-all --format json | jq '.[] | select(.errorCount > 0)'

# Save SARIF while still seeing progress
claudelint check-all --format sarif > results.sarif

# GitHub annotations to stdout, progress to stderr
claudelint check-all --format github
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NO_COLOR` | Disable color output (respected per [no-color.org](https://no-color.org) standard) |
| `FORCE_COLOR` | Force color output even when not a TTY |
| `CI` | Suppress update notifications when running in CI environments |
| `NO_UPDATE_NOTIFIER` | Suppress update notifications explicitly |

Color is auto-detected based on TTY status. The `--color` and `--no-color` flags override environment variables.

claudelint checks the npm registry for newer versions once every 24 hours and displays a notification if an update is available. Set `CI=true` or `NO_UPDATE_NOTIFIER=1` to suppress this behavior.

## Exit Codes

claudelint uses standard POSIX exit codes:

| Exit Code | Meaning | When It Happens |
|-----------|---------|-----------------|
| `0` | Success | No issues found, all checks passed |
| `1` | Issues found | Errors or warnings detected (depending on flags) |
| `2` | Fatal error | Invalid config, command failure, or internal error |
| `130` | Interrupted | Process terminated by SIGINT (Ctrl+C) or SIGTERM |

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

## See Also

- [Configuration Guide](./configuration.md) - Config file format and options
- [Rules Catalog](/rules/overview) - All validation rules
- [Auto-fix Guide](./auto-fix.md) - Using auto-fix safely
- [CI/CD Integration](/integrations/ci) - GitHub Actions, GitLab CI, and pre-commit setup
- [npm Scripts](/integrations/npm-scripts) - Adding claudelint to your package.json
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
