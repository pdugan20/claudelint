# Claude Code Plugin Usage Guide

This guide covers how to install and use claudelint as a Claude Code plugin.

## Prerequisites

The plugin's slash commands run claudelint CLI commands under the hood. You must install the npm package first:

```bash
npm install -g claude-code-lint
```

See [Getting Started](/guide/getting-started) for full installation options.

## Installation

### Add the Marketplace

First, add the claudelint marketplace to your Claude Code:

```bash
/plugin marketplace add pdugan20/claudelint
```

### Install the Plugin

Then install the claudelint plugin:

```bash
/plugin install claudelint
```

This makes all 8 claudelint skills available as slash commands in your Claude Code sessions.

## Available Skills

Once installed, you can use these slash commands:

### `/validate-all` - Comprehensive Validation

Run all validators on your entire project:

```bash
/validate-all
```

This checks:

- CLAUDE.md files (size, imports, frontmatter)
- Skills (schema, security, documentation)
- Settings (JSON schema, permissions)
- Hooks (events, commands)
- MCP servers (transport, variables)
- Plugin manifests (version, references)

**Options:**

```bash
/validate-all --verbose
/validate-all --explain
/validate-all --warnings-as-errors
/validate-all --format json
```

### `/validate-all-cc-md` - CLAUDE.md Validation

Validate only CLAUDE.md files:

```bash
/validate-all-cc-md
```

Checks:

- File size limits (30KB warning, 50KB error)
- @import directive syntax and existence
- Frontmatter in .claude/rules/ files
- Section organization

**Options:**

```bash
/validate-all-cc-md --path /path/to/CLAUDE.md
/validate-all-cc-md --explain
```

### `/validate-all-skills` - Skills Validation

Validate Claude Code skills:

```bash
/validate-all-skills
```

Checks:

- SKILL.md schema and frontmatter
- Security issues (dangerous commands, eval usage)
- Documentation (CHANGELOG, examples, README)
- Best practices (shebang, comments, naming)

**Options:**

```bash
/validate-all-skills --skill my-skill
/validate-all-skills --verbose
```

### `/validate-all-settings` - Settings Validation

Validate settings.json:

```bash
/validate-all-settings
```

Checks:

- JSON schema
- Permission rules
- Environment variables
- Model configuration

### `/validate-all-hooks` - Hooks Validation

Validate hooks.json:

```bash
/validate-all-hooks
```

Checks:

- Hook events and types
- Command scripts
- Matcher configuration

### `/validate-all-mcp` - MCP Server Validation

Validate .mcp.json configuration:

```bash
/validate-all-mcp
```

Checks:

- Server names and uniqueness
- Transport configuration (stdio/SSE)
- Variable expansion patterns
- Environment variables

### `/validate-all-plugin` - Plugin Manifest Validation

Validate plugin.json:

```bash
/validate-all-plugin
```

Checks:

- Manifest schema
- Semantic versioning
- Skill/agent/hook references

### `/format-cc` - Format Claude Files

Auto-format Claude Code files:

```bash
/format-cc
```

Runs:

- markdownlint on CLAUDE.md and .claude/\*_/_.md
- prettier on JSON/YAML files
- shellcheck on shell scripts

**Options:**

```bash
/format-cc --check    # Check without making changes
/format-cc --fix      # Fix issues (default)
/format-cc --verbose  # Show detailed output
```

## Typical Workflows

### Quick Validation

Start a session and immediately check your project:

```bash
/validate-all
```

### Fix Formatting Issues

Before committing changes:

```bash
/format-cc
/validate-all
```

### Debug Specific Component

If you're working on skills:

```bash
/validate-all-skills --verbose --explain
```

### Strict Mode for CI

Treat all warnings as errors:

```bash
/validate-all --warnings-as-errors --format json
```

## Configuration

The plugin respects your project's configuration files:

- `.claudelintrc.json` - Rule configuration
- `.claudelintignore` - Files to ignore
- `.claude/hooks/hooks.json` - Auto-validation hooks

See the [Configuration Guide](/guide/configuration) for details.

## Automatic Validation

Set up a SessionStart hook to validate automatically when Claude Code starts:

Create `.claude/hooks/hooks.json`:

```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "claudelint check-all --format compact",
      "description": "Validate Claude Code project at session start"
    }
  ]
}
```

See [Hooks Validator](/validators/hooks) for more hook examples.

## Troubleshooting

### Skills Don't Appear

If slash commands aren't available:

1. Check plugin is installed: `/plugin list`
2. Reinstall if needed: `/plugin uninstall claudelint` then `/plugin install claudelint`
3. Restart Claude Code session

### Validation Fails

If validation returns errors:

1. Run with `--explain` flag for detailed guidance
2. Check `.claudelintrc.json` for rule configuration
3. See error messages for specific line numbers and fixes
4. Review [Rules Reference](/rules/overview) for rule details

### Permission Denied

If you get permission errors:

1. Check `claudelint` is installed: `which claudelint`
2. Install globally if needed: `npm install -g claude-code-lint`
3. Check PATH includes npm global bin directory

### Hook Doesn't Run

If SessionStart hook isn't triggering:

1. Verify `.claude/hooks/hooks.json` exists
2. Validate hook config: `/validate-all-hooks`
3. Check command syntax: `"claudelint check-all --format compact"`
4. Test command manually first

### Slow Performance

If validation is slow:

1. Use `--fast` mode: `/validate-all --fast`
2. Add large directories to `.claudelintignore`
3. Disable expensive rules in `.claudelintrc.json`
4. Check timing with `--verbose` flag

### False Positives

If you get warnings/errors that shouldn't apply:

1. Use inline disable comments: `<!-- claudelint-disable rule-name -->`
2. Configure rules in `.claudelintrc.json`
3. Add file overrides for specific patterns
4. Report issue if rule is incorrect

## Integration with Claude Workflows

### Before Committing

```bash
/format-cc
/validate-all --warnings-as-errors
```

### While Developing

```bash
/validate-all-skills --skill my-skill --explain
```

### For CI/CD

```bash
/validate-all --format json > validation-results.json
```

### Quick Status Check

```bash
/validate-all --format compact
```

## Performance

Plugin skills run the same claudelint CLI commands, so performance is identical:

| Project Size | Skills | Time      |
| ------------ | ------ | --------- |
| Small        | 5-10   | 20-40ms   |
| Medium       | 10-20  | 40-80ms   |
| Large        | 20-50  | 80-150ms  |
| Very Large   | 50+    | 150-300ms |

All skills complete quickly enough for interactive use.

## Uninstalling

To remove the plugin:

```bash
/plugin uninstall claudelint
```

To remove the marketplace:

```bash
/plugin marketplace remove pdugan20/claudelint
```

## See Also

- [Configuration Guide](/guide/configuration) - Customize validation rules
- [Hooks Validator](/validators/hooks) - Automatic validation
- [Rules Reference](/rules/overview) - What gets validated
- [CLI Reference](/guide/cli-reference) - All commands and flags
