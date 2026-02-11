# Basic Example Configuration

Minimal claudelint configuration for getting started.

## Files

- `.claudelintrc.json` - Basic rule configuration
- `.claudelintignore` - Standard ignore patterns

## Philosophy

This is a **permissive configuration** that:

- Enables only critical error rules
- Treats most issues as warnings
- Focuses on functionality over style
- Good for starting projects or migrating existing projects

## Rules Enabled

### Errors (fail validation)

- `size-error` - CLAUDE.md exceeds 40KB limit
- `import-missing` - @import points to non-existent file
- `skill-dangerous-command` - Dangerous shell commands detected
- `settings-invalid-schema` - Settings file doesn't match schema

### Warnings (non-blocking)

- `size-warning` - CLAUDE.md approaching size limit (35KB)
- `skill-missing-shebang` - Shell script missing shebang

## Usage

### Copy to Your Project

```bash
# Copy files
cp examples/basic/.claudelintrc.json .
cp examples/basic/.claudelintignore .

# Test validation
claudelint check-all
```

### Customize

Edit `.claudelintrc.json` to adjust rules:

```json
{
  "rules": {
    "claude-md-size-warning": "off",           // Disable this rule
    "claude-md-import-missing": "warn",         // Downgrade to warning
    "skill-missing-shebang": "error"  // Upgrade to error
  }
}
```

## Next Steps

### Gradually Tighten Rules

As your project matures, enable more rules:

1. Start with this basic config
2. Fix all errors
3. Enable warning rules as errors
4. Add style rules (missing-comments, naming-inconsistent, etc.)
5. Eventually move to [strict mode](../strict/)

### Add More Rules

Browse available rules:

```bash
claudelint list-rules
```

See detailed rule documentation:

```bash
# Opens docs for specific rule
open docs/rules/skills/missing-shebang.md
```

### Integration

Add to `package.json`:

```json
{
  "scripts": {
    "lint": "claudelint check-all",
    "lint:fix": "claudelint check-all --fix"
  }
}
```

Add to pre-commit hooks:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: claudelint
        name: Validate Claude files
        entry: claudelint check-all
        language: system
        pass_filenames: false
```

## When to Use

**Use this configuration if:**

- Just starting with claudelint
- Migrating existing project
- Want to fix critical issues first
- Team prefers gradual adoption

**Don't use if:**

- Starting new project from scratch → Use [strict mode](../strict/)
- Want maximum validation → Use [strict mode](../strict/)
- CI/CD requires zero warnings → Use strict mode with `--max-warnings 0`
