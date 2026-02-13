# claudelint Plugin for Claude Code

Validate and optimize your Claude Code project files directly in conversation with Claude.

## What This Plugin Does

This plugin gives Claude the ability to check your Claude Code projects for errors, validate configurations, and help you fix issues - all through natural conversation. No need to remember command syntax or manually run validators.

**Simply ask Claude**: "Check my Claude Code project" or "Why isn't my skill loading?" and Claude will automatically run the right validators and explain any issues.

## Skills Included

### Validation Skills

- **validate-all** - Run all validators in one command
  - Validates CLAUDE.md, skills, settings, hooks, MCP servers, and plugin manifests
  - Use when: "check everything", "full audit", "validate my entire project"

- **validate-cc-md** - Check CLAUDE.md files for errors
  - Checks file size limits, @import directives, frontmatter, structure
  - Use when: "check my CLAUDE.md", "why is my CLAUDE.md too long"

- **validate-skills** - Validate skill files
  - Checks SKILL.md frontmatter, allowed-tools, file references, security
  - Use when: "check my skill", "why isn't my skill loading"

- **validate-plugin** - Validate plugin manifests
  - Checks plugin.json syntax, required fields, semantic versioning
  - Use when: "check my plugin config", "why isn't my plugin loading"

- **validate-mcp** - Validate MCP server configs
  - Checks .mcp.json files for transport types, server names, env vars
  - Use when: "check my MCP config", "why isn't my MCP working"

- **validate-settings** - Validate settings.json files
  - Checks schema, permissions, security, model names
  - Use when: "check my settings", "permission errors"

- **validate-hooks** - Validate hooks.json files
  - Checks hook events, types, matcher patterns, command references
  - Use when: "check my hooks", "why isn't my hook firing"

### Quality & Optimization

- **format-cc** - Format Claude Code files
  - Auto-fixes markdown, JSON, YAML with markdownlint and prettier
  - Analyzes shell scripts with shellcheck
  - Use when: "format my files", "clean up CLAUDE.md"

- **optimize-cc-md** - Interactively optimize CLAUDE.md files
  - Helps reduce file size, organize content, create @import files
  - Explains violations conversationally and asks before making changes
  - Use when: "my CLAUDE.md is too long", "optimize my config"

## Installation

### For Claude.ai Users

Install directly from GitHub:

```bash
/plugin install github:pdugan20/claudelint
```

**Note**: You must also install the npm package (see below) for the validators to work.

### For npm Users (Recommended)

1. Install the npm package in your project:

```bash
npm install --save-dev claude-code-lint
```

1. Install the plugin from your local package:

```bash
/plugin install --source ./node_modules/claude-code-lint
```

This gives you both the CLI commands and the Claude skills.

## Usage

### Natural Language

Simply ask Claude to validate your files:

- "Check my Claude Code project"
- "Validate my CLAUDE.md"
- "Why isn't my skill loading?"
- "Optimize my config"
- "Format my CLAUDE.md file"

Claude will automatically load the appropriate skill and run the right validators.

### Manual Skill Invocation

You can also invoke skills directly:

- `/claudelint:validate-all` - Run all validators
- `/claudelint:validate-cc-md` - Check CLAUDE.md
- `/claudelint:optimize-cc-md` - Optimize CLAUDE.md
- `/claudelint:format-cc` - Format files

## Requirements

This plugin requires the `claude-code-lint` npm package to be installed:

```bash
npm install --save-dev claude-code-lint
```

The plugin provides Claude with skills to help you, but the actual validation is done by the npm package's CLI commands. This is similar to how LSP plugins work (e.g., pyright-lsp requires pyright-langserver).

## CLI Usage

The npm package also provides CLI commands you can run directly:

```bash
# Validate everything
claudelint check-all

# Validate CLAUDE.md
claudelint validate-claude-md

# Validate skills
claudelint validate-skills

# And more...
```

See the [npm package README](https://github.com/pdugan20/claudelint#readme) for complete CLI documentation.

## What Gets Validated

- **CLAUDE.md files**: Size limits, @import directives, frontmatter, structure
- **Skills**: SKILL.md frontmatter, allowed-tools, security, file references
- **Plugins**: plugin.json schema, required fields, semantic versioning
- **MCP servers**: .mcp.json transport types, server names, environment variables
- **Settings**: settings.json schema, permissions, security, model names
- **Hooks**: hooks.json events, types, matcher patterns, commands
- **Agents**: AGENT.md frontmatter, tools, skills, system prompts
- **Output Styles**: Style files frontmatter, structure, guidelines

## Why Use This Plugin?

**Without this plugin:**

1. User: "How do I check my CLAUDE.md?"
2. Claude: "You can use claudelint..."
3. User: "How do I run it?"
4. Claude: "Try: claudelint validate-claude-md"
5. User: *runs command manually*

**With this plugin:**

1. User: "Check my CLAUDE.md"
2. Claude: *automatically runs validation and explains any issues*

**Result**: 75% reduction in steps, automatic execution, clear explanations.

## Support

- **Issues**: [GitHub Issues](https://github.com/pdugan20/claudelint/issues)
- **Documentation**: [Project README](https://github.com/pdugan20/claudelint#readme)
- **CLI Reference**: See npm package documentation

## License

MIT
