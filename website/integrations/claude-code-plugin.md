---
description: Install claudelint as a Claude Code plugin to access validation skills directly inside Claude Code sessions via slash commands.
---

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
/plugin install github:pdugan20/claudelint
```

### From Local Package

If you've installed the npm package, you can load the plugin from your local `node_modules`:

```bash
/plugin install --source ./node_modules/claude-code-lint
```

This gives you both the CLI commands and the Claude skills.

## Skills

Once installed, the plugin adds 9 skills that Claude can use automatically. Ask naturally or invoke directly with `/claudelint:<name>`.

### Validation

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin: 16px 0;">

<SkillCard
  name="validate-all"
  description="Runs every validator on your entire project — CLAUDE.md, skills, settings, hooks, MCP servers, and plugin manifests."
  example="Check my Claude Code project for issues"
/>

<SkillCard
  name="validate-cc-md"
  description="Checks CLAUDE.md file size, @import directives, frontmatter, and section organization."
  example="Is my CLAUDE.md ok?"
/>

<SkillCard
  name="validate-skills"
  description="Checks SKILL.md frontmatter, allowed-tools, file references, and shell script security."
  example="Why is my skill not loading?"
/>

<SkillCard
  name="validate-settings"
  description="Checks settings.json schema, permissions, and environment variables."
  example="Check my settings"
/>

<SkillCard
  name="validate-hooks"
  description="Checks hooks.json events, matcher patterns, and command script references."
  example="Why is my hook not firing?"
/>

<SkillCard
  name="validate-mcp"
  description="Checks .mcp.json transport types, server names, and environment variables."
  example="Validate my MCP config"
/>

<SkillCard
  name="validate-plugin"
  description="Checks plugin.json manifest schema, versioning, and component references."
  example="Check my plugin manifest"
/>

</div>

### Quality and Optimization

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin: 16px 0;">

<SkillCard
  name="format-cc"
  description="Auto-formats Claude Code files with markdownlint, prettier, and shellcheck."
  example="Format my Claude Code files"
/>

<SkillCard
  name="optimize-cc-md"
  description="Interactive workflow to reduce CLAUDE.md size, remove generic content, and organize @import files."
  example="My CLAUDE.md is too long, help me organize it"
/>

</div>

See the [CLI Reference](/guide/cli-reference) for all available flags when using slash commands directly.

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
