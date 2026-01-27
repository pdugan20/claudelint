# eslint-config-claude

ESLint configuration for advanced JSON/YAML linting in Claude Code projects.

## What It Does

This config provides advanced linting for JSON and YAML files using:

- **eslint-plugin-jsonc** - JSON/JSONC linting
- **eslint-plugin-yml** - YAML linting

**What it catches:**

- Duplicate keys in JSON/YAML
- Inconsistent key naming (camelCase vs kebab-case)
- Key ordering violations
- Trailing commas in JSON
- Inconsistent indentation
- Quote style violations
- Spacing issues

## Installation

```bash
npm install --save-dev eslint-config-claude eslint
```

Dependencies are automatically installed:

- `eslint-plugin-jsonc`
- `eslint-plugin-yml`
- `jsonc-eslint-parser`
- `yaml-eslint-parser`

## Usage

### Option 1: Claude Files Only (Recommended)

Use ESLint overrides to apply this config ONLY to Claude files:

```javascript
// eslint.config.js
export default [
  // Your existing project configs...

  // Claude-specific JSON linting
  {
    files: ['.claude/**/*.json', '.mcp.json', '.claude-plugin/**/*.json'],
    ...require('eslint-config-claude/json')
  },

  // Claude-specific YAML linting
  {
    files: ['.claude/**/*.{yaml,yml}'],
    ...require('eslint-config-claude/yaml')
  }
];
```

### Option 2: Separate Configs

Import just JSON or YAML if you only need one:

```javascript
// eslint.config.js
export default [
  // JSON only
  {
    files: ['.claude/**/*.json'],
    ...require('eslint-config-claude/json')
  }
];
```

### Option 3: Entire Project (Legacy)

If using the old ESLint config format (`.eslintrc.json`):

```json
{
  "extends": ["eslint-config-claude"]
}
```

## Rules

### JSON Rules

- `jsonc/key-name-casing` - Enforce camelCase or kebab-case
- `jsonc/no-duplicate-keys` - Prevent duplicate keys
- `jsonc/sort-keys` - Alphabetical key ordering (warning)
- `jsonc/no-trailing-comma` - No trailing commas
- `jsonc/quotes` - Double quotes
- `jsonc/indent` - 2 spaces

### YAML Rules

- `yml/no-duplicate-keys` - Prevent duplicate keys
- `yml/sort-keys` - Alphabetical key ordering (warning)
- `yml/no-empty-mapping-value` - No empty values
- `yml/indent` - 2 spaces
- `yml/quotes` - Single quotes (prefer)
- `yml/block-mapping` - Use block style

## npm Scripts

```json
{
  "scripts": {
    "lint:json:claude": "eslint '.claude/**/*.json' '.mcp.json'",
    "lint:yaml:claude": "eslint '.claude/**/*.{yaml,yml}'",
    "lint:claude": "npm run lint:json:claude && npm run lint:yaml:claude"
  }
}
```

## What Files Should Use This?

Use this config for:

- `.claude/settings.json`
- `.claude/settings.local.json`
- `.claude/hooks/hooks.json`
- `.mcp.json`
- `.claude-plugin/plugin.json`
- `marketplace.json`
- Any YAML files in `.claude/`

Don't use this for:

- Project `package.json` (use your project's ESLint config)
- Project TypeScript/JavaScript (use your project's ESLint config)
- Other project configuration files

## Integration with claudelint

This config is designed to work alongside [@pdugan20/claudelint](https://www.npmjs.com/package/@pdugan20/claudelint):

```bash
# Validate Claude-specific configuration
claudelint check-all

# Advanced JSON/YAML linting
eslint '.claude/**/*.json' '.claude/**/*.{yaml,yml}'

# Format with prettier
prettier --write '.claude/**/*.{json,yaml}'
```

## Customization

You can override specific rules:

```javascript
// eslint.config.js
export default [
  {
    files: ['.claude/**/*.json'],
    ...require('eslint-config-claude/json'),
    rules: {
      'jsonc/sort-keys': 'off',  // Disable key sorting
      'jsonc/key-name-casing': ['error', { camelCase: true }]  // Only camelCase
    }
  }
];
```

## Why This Over Prettier?

Prettier handles formatting (spacing, indentation), but doesn't validate:

- Duplicate keys
- Key naming consistency
- Structural issues
- Semantic correctness

This config complements Prettier by adding semantic validation.

## Tier 2 Tool

This is a **Tier 2 (Recommended)** tool in the claudelint ecosystem:

- **Tier 1 (Critical)**: markdownlint, prettier, shellcheck
- **Tier 2 (Recommended)**: eslint-config-claude, shfmt
- **Tier 3 (Optional)**: Vale, black/ruff, TypeScript

Use this if you have complex JSON/YAML configs and want advanced validation.

## Related Packages

- [@pdugan20/claudelint](https://www.npmjs.com/package/@pdugan20/claudelint) - Claude configuration validator
- [markdownlint-config-claude](https://www.npmjs.com/package/markdownlint-config-claude) - Markdownlint config
- [prettier-config-claude](https://www.npmjs.com/package/prettier-config-claude) - Prettier config

## License

MIT
