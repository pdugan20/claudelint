---
description: Install claudelint as a Claude Code plugin to access validation skills directly inside Claude Code sessions via slash commands.
---

# Claude Code Plugin

This guide covers how to install and use claudelint as a Claude Code plugin.

## Installation

### Prerequisites

The plugin's skills run claudelint CLI commands under the hood. Install the npm package first:

<CodeTabs :tabs="[
  { label: 'Global (recommended)', code: 'npm install -g claude-code-lint' },
  { label: 'Project only', code: 'npm install --save-dev claude-code-lint' },
]" />

**Global** makes `claudelint` available in every project. **Project-local** pins a version for your team via `package.json`. See [Global vs Project Install](#global-vs-project-install) for help choosing.

### From the Marketplace

1. Add the marketplace (one-time setup):

   ```text
   /plugin marketplace add pdugan20/claudelint
   ```

2. Install the plugin:

   ```text
   /plugin install claudelint@pdugan20-plugins
   ```

Choose your installation scope when prompted:

- **User scope** (default, recommended) — available in all your projects
- **Project scope** — shared with collaborators via `.claude/settings.json`
- **Local scope** — only you, only this repo

### Team Setup

To pre-configure the plugin for all collaborators, commit this to `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "pdugan20-plugins": {
      "source": {
        "source": "github",
        "repo": "pdugan20/claudelint"
      }
    }
  },
  "enabledPlugins": {
    "claudelint@pdugan20-plugins": true
  }
}
```

When a collaborator opens Claude Code in this project, they will be prompted to install the plugin.

### Local Development / Testing

For plugin contributors, load the plugin directly:

```bash
claude --plugin-dir ./node_modules/claude-code-lint
```

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

## Global vs Project Install

| Scenario | npm Install | Plugin Scope |
|----------|------------|--------------|
| Individual developer, all projects | `npm install -g` | User scope |
| Team project, pinned version | `npm install --save-dev` | Project scope |
| Trying it out | `npm install --save-dev` | Local scope |

- **Global npm + User scope** is the simplest setup. Install once and claudelint works everywhere.
- **Local npm + Project scope** gives teams a pinned version. Add `claude-code-lint` to `devDependencies` and commit `.claude/settings.json` so everyone gets the same setup.

## Keeping Up to Date

Third-party marketplace plugins do not auto-update by default. You have two options:

**Enable auto-update** (recommended):

```text
/plugin > Marketplaces > pdugan20-plugins > Enable auto-update
```

**Manual update**:

```text
/plugin marketplace update pdugan20-plugins
```

Plugin updates and npm package updates are independent. When upgrading, update both:

```bash
# Update npm package
npm install -g claude-code-lint@latest
# or for project-local:
npm install --save-dev claude-code-lint@latest
```

```text
# Update plugin (inside Claude Code)
/plugin marketplace update pdugan20-plugins
```

The SessionStart hook will warn you if the plugin version and npm package version are out of sync.

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

### Skills Work in One Project but Not Another

If skills work in some projects but fail in others, the npm package is likely installed locally (in `node_modules`) rather than globally. Either:

1. Install globally: `npm install -g claude-code-lint`
2. Or add `claude-code-lint` to `devDependencies` in each project

### Version Mismatch Warning

If you see `[claudelint] Version mismatch: plugin=X, CLI=Y` when starting a session, the plugin and npm package versions are out of sync. Update the npm package:

```bash
npm install -g claude-code-lint@latest
```

### Auto-Update Not Working

Third-party marketplaces have auto-update disabled by default. Enable it:

```text
/plugin > Marketplaces > pdugan20-plugins > Enable auto-update
```

Or update manually: `/plugin marketplace update pdugan20-plugins`

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
