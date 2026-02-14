# Flag Architecture Refactoring Spec

**Last Updated**: 2026-02-14

---

## Problem

The CLI flag system has four structural issues that create inconsistency and make adding new flags error-prone:

### 1. Duplicated Config Loading

`check-all.ts` has ~50 lines of inline config loading logic (lines 88-169) that duplicates what `config-loader.ts` already provides. This is how `--no-config` got missed on the primary command -- it exists in the shared utility but check-all doesn't use it.

**check-all.ts** (current):

```typescript
let config = {};
if (options.config) {
  // ~40 lines of manual config loading, extends resolution, validation...
}
```

**validator-commands.ts** (correct pattern):

```typescript
const config = loadAndValidateConfig(options);
```

### 2. Scattered Inline Option Types

Three commands define their own inline anonymous option types with overlapping but inconsistent properties:

| Command | Properties | Has `--no-config`? | Has `-c` shorthand? |
|---------|------------|-------|----------|
| check-all | 24 | No (bug) | No |
| validator-commands | 8 | Yes | Yes |
| watch | 6 | Yes | Yes |

No shared interface means adding a flag like `--max-warnings` requires updating each type independently.

### 3. Flat Option Registration

All 24 `check-all` options are registered as a flat `.option()` chain with no grouping. When Phase 4 adds help text grouping, we need to organize these anyway. Option builder functions provide the structure now.

### 4. Manual Reporter Mapping

Creating a `Reporter` in check-all requires manually mapping 10 CLI options + config values to `ReportingOptions`, with three different merge strategies mixed together:

```typescript
const reporter = new Reporter({
  verbose: options.verbose || mergedConfig.output?.verbose,          // CLI || config
  color: options.color !== undefined ? options.color : mergedConfig.output?.color,  // CLI ?? config
  deprecatedWarnings: options.deprecatedWarnings !== false,           // --no-X negation
  collapseRepetitive:
    options.collapse !== false && mergedConfig.output?.collapseRepetitive !== false,  // both
});
```

This is the most bug-prone code in the CLI layer.

---

## Solution: Four Refactoring Steps

### A: Shared CLI Option Types (`src/cli/types.ts`)

Create a single source of truth for CLI option interfaces:

```typescript
/** Options common to all commands */
export interface CommonOptions {
  verbose?: boolean;
  config?: string | false;
  warningsAsErrors?: boolean;
  maxWarnings?: number;
}

/** Output-related options */
export interface OutputOptions {
  format?: OutputFormat;
  color?: boolean;
  quiet?: boolean;
  explain?: boolean;
  showDocsUrl?: boolean;
  deprecatedWarnings?: boolean;
  collapse?: boolean;
}

/** Full check-all options (extends common + output) */
export interface CheckAllOptions extends CommonOptions, OutputOptions {
  fix?: boolean;
  fixDryRun?: boolean;
  fixType?: string;
  cache?: boolean;
  cacheLocation?: string;
  // ... etc
}

/** Validator command options */
export interface ValidatorOptions extends CommonOptions {
  path?: string;
  explain?: boolean;
  skill?: string;
  collapse?: boolean;
}
```

**Effort**: ~1 hour. Create file, update imports in check-all, validator-commands, watch.

### B: Shared Config Loader in check-all

Replace the ~50 lines of inline config loading with a call to `loadAndValidateConfig()`:

```typescript
// Before (50 lines):
let config = {};
if (options.config) { ... }

// After (1 line):
const config = loadAndValidateConfig(options);
```

This automatically picks up `--no-config` support since the shared loader already handles it.

**Effort**: ~30 minutes. Delete inline logic, add import, verify behavior unchanged.

### C: Option Builder Functions (`src/cli/utils/option-builders.ts`)

Group option registration into composable functions:

```typescript
export function addCommonOptions(cmd: Command): Command {
  return cmd
    .option('-v, --verbose', 'Verbose output')
    .option('-c, --config <path>', 'Path to configuration file')
    .option('--no-config', 'Disable configuration file loading')
    .option('--warnings-as-errors', 'Treat warnings as errors')
    .option('--max-warnings <number>', 'Fail if warning count exceeds limit', parseInt);
}

export function addOutputOptions(cmd: Command): Command {
  return cmd
    .option('--format <format>', 'Output format: stylish, json, compact, sarif, github')
    .option('-q, --quiet', 'Suppress warnings, show only errors')
    .option('--color / --no-color', 'Force or disable color output')
    .option('--explain', 'Show detailed explanations and fix suggestions')
    .option('--no-collapse', 'Show all issues without collapsing');
}

// Also: addEnforcementOptions, addCacheOptions, addFixOptions, addFileSelectionOptions
```

Usage in check-all:

```typescript
const cmd = program.command('check-all');
addCommonOptions(cmd);
addOutputOptions(cmd);
addEnforcementOptions(cmd);
addCacheOptions(cmd);
addFixOptions(cmd);
```

These groups directly map to help text categories in Phase 4.

**Effort**: ~1.5 hours. Create builders, refactor check-all and validator-commands to use them.

### D: Reporter Options Builder (`src/cli/utils/reporter-options.ts`)

Encapsulate the CLI-to-Reporter mapping in a single utility:

```typescript
import { ReportingOptions } from '../../utils/reporting/reporting';
import { CommonOptions, OutputOptions } from '../types';

/**
 * Build ReportingOptions from CLI flags and loaded config.
 *
 * Merge strategy:
 * - CLI flags take precedence over config values
 * - Boolean negation flags (--no-X) are normalized
 * - Undefined CLI values fall through to config defaults
 */
export function buildReporterOptions(
  cliOptions: CommonOptions & OutputOptions,
  config?: { output?: Partial<ReportingOptions> }
): ReportingOptions {
  const configOutput = config?.output ?? {};

  return {
    verbose: cliOptions.verbose ?? configOutput.verbose,
    quiet: cliOptions.quiet,
    warningsAsErrors: cliOptions.warningsAsErrors,
    explain: cliOptions.explain,
    format: cliOptions.format ?? configOutput.format,
    color: cliOptions.color ?? configOutput.color,
    showDocsUrl: cliOptions.showDocsUrl,
    deprecatedWarnings: cliOptions.deprecatedWarnings !== false,
    errorOnDeprecated: cliOptions.errorOnDeprecated,
    collapseRepetitive:
      cliOptions.collapse !== false && configOutput.collapseRepetitive !== false,
  };
}
```

Usage:

```typescript
// Before (10 lines of manual mapping):
const reporter = new Reporter({
  verbose: options.verbose || mergedConfig.output?.verbose,
  quiet: options.quiet,
  // ... 8 more lines
});

// After (1 line):
const reporter = new Reporter(buildReporterOptions(options, mergedConfig));
```

**Effort**: ~1 hour. Create utility, replace inline mapping in check-all and validator-commands.

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/cli/types.ts` | Create | Shared CLI option interfaces |
| `src/cli/utils/option-builders.ts` | Create | Option group builder functions |
| `src/cli/utils/reporter-options.ts` | Create | Reporter options builder |
| `src/cli/commands/check-all.ts` | Modify | Use shared types, config loader, option builders, reporter builder |
| `src/cli/commands/validator-commands.ts` | Modify | Use shared types and option builders |
| `src/cli/commands/watch.ts` | Modify | Use shared types |
| `tests/cli/option-builders.test.ts` | Create | Tests for option builders |
| `tests/cli/reporter-options.test.ts` | Create | Tests for reporter options builder |

---

## Design Decisions

1. **Utility function over Reporter modification**: The `buildReporterOptions` function keeps Reporter unchanged. Reporter stays a pure display concern; the merge logic lives in the CLI layer where it belongs.

2. **Composition over inheritance**: Option builders are functions that compose, not class hierarchies. `addCommonOptions(cmd)` then `addOutputOptions(cmd)` is explicit and flexible.

3. **Config loader reuse**: check-all adopts the exact same `loadAndValidateConfig` that validator-commands already uses, eliminating the source of the `--no-config` bug.

4. **Progressive adoption**: Each step (A/B/C/D) is independently valuable and can be verified separately.

---

## Test Plan

| Test | Validates |
|------|-----------|
| Shared types compile | A: interfaces are correct |
| check-all uses shared config loader | B: config loading behavior unchanged |
| `--no-config` works on check-all | B: bug fix verified |
| Option builders register expected flags | C: all flags present |
| Option groups don't overlap | C: no duplicate flags |
| buildReporterOptions with CLI-only values | D: basic mapping works |
| buildReporterOptions with config fallback | D: config values used when CLI undefined |
| buildReporterOptions with CLI override | D: CLI wins over config |
| buildReporterOptions --no-X negation | D: boolean negation handled |
| Validator commands use shared patterns | Integration: no regressions |
| Existing CLI tests still pass | Integration: no behavioral changes |
