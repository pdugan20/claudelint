# Strict Mode Example Configuration

Zero-tolerance claudelint configuration for maximum code quality.

## Files

- `.claudelintrc.json` - Strict rule configuration

## Philosophy

This is a **strict configuration** that:

- Treats **all violations as errors**
- Enables **maximum rules**
- Enforces **best practices**
- Detects **unused disable directives**
- **Zero warnings allowed** (`maxWarnings: 0`)

## Rules Enabled

All major rules enabled as errors:

### CLAUDE.md Rules

- `size-error` - File exceeds 40KB
- `size-warning` - File exceeds 35KB (treated as error)
- `import-missing` - Import points to non-existent file
- `import-circular` - Circular import dependencies

### Skills Rules

- `skill-missing-shebang` - Shell scripts need shebangs
- `skill-missing-comments` - Files need explanatory comments
- `skill-missing-changelog` - Skills need CHANGELOG.md
- `skill-missing-version` - Skills need version field
- `skill-dangerous-command` - Dangerous commands detected
- `skill-eval-usage` - Use of eval/exec detected
- `skill-path-traversal` - Path traversal vulnerability

### Configuration Rules

- `settings-invalid-schema` - Invalid settings schema
- `settings-invalid-permission` - Invalid permission rules
- `hooks-invalid-event` - Unknown hook event names
- `hooks-invalid-config` - Invalid hooks configuration
- `mcp-invalid-server` - Invalid MCP server config
- `plugin-invalid-manifest` - Invalid plugin manifest

## Special Features

### Unused Disable Detection

```json
"reportUnusedDisableDirectives": true
```

Warns about disable comments that don't suppress any violations:

```markdown
<!-- claudelint-disable-next-line size-error -->
Short line - Warning: unused disable directive!
```

### Zero Warnings Allowed

```json
"maxWarnings": 0
```

Any warning counts as a failure. Perfect for CI/CD pipelines.

## Usage

### Copy to Your Project

```bash
# Copy file
cp examples/strict/.claudelintrc.json .

# Test validation
claudelint check-all --strict
```

**Note:** Use `--strict` flag or the config will still allow warnings from validators that don't have rules configured.

### CI/CD Integration

```yaml
# .github/workflows/validate.yml
name: Validate

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @pdugan20/claudelint
      - run: claudelint check-all --strict
```

### npm Scripts

```json
{
  "scripts": {
    "lint": "claudelint check-all --strict",
    "lint:fix": "claudelint check-all --fix",
    "test": "npm run lint && <other tests>"
  }
}
```

## When to Use

**Use this configuration if:**

- Starting a **new project** from scratch
- Want **maximum code quality**
- CI/CD enforces **zero issues**
- Team values **strict standards**
- **Security-critical** project

**Don't use if:**

- Migrating existing project → Start with [basic config](../basic/)
- Team prefers gradual adoption → Use [basic config](../basic/)
- Want flexibility during development → Use basic config

## Relaxing Rules

If strict mode is too aggressive, selectively disable rules:

```json
{
  "rules": {
    "skill-missing-comments": "warn",   // Downgrade to warning
    "skill-missing-changelog": "off",   // Disable entirely
    "size-warning": "warn"              // Keep as warning, not error
  },
  "maxWarnings": 10  // Allow up to 10 warnings
}
```

## Auto-fix Support

Many rules support auto-fix:

```bash
# Preview fixes
claudelint check-all --fix-dry-run

# Apply fixes
claudelint check-all --fix

# Check results
claudelint check-all --strict
```

**Fixable rules:**

- `skill-missing-shebang` - Adds `#!/usr/bin/env bash`
- `skill-missing-version` - Adds `version: "1.0.0"`
- `skill-missing-changelog` - Creates CHANGELOG.md template

## Example Workflow

1. **Setup project** with strict config
2. **Run validation**: `claudelint check-all --strict`
3. **Auto-fix** what you can: `claudelint check-all --fix`
4. **Fix remaining** issues manually
5. **Validate again**: Should pass with zero issues
6. **Commit** and push (pre-commit hook runs automatically)
7. **CI validates** on pull request

## Comparison with Basic Mode

| Feature | Basic | Strict |
|---------|-------|--------|
| Rules as errors | 4 | 17 |
| Rules as warnings | 2 | 0 |
| Max warnings | Unlimited | 0 |
| Unused disables | Not checked | Checked |
| Best for | Migration | New projects |
| Fail on warnings | No | Yes |

## Migration from Basic

Gradually migrate from basic to strict:

```bash
# Start with basic
cp examples/basic/.claudelintrc.json .

# Fix all errors
claudelint check-all

# Upgrade warnings to errors one by one
# Edit .claudelintrc.json: "size-warning": "error"

# Eventually switch to strict config
cp examples/strict/.claudelintrc.json .
```
