# Claude Code Plugin

This guide covers how to install and use claudelint as a Claude Code plugin.

## Installation

The plugin's skills run claudelint CLI commands under the hood. You must install the npm package first:

<CodeTabs :tabs="[
  { label: 'npm', code: 'npm install --save-dev claude-code-lint' },
  { label: 'yarn', code: 'yarn add --dev claude-code-lint' },
  { label: 'pnpm', code: 'pnpm add -D claude-code-lint' },
]" />

See [Getting Started](/guide/getting-started) for full installation options.

### From GitHub

Install directly from GitHub:

```bash
/plugin install github:pdugan20/claude-code-lint
```

### From Local Package

If you've installed the npm package, you can load the plugin from your local `node_modules`:

```bash
/plugin install --source ./node_modules/claude-code-lint
```

This gives you both the CLI commands and the Claude skills.

## Available Skills

Once installed, 9 skills are available as namespaced slash commands:

### Validation Skills

**`/claudelint:validate-all`** — Run all validators on your entire project.

Checks CLAUDE.md files, skills, settings, hooks, MCP servers, and plugin manifests.

```bash
/claudelint:validate-all
/claudelint:validate-all --verbose
/claudelint:validate-all --explain
/claudelint:validate-all --warnings-as-errors
```

**`/claudelint:validate-cc-md`** — Validate CLAUDE.md files.

Checks file size limits (35KB warning, 40KB error), `@import` directives, frontmatter in `.claude/rules/` files, and section organization.

```bash
/claudelint:validate-cc-md
/claudelint:validate-cc-md --path /path/to/CLAUDE.md
/claudelint:validate-cc-md --explain
```

**`/claudelint:validate-skills`** — Validate skill definitions.

Checks SKILL.md frontmatter, allowed-tools, file references, security issues (dangerous commands, eval usage), and documentation quality.

```bash
/claudelint:validate-skills
/claudelint:validate-skills --verbose
```

**`/claudelint:validate-settings`** — Validate settings.json files.

Checks JSON schema, permission rules, environment variables, and model configuration.

**`/claudelint:validate-hooks`** — Validate hooks.json files.

Checks hook events, types (command, prompt, agent), matcher patterns, and command script references.

**`/claudelint:validate-mcp`** — Validate .mcp.json configuration.

Checks server names, transport types (stdio, SSE, HTTP, WebSocket), environment variables, and variable expansion patterns.

**`/claudelint:validate-plugin`** — Validate plugin.json manifests.

Checks manifest schema, semantic versioning, required fields, and component references.

### Quality and Optimization

**`/claudelint:format-cc`** — Auto-format Claude Code files.

Runs markdownlint on CLAUDE.md and `.claude/**/*.md`, prettier on JSON/YAML files, and shellcheck on shell scripts.

```bash
/claudelint:format-cc
/claudelint:format-cc --check    # Check without making changes
/claudelint:format-cc --verbose
```

**`/claudelint:optimize-cc-md`** — Interactively optimize CLAUDE.md files.

Helps reduce file size, organize content, and create `@import` files. Explains violations conversationally and asks before making changes.

## Workflows

### Quick Validation

Start a session and immediately check your project:

```bash
/claudelint:validate-all
```

Or just ask Claude naturally — "check my Claude Code project" or "validate my CLAUDE.md" — and Claude will automatically invoke the right skill.

### Fix Formatting Issues

Before committing changes:

```bash
/claudelint:format-cc
/claudelint:validate-all
```

### Debug a Specific Component

If you're working on skills:

```bash
/claudelint:validate-skills --verbose --explain
```

### Strict Mode for CI

Treat all warnings as errors:

```bash
/claudelint:validate-all --warnings-as-errors --format json
```

## Automatic Validation

Set up a SessionStart hook to validate automatically when Claude Code starts.

Create `.claude/hooks/hooks.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "claudelint check-all --format compact"
          }
        ]
      }
    ]
  }
}
```

See [Claude Code Hooks](/integrations/pre-commit) for more hook examples.

## Configuration

The plugin respects your project's configuration files:

- `.claudelintrc.json` — Rule configuration
- `.claudelintignore` — Files to ignore

See the [Configuration Guide](/guide/configuration) for details.

## Troubleshooting

### Skills Don't Appear

If slash commands aren't available:

1. Check plugin is installed: `/plugin list`
2. Reinstall if needed: `/plugin uninstall claudelint` then reinstall
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

### False Positives

If you get warnings/errors that shouldn't apply:

1. Use inline disable comments: `<!-- claudelint-disable rule-name -->`
2. Configure rules in `.claudelintrc.json`
3. Add file overrides for specific patterns
4. Report issue if rule is incorrect

## Uninstalling

To remove the plugin:

```bash
/plugin uninstall claudelint
```

## See Also

- [Configuration Guide](/guide/configuration) - Customize validation rules
- [Claude Code Hooks](/integrations/pre-commit) - Automatic validation hooks
- [Rules Reference](/rules/overview) - What gets validated
- [CLI Reference](/guide/cli-reference) - All commands and flags
