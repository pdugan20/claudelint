---
name: format
description: Format Claude Code files with markdownlint, prettier, and shellcheck
version: 1.0.0
allowed-tools:
  - Bash
  - Read
---

# Format Claude Code Files

Runs `claudelint format` to format Claude Code project files using industry-standard tools:

- **markdownlint** - Markdown structure and formatting
- **prettier** - Code formatting for markdown, JSON, YAML
- **shellcheck** - Shell script analysis

## Usage

```bash
claudelint format --fix
```

## Modes

### Fix Mode (default)

Auto-fix formatting issues:

```bash
claudelint format --fix
```

Or simply:

```bash
claudelint format
```

### Check Mode

Check formatting without making changes:

```bash
claudelint format --check
```

Useful for CI/CD to verify formatting.

## Options

- `--check` - Check formatting without making changes
- `--fix` - Fix formatting issues (default)
- `--verbose` - Show detailed command output

## What Gets Formatted

### Markdown Files

- `CLAUDE.md`
- `.claude/**/*.md`

Tools:

- markdownlint - MD041, MD031, MD032, MD040, MD022
- prettier - Line wrapping, indentation

### JSON Files

- `.claude/**/*.json`
- `.mcp.json`
- `.claude-plugin/**/*.json`

Tool: prettier

### YAML Files

- `.claude/**/*.{yaml,yml}`

Tool: prettier

### Shell Scripts

- `.claude/**/*.sh`
- `.claude/hooks/*`

Tool: shellcheck (analysis only, no auto-fix)

## Examples

Format all Claude files:

```bash
claudelint format --fix
```

Check formatting in CI:

```bash
claudelint format --check
```

Verbose output:

```bash
claudelint format --fix --verbose
```

## Required Tools

Install formatting tools globally or in your project:

### markdownlint

```bash
npm install -g markdownlint-cli
# or
npm install --save-dev markdownlint-cli
```

### prettier

```bash
npm install -g prettier
# or
npm install --save-dev prettier
```

### shellcheck

```bash
brew install shellcheck
# or
npm install -g shellcheck
```

## Configuration

The format command automatically scopes to Claude files only, so it won't conflict with your project's existing formatters.

To customize markdownlint:

```bash
npm install --save-dev @pdugan20/markdownlint-config-claude
```

Create `.markdownlintrc.json`:

```json
{
  "extends": "@pdugan20/markdownlint-config-claude"
}
```

To customize prettier:

```bash
npm install --save-dev @pdugan20/prettier-config-claude
```

Create `.prettierrc.json`:

```json
{
  "overrides": [
    {
      "files": [".claude/**/*", "CLAUDE.md"],
      "options": {
        "proseWrap": "always",
        "printWidth": 100
      }
    }
  ]
}
```

## Integration

Add to package.json scripts:

```json
{
  "scripts": {
    "format:claude": "claudelint format --fix",
    "format:claude:check": "claudelint format --check",
    "lint:claude": "claudelint check-all"
  }
}
```

Add to pre-commit hooks:

```bash
#!/bin/sh
claudelint format --check
claudelint check-all
```

## Exit Codes

- `0` - All formatting checks passed
- `1` - Formatting issues found

## See Also

- [validate](../validate/SKILL.md) - Validate Claude files
- [Formatting Tools Documentation](../../docs/formatting-tools.md) - Complete formatting guide
