# Getting Started

This guide will help you set up claude-code-lint in your Claude Code project.

## Installation

### Global Installation

````bash
npm install -g claude-code-lint
```text
### Project Installation

```bash
npm install --save-dev claude-code-lint
```text
### As Claude Code Plugin

```bash
/plugin marketplace add pdugan20/claude-code-lint
/plugin install claude-code-lint
```text
## Quick Start

### 1. Initialize Configuration

Run the interactive init wizard:

```bash
claude-code-lint init
```text
Or use defaults (non-interactive):

```bash
claude-code-lint init --yes
```text
This creates:

- `.claudelintrc.json` - Configuration file
- `.claudelintignore` - Ignore patterns
- npm scripts (if package.json exists)

### 2. Run Validation

```bash
# Validate everything
claude-code-lint check-all

# Or use npm script (if added by init)
npm run lint:claude
```text
### 3. Review Results

claude-code-lint will show validation results with:

- ✓ Success indicators
- ✗ Errors (exit code 1)
- ! Warnings (exit code 1)

Example output:

```text
✓ CLAUDE.md (13ms)
✓ All checks passed!

✓ Skills (18ms)
! Warning: Skill directory lacks CHANGELOG.md [missing-changelog]
  at: .claude/skills/my-skill
  Fix: touch .claude/skills/my-skill/CHANGELOG.md

✓ Settings (10ms)
✓ All checks passed!
```text
## Configuration

### Default Configuration

The init wizard creates this default configuration:

```json
{
  "rules": {
    "size-error": "error",
    "size-warning": "warn",
    "import-missing": "error",
    "skill-dangerous-command": "error",
    "skill-missing-changelog": "off"
  },
  "output": {
    "format": "stylish",
    "verbose": false
  }
}
```text
### Customize Rules

Edit `.claudelintrc.json` to customize:

```json
{
  "rules": {
    "size-error": "error",
    "size-warning": "off",
    "import-missing": "error",
    "skill-missing-changelog": "warn"
  },
  "output": {
    "format": "compact",
    "verbose": true
  },
  "maxWarnings": 10
}
```text
See [Configuration](configuration.md) for all options.

### List Available Rules

```bash
claude-code-lint list-rules
claude-code-lint list-rules --category Skills
```text
## Common Workflows

### Local Development

```bash
# Run validation
claude-code-lint check-all

# Run with verbose output
claude-code-lint check-all --verbose

# Fail on any issues (warnings or errors)
claude-code-lint check-all --strict
```text
### CI/CD Integration

```yaml
# .github/workflows/lint.yml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g claude-code-lint
      - run: claude-code-lint check-all
```text
### Pre-commit Hook

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: claude-code-lint
        name: Validate Claude Configuration
        entry: npx claude-code-lint check-all
        language: node
        pass_filenames: false
        files: '^(CLAUDE\.md|\.claude/)'
```text
### Package.json Scripts

```json
{
  "scripts": {
    "lint:claude": "claude-code-lint check-all",
    "lint:claude:fix": "claude-code-lint format --fix",
    "lint:all": "npm run lint:claude && npm run lint:md",
    "precommit": "npm run lint:claude"
  }
}
```text
## Next Steps

1. **Explore validators** - See [Validators](validators.md) for detailed information
2. **Configure rules** - See [Configuration](configuration.md) for all options
3. **Integrate tools** - See [Formatting Tools](formatting-tools.md) for complementary tools
4. **Use as plugin** - See [Plugin Usage](plugin-usage.md) for Claude Code integration
5. **Set up hooks** - See [Hooks](hooks.md) for automatic validation

## Troubleshooting

### Command Not Found

```bash
# If globally installed
which claude-code-lint

# If locally installed
npx claude-code-lint check-all

# Or use full path
./node_modules/.bin/claude-code-lint check-all
```text
### Config File Not Found

claude-code-lint searches for config starting from current directory:

```bash
# Specify config explicitly
claude-code-lint check-all --config /path/to/.claudelintrc.json

# Or cd to project root
cd /path/to/project
claude-code-lint check-all
```text
### Too Many Warnings

Configure rules or use `--max-warnings`:

```bash
# Allow up to 10 warnings
claude-code-lint check-all --max-warnings 10

# Or disable specific rules in .claudelintrc.json
{
  "rules": {
    "skill-missing-changelog": "off"
  }
}
```text
### False Positives

Use inline disable comments:

```markdown
<!-- claude-code-lint-disable-next-line import-missing -->
@import non-existent-file.md
```text
See [Configuration](configuration.md#inline-disable-comments) for more options.

## Getting Help

- **Documentation**: [docs/](.)
- **Issues**: [GitHub Issues](https://github.com/pdugan20/claude-code-lint/issues)
- **Examples**: [examples/](../examples/)
- **Changelog**: [CHANGELOG.md](../CHANGELOG.md)
````
