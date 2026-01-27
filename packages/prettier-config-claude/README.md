# prettier-config-claude

Prettier configuration for Claude Code projects.

## What It Formats

This config provides sensible formatting defaults for Claude-specific files:

- **Markdown** (`.md`) - CLAUDE.md, SKILL.md, documentation
- **JSON** (`.json`) - settings.json, hooks.json, .mcp.json, plugin.json
- **YAML** (`.yaml`, `.yml`) - Frontmatter, config files

## Configuration

- `printWidth: 100` - Wider than default (80) for documentation
- `tabWidth: 2` - Consistent indentation
- `proseWrap: "preserve"` - Don't wrap markdown prose (Claude reads better unwrapped)
- `singleQuote: true` - Use single quotes in JSON/YAML where supported
- `trailingComma: "es5"` - Trailing commas in objects/arrays
- `endOfLine: "lf"` - Unix line endings

## Installation

```bash
npm install --save-dev prettier-config-claude prettier
```

## Usage

### Option 1: Claude Files Only (Recommended)

Use Prettier's `overrides` to apply this config ONLY to Claude files, avoiding conflicts with your existing Prettier setup:

```json
// .prettierrc.json
{
  "semi": false,
  "printWidth": 80,
  "singleQuote": false,

  "overrides": [
    {
      "files": ["CLAUDE.md", ".claude/**/*.{md,json,yaml}"],
      "options": "prettier-config-claude"
    }
  ]
}
```

This way:

- Your project files use your existing Prettier config
- Claude files use this config
- No conflicts!

### Option 2: Entire Project

If you want to use this config for your entire project:

```json
// package.json
{
  "prettier": "prettier-config-claude"
}
```

**Warning:** Only use this if you don't have an existing Prettier config.

### Option 3: Extend and Customize

```json
// .prettierrc.json
{
  "extends": "prettier-config-claude",
  "printWidth": 120
}
```

## Why Overrides?

Prettier's override system is perfect for applying different formatting to specific files. This is the same pattern used by major projects that need different formatting for different file types (e.g., prose vs code, frontend vs backend).

From [Prettier's documentation](https://prettier.io/docs/configuration):

> "Overrides let you have different configuration for certain file extensions, folders and specific files."

## npm Scripts

```json
{
  "scripts": {
    "format": "prettier --write '**/*.{md,json,yaml}'",
    "format:check": "prettier --check '**/*.{md,json,yaml}'",
    "format:claude": "prettier --write 'CLAUDE.md' '.claude/**/*.{md,json,yaml}'",
    "format:claude:check": "prettier --check 'CLAUDE.md' '.claude/**/*.{md,json,yaml}'"
  }
}
```

## Pre-commit Hook

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.1.0
    hooks:
      - id: prettier
        types_or: [markdown, json, yaml]
        files: '^(CLAUDE\.md|\.claude/)'
```

## What Files Should Use This?

Use this config for:

- `CLAUDE.md` (project root)
- `.claude/**/*.md` (all markdown in .claude)
- `.claude/settings.json` (settings)
- `.claude/hooks/hooks.json` (hooks)
- `.mcp.json` (MCP servers)
- `.claude-plugin/plugin.json` (plugin manifest)
- `marketplace.json` (marketplace metadata)
- Any YAML files in `.claude/`

Don't use this for:

- Project source code
- Project documentation
- Other project configuration files

## Integration with claudelint

This config is designed to work alongside [@pdugan20/claudelint](https://www.npmjs.com/package/@pdugan20/claudelint):

```bash
# Validate Claude-specific configuration
claudelint check-all

# Format Claude files
prettier --write 'CLAUDE.md' '.claude/**/*.{md,json,yaml}'

# Or use the convenience command
claudelint format --fix
```

## Configuration Precedence

When using overrides, Prettier applies configs in this order:

1. Base config (your project settings)
2. Override config (prettier-config-claude for matching files)

This ensures Claude files get the right formatting without affecting your project.

## Related Packages

- [@pdugan20/claudelint](https://www.npmjs.com/package/@pdugan20/claudelint) - Claude configuration validator
- [markdownlint-config-claude](https://www.npmjs.com/package/markdownlint-config-claude) - Markdownlint config for Claude files
- [eslint-config-claude](https://www.npmjs.com/package/eslint-config-claude) - ESLint config for Claude JSON/YAML

## License

MIT
