# Monorepo Example

This example demonstrates claudelint's monorepo support with config inheritance and workspace validation.

## Structure

```text
monorepo/
├── .claudelintrc.json              Root config (shared rules)
├── pnpm-workspace.yaml             Workspace definition
├── package.json                    Scripts
├── packages/
│   ├── app-1/
│   │   └── .claudelintrc.json     Extends root, stricter warnings
│   └── app-2/
│       └── .claudelintrc.json     Extends root, disables changelog
└── libs/
    └── shared/
        └── .claudelintrc.json     Extends root (no overrides)
```

## Features Demonstrated

### 1. Config Inheritance

All package configs extend the root config using `extends`:

```json
{
  "extends": "../../.claudelintrc.json",
  "rules": {
    "some-rule": "warn"
  }
}
```

### 2. Package-Specific Overrides

- app-1: Makes size warnings into errors
- app-2: Disables changelog requirement
- shared: Uses root config as-is

### 3. Workspace Validation

Run validation for specific packages or all packages.

## Usage

### Validate Entire Workspace

```bash
npm run lint
```

This runs `claudelint check-all --workspaces` to validate all packages.

### Validate Specific Package

```bash
npm run lint:app-1
```

```bash
npm run lint:app-2
```

```bash
npm run lint:shared
```

### Check Individual Package Directory

```bash
cd packages/app-1
claudelint check-all
```

This validates app-1 with its extended config (root + app-1 overrides).

## Configuration Merging

### Root Config

```json
{
  "rules": {
    "claude-md-size-error": "error",
    "claude-md-size-warning": "warn",
    "skill-missing-version": "error",
    "skill-missing-changelog": "warn"
  }
}
```

### app-1 Final Config (root + app-1)

```json
{
  "rules": {
    "claude-md-size-error": "error",
    "claude-md-size-warning": "error",
    "skill-missing-version": "error",
    "skill-missing-changelog": "warn"
  }
}
```

### app-2 Final Config (root + app-2)

```json
{
  "rules": {
    "claude-md-size-error": "error",
    "claude-md-size-warning": "warn",
    "skill-missing-version": "error",
    "skill-missing-changelog": "off"
  }
}
```

## Expected Output

```text
Validating 3 workspace packages

=== Package: app-1 ===
Checking CLAUDE.md files...
✓ All files valid

=== Package: app-2 ===
Checking CLAUDE.md files...
✓ All files valid

=== Package: shared ===
Checking CLAUDE.md files...
✓ All files valid

=== Workspace Summary ===
Total packages: 3
Failed packages: 0
Total errors: 0
Total warnings: 0
```

## Tips

1. Keep root config minimal with only shared rules
2. Override only when packages truly need different rules
3. Use `--workspace <name>` during development for faster feedback
4. Run `--workspaces` in CI to catch all issues
5. Document why packages override rules (add comments in JSON)
