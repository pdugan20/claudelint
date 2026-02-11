# Monorepo Support - User Guide

Complete guide for using claudelint in monorepo projects.

## Overview

claudelint supports monorepos through:

1. **Config Inheritance**: Share configs across packages with `extends`
2. **Workspace Detection**: Auto-detect pnpm/npm/Yarn workspaces
3. **Scoped Validation**: Validate specific packages or all packages

## Quick Start

### 1. Setup Root Config

Create a shared config at your monorepo root:

```json
// .claudelintrc.json
{
  "rules": {
    "skill-missing-changelog": "warn",
    "claude-md-size-warning": "warn",
    "claude-md-size-error": "error"
  }
}
```

### 2. Extend in Packages

Each package can extend the root config:

```json
// packages/app-1/.claudelintrc.json
{
  "extends": "../../.claudelintrc.json",
  "rules": {
    "claude-md-size-warning": "off"  // Override for this package
  }
}
```

### 3. Validate

```bash
# Validate all packages from root
claudelint check-all

# Validate specific package
claudelint check-all --workspace app-1

# Validate each package independently
claudelint check-all --workspaces
```

## Config Inheritance

### Basic Usage

```json
// Root config
// .claudelintrc.json
{
  "rules": {
    "skill-missing-changelog": "warn"
  }
}

// Package config
// packages/app-1/.claudelintrc.json
{
  "extends": "../../.claudelintrc.json"
}
```

### Multiple Extends

Extend multiple configs (merged in order):

```json
{
  "extends": [
    "../../base.json",
    "../../strict-rules.json"
  ],
  "rules": {
    "custom-rule": "warn"
  }
}
```

Merge order: `base.json` → `strict-rules.json` → current file

### Node Modules Packages

Share configs via npm packages:

```bash
npm install --save-dev @acme/claudelint-config
```

```json
{
  "extends": "@acme/claudelint-config"
}
```

Or extend specific exports:

```json
{
  "extends": "@acme/claudelint-config/strict"
}
```

### Override Rules

Child configs override parent rules:

```json
// base.json
{
  "rules": {
    "claude-md-size-warning": "warn",
    "claude-md-size-error": "error"
  }
}

// child.json
{
  "extends": "./base.json",
  "rules": {
    "claude-md-size-warning": "off"  // Override
  }
}

// Result
{
  "rules": {
    "claude-md-size-warning": "off",   // Overridden
    "claude-md-size-error": "error"    // Inherited
  }
}
```

## Workspace Validation

### Supported Package Managers

**pnpm:**

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**npm:**

```json
// package.json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

**Yarn:**

```json
// package.json
{
  "workspaces": {
    "packages": [
      "packages/*",
      "apps/*"
    ]
  }
}
```

### Validate Specific Package

```bash
claudelint check-all --workspace my-app
```

Output:

```text
Validating workspace package: my-app
Path: /path/to/monorepo/packages/my-app

✓ Validated CLAUDE.md files (45ms)
✓ Validated skills (120ms)
✓ Validated settings (30ms)

No issues found
```

### Validate All Packages

```bash
claudelint check-all --workspaces
```

Output:

```text
Found 3 workspace packages

[app-1] Validating...
[app-1] No issues

[app-2] Validating...
[app-2] 2 errors, 1 warning

[shared] Validating...
[shared] No issues

==================================================
Workspace Validation Summary
==================================================
Total Packages: 3
Total Errors: 2
Total Warnings: 1
```

### With Other Flags

Combine workspace flags with other options:

```bash
# Specific package with verbose output
claudelint check-all --workspace app-1 --verbose

# All packages with strict mode
claudelint check-all --workspaces --strict

# Specific package with JSON output
claudelint check-all --workspace app-1 --format json
```

## Example Monorepo Structure

```text
my-monorepo/
├── pnpm-workspace.yaml          # Workspace config
├── .claudelintrc.json           # Root config (shared rules)
├── packages/
│   ├── app-1/
│   │   ├── .claudelintrc.json   # Extends root
│   │   └── .claude/
│   │       └── skills/
│   ├── app-2/
│   │   ├── .claudelintrc.json   # Extends root + custom rules
│   │   └── CLAUDE.md
│   └── shared/
│       ├── .claudelintrc.json   # Extends root
│       └── .claude/
└── apps/
    └── web/
        ├── .claudelintrc.json   # Extends root
        └── CLAUDE.md
```

### Root Config

```json
// .claudelintrc.json
{
  "rules": {
    "skill-missing-changelog": "warn",
    "skill-missing-version": "error",
    "claude-md-size-warning": "warn",
    "claude-md-size-error": "error"
  },
  "ignorePatterns": [
    "**/node_modules/**",
    "**/dist/**"
  ]
}
```

### Package Configs

**app-1 (standard rules):**

```json
// packages/app-1/.claudelintrc.json
{
  "extends": "../../.claudelintrc.json"
}
```

**app-2 (custom overrides):**

```json
// packages/app-2/.claudelintrc.json
{
  "extends": "../../.claudelintrc.json",
  "rules": {
    "claude-md-size-warning": "off",  // Disable for this package
    "skill-missing-tests": "warn"  // Add package-specific rule
  }
}
```

**shared (strict rules):**

```json
// packages/shared/.claudelintrc.json
{
  "extends": "../../.claudelintrc.json",
  "rules": {
    "skill-missing-changelog": "error",  // Stricter than root
    "skill-missing-tests": "error"
  }
}
```

## Common Patterns

### Pattern 1: Shared Base + Per-Package Overrides

```text
monorepo/
├── .claudelintrc.json           # Base rules for all packages
└── packages/
    ├── app-1/
    │   └── .claudelintrc.json   # Extends base
    └── app-2/
        └── .claudelintrc.json   # Extends base + overrides
```

**Use when:** You want consistent rules with minor per-package tweaks.

### Pattern 2: Multiple Shared Configs

```text
monorepo/
├── config/
│   ├── base.json                # Common rules
│   └── strict.json              # Strict rules
└── packages/
    ├── library/
    │   └── .claudelintrc.json   # Extends strict
    └── example/
        └── .claudelintrc.json   # Extends base only
```

**Use when:** Different package types need different rule sets.

### Pattern 3: Shareable Package

```text
monorepo/
├── packages/
│   ├── claudelint-config/
│   │   ├── package.json         # Shareable config package
│   │   └── index.json
│   ├── app-1/
│   │   └── .claudelintrc.json   # extends: "@acme/claudelint-config"
│   └── app-2/
│       └── .claudelintrc.json   # extends: "@acme/claudelint-config"
```

**Use when:** You want to publish your config to npm or share across repos.

## CI/CD Integration

### GitHub Actions

```yaml
name: Validate Claude Config

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm install -g claude-code-lint
      - run: claudelint check-all --workspaces
```

### Per-Package Validation

Validate only changed packages:

```yaml
- name: Get changed packages
  id: changed
  run: |
    PACKAGES=$(git diff --name-only origin/main | grep "^packages/" | cut -d/ -f2 | sort -u)
    echo "packages=$PACKAGES" >> $GITHUB_OUTPUT

- name: Validate changed packages
  run: |
    for pkg in ${{ steps.changed.outputs.packages }}; do
      echo "Validating $pkg..."
      claudelint check-all --workspace $pkg
    done
```

### Pre-commit Hook

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: claudelint-workspaces
        name: Validate Claude Config
        entry: npx claude-code-lint check-all --workspaces
        language: node
        pass_filenames: false
        files: '^(packages|apps)/.*\.(CLAUDE\.md|\.claudelintrc\.json|SKILL\.md)$'
```

## Troubleshooting

### Config Not Found

**Problem:**

```text
Extended config not found: ../../.claudelintrc.json
Resolved to: /path/to/config.json
```

**Solution:**

Check the relative path is correct:

```bash
# From packages/app-1/.claudelintrc.json
# ../../.claudelintrc.json should go up to monorepo root
ls ../../.claudelintrc.json
```

### Circular Dependency

**Problem:**

```text
Circular dependency detected in config extends:
  1. /path/to/a.json
  2. /path/to/b.json
  3. /path/to/a.json
```

**Solution:**

Remove the circular reference. Configs should extend in one direction only.

### Package Not Found

**Problem:**

```text
Package "my-app" not found in workspace.
Available packages:
  - app-1
  - app-2
```

**Solution:**

- Check package name matches directory name
- Verify workspace glob patterns include the package
- Run from monorepo root, not package directory

### No Workspace Detected

**Problem:**

```text
No workspace detected in current directory.
The --workspace flag requires a monorepo setup.
```

**Solution:**

- Ensure you're in the monorepo root directory
- Check `pnpm-workspace.yaml` or `package.json` workspaces exists
- Verify file syntax is valid (YAML/JSON)

### Rules Not Applied

**Problem:** Rules from extended config not being applied.

**Solution:**

Check the extend path and merge order:

```bash
# Debug config loading
claudelint check-all --debug-config
```

Output shows which config files are loaded and merged.

## Best Practices

### 1. Keep Root Config Minimal

Only include rules that apply to all packages:

```json
// .claudelintrc.json - Root config
{
  "rules": {
    "claude-md-size-error": "error",        // All packages
    "skill-missing-version": "error"  // All packages
  }
}
```

### 2. Document Package-Specific Rules

Add comments explaining why rules are overridden:

```json
// packages/examples/.claudelintrc.json
{
  "extends": "../../.claudelintrc.json",
  "rules": {
    // Examples are allowed to be larger than 5MB
    "claude-md-size-warning": "off"
  }
}
```

### 3. Use Shared Config Packages for Multi-Repo

If you have multiple monorepos, publish a shared config:

```bash
npm publish @acme/claudelint-config
```

Then use in all repos:

```json
{
  "extends": "@acme/claudelint-config"
}
```

### 4. Validate in CI/CD

Always validate all packages in CI:

```bash
claudelint check-all --workspaces
```

### 5. Use Workspace Flags in Scripts

Add npm scripts for convenience:

```json
// package.json (monorepo root)
{
  "scripts": {
    "lint:claude": "claudelint check-all --workspaces",
    "lint:claude:app1": "claudelint check-all --workspace app-1"
  }
}
```

## Migration from Single Repo

### Step 1: Create Root Config

Move your existing config to the root:

```bash
# If you have a config in a package
mv packages/app-1/.claudelintrc.json .claudelintrc.json
```

### Step 2: Add Extends to Packages

Create minimal configs that extend the root:

```bash
# For each package
echo '{ "extends": "../../.claudelintrc.json" }' > packages/app-1/.claudelintrc.json
```

### Step 3: Add Package-Specific Rules

Identify rules that should only apply to specific packages:

```json
// packages/library/.claudelintrc.json
{
  "extends": "../../.claudelintrc.json",
  "rules": {
    "skill-missing-changelog": "error"  // Library needs changelog
  }
}
```

### Step 4: Test

```bash
# Validate all packages
claudelint check-all --workspaces

# Validate one package at a time
claudelint check-all --workspace app-1
claudelint check-all --workspace app-2
```

## FAQ

### Q: Can I extend configs from parent directories?

**A:** Yes, use relative paths:

```json
{
  "extends": "../../.claudelintrc.json"
}
```

### Q: Can I extend multiple configs?

**A:** Yes, use an array:

```json
{
  "extends": ["./base.json", "./strict.json"]
}
```

They merge in order: first → second → current file.

### Q: Do I need a config in every package?

**A:** No. If a package doesn't have a config, claudelint searches parent directories (like ESLint).

### Q: Can I use extends without a monorepo?

**A:** Yes! `extends` works in any project:

```json
{
  "extends": "./configs/base.json"
}
```

### Q: What happens if extended config not found?

**A:** claudelint throws a helpful error with the resolved path and suggestions.

### Q: Can I extend configs from URLs?

**A:** Not yet. Only local paths and node_modules packages are supported.

### Q: Does this work with all package managers?

**A:** Yes. Workspace detection supports pnpm, npm, and Yarn.

### Q: Can I validate a package from within the package directory?

**A:** Yes, but use the normal command:

```bash
cd packages/app-1
claudelint check-all
```

The `--workspace` flag is only needed from the monorepo root.

## Examples Repository

See [`examples/monorepo/`](../../../examples/monorepo/) for a complete working example with:

- pnpm workspace setup
- Root config with shared rules
- Multiple packages extending root config
- Package-specific rule overrides
- CI/CD integration examples

## Support

- [GitHub Issues](https://github.com/pdugan20/claudelint/issues)
- [Documentation](https://github.com/pdugan20/claudelint/tree/main/docs)
- [Contributing Guide](https://github.com/pdugan20/claudelint/blob/main/CONTRIBUTING.md)
