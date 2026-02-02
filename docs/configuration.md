# Configuration

claudelint supports configuration through multiple methods, allowing you to customize linting rules and behavior for your project.

## Quick Navigation

**Configuration Topics:**

- [Configuration Files](#configuration-files) - Where to put your config
- [Rules](#rules) - Enabling, disabling, and configuring rules
- [Ignoring Files](#ignoring-files) - Skip validation for certain paths
- [Inline Disables](./inline-disables.md) - Disable rules in specific files
- [CLI Configuration](./cli-reference.md) - Command-line flags and options
- [Debugging Config](./debugging.md) - Troubleshoot configuration issues

**Common Tasks:**

- **Disable a rule:** See [Rules](#rules)
- **Ignore a directory:** See [Ignoring Files](#ignoring-files)
- **Disable for one line:** See [Inline Disables](./inline-disables.md)
- **Check current config:** Run `claudelint print-config`
- **Fix config errors:** See [Debugging Guide](./debugging.md)

## Configuration Files

claudelint will automatically search for configuration files in the following order:

1. `.claudelintrc.json` - JSON configuration file
2. `.claudelintrc.yaml` - YAML configuration file (not yet supported)
3. `.claudelintrc.yml` - YAML configuration file (not yet supported)
4. `claudelint.config.js` - JavaScript configuration file (not yet supported)
5. `package.json` - Configuration in the `claudelint` field

The search starts in the current directory and walks up the directory tree until a configuration file is found or the root is reached.

## Configuration Format

### Basic Structure

```json
{
  "extends": "string or array",
  "rules": {
    "rule-name": "severity"
  },
  "overrides": [],
  "ignorePatterns": [],
  "output": {},
  "reportUnusedDisableDirectives": false,
  "maxWarnings": 0
}
```

### Extends

The `extends` field allows you to inherit configuration from other config files or npm packages.

**Relative paths:**

```json
{
  "extends": "../.claudelintrc.json",
  "rules": {
    "claude-md-size-error": "warn"
  }
}
```

**Node modules:**

```json
{
  "extends": "@company/claudelint-config"
}
```

**Multiple extends:**

```json
{
  "extends": ["./base.json", "./strict.json"]
}
```

**Merge behavior:**

When extending configs, claudelint merges configurations in this order:

1. Base config (first in extends array)
2. Additional extended configs (in order)
3. Current config (overrides everything)

Rules are deep merged (child can override specific rules). Overrides and ignore patterns are concatenated. Circular dependencies are detected and prevented.

See [Monorepo documentation](./monorepo.md) for detailed examples.

### Rules

Rules can be configured with a severity level or a full configuration object:

```json
{
  "rules": {
    "size-error": "error",
    "size-warning": "warn",
    "import-missing": "off"
  }
}
```

Severity levels:

- `"off"` - Disable the rule
- `"warn"` - Treat violations as warnings
- `"error"` - Treat violations as errors

For rules that support options:

```json
{
  "rules": {
    "size-error": {
      "severity": "error",
      "options": {
        "maxSize": 50000
      }
    }
  }
}
```

### Available Rules

#### CLAUDE.md Rules

- `size-error` - File size exceeds error threshold (50KB)
- `size-warning` - File size exceeds warning threshold (30KB)
- `import-missing` - @import directive points to non-existent file
- `import-circular` - Circular @import dependencies detected

#### Skills Rules

- `skill-missing-shebang` - Shell script missing shebang line
- `skill-missing-comments` - File lacks explanatory comments
- `skill-dangerous-command` - Dangerous shell command detected (rm -rf, dd, mkfs)
- `skill-eval-usage` - Use of eval/exec detected
- `skill-path-traversal` - Potential path traversal vulnerability
- `skill-missing-changelog` - Skill missing CHANGELOG.md
- `skill-missing-examples` - Skill missing usage examples
- `skill-missing-version` - Skill missing version field
- `skill-too-many-files` - Too many loose files in skill directory
- `skill-deep-nesting` - Excessive directory nesting in skill
- `skill-naming-inconsistent` - Inconsistent naming conventions

### Overrides

Override rules for specific file patterns:

```json
{
  "overrides": [
    {
      "files": ["*.test.ts", "*.spec.ts"],
      "rules": {
        "size-warning": "off"
      }
    },
    {
      "files": [".claude/skills/**/SKILL.md"],
      "rules": {
        "size-error": "off"
      }
    }
  ]
}
```

### Ignoring Files

Patterns to exclude from linting (in addition to `.claudelintignore`):

```json
{
  "ignorePatterns": ["**/*.generated.ts", ".cache/", "coverage/"]
}
```

### Output Options

Configure output formatting:

```json
{
  "output": {
    "format": "stylish",
    "verbose": false,
    "color": true
  }
}
```

Options:

- `format` - Output format: `"stylish"`, `"json"`, or `"compact"`
- `verbose` - Enable verbose output
- `color` - Enable/disable color output (auto-detected by default)

### Report Unused Disable Directives

Report when inline disable comments don't suppress any violations:

```json
{
  "reportUnusedDisableDirectives": true
}
```

When enabled, claudelint warns about:

- Disable directives that don't match any violations
- Directives for rules that don't trigger in that location
- Leftover disables after violations are fixed

**Example:**

```markdown
<!-- claudelint-disable-next-line size-error -->

Normal line with no violation - will warn about unused disable
```

**Why use this:**

- Keeps inline disable comments clean and intentional
- Identifies when violations have been fixed
- Prevents confusion about which rules are actually active

See [Inline Disable Directives](inline-disables.md) for complete documentation on disable syntax and usage.

### Inline Disable Comments

Disable specific rules inline using HTML comments:

```markdown
<!-- Disable for entire file -->
<!-- claudelint-disable-file import-missing -->

<!-- Disable for next line -->
<!-- claudelint-disable-next-line import-missing -->

@import non-existent-file.md

<!-- Disable all rules for a block -->
<!-- claudelint-disable -->

Content here is not validated

<!-- claudelint-enable -->
```

**Supported directives:**

- `claudelint-disable-file [rule-id]` - Disable entire file
- `claudelint-disable-next-line [rule-id]` - Disable next line
- `claudelint-disable-line [rule-id]` - Disable current line
- `claudelint-disable [rule-id]` / `claudelint-enable [rule-id]` - Disable range

**Rule ID is optional** - omit to disable all rules.

See [Inline Disable Directives](inline-disables.md) for syntax, examples, and best practices.

### Max Warnings

Exit with error if warning count exceeds this threshold:

```json
{
  "maxWarnings": 10
}
```

Set to `0` to allow unlimited warnings, or omit the field.

The CLI `--max-warnings` option overrides this config value:

```bash
# Override config maxWarnings with CLI option
claudelint check-all --max-warnings 5

# Allow unlimited warnings (ignores config)
claudelint check-all --max-warnings 0
```

## package.json Configuration

You can also configure claudelint in your `package.json`:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "claudelint": {
    "rules": {
      "size-warning": "off"
    }
  }
}
```

## .claudelintignore

Create a `.claudelintignore` file to exclude files and directories from linting:

```text
# Dependencies
node_modules/
vendor/

# Build outputs
dist/
build/

# Generated files
**/*.generated.ts

# Test fixtures
fixtures/
```

Syntax is similar to `.gitignore`:

- `#` for comments
- `*` matches any characters except `/`
- `**` matches any characters including `/`
- Trailing `/` matches directories
- Blank lines are ignored

Default ignores (always applied):

- `node_modules/**`
- `.git/**`
- `dist/**`
- `build/**`

## CLI Options

Configuration can be overridden with CLI options:

```bash
# Specify config file
claudelint check-all --config .claudelintrc.custom.json

# Override output options
claudelint check-all --verbose --format json

# Color control
claudelint check-all --color
claudelint check-all --no-color

# Explain violations
claudelint check-all --explain

# Treat warnings as errors
claudelint check-all --warnings-as-errors

# Strict mode (fail on any issue)
claudelint check-all --strict

# Max warnings threshold
claudelint check-all --max-warnings 10

# Debug configuration loading
claudelint check-all --debug-config
```

## Debugging Commands

claudelint provides several commands to help debug configuration issues:

### print-config

Print the resolved configuration:

```bash
# Print as JSON
claudelint print-config

# Print as human-readable table
claudelint print-config --format table

# Print specific config file
claudelint print-config --config /path/to/.claudelintrc.json
```

### validate-config

Validate configuration file for errors:

```bash
# Validate config in current directory
claudelint validate-config

# Validate specific config file
claudelint validate-config --config /path/to/.claudelintrc.json
```

Checks for:

- Unknown rule IDs
- Invalid rule severities
- Invalid output formats
- JSON syntax errors

### resolve-config

Show effective configuration for a specific file:

```bash
# Show config for a file
claudelint resolve-config CLAUDE.md

# Show as table
claudelint resolve-config .claude/skills/test/SKILL.md --format table
```

Useful for debugging file-specific overrides.

See [Debugging Guide](debugging.md) for complete troubleshooting information.

## Example Configuration

Complete example `.claudelintrc.json`:

```json
{
  "rules": {
    "size-error": "error",
    "size-warning": "warn",
    "import-missing": "error",
    "import-circular": "error",
    "skill-missing-shebang": "warn",
    "skill-dangerous-command": "error"
  },
  "overrides": [
    {
      "files": ["*.test.ts"],
      "rules": {
        "size-warning": "off"
      }
    }
  ],
  "ignorePatterns": ["**/*.generated.ts", ".cache/"],
  "output": {
    "format": "stylish",
    "verbose": false,
    "color": true
  },
  "reportUnusedDisableDirectives": true,
  "maxWarnings": 10
}
```

## Hierarchical Configuration

claudelint searches for configuration files starting from the current directory and walking up the directory tree. This allows for:

- Project-level configuration in the project root
- Repository-level configuration in monorepo roots
- Global configuration in home directory

The first configuration file found is used. Files lower in the tree take precedence over files higher up.
