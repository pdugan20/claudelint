# claudelint Documentation

Welcome to the claudelint documentation! claudelint is a comprehensive linter for Claude Code projects that helps you maintain high-quality, secure, and well-structured configurations.

## Quick Navigation

### Getting Started

- **[Getting Started Guide](./getting-started.md)** - Install and run your first validation
- **[CLI Reference](./cli-reference.md)** - Complete command documentation
- **[Configuration](./configuration.md)** - Configure rules and options

### User Guides

- **[Auto-fixing Issues](./auto-fix.md)** - Automatically fix common problems
- **[Caching for Performance](./caching.md)** - Speed up validation with smart caching
- **[Debugging Configuration](./debugging.md)** - Troubleshoot config issues
- **[Inline Disable Comments](./inline-disables.md)** - Fine-grained rule control

### Reference

- **[Rules Catalog](./rules/)** - Browse all 66 validation rules
  - [CLAUDE.md Rules](./rules/claude-md/)
  - [Skills Rules](./rules/skills/)
  - [Settings Rules](./rules/settings/)
  - [Hooks Rules](./rules/hooks/)
  - [MCP Rules](./rules/mcp/)
  - [Plugin Rules](./rules/plugin/)
- **[Validation Reference](./validation-reference.md)** - Understanding validation categories

### For Developers

- **[Architecture](./architecture.md)** - System design and components
- **[Contributing Rules](./contributing-rules.md)** - Write new validation rules
- **[Custom Rules](./custom-rules.md)** - Create custom validation rules

## Documentation by User Type

### New Users

1. Start with [Getting Started](./getting-started.md) to install and run your first validation
2. Review [Configuration](./configuration.md) to customize rules for your project
3. Browse the [Rules Catalog](./rules/) to understand what claudelint checks

### Daily Users

- **Quick reference**: [CLI Reference](./cli-reference.md) for all commands and flags
- **Troubleshooting**: [Debugging](./debugging.md) for common issues
- **Performance**: [Caching](./caching.md) to speed up validation

### Contributors

- **Understanding the codebase**: [Architecture](./architecture.md)
- **Adding rules**: [contributing-rules.md](./contributing-rules.md) - Complete guide to writing rules
- **Rule implementations**: See `src/rules/{category}/` for examples
- **Testing**: Run `npm test` to execute the test suite

### Custom Rule Developers

- **Create custom rules**: [Custom Rules Guide](./custom-rules.md)
- **Custom rule architecture**: See [Architecture - Custom Rules](./architecture.md#custom-rules)
- **Contributing built-in rules**: Use [contributing-rules.md](./contributing-rules.md) as your guide

## Common Tasks

### Running Validation

```bash
# Run all validators
claudelint check-all

# Strict mode (fail on any issue)
claudelint check-all --strict

# Limit warnings
claudelint check-all --max-warnings 5

# JSON output for CI
claudelint check-all --format json
```

### Auto-fixing Issues

```bash
# Preview fixes
claudelint check-all --fix-dry-run

# Apply fixes
claudelint check-all --fix

# Fix only errors
claudelint check-all --fix --fix-type errors
```

### Configuration Management

```bash
# Initialize configuration
claudelint init

# View resolved config
claudelint print-config

# Check config for specific file
claudelint resolve-config .claude/CLAUDE.md

# Validate config file
claudelint validate-config
```

### Performance Optimization

```bash
# Enable caching (default)
claudelint check-all

# Clear cache if stale
claudelint cache-clear

# Disable cache temporarily
claudelint check-all --no-cache
```

## Documentation Structure

Our documentation follows a progressive disclosure approach:

1. **Getting Started** - Quick installation and basic usage
2. **User Guides** - Task-oriented guides for specific features
3. **Reference** - Comprehensive command and rule documentation
4. **Architecture** - Deep dive into system design for contributors

This structure ensures you can find what you need quickly, whether you're just starting out or diving deep into the codebase.

## Features

- ** 66 Validation Rules** - Comprehensive checks across 10 categories
- ** Parallel Execution** - ~3.5x speedup from concurrent validators
- ** Smart Caching** - ~2.4x speedup with mtime-based caching
- ** Auto-fix** - Automatically fix common issues
- ** Progress Indicators** - Real-time feedback with timing
- ** Multiple Formats** - Stylish, JSON, and compact output
- ** Interactive Setup** - Configuration wizard with `claudelint init`
- ** Debug Tools** - Config debugging commands
- ** Per-rule Docs** - Detailed documentation for each rule
- ** Inline Disables** - Fine-grained control with comments
- ** Custom Rules** - Extend with your own validation rules

## Getting Help

- **Documentation Issues**: [Report on GitHub](https://github.com/pdugan20/claudelint/issues)
- **Questions**: Check [Debugging Guide](./debugging.md) or open an issue
- **Contributing**: See [Architecture](./architecture.md) for contributor info

## Version History

See [CHANGELOG.md](../CHANGELOG.md) for version history and release notes.
