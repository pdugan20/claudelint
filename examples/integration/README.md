# Integration Examples

This directory contains example configurations for using claudelint with complementary tools across all 3 tiers.

## Philosophy

claudelint follows the **separation of concerns** pattern used by successful linter ecosystems:

- **claudelint** - Claude-specific configuration validation
- **markdownlint** - Generic markdown structure
- **prettier** - Code formatting and whitespace
- **shellcheck** - Shell script bug detection
- **shfmt** - Shell script formatting
- **eslint** - Advanced JSON/YAML linting
- And more...

Each tool does one thing well, and they work together without conflicts.

## Files

### Tier 1: Critical (Must Have)

- `.markdownlint.json` - markdownlint configuration
- `.prettierrc.json` - Prettier configuration with Claude overrides
- `.shellcheckrc` - ShellCheck configuration
- `package.json` - npm scripts for validation (all tiers)

### Tier 2: Recommended

- `eslint.config.js` - ESLint configuration for JSON/YAML
- `.editorconfig` - Editor configuration (includes shfmt settings)

### Tier 3: Optional

- `.vale.ini` - Vale prose linting configuration (example in comments)
- `pyproject.toml` - Python black/ruff configuration (example in comments)

### Integration

- `.pre-commit-config.yaml` - Pre-commit hooks setup (all tiers)

## Setup

### Install Tools

```bash
# Install all tools
npm install --save-dev claude-code-lint markdownlint-cli prettier

# Or globally
npm install -g claude-code-lint markdownlint-cli prettier
```

### Copy Configuration Files

```bash
# Copy to your project root
cp examples/integration/.markdownlint.json .
cp examples/integration/.prettierrc.json .
cp examples/integration/.pre-commit-config.yaml .
```

### Add npm Scripts

Add the validation scripts to your `package.json`:

```json
{
  "scripts": {
    "lint:md": "markdownlint '**/*.md' --ignore node_modules",
    "format:check": "prettier --check '**/*.{md,json,yaml}'",
    "validate:claude": "claudelint check-all",
    "validate:all": "npm run lint:md && npm run format:check && npm run validate:claude"
  }
}
```

## Usage

### Validate All

```bash
npm run validate:all
```

This runs:

1. markdownlint - Checks generic markdown rules (H1 headings, blank lines, etc.)
2. prettier - Checks formatting and whitespace
3. claudelint - Validates Claude-specific configuration

### Fix Issues

```bash
# Fix markdown formatting
npm run lint:md:fix

# Fix code formatting
npm run format

# claudelint doesn't auto-fix (linter-only)
# Follow error messages to fix manually
```

### Pre-commit Hooks

Install pre-commit hooks to validate automatically:

```bash
pip install pre-commit
pre-commit install
```

Now validation runs automatically before each commit.

## CI/CD Integration

### GitHub Actions

```yaml
name: Validate

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run validate:all
```

### GitLab CI

```yaml
validate:
  script:
    - npm ci
    - npm run validate:all
```

## What Each Tool Validates

### markdownlint

- MD041 - First line must be H1 heading
- MD031 - Blank lines around code blocks
- MD032 - Blank lines around lists
- MD040 - Code fence language specification
- MD022 - Blank lines around headings

### prettier

- Consistent indentation (tabs vs spaces)
- Line length (configurable)
- Trailing commas
- Quote style
- Markdown prose wrapping

### claudelint

- CLAUDE.md file size limits (Claude context constraints)
- `@import` syntax and file existence
- Skill frontmatter schema
- Settings/hooks/MCP configuration
- Cross-reference integrity

## Why Not One Tool?

Combining all validation into one tool would:

- Sacrifice domain expertise
- Create performance overhead
- Limit user control
- Duplicate existing tools
- Increase maintenance burden

The complementary approach follows industry best practices used by ESLint + Prettier, markdownlint + Vale, and other successful ecosystems.
