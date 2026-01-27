# Claude Validator

Comprehensive validation toolkit for Claude Code projects. Validates CLAUDE.md files, skills, settings, hooks, MCP servers, and more.

## Features

- **CLAUDE.md Validation** - Size limits, markdown formatting, import syntax
- **Skills Validation** - Frontmatter, structure, referenced files
- **Settings Validation** - JSON schema, permission rules, tool names
- **Hooks Validation** - Event names, script existence, configuration
- **MCP Server Validation** - Server names, commands, environment variables
- **Plugin Validation** - Manifest schema, directory structure, cross-references

## Installation

### As NPM Package

```bash
# Global installation
npm install -g @patdugan/claude-validator

# Project installation
npm install --save-dev @patdugan/claude-validator
```

### As Claude Code Plugin

```bash
# Add marketplace
/plugin marketplace add patdugan/claude-validator

# Install plugin
/plugin install claude-validator
```

## Usage

### CLI Usage

```bash
# Validate everything
claude-validator check-all

# Validate specific components
claude-validator check-claude-md
claude-validator validate-skills
claude-validator validate-settings
claude-validator validate-hooks
claude-validator validate-mcp

# With options
claude-validator check-all --verbose
claude-validator check-all --warnings-as-errors
claude-validator validate-skills --path .claude/skills
```

### As Claude Code Skill

```bash
# Validate everything
/validate

# Validate specific components
/validate-claude-md
/validate-skills
/validate-settings
```

### In Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
- repo: local
  hooks:
    - id: validate-claude-md
      name: Validate CLAUDE.md
      entry: npx claude-validator check-claude-md
      language: node
      files: '^CLAUDE\.md$|^\.claude/CLAUDE\.md$|^\.claude/rules/.*\.md$'
      pass_filenames: false

    - id: validate-claude-skills
      name: Validate Claude Skills
      entry: npx claude-validator validate-skills
      language: node
      files: '^\.claude/skills/.*\.md$'
      pass_filenames: false
```

### In npm Scripts

```json
{
  "scripts": {
    "validate:claude": "claude-validator check-all",
    "validate:claude:fix": "claude-validator check-all --auto-fix"
  }
}
```

## Validators

See [docs/validators.md](docs/validators.md) for detailed information about each validator.

## Development

See [docs/development.md](docs/development.md) for development setup and contributing guidelines.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for project phases and task tracking.

## License

MIT
