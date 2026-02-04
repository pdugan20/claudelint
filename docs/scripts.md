# NPM Scripts Reference

This document explains the npm scripts available in this project and how they're organized.

## Quick Reference

### Most Common Commands

```bash
# Development
npm run dev              # Watch mode compilation
npm run build            # Build TypeScript

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode testing

# Quality Checks
npm run lint             # Run all linters (TS, MD, package.json)
npm run lint:fix         # Auto-fix all lint issues
npm run format           # Format all code
npm run check            # Run common validation checks
npm run validate         # Full validation (lint + format + build + test)

# Release
npm run release          # Create a release
npm run release:dry      # Preview release changes
```

## Script Organization

Scripts are organized into **logical groups** with **alphabetical sorting within each group**.

### Pattern

1. **Aggregate scripts first** - Top-level commands (e.g., `lint`, `check`, `test`)
2. **Sub-commands alphabetically** - Specific variants (e.g., `lint:md`, `lint:pkg`, `lint:ts`)
3. **Modifiers after base** - Fix/check variants (e.g., `lint:ts`, `lint:ts:fix`)

## Available Scripts

### Generate

Code generation scripts:

- `generate:json-schemas` - Generate JSON schemas from Zod
- `generate:schema-rules` - Generate schema-based rules
- `generate:types` - Generate rule type definitions

### Build & Dev

- `build` - Compile TypeScript to dist/
- `dev` - Watch mode compilation
- `clean` - Remove dist/ folder
- `prebuild` - Pre-build hook (runs generate:types)

### Test

- `test` - Run all tests with Jest
- `test:watch` - Watch mode testing
- `test:validators` - Test validators specifically
- `test:schemas` - Test schemas specifically
- `test:skills:automated` - Automated skill tests
- `test:skills:structure` - Skill structure validation
- `test:skills:cli` - CLI command tests
- `test:skills:metadata` - Skill metadata tests
- `test:skills:manual` - Manual test instructions

### Lint

**Aggregates:**

- `lint` - **Run all linters** (TypeScript + Markdown + package.json)
- `lint:fix` - **Auto-fix all lint issues**

**TypeScript:**

- `lint:ts` - ESLint for TypeScript
- `lint:ts:fix` - Auto-fix TypeScript issues

**Markdown:**

- `lint:md` - Markdownlint for all .md files
- `lint:md:fix` - Auto-fix markdown issues

**package.json:**

- `lint:pkg` - Validate package.json structure
- `lint:pkg:quiet` - Validate package.json (quiet mode)

### Format

- `format` - Format all code (TypeScript + JSON)
- `format:check` - Check formatting without changes

### Check

**Aggregates:**

- `check` - **Common checks** (emojis, logger, publint)
- `check:all` - **All comprehensive checks**

**Specific checks:**

- `check:consistency` - Check consistency
- `check:constants` - Verify ToolNames and ModelNames constants
- `check:deadcode` - Dead code detection (knip)
- `check:deadcode:production` - Production dead code only
- `check:emojis` - Check for emoji usage violations
- `check:file-naming` - Validate file naming conventions
- `check:links` - Check documentation links
- `check:links:all` - Check all links with remark
- `check:logger-spacing` - Logger formatting checks
- `check:logger-usage` - Logger usage validation
- `check:model-names` - Verify ModelNames constant
- `check:publint` - Package publishing validation
- `check:rule-coverage` - Rule test coverage
- `check:rule-docs` - Rule documentation checks
- `check:rule-docs-audit` - Audit rule documentation
- `check:rule-ids` - Validate rule IDs
- `check:rule-implementations` - Verify rule implementations exist
- `check:rule-option-docs` - Rule option documentation
- `check:rule-option-interfaces` - Rule option interfaces
- `check:rule-structure` - Rule structure validation (1:1:1 mapping)
- `check:schema-sync` - Schema synchronization check
- `check:schemas` - Schema validation
- `check:tool-names` - Verify ToolNames constant

### Validate

- `validate` - **Quick validation** (lint + format:check + build + test)
- `validate:all` - **Complete validation** (includes all checks)

### Release

- `release` - Create a standard release
- `release:alpha` - Create alpha pre-release
- `release:beta` - Create beta pre-release
- `release:rc` - Create release candidate
- `release:patch` - Patch version bump (0.2.0 → 0.2.1)
- `release:minor` - Minor version bump (0.2.0 → 0.3.0)
- `release:major` - Major version bump (0.2.0 → 1.0.0)
- `release:dry` - Dry run (preview changes, no commit/publish)

### Sync

- `sync:versions` - Sync versions across all files
- `sync:versions:check` - Check version sync status

### Setup & Lifecycle

- `setup:hooks` - Install git hooks (husky)
- `postinstall` - Post-installation hook (runs setup:hooks)
- `prepublishOnly` - Pre-publish hook (runs build)

## Common Workflows

### During Development

```bash
# Start development
npm run dev

# In another terminal, run tests
npm run test:watch
```

### Before Committing

```bash
# Quick check
npm run lint
npm run format

# Or comprehensive
npm run validate
```

### Before Creating PR

```bash
# Full validation
npm run validate:all

# If issues found
npm run lint:fix
npm run format
```

### Before Release

```bash
# Preview what will happen
npm run release:dry

# Check everything is ready
npm run validate:all

# Create release
npm run release
```

## Script Naming Conventions

All scripts follow these conventions:

### Namespaces

- `generate:*` - Code generation
- `build`, `dev`, `clean` - Build operations
- `test:*` - Testing
- `lint:*` - Linting/static analysis
- `format:*` - Code formatting
- `check:*` - Validation checks
- `validate:*` - Composite validation
- `release:*` - Release management
- `sync:*` - Version synchronization

### Modifiers

- `:fix` - Auto-fix issues (e.g., `lint:ts:fix`)
- `:check` - Check only, no changes (e.g., `format:check`)
- `:watch` - Watch mode (e.g., `test:watch`)
- `:all` - Run all variations (e.g., `check:all`)
- `:dry` - Dry run, no changes (e.g., `release:dry`)

### Aggregates First

Within each group, aggregate scripts (that run multiple tasks) appear first:

```json
{
  "lint": "npm-run-all --parallel lint:*",      // Aggregate first
  "lint:fix": "npm-run-all --parallel lint:*:fix",
  "lint:md": "markdownlint ...",                 // Specifics alphabetically
  "lint:pkg": "npmPkgJsonLint ...",
  "lint:ts": "eslint ..."
}
```

## Tools Used

### Linting & Formatting

- **ESLint** - TypeScript linting (`lint:ts`)
- **Prettier** - Code formatting (`format`)
- **markdownlint** - Markdown linting (`lint:md`)
- **npm-package-json-lint** - package.json validation (`lint:pkg`)

### Validation

- **publint** - Package publishing validation (`check:publint`)
- **knip** - Dead code detection (`check:deadcode`)
- **Custom scripts** - Project-specific checks (`check:*`)

### Testing

- **Jest** - Unit and integration testing (`test`)
- **Custom validators** - Skill and structure validation (`test:skills:*`)

### Release

- **release-it** - Automated releases (`release`)
- **Conventional Changelog** - CHANGELOG generation

### Script Composition

- **npm-run-all2** - Run multiple scripts in parallel or series

## Adding New Scripts

When adding new scripts, follow the pattern:

1. **Identify the group** (generate, test, lint, check, etc.)
2. **If it's an aggregate**, put it first in the group
3. **Otherwise**, insert alphabetically within the group
4. **Follow the naming pattern**: `namespace:specific:modifier`

**Example - Adding YAML linting:**

```json
{
  "scripts": {
    "lint": "npm-run-all --parallel lint:ts lint:md lint:pkg lint:yaml",
    "lint:fix": "npm-run-all --parallel lint:*:fix",
    "lint:md": "...",
    "lint:md:fix": "...",
    "lint:pkg": "...",
    "lint:ts": "...",
    "lint:ts:fix": "...",
    "lint:yaml": "yamllint .",           // ← Insert alphabetically
    "lint:yaml:fix": "yamllint . --fix"
  }
}
```

## Pre-commit Hooks

The following scripts run automatically on `git commit` via husky:

1. **lint-staged** - Lints and formats only staged files
2. **check:emojis** - Checks for emoji violations
3. **check:logger-spacing** - Validates logger formatting
4. **check:logger-usage** - Validates logger usage
5. **check:rule-implementations** - Verifies rule implementations
6. **check:rule-coverage** - Checks rule test coverage
7. **check:schema-sync** - Validates schema synchronization
8. **build** - Ensures TypeScript compiles
9. **test:validators** - Runs validator tests
10. **lint:md** - Lints all markdown files

To bypass hooks (emergencies only):

```bash
git commit --no-verify
```

## CI/CD Scripts

These scripts run in GitHub Actions:

- `lint:ts` - TypeScript linting
- `lint:md` - Markdown linting
- `format:check` - Format validation
- `check:links` - Link validation
- `check:emojis` - Emoji checks
- `check:rule-implementations` - Rule validation
- `check:rule-structure` - Structure validation
- `check:schema-sync` - Schema sync validation
- `build` - Build verification
- `test` - Full test suite
- `validate:all` - Complete validation

## Troubleshooting

### Script Not Found

```bash
npm run unknown-script
# Error: missing script: unknown-script
```

**Solution:** Run `npm run` to see all available scripts.

### Lint Failures

```bash
npm run lint
# ERROR: ESLint found 3 errors
```

**Solution:** Try auto-fix first:

```bash
npm run lint:fix
```

### Pre-commit Hook Failures

```bash
git commit -m "message"
# Lint-staged failed
```

**Solution:** Fix the issues, then commit again:

```bash
npm run lint:fix
npm run format
git add .
git commit -m "message"
```

## See Also

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [docs/cli-reference.md](./cli-reference.md) - CLI command reference
- [docs/validation-reference.md](./validation-reference.md) - Validation rules reference
