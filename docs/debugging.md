# Debugging Configuration

This guide helps you debug and understand claudelint configuration issues.

## Overview

claudelint provides several commands to help you:

- Print resolved configuration
- Show effective config for specific files
- Validate config against rule registry
- Debug config loading process

## Commands

### print-config

Print the resolved configuration loaded from your config file.

````bash
# Print as JSON (default)
claudelint print-config

# Print as human-readable table
claudelint print-config --format table

# Print specific config file
claudelint print-config --config /path/to/.claudelintrc.json
```text
**Example output (table format):**

```text
Configuration Summary:
============================================================
Source: /Users/me/project/.claudelintrc.json

Rules:
------------------------------------------------------------
  ✗ import-missing                 error    [CLAUDE.md]
  ✗ size-error                     error    [CLAUDE.md]
  ! size-warning                   warn     [CLAUDE.md]
  ✗ skill-dangerous-command        error    [Skills]
  ! skill-missing-changelog        warn     [Skills]

Output:
------------------------------------------------------------
  Format:  stylish
  Verbose: no

Limits:
------------------------------------------------------------
  Max warnings: 10
```text
### validate-config

Validate your configuration file for errors.

```bash
# Validate config in current directory
claudelint validate-config

# Validate specific config file
claudelint validate-config --config /path/to/.claudelintrc.json
```text
**Checks performed:**

- Unknown rule IDs (not in rule registry)
- Invalid rule severities (not 'error', 'warn', or 'off')
- Invalid output formats (not 'stylish', 'compact', or 'json')
- Config file syntax errors

**Example output:**

```text
Validating: .claudelintrc.json

✓ Configuration is valid

Summary:
  15 rules enabled
  Format: stylish
  Max warnings: 10
```text
**Example error output:**

```text
Validating: .claudelintrc.json

✗ Unknown rules found:
  - size-huge
  - skill-invalid-rule

Run "claudelint list-rules" to see available rules.
```text
### resolve-config

Show the effective configuration for a specific file (useful for debugging overrides).

```bash
# Show config for specific file
claudelint resolve-config CLAUDE.md

# Show as table
claudelint resolve-config .claude/skills/test/SKILL.md --format table

# Use specific config file
claudelint resolve-config CLAUDE.md --config /path/to/.claudelintrc.json
```text
**Output:**

```text
File: CLAUDE.md
Config: /Users/me/project/.claudelintrc.json

Effective configuration:
{
  "rules": {
    "size-error": "error",
    "size-warning": "warn"
  },
  "output": {
    "format": "stylish",
    "verbose": false
  }
}
```text
### --debug-config Flag

Use the `--debug-config` flag with `check-all` to see detailed config loading information.

```bash
claudelint check-all --debug-config
```text
**Example output:**

```text
[Config Debug] Searching for config file from: /Users/me/project
[Config Debug] Found config file: /Users/me/project/.claudelintrc.json
Using config file: /Users/me/project/.claudelintrc.json
[Config Debug] Loaded config: {
  "rules": {
    "size-error": "error"
  }
}

⠋ Validating CLAUDE.md files...
```text
## Common Issues

### Config File Not Found

**Problem:**

```text
No configuration file found.

Searched locations:
  - .claudelintrc.json
  - .claudelintrc.js
  - package.json (claudelint key)
```text
**Solution:**

1. Run `claudelint init` to create a config file
2. Or specify config path: `claudelint check-all --config /path/to/config.json`
3. Or add `claudelint` key to package.json

### Unknown Rules

**Problem:**

```text
✗ Unknown rules found:
  - size-huge
```text
**Solution:**

1. Check rule name spelling
2. Run `claudelint list-rules` to see available rules
3. Update .claudelintrc.json with correct rule names

### Invalid Severities

**Problem:**

```text
✗ Invalid rule severities:
  - size-error: "high" (must be "error", "warn", or "off")
```text
**Solution:**

Change severity to one of the valid values:

```json
{
  "rules": {
    "size-error": "error"
  }
}
```text
### Config Not Loading

**Problem:** Config file exists but claudelint isn't using it.

**Debug Steps:**

1. Check config file location:

   ```bash
   claudelint print-config
   ```text
2. Verify config is valid JSON:

   ```bash
   cat .claudelintrc.json | jq .
   ```text
3. Use --debug-config flag:

   ```bash
   claudelint check-all --debug-config
   ```text
4. Specify config explicitly:

   ```bash
   claudelint check-all --config ./.claudelintrc.json
   ```text
## Config File Locations

claudelint searches for config in the following order:

1. `.claudelintrc.json` (recommended)
2. `.claudelintrc.js`
3. `package.json` (with "claudelint" key)

**Search algorithm:**

- Starts from current working directory
- Walks up directory tree until config found
- Stops at git repository root or home directory

## Validation Workflow

When debugging config issues, follow this workflow:

#### Step 1: Verify config exists
```bash
ls -la .claudelintrc.json
```text
#### Step 2: Validate config
```bash
claudelint validate-config
```text
#### Step 3: Print resolved config
```bash
claudelint print-config --format table
```text
#### Step 4: Test with specific file
```bash
claudelint resolve-config CLAUDE.md
```text
#### Step 5: Run with debug output
```bash
claudelint check-all --debug-config
```text
## Tips

**Use table format for readability:**

```bash
claudelint print-config --format table
```text
**Check which rules are enabled:**

```bash
claudelint print-config --format table | grep '✗\|!'
```text
**Validate before committing:**

```bash
claudelint validate-config && claudelint check-all
```text
**Debug in CI:**

```bash
# Add to CI script
claudelint print-config
claudelint check-all --debug-config
```text
## Related Commands

- `claudelint init` - Create configuration file
- `claudelint list-rules` - List all available rules
- `claudelint check-all --verbose` - Verbose validation output

## See Also

- [Configuration Guide](configuration.md) - Complete configuration reference
- [Getting Started](getting-started.md) - Initial setup guide
- [Validators](validators.md) - Available validation rules
````
