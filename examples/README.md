# claudelint Examples

Copy-pastable configurations for common use cases.

## Quick Start Examples

### Basic Configuration

**Location:** [`basic/`](./basic/)

Minimal, permissive configuration for getting started or migrating existing projects.

- Only critical rules enabled
- Most issues are warnings
- Good for gradual adoption

```bash
# Copy to your project
cp examples/basic/.claudelintrc.json .
cp examples/basic/.claudelintignore .
claudelint check-all
```

### Strict Configuration

**Location:** [`strict/`](./strict/)

Zero-tolerance configuration for maximum code quality.

- All major rules enabled as errors
- Zero warnings allowed (`maxWarnings: 0`)
- Unused disable directive detection
- Best for new projects

```bash
# Copy to your project
cp examples/strict/.claudelintrc.json .
claudelint check-all --strict
```

### Integration Examples

**Location:** [`integration/`](./integration/)

Complete setup with complementary tools (markdownlint, prettier, shellcheck).

- Pre-commit hooks
- CI/CD configurations
- npm scripts
- All tool tiers

```bash
# Copy all integration configs
cp examples/integration/.markdownlint.json .
cp examples/integration/.prettierrc.json .
cp examples/integration/.pre-commit-config.yaml .
```

## Examples Overview

| Example | Best For | Strictness | Rules | Warnings Allowed |
|---------|----------|------------|-------|------------------|
| [basic/](./basic/) | Migration, learning | Low | 6 | ✓ Unlimited |
| [strict/](./strict/) | New projects, CI/CD | High | 17 | ✗ Zero |
| [integration/](./integration/) | Complete setup | Medium | All tools | ✓ Per tool |

## Custom Rules

claudelint supports custom rules via the `.claudelint/rules/` directory. See the [Custom Rules Guide](https://github.com/pdugan20/claudelint/blob/main/website/development/custom-rules.md) for how to extend validation with project-specific checks.

## Test Fixtures

**Note:** `valid/` and `invalid/` directories contain test fixtures used by the test suite, not user-facing examples.

## Which Example Should I Use?

### Starting a New Project?

Use **[strict/](./strict/)** configuration.

- Start with high standards
- Catch issues early
- Clean codebase from day one

### Migrating Existing Project?

Use **[basic/](./basic/)** configuration.

- Fix critical issues first
- Gradually enable more rules
- Migrate to strict over time

### Need Tool Integration?

Use **[integration/](./integration/)** setup.

- Complete validation stack
- Pre-commit hooks
- CI/CD examples

## Usage Patterns

### Development Workflow

```bash
# 1. Initialize with basic config
cp examples/basic/.claudelintrc.json .
claudelint init --yes

# 2. Run validation
claudelint check-all

# 3. Auto-fix issues
claudelint check-all --fix

# 4. Fix remaining issues manually

# 5. Gradually tighten rules
# Edit .claudelintrc.json to enable more rules
```

### CI/CD Workflow

```bash
# Use strict mode in CI
claudelint check-all --strict --format json
```

### Pre-commit Workflow

```bash
# Install pre-commit
pip install pre-commit
cp examples/integration/.pre-commit-config.yaml .
pre-commit install

# Runs automatically on git commit
git commit -m "Update Claude files"
```

## Customization

All examples can be customized:

```json
{
  "rules": {
    "claude-md-size": "off",                    // Disable rule
    "claude-md-import-missing": "warn",         // Downgrade to warning
    "skill-missing-shebang": "error"  // Upgrade to error
  },
  "maxWarnings": 10,                  // Allow up to 10 warnings
  "reportUnusedDisableDirectives": true  // Check unused disables
}
```

See [Configuration Guide](../docs/configuration.md) for all options.

## More Information

- [CLI Reference](../docs/cli-reference.md) - All commands and flags
- [Configuration Guide](../docs/configuration.md) - Detailed config options
- [Rules Catalog](../docs/rules/) - All validation rules
- [Auto-fix Guide](../docs/auto-fix.md) - Using auto-fix safely
