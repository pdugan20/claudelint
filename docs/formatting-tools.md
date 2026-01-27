# Formatting Tools for Claude Code Projects

Complete guide to formatting and linting Claude-specific files using industry-standard tools.

## Philosophy

claudelint follows the **complementary tools pattern** where each tool does one thing well:

- **claudelint** - Claude-specific configuration validation
- **markdownlint** - Generic markdown structure
- **prettier** - Code formatting
- **shellcheck** - Shell script linting
- And more...

All configs are **scoped** to Claude files only (`.claude/`, `CLAUDE.md`) to avoid conflicts with your existing project formatters.

## File Type Coverage

| File Type             | Location                             | Linting             | Formatting | Tier |
| --------------------- | ------------------------------------ | ------------------- | ---------- | ---- |
| Markdown              | `CLAUDE.md`, `.claude/**/*.md`       | markdownlint        | prettier   | 1    |
| JSON                  | `.claude/**/*.json`, `.mcp.json`     | eslint-plugin-jsonc | prettier   | 1,2  |
| YAML                  | `.claude/**/*.{yaml,yml}`            | eslint-plugin-yml   | prettier   | 1,2  |
| Shell                 | `.claude/**/*.sh`, `.claude/hooks/*` | shellcheck          | shfmt      | 1,2  |
| Python                | `.claude/skills/**/*.py`             | ruff                | black      | 3    |
| JavaScript/TypeScript | `.claude/skills/**/*.{js,ts}`        | eslint              | prettier   | 3    |

## Tier 1: Critical (Must Have)

These tools provide the most value and should be used on all Claude projects.

### 1. markdownlint-config-claude

**What it does:** Validates markdown structure in CLAUDE.md and SKILL.md files.

**Installation:**

```bash
npm install --save-dev markdownlint-config-claude markdownlint-cli
```

**Usage (Scoped to Claude files):**

```json
// package.json
{
  "scripts": {
    "lint:md:claude": "markdownlint --config node_modules/markdownlint-config-claude 'CLAUDE.md' '.claude/**/*.md'"
  }
}
```

**Why NOT global config:**

Don't use this as your project-wide markdownlint config if you already have one. Run it as a separate command targeting only Claude files.

**Rules enforced:**

- MD041: First line must be H1 heading
- MD031: Blank lines around code blocks
- MD032: Blank lines around lists
- MD040: Code fence language specification
- MD022: Blank lines around headings
- MD024: No duplicate headings (siblings only)

### 2. prettier-config-claude

**What it does:** Formats markdown, JSON, and YAML in Claude files.

**Installation:**

```bash
npm install --save-dev prettier-config-claude prettier
```

**Usage (Scoped with overrides):**

```json
// .prettierrc.json
{
  "semi": true,
  "singleQuote": false,

  "overrides": [
    {
      "files": ["CLAUDE.md", ".claude/**/*.{md,json,yaml}"],
      "options": "prettier-config-claude"
    }
  ]
}
```

**Why overrides:**

This applies prettier-config-claude ONLY to Claude files, leaving your project's existing prettier settings intact.

**Settings:**

- `proseWrap: "preserve"` - Don't wrap markdown prose
- `printWidth: 100` - Wider line length for documentation
- `tabWidth: 2` - Consistent indentation

### 3. ShellCheck

**What it does:** Finds bugs, security issues, and bad practices in shell scripts.

**Installation:**

```bash
# macOS
brew install shellcheck

# npm (for CI/CD)
npm install --save-dev shellcheck
```

**Usage:**

```json
// package.json
{
  "scripts": {
    "lint:shell:claude": "shellcheck .claude/**/*.sh .claude/hooks/*"
  }
}
```

**Configuration (.shellcheckrc):**

```bash
# Disable specific warnings if needed
# SC2034: Variable appears unused
disable=SC2034

# Set shell dialect
shell=bash
```

**Common issues it catches:**

- Unquoted variables (can cause word splitting)
- Missing shebangs
- Useless use of cat
- Command injection vulnerabilities
- Portability issues

## Tier 2: Recommended (Should Have)

These tools add advanced capabilities for cleaner, more consistent code.

### 4. shfmt

**What it does:** Formats shell scripts with consistent style.

**Installation:**

```bash
# macOS
brew install shfmt

# npm
npm install --save-dev shfmt
```

**Usage:**

```json
// package.json
{
  "scripts": {
    "format:shell": "shfmt -w .claude/**/*.sh .claude/hooks/*",
    "format:shell:check": "shfmt -d .claude/**/*.sh .claude/hooks/*"
  }
}
```

**Configuration (.editorconfig):**

```ini
[*.sh]
# Google Shell Style Guide
indent_style = space
indent_size = 2
```

**What it formats:**

- Consistent indentation (2 spaces)
- Binary operator alignment
- Case statement formatting
- Function definition style

### 5. eslint-config-claude

**What it does:** Advanced JSON/YAML linting (key ordering, duplicate detection).

**Installation:**

```bash
npm install --save-dev eslint-config-claude
```

**Usage (Scoped with overrides):**

```javascript
// eslint.config.js
export default [
  // Your existing configs...

  // Claude-specific JSON linting
  {
    files: ['.claude/**/*.json', '.mcp.json', '.claude-plugin/**/*.json'],
    extends: ['claude/json'],
    rules: {
      'jsonc/key-name-casing': 'error',
      'jsonc/no-duplicate-keys': 'error',
      'jsonc/sort-keys': 'warn',
    },
  },

  // Claude-specific YAML linting
  {
    files: ['.claude/**/*.{yaml,yml}'],
    extends: ['claude/yaml'],
    rules: {
      'yml/no-duplicate-keys': 'error',
      'yml/sort-keys': 'warn',
    },
  },
];
```

**What it catches:**

- Duplicate JSON/YAML keys
- Inconsistent key naming (camelCase vs snake_case)
- Trailing commas in JSON
- Invalid YAML syntax
- Key ordering violations

## Tier 3: Optional (Nice to Have)

Advanced tools for specific use cases.

### 6. Vale (Prose Quality)

**When to use:** Documentation-heavy projects needing style guide enforcement.

**Installation:**

```bash
brew install vale
```

**Usage:**

```json
// package.json
{
  "scripts": {
    "lint:prose": "vale .claude/**/*.md CLAUDE.md"
  }
}
```

**Configuration (.vale.ini):**

```ini
StylesPath = .vale/styles
MinAlertLevel = suggestion

[*.md]
BasedOnStyles = Vale, Microsoft
```

**What it checks:**

- Spelling and grammar
- Style guide compliance (Microsoft, Google, etc.)
- Readability metrics
- Tone consistency

### 7. Python (black + ruff)

**When to use:** Projects with Python-based skills.

**Installation:**

```bash
pip install black ruff
```

**Usage:**

```json
// package.json
{
  "scripts": {
    "format:python": "black .claude/skills/**/*.py",
    "lint:python": "ruff check .claude/skills/**/*.py"
  }
}
```

**Configuration (pyproject.toml):**

```toml
[tool.black]
line-length = 100
target-version = ['py311']

[tool.ruff]
line-length = 100
select = ["E", "F", "I"]
```

### 8. TypeScript/JavaScript

**When to use:** Projects with JS/TS-based skills.

**Installation:**

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Usage:**

```javascript
// eslint.config.js
export default [
  {
    files: ['.claude/skills/**/*.{js,ts}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
  },
];
```

## The `claudelint format` Command

For convenience, claudelint provides a wrapper command that automatically scopes all formatting to Claude files.

**Installation:**

```bash
npm install --save-dev @pdugan20/claudelint markdownlint-config-claude prettier-config-claude
```

**Usage:**

```bash
# Check formatting (no changes)
claudelint format --check

# Fix formatting issues
claudelint format --fix
```

**What it runs:**

1. **markdownlint** on `.md` files with `markdownlint-config-claude`
2. **prettier** on `.md`, `.json`, `.yaml` files with `prettier-config-claude`
3. **shellcheck** on `.sh` files in `.claude/`

**Automatic file targeting:**

The command automatically targets:

- `CLAUDE.md` (project root)
- `.claude/**/*.md` (all markdown in .claude)
- `.claude/**/*.json` (settings, hooks, etc.)
- `.claude/**/*.yaml` (any YAML configs)
- `.claude/**/*.sh` (shell scripts)
- `.claude/hooks/*` (hook scripts)

No manual glob patterns needed!

## Complete Integration Example

Here's a complete setup using all Tier 1 tools:

```json
// package.json
{
  "scripts": {
    "lint:md:claude": "markdownlint --config node_modules/markdownlint-config-claude 'CLAUDE.md' '.claude/**/*.md'",
    "lint:shell:claude": "shellcheck .claude/**/*.sh .claude/hooks/*",
    "format:check": "prettier --check 'CLAUDE.md' '.claude/**/*.{md,json,yaml}'",
    "format:fix": "prettier --write 'CLAUDE.md' '.claude/**/*.{md,json,yaml}'",
    "validate:claude": "npm run lint:md:claude && npm run lint:shell:claude && npm run format:check && claudelint check-all",
    "validate:all": "npm run lint && npm run validate:claude"
  },
  "devDependencies": {
    "@pdugan20/claudelint": "^0.1.0",
    "markdownlint-config-claude": "^1.0.0",
    "prettier-config-claude": "^1.0.0",
    "shellcheck": "^0.9.0",
    "prettier": "^3.1.0",
    "markdownlint-cli": "^0.39.0"
  }
}
```

```json
// .prettierrc.json
{
  "semi": true,
  "singleQuote": false,
  "printWidth": 80,

  "overrides": [
    {
      "files": ["CLAUDE.md", ".claude/**/*.{md,json,yaml}"],
      "options": "prettier-config-claude"
    }
  ]
}
```

```yaml
# .pre-commit-config.yaml
repos:
  # Generic markdown
  - repo: https://github.com/igorshubovych/markdownlint-cli
    rev: v0.39.0
    hooks:
      - id: markdownlint
        files: '^(?!CLAUDE\.md|\.claude/).*\.md$'

  # Claude-specific markdown
  - repo: local
    hooks:
      - id: markdownlint-claude
        name: Lint Claude markdown
        entry: npx markdownlint --config node_modules/markdownlint-config-claude
        language: node
        files: '^(CLAUDE\.md|\.claude/.*\.md)$'

      - id: shellcheck-claude
        name: Lint Claude shell scripts
        entry: shellcheck
        language: system
        files: '^\.claude/.*\.sh$'

      - id: claudelint
        name: Validate Claude configuration
        entry: npx claudelint check-all
        language: node
        pass_filenames: false
        files: '^(CLAUDE\.md|\.claude/)'
```

## Avoiding Conflicts

### Problem: Multiple Configs

If you already have markdownlint or prettier configs for your project, you might worry about conflicts.

### Solution: Scoping

All our configs use **scoping** to apply only to Claude files:

**Prettier:** Use `overrides` array

```json
{
  "overrides": [
    {
      "files": ["CLAUDE.md", ".claude/**/*"],
      "options": "prettier-config-claude"
    }
  ]
}
```

**markdownlint:** Use separate commands

```bash
# Your project markdown
markdownlint '**/*.md' --ignore .claude

# Claude markdown
markdownlint 'CLAUDE.md' '.claude/**/*.md' --config markdownlint-config-claude
```

**Result:** Zero conflicts! Your project uses your configs, Claude files use Claude configs.

## Troubleshooting

### "markdownlint complains about my CLAUDE.md"

You're probably running markdownlint with your project config on CLAUDE.md. Use the separate command approach:

```bash
# Exclude Claude files from project linting
markdownlint '**/*.md' --ignore 'CLAUDE.md' --ignore '.claude'

# Lint Claude files separately
markdownlint 'CLAUDE.md' '.claude/**/*.md' --config node_modules/markdownlint-config-claude
```

### "Prettier formats differently in .claude/"

Make sure your override is configured correctly:

```json
{
  "overrides": [
    {
      "files": ["CLAUDE.md", ".claude/**/*.{md,json,yaml}"],
      "options": "prettier-config-claude" // NOT "extends"
    }
  ]
}
```

### "ShellCheck isn't finding my scripts"

Make sure you're using the correct glob pattern:

```bash
# This works
shellcheck .claude/**/*.sh .claude/hooks/*

# This doesn't (missing globstar)
shellcheck .claude/*.sh
```

## Next Steps

1. **Start with Tier 1** (markdownlint, prettier, shellcheck)
2. **Add Tier 2** if you have many shell scripts or complex JSON/YAML
3. **Consider Tier 3** only if you have language-specific skills (Python, JS/TS) or need prose quality checking

See [examples/integration/](../examples/integration/) for complete working examples.
