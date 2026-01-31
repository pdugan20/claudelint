# Claude Code Plugin Usage Guide

This guide covers how to install and use claude-code-lint as a Claude Code plugin.

## Installation

### Add the Marketplace

First, add the claude-code-lint marketplace to your Claude Code:

```bash
/plugin marketplace add pdugan20/claude-code-lint
```

### Install the Plugin

Then install the claude-code-lint plugin:

```bash
/plugin install claude-code-lint
```

This makes all 8 claude-code-lint skills available as slash commands in your Claude Code sessions.

## Available Skills

Once installed, you can use these slash commands:

### `/validate` - Comprehensive Validation

Run all validators on your entire project:

```bash
/validate
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
/validate --verbose
/validate --explain
/validate --warnings-as-errors
/validate --format json
```

### `/validate-claude-md` - CLAUDE.md Validation

Validate only CLAUDE.md files:

```bash
/validate-claude-md
```

Checks:

- File size limits (30KB warning, 50KB error)
- @import directive syntax and existence
- Frontmatter in .claude/rules/ files
- Section organization

**Options:**

```bash
/validate-claude-md --path /path/to/CLAUDE.md
/validate-claude-md --explain
```

### `/validate-skills` - Skills Validation

Validate Claude Code skills:

```bash
/validate-skills
```

Checks:

- SKILL.md schema and frontmatter
- Security issues (dangerous commands, eval usage)
- Documentation (CHANGELOG, examples, README)
- Best practices (shebang, comments, naming)

**Options:**

```bash
/validate-skills --skill my-skill
/validate-skills --verbose
```

### `/validate-settings` - Settings Validation

Validate settings.json:

```bash
/validate-settings
```

Checks:

- JSON schema
- Permission rules
- Environment variables
- Model configuration

### `/validate-hooks` - Hooks Validation

Validate hooks.json:

```bash
/validate-hooks
```

Checks:

- Hook events and types
- Command scripts
- Matcher configuration

### `/validate-mcp` - MCP Server Validation

Validate .mcp.json configuration:

```bash
/validate-mcp
```

Checks:

- Server names and uniqueness
- Transport configuration (stdio/SSE)
- Variable expansion patterns
- Environment variables

### `/validate-plugin` - Plugin Manifest Validation

Validate plugin.json:

```bash
/validate-plugin
```

Checks:

- Manifest schema
- Semantic versioning
- Skill/agent/hook references

### `/format` - Format Claude Files

Auto-format Claude Code files:

```bash
/format
```

Runs:

- markdownlint on CLAUDE.md and .claude/\*_/_.md
- prettier on JSON/YAML files
- shellcheck on shell scripts

**Options:**

```bash
/format --check    # Check without making changes
/format --fix      # Fix issues (default)
/format --verbose  # Show detailed output
```

## Typical Workflows

### Quick Validation

Start a session and immediately check your project:

```bash
/validate
```

### Fix Formatting Issues

Before committing changes:

```bash
/format
/validate
```

### Debug Specific Component

If you're working on skills:

```bash
/validate-skills --verbose --explain
```

### Strict Mode for CI

Treat all warnings as errors:

```bash
/validate --warnings-as-errors --format json
```

## Configuration

The plugin respects your project's configuration files:

- `.claudelintrc.json` - Rule configuration
- `.claudelintignore` - Files to ignore
- `.claude/hooks/hooks.json` - Auto-validation hooks

See [configuration.md](./configuration.md) for details.

## Automatic Validation

Set up a SessionStart hook to validate automatically when Claude Code starts:

Create `.claude/hooks/hooks.json`:

```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "claude-code-lint check-all --format compact",
      "description": "Validate Claude Code project at session start"
    }
  ]
}
```

See [hooks.md](./hooks.md) for more hook examples.

## Troubleshooting

### Skills Don't Appear

If slash commands aren't available:

1. Check plugin is installed: `/plugin list`
2. Reinstall if needed: `/plugin uninstall claude-code-lint` then `/plugin install claude-code-lint`
3. Restart Claude Code session

### Validation Fails

If validation returns errors:

1. Run with `--explain` flag for detailed guidance
2. Check `.claudelintrc.json` for rule configuration
3. See error messages for specific line numbers and fixes
4. Review [validators.md](./validators.md) for rule details

### Permission Denied

If you get permission errors:

1. Check `claude-code-lint` is installed: `which claude-code-lint`
2. Install globally if needed: `npm install -g claude-code-lint`
3. Check PATH includes npm global bin directory

### Hook Doesn't Run

If SessionStart hook isn't triggering:

1. Verify `.claude/hooks/hooks.json` exists
2. Validate hook config: `/validate-hooks`
3. Check command syntax: `"claude-code-lint check-all --format compact"`
4. Test command manually first

### Slow Performance

If validation is slow:

1. Use `--fast` mode: `/validate --fast`
2. Add large directories to `.claudelintignore`
3. Disable expensive rules in `.claudelintrc.json`
4. Check timing with `--verbose` flag

### False Positives

If you get warnings/errors that shouldn't apply:

1. Use inline disable comments: `<!-- claude-code-lint-disable rule-name -->`
2. Configure rules in `.claudelintrc.json`
3. Add file overrides for specific patterns
4. Report issue if rule is incorrect

## Integration with Claude Workflows

### Before Committing

```bash
/format
/validate --warnings-as-errors
```

### While Developing

```bash
/validate-skills --skill my-skill --explain
```

### For CI/CD

```bash
/validate --format json > validation-results.json
```

### Quick Status Check

```bash
/validate --format compact
```

## Performance

Plugin skills run the same claude-code-lint CLI commands, so performance is identical:

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
/plugin uninstall claude-code-lint
```

To remove the marketplace:

```bash
/plugin marketplace remove pdugan20/claude-code-lint
```

## See Also

- [Configuration Guide](./configuration.md) - Customize validation rules
- [Hooks Guide](./hooks.md) - Automatic validation
- [Validators Documentation](./validators.md) - What gets validated
- [CLI Reference](../README.md#usage) - All commands and flags
