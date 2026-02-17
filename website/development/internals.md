---
description: "Discover how claudelint works under the hood: parallel validation with Promise.all, result caching, CLI command architecture, and structured diagnostic collection."
---

# Internals

How claudelint works under the hood: parallel validation, caching, the CLI architecture, and diagnostic collection.

## Parallel Validation

**Location:** `src/cli/commands/check-all.ts`

All validators run concurrently using `Promise.all()`. Each validator (CLAUDE.md, Skills, Agents, etc.) executes independently, so total wall-clock time equals the slowest validator rather than the sum of all.

```typescript
// Simplified from src/cli/commands/check-all.ts
const enabledValidators = ValidatorRegistry.getAllMetadata().filter((m) => m.enabled);

const results = await Promise.all(
  enabledValidators.map((metadata) =>
    reporter.runValidator(metadata.name, () =>
      ValidatorRegistry.create(metadata.id, options).validate()
    )
  )
);
```

Progress output adapts to the environment automatically: animated spinners in terminals, plain text in CI (detected via `CI`, `GITHUB_ACTIONS`, and similar env vars), and no output in JSON mode.

## Caching

**Location:** `src/utils/cache.ts`

The `ValidationCache` class caches validation results keyed by validator name. Cache entries are invalidated when the claudelint version, configuration, or validated file modification times change. For CLI flags and CI setup, see the [CI/CD Integration Guide](/integrations/ci#caching).

```typescript
// src/utils/cache.ts
export interface CacheOptions {
  enabled: boolean;
  location: string;          // Default: '.claudelint-cache'
  strategy: 'content' | 'mtime';
}

export class ValidationCache {
  get(validatorName: string, config?: unknown): ValidationResult | null;
  set(validatorName: string, result: ValidationResult, config?: unknown): void;
  clear(): void;
}
```

## CLI Implementation

**Location:** `src/cli.ts` and `src/cli/commands/`

The CLI uses [Commander.js](https://github.com/tj/commander.js) for argument parsing. Commands are organized in `src/cli/commands/`:

- `check-all.ts` — Run all validators (parallel execution)
- `validator-commands.ts` — Factory for individual validator commands (`validate-claude-md`, `validate-skills`, etc.)
- `explain.ts` — Explain a rule in detail
- `list-rules.ts` — List all available rules
- `check-deprecated.ts` — List deprecated rules in config
- `migrate.ts` — Auto-migrate deprecated rules in config
- `format.ts` — Format Claude Code files
- `cache-clear.ts` — Clear validation cache
- `config-commands.ts` — Config inspection commands
- `install-plugin.ts` — Plugin installation
- `watch.ts` — Watch mode for file change monitoring

Individual validator commands (`validate-claude-md`, `validate-skills`, etc.) are created through a factory in `validator-commands.ts` to eliminate duplication. Each command follows the same pattern: load config, create validator, run validation, report results.

## Diagnostic Collection

**Location:** `src/utils/diagnostics/collector.ts`

Library code uses `DiagnosticCollector` instead of `console` directly:

```typescript
// src/utils/diagnostics/collector.ts
export class DiagnosticCollector {
  warn(message: string, source: string, code?: string): void;
  error(message: string, source: string, code?: string): void;
  info(message: string, source: string, code?: string): void;
  getWarnings(): Diagnostic[];
  getErrors(): Diagnostic[];
  getAll(): Diagnostic[];
}
```

This makes the library testable (no console spam), supports programmatic usage, and provides structured diagnostics with source tracking.

Console output is only allowed in the CLI layer (`src/cli/utils/logger.ts`), output formatting (`src/utils/reporting/`), and script utilities (`scripts/util/logger.ts`).
