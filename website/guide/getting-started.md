# Getting Started

claudelint is a comprehensive linter for Claude Code projects. It validates CLAUDE.md files, skills, settings, hooks, MCP servers, plugins, and more.

## Installation

```bash
npm install -g claude-code-lint
```

## Quick Start

```bash
# Initialize configuration
claudelint init

# Validate your project
claudelint check-all
```

## What Gets Validated

claudelint checks 10 different aspects of your Claude Code project:

- **CLAUDE.md** - File size, imports, paths, content structure
- **Skills** - Names, descriptions, security, versioning
- **Settings** - Permissions, environment variables
- **Hooks** - Event types, script references
- **MCP Servers** - Transport types, URLs, environment variables
- **Plugins** - Manifest structure, component references
- **Agents** - Names, descriptions, tools, models
- **LSP** - Transport config, language IDs, extensions
- **Output Styles** - Name validation
- **Commands** - Migration checks

## Configuration

Create a `.claudelintrc.json` in your project root:

```json
{
  "rules": {
    "claude-md-size-error": "error",
    "skill-name": "error",
    "skill-description": "warning"
  }
}
```

See the [Rules Overview](/guide/rules-overview) for all available rules.
