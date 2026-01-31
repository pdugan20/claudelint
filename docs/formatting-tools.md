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

## Using `claudelint format`

The simplest way to format Claude files is with the built-in `claudelint format` command.

**Installation:**

```bash
npm install --save-dev claudelint
```

**Usage:**

```bash
# Check formatting (no changes)
claudelint format --check

# Fix formatting issues
claudelint format --fix
```

**What it runs:**

1. **markdownlint** on `.md` files
2. **prettier** on `.md`, `.json`, `.yaml` files
3. **shellcheck** on `.sh` files (if installed)

**File targeting:**

The command automatically targets Claude-specific files:

- `CLAUDE.md`
- `.claude/**/*.md`
- `.claude/**/*.json`
- `.claude/**/*.yaml`
- `.claude/**/*.sh`
- `.claude/hooks/*`

## Customizing Formatter Configs

Users can override the default formatting rules by creating config files in their project root.

### Customizing Markdownlint

Create `.markdownlint.json`:

```json
{
  "default": true,
  "MD013": false,
  "MD033": {
    "allowed_elements": ["kbd", "br"]
  },
  "MD041": true,
  "MD031": true,
  "MD032": true,
  "MD040": true,
  "MD022": true
}
```

`claudelint format` will automatically use this config.

**Recommended rules for Claude files:**

- MD041: First line must be H1 heading
- MD031: Blank lines around code blocks
- MD032: Blank lines around lists
- MD040: Code fence language specification
- MD022: Blank lines around headings
- MD024: No duplicate headings (siblings only)

### Customizing Prettier

Create `.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "proseWrap": "preserve"
}
```

`claudelint format` will automatically use this config.

**Recommended settings for Claude files:**

- `proseWrap: "preserve"` - Don't wrap markdown prose
- `printWidth: 100` - Wider line length for documentation
- `endOfLine: "lf"` - Consistent line endings
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

### 5. ESLint for JSON/YAML (Advanced)

**What it does:** Advanced JSON/YAML linting (key ordering, duplicate detection).

**Installation:**

```bash
npm install --save-dev eslint eslint-plugin-jsonc eslint-plugin-yml
```

**Usage (Scoped with overrides):**

```javascript
// eslint.config.js
export default [
  // Your existing configs...

  // Claude-specific JSON linting
  {
    files: ['.claude/**/*.json', '.mcp.json', '.claude-plugin/**/*.json'],
    plugins: ['jsonc'],
    parser: 'jsonc-eslint-parser',
    rules: {
      'jsonc/key-name-casing': 'error',
      'jsonc/no-duplicate-keys': 'error',
      'jsonc/sort-keys': 'warn',
    },
  },

  // Claude-specific YAML linting
  {
    files: ['.claude/**/*.{yaml,yml}'],
    plugins: ['yml'],
    parser: 'yaml-eslint-parser',
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

## Integration with Package Scripts

Add these to your `package.json` for easy access:

```json
{
  "scripts": {
    "lint:claude": "claudelint check-all",
    "format:claude": "claudelint format --fix",
    "format:claude:check": "claudelint format --check"
  }
}
```

Then run:

```bash
npm run lint:claude      # Validate Claude configurations
npm run format:claude    # Format Claude files
- `.claude/hooks/*` (hook scripts)

No manual glob patterns needed!

## Complete Integration Example

Here's a complete setup using all Tier 1 tools:

```json
// package.json
{
  "scripts": {
    "lint:claude": "claudelint check-all",
    "format:claude": "claudelint format --fix",
    "format:claude:check": "claudelint format --check",
    "validate:claude": "npm run lint:claude && npm run format:claude:check",
    "validate:all": "npm run lint && npm run validate:claude"
  },
  "devDependencies": {
    "claudelint": "^0.2.0-beta.0",
    "markdownlint-cli": "^0.39.0",
    "prettier": "^3.1.0"
  }
}
```

Optionally customize formatting by creating `.markdownlint.json`:

```json
{
  "default": true,
  "MD013": false,
  "MD041": true,
  "MD031": true,
  "MD032": true,
  "MD040": true,
  "MD022": true
}
```

And `.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "proseWrap": "preserve"
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

  # Claude-specific validation and formatting
  - repo: local
    hooks:
      - id: claudelint
        name: Validate Claude configuration
        entry: npx claudelint check-all
        language: node
        pass_filenames: false
        files: '^(CLAUDE\.md|\.claude/)'

      - id: claudelint-format
        name: Format Claude files
        entry: npx claudelint format --check
        language: node
        pass_filenames: false
        files: '^(CLAUDE\.md|\.claude/)'
```

## Avoiding Conflicts

### Problem: Multiple Configs

If you already have markdownlint or prettier configs for your project, you might worry about conflicts with Claude files.

### Solution: Use claudelint format

The `claudelint format` command automatically scopes to Claude files only:

```bash
# Format your project files (uses your configs)
npm run format

# Format Claude files (uses .markdownlint.json and .prettierrc.json)
claudelint format --fix
```

**Result:** Zero conflicts! The `claudelint format` command only touches:

- `CLAUDE.md`
- `.claude/**/*.md`
- `.claude/**/*.json`
- `.claude/**/*.yaml`
- `.claude/**/*.sh`

## Troubleshooting

### "markdownlint complains about my CLAUDE.md"

Exclude Claude files from your project-wide linting:

```bash
# In package.json
{
  "scripts": {
    "lint:md": "markdownlint '**/*.md' --ignore 'CLAUDE.md' --ignore '.claude'"
  }
}
```

Then use `claudelint format` for Claude files.

### "Prettier formats differently in .claude/"

Make sure you're using `claudelint format` for Claude files, not your project's prettier command:

```bash
# Wrong: Uses project prettier config on Claude files
prettier --write '**/*.md'

# Right: Uses .prettierrc.json for Claude files only
claudelint format --fix
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
