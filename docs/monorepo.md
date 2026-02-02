# Monorepo Support

claudelint provides full support for monorepo projects with workspace detection and configuration inheritance.

## Quick Start

### 1. Config Inheritance

Share configuration across packages using the `extends` field:

```json
{
  "extends": "./base-config.json",
  "rules": {
    "claude-md-size-error": "warn"
  }
}
```

### 2. Workspace Validation

Validate specific packages or all packages in your monorepo:

```bash
claudelint check-all --workspace my-package

claudelint check-all --workspaces
```

## Configuration Inheritance

### Basic Usage

Create a base configuration that child packages can extend:

```json
{
  "extends": "../.claudelintrc.json",
  "rules": {
    "skill-missing-version": "error"
  }
}
```

### Supported Formats

**Relative paths:**

```json
{
  "extends": "./base.json"
}
```

```json
{
  "extends": "../../root-config.json"
}
```

**Node modules packages:**

```json
{
  "extends": "claudelint-config-standard"
}
```

```json
{
  "extends": "@company/claudelint-config"
}
```

**Multiple extends (array):**

```json
{
  "extends": ["./base.json", "./strict.json"]
}
```

### Merge Behavior

When extending configs, claudelint merges configurations in this order:

1. Base config (first in extends array)
2. Additional extended configs (in order)
3. Current config (overrides everything)

**Rules:** Deep merged (child can override specific rules)

**Overrides:** Arrays concatenated (all overrides apply)

**Ignore Patterns:** Arrays concatenated and deduplicated

**Output:** Child completely overrides parent

**Scalars:** Child value wins

### Example Monorepo Structure

```text
monorepo/
├── .claudelintrc.json          # Root config
├── pnpm-workspace.yaml
├── packages/
│   ├── app-1/
│   │   └── .claudelintrc.json  # Extends root
│   └── app-2/
│       └── .claudelintrc.json  # Extends root
└── libs/
    └── shared/
        └── .claudelintrc.json  # Extends root
```

**Root config** (.claudelintrc.json):

```json
{
  "rules": {
    "claude-md-size-error": "error",
    "skill-missing-version": "error"
  },
  "ignorePatterns": [
    "node_modules/**",
    "dist/**"
  ]
}
```

**Package config** (packages/app-1/.claudelintrc.json):

```json
{
  "extends": "../../.claudelintrc.json",
  "rules": {
    "claude-md-size-error": "warn"
  }
}
```

## Workspace Detection

claudelint automatically detects monorepo workspaces from:

- pnpm-workspace.yaml (pnpm)
- package.json workspaces field (npm/Yarn)

### Supported Package Managers

**pnpm:**

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**npm:**

```json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

**Yarn:**

```json
{
  "workspaces": {
    "packages": [
      "packages/*",
      "apps/*"
    ]
  }
}
```

### CLI Flags

**Validate specific package:**

```bash
claudelint check-all --workspace my-package
```

This finds the workspace package with directory name `my-package` and runs validation only for that package.

**Validate all packages:**

```bash
claudelint check-all --workspaces
```

This runs validation for every package in the workspace and aggregates results.

**Output:**

```text
Validating 3 workspace packages

=== Package: app-1 ===
Checking CLAUDE.md files...
✓ All files valid

=== Package: app-2 ===
Checking CLAUDE.md files...
Warning: 1 warning found

=== Package: shared ===
Checking CLAUDE.md files...
All files valid

=== Workspace Summary ===
Total packages: 3
Failed packages: 1
Total errors: 0
Total warnings: 1
```

## Troubleshooting

### Error: No workspace detected

```text
Error: No workspace detected in current directory.
Workspace detection supports pnpm-workspace.yaml and package.json workspaces.
Please run this command from a monorepo root directory.
```

**Solution:** Run the command from your monorepo root (where pnpm-workspace.yaml or package.json with workspaces field exists).

### Error: Workspace package not found

```text
Error: Workspace package not found: my-pkg

Available packages:
- app-1
- app-2
- shared
```

**Solution:** Use the exact directory name of the package (shown in "Available packages" list).

### Error: Extended config not found

```text
Error: Extended config not found: ./base.json
Resolved to: /path/to/base.json
Referenced from: /path/to/dir
```

**Solution:** Check that the relative path is correct and the file exists.

### Error: Circular dependency detected

```text
Error: Circular dependency detected in config extends:
  1. /path/to/a.json
  2. /path/to/b.json
  3. /path/to/a.json
```

**Solution:** Remove the circular reference from your config extends chain.

## FAQ

### Can I use extends without workspaces?

Yes! Config inheritance works in any repository, not just monorepos.

### Can I extend from npm packages?

Yes! Install the package and reference it:

```bash
npm install --save-dev @company/claudelint-config
```

```json
{
  "extends": "@company/claudelint-config"
}
```

### Does extends work recursively?

Yes! Configs can extend other configs that also use extends. Circular dependencies are detected and prevented.

### Can I override inherited rules?

Yes! Rules in the child config always override rules from extended configs.

### What happens if I don't specify a config in a package?

claudelint searches up the directory tree for the nearest .claudelintrc.json file, just like ESLint.

### Can I use --workspace with non-monorepo projects?

No. The --workspace and --workspaces flags require a workspace configuration (pnpm-workspace.yaml or package.json workspaces).

### How do I ignore patterns in extended configs?

Ignore patterns are concatenated and deduplicated. Both parent and child patterns apply.

### Can I disable a rule that's enabled in the base config?

Yes! Set it to "off" in the child config:

```json
{
  "extends": "./base.json",
  "rules": {
    "some-rule": "off"
  }
}
```

## Migration Guide

### Upgrading Existing Monorepos

**Before (duplicated config in each package):**

```text
packages/
├── app-1/.claudelintrc.json  (full config)
├── app-2/.claudelintrc.json  (full config)
└── shared/.claudelintrc.json (full config)
```

**After (shared config with extends):**

```text
.claudelintrc.json              (shared rules)
packages/
├── app-1/.claudelintrc.json  (extends root)
├── app-2/.claudelintrc.json  (extends root)
└── shared/.claudelintrc.json (extends root)
```

**Steps:**

1. Create root .claudelintrc.json with common rules
2. Update package configs to extend root:

   ```json
   {
     "extends": "../../.claudelintrc.json"
   }
   ```

3. Keep only package-specific overrides in child configs
4. Test with `claudelint check-all --workspaces`

### Backward Compatibility

- All existing configs continue to work without changes
- `extends` field is optional
- Workspaces are auto-detected (no config changes needed)
- No breaking changes to existing functionality

## Examples

### Example: Strict for Apps, Relaxed for Tests

**Root config:**

```json
{
  "rules": {
    "claude-md-size-error": "error"
  }
}
```

**App package:**

```json
{
  "extends": "../../.claudelintrc.json"
}
```

**Test utilities package:**

```json
{
  "extends": "../../.claudelintrc.json",
  "rules": {
    "claude-md-size-error": "warn"
  }
}
```

### Example: Shared Company Config

**Publish shared config:**

```json
{
  "name": "@company/claudelint-config",
  "version": "1.0.0",
  "main": "index.json"
}
```

**index.json:**

```json
{
  "rules": {
    "claude-md-size-error": "error",
    "skill-missing-version": "error",
    "skill-missing-changelog": "error"
  }
}
```

**Use in projects:**

```bash
npm install --save-dev @company/claudelint-config
```

```json
{
  "extends": "@company/claudelint-config",
  "rules": {
    "claude-md-size-error": "warn"
  }
}
```

## Best Practices

1. **Keep root config minimal** - only shared rules
2. **Use extends for consistency** - avoid duplicating rules
3. **Override sparingly** - only when packages truly differ
4. **Test with --workspaces** - catch issues across all packages
5. **Version shared configs** - treat them like dependencies
6. **Document overrides** - explain why packages differ

## Related Documentation

- [Configuration Reference](./configuration.md)
- [Rules Reference](./rules.md)
- [CLI Reference](./cli.md)
