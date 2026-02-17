---
description: Configure claudelint for monorepos using config inheritance, workspace detection, and per-package validation with pnpm, npm, or Yarn workspaces.
---

# Monorepo Support

<script setup>
const faqItems = [
  { q: 'Can I use extends without workspaces?', a: 'Yes. Config inheritance works in any repository, not just monorepos.' },
  { q: 'Can I extend from npm packages?', a: 'Yes. Install the package and reference it by name in your config.' },
  { q: 'Do recursive extends work?', a: 'Yes. Configs can extend other configs that also use extends. Circular dependencies are detected and prevented.' },
  { q: 'Can I override inherited rules?', a: 'Yes. Rules in the child config always override rules from extended configs.' },
  { q: 'What if a package has no config?', a: 'claudelint searches up the directory tree for the nearest .claudelintrc.json file, just like ESLint.' },
  { q: 'Can I use --workspace without a monorepo?', a: 'No. The --workspace and --workspaces flags require a workspace configuration (pnpm-workspace.yaml or package.json workspaces).' },
  { q: 'How do ignore patterns merge?', a: 'Ignore patterns are concatenated and deduplicated. Both parent and child patterns apply.' },
  { q: 'Can I disable an inherited rule?', a: 'Yes. Set it to "off" in the child config.' },
]
</script>

claudelint provides full support for monorepo projects with workspace detection and configuration inheritance.

## File Discovery

claudelint recursively discovers files throughout your project tree, matching how Claude Code itself discovers CLAUDE.md files in monorepos:

| File Type | Discovery Pattern | Recursive? |
|-----------|------------------|------------|
| `CLAUDE.md` | `**/CLAUDE.md` | Yes |
| `CLAUDE.local.md` | `**/CLAUDE.local.md` | Yes |
| Rules | `.claude/rules/**/*.md` | Yes (within .claude/rules/) |
| Skills | `**/.claude/skills/*/SKILL.md` | Yes |
| Settings | `.claude/settings.json` | Root only |
| Hooks | `.claude/hooks/hooks.json` | Root only |
| MCP | `.mcp.json` | Root only |
| Agents | `.claude/agents/*/AGENT.md` | Root only |

This means `CLAUDE.md` files in subdirectories (e.g., `packages/api/CLAUDE.md`, `src/CLAUDE.md`) are automatically found and validated. Skills in nested `.claude/skills/` directories are also discovered, matching Claude Code's on-demand subdirectory skill loading.

## Quick Start

### 1. Config Inheritance

Share configuration across packages using the `extends` field:

```json
{
  "extends": "./base-config.json",
  "rules": {
    "claude-md-size": "warn"
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
  "extends": "../../.claudelintrc.json"
}
```

**Node modules packages:**

::: code-group

```json [Unscoped]
{
  "extends": "claudelint-config-standard"
}
```

```json [Scoped]
{
  "extends": "@company/claudelint-config"
}
```

:::

**Multiple extends:**

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

Each field type merges differently:

| Field | Strategy |
|-------|----------|
| `rules` | Deep merged (child can override specific rules) |
| `overrides` | Arrays concatenated (all overrides apply) |
| `ignorePatterns` | Arrays concatenated and deduplicated |
| `output` | Child completely replaces parent |
| Scalars | Child value wins |

### Example Monorepo Structure

```text
monorepo/
├── CLAUDE.md                   # Root project context
├── .claudelintrc.json          # Root config
├── pnpm-workspace.yaml
├── packages/
│   ├── app-1/
│   │   ├── CLAUDE.md           # Package-specific context
│   │   └── .claudelintrc.json  # Extends root
│   └── app-2/
│       ├── CLAUDE.md           # Package-specific context
│       └── .claudelintrc.json  # Extends root
└── libs/
    └── shared/
        ├── CLAUDE.md           # Package-specific context
        └── .claudelintrc.json  # Extends root
```

::: code-group

```json [Root config]
{
  "rules": {
    "claude-md-size": "warn",
    "skill-missing-version": "error"
  },
  "ignorePatterns": [
    "node_modules/**",
    "dist/**"
  ]
}
```

```json [App package]
{
  "extends": "../../.claudelintrc.json"
}
```

```json [Test utils (relaxed)]
{
  "extends": "../../.claudelintrc.json",
  "rules": {
    "claude-md-size": "warn"
  }
}
```

:::

## Workspace Detection

claudelint automatically detects monorepo workspaces from:

- pnpm-workspace.yaml (pnpm)
- package.json workspaces field (npm/Yarn)

### Supported Package Managers

::: code-group

```yaml [pnpm]
packages:
  - 'packages/*'
  - 'apps/*'
```

```json [npm]
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

```json [Yarn]
{
  "workspaces": {
    "packages": [
      "packages/*",
      "apps/*"
    ]
  }
}
```

:::

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
Checked 4 files across 3 categories (claude-md, settings, hooks) in 32ms. No problems found.

=== Package: app-2 ===
claude-md (28ms)

  src/CLAUDE.md (1 error)
     0  error  File exceeds 40KB limit (66669 bytes)  claude-md-size

Checked 3 files across 2 categories (claude-md, skills) in 28ms.
1 problem (1 error, 0 warnings)

=== Package: shared ===
Checked 2 files across 2 categories (claude-md, settings) in 18ms. No problems found.

=== Workspace Summary ===
Total packages: 3
Failed packages: 1
Total errors: 1
Total warnings: 0
```

The summary line for each package shows exactly which categories were validated and how many files were checked, giving you visibility into coverage across the monorepo.

## Troubleshooting

### No workspace detected

```text
Error: No workspace detected in current directory.
Workspace detection supports pnpm-workspace.yaml and package.json workspaces.
Please run this command from a monorepo root directory.
```

Solution: Run the command from your monorepo root (where pnpm-workspace.yaml or package.json with workspaces field exists).

### Package not found

```text
Error: Workspace package not found: my-pkg

Available packages:
- app-1
- app-2
- shared
```

Solution: Use the exact directory name of the package (shown in "Available packages" list).

### Extended config not found

```text
Error: Extended config not found: ./base.json
Resolved to: /path/to/base.json
Referenced from: /path/to/dir
```

Solution: Check that the relative path is correct and the file exists.

### Circular dependency

```text
Error: Circular dependency detected in config extends:
  1. /path/to/a.json
  2. /path/to/b.json
  3. /path/to/a.json
```

Solution: Remove the circular reference from your config extends chain.

## Migration Guide

**Upgrading existing monorepos:**

::: code-group

```text [Before]
packages/
├── app-1/.claudelintrc.json  (full config)
├── app-2/.claudelintrc.json  (full config)
└── shared/.claudelintrc.json (full config)
```

```text [After]
.claudelintrc.json              (shared rules)
packages/
├── app-1/.claudelintrc.json  (extends root)
├── app-2/.claudelintrc.json  (extends root)
└── shared/.claudelintrc.json (extends root)
```

:::

Steps:

1. Create root .claudelintrc.json with common rules
2. Update package configs to extend root:

   ```json
   {
     "extends": "../../.claudelintrc.json"
   }
   ```

3. Keep only package-specific overrides in child configs
4. Test with `claudelint check-all --workspaces`

**Backward compatibility:** All existing configs continue to work without changes. The `extends` field is optional, workspaces are auto-detected, and there are no breaking changes to existing functionality.

## Best Practices

1. **Keep root config minimal** - only shared rules
2. **Use extends for consistency** - avoid duplicating rules
3. **Override sparingly** - only when packages truly differ
4. **Test with --workspaces** - catch issues across all packages
5. **Version shared configs** - treat them like dependencies
6. **Document overrides** - explain why packages differ

## FAQ

<FaqList variant="divider" :items="faqItems" />

## Related Documentation

- [Configuration Reference](/guide/configuration)
- [Rules Reference](/rules/overview)
- [CLI Reference](/guide/cli-reference)
