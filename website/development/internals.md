---
description: "Discover how claudelint works under the hood: parallel validation with Promise.all, result caching, CLI command architecture, and structured diagnostic collection."
---

# Internals

How claudelint works under the hood: parallel validation, caching, the CLI architecture, and diagnostic collection.

## Parallel Validation

All validators run concurrently using `Promise.all()` in [`check-all.ts`](https://github.com/pdugan20/claudelint/blob/main/src/cli/commands/check-all.ts). Each validator (CLAUDE.md, Skills, Agents, etc.) executes independently, so total wall-clock time equals the slowest validator rather than the sum of all.

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

The [`ValidationCache`](https://github.com/pdugan20/claudelint/blob/main/src/utils/cache.ts) class caches validation results keyed by validator name. Cache entries are invalidated when the claudelint version, configuration, or validated file modification times change. For CLI flags and CI setup, see the [CI/CD Integration Guide](/integrations/ci#caching).

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

The CLI uses [Commander.js](https://github.com/tj/commander.js) for argument parsing. The entrypoint is [`src/cli.ts`](https://github.com/pdugan20/claudelint/blob/main/src/cli.ts) and commands are organized in [`src/cli/commands/`](https://github.com/pdugan20/claudelint/tree/main/src/cli/commands):

| Command | Source | Description |
|---------|--------|-------------|
| `check-all` | [`check-all.ts`](https://github.com/pdugan20/claudelint/blob/main/src/cli/commands/check-all.ts) | Run all validators (parallel execution) |
| `validate-*` | [`validator-commands.ts`](https://github.com/pdugan20/claudelint/blob/main/src/cli/commands/validator-commands.ts) | Factory for individual validator commands |
| `explain` | [`explain.ts`](https://github.com/pdugan20/claudelint/blob/main/src/cli/commands/explain.ts) | Explain a rule in detail |
| `list-rules` | [`list-rules.ts`](https://github.com/pdugan20/claudelint/blob/main/src/cli/commands/list-rules.ts) | List all available rules |
| `check-deprecated` | [`check-deprecated.ts`](https://github.com/pdugan20/claudelint/blob/main/src/cli/commands/check-deprecated.ts) | List deprecated rules in config |
| `migrate` | [`migrate.ts`](https://github.com/pdugan20/claudelint/blob/main/src/cli/commands/migrate.ts) | Auto-migrate deprecated rules |
| `format` | [`format.ts`](https://github.com/pdugan20/claudelint/blob/main/src/cli/commands/format.ts) | Format Claude Code files |
| `cache-clear` | [`cache-clear.ts`](https://github.com/pdugan20/claudelint/blob/main/src/cli/commands/cache-clear.ts) | Clear validation cache |
| `config` | [`config-commands.ts`](https://github.com/pdugan20/claudelint/blob/main/src/cli/commands/config-commands.ts) | Config inspection commands |
| `install-plugin` | [`install-plugin.ts`](https://github.com/pdugan20/claudelint/blob/main/src/cli/commands/install-plugin.ts) | Plugin installation |
| `watch` | [`watch.ts`](https://github.com/pdugan20/claudelint/blob/main/src/cli/commands/watch.ts) | Watch mode for file changes |

Individual validator commands are created through a factory in `validator-commands.ts` to eliminate duplication. Each command follows the same pattern: load config, create validator, run validation, report results.

## Diagnostic Collection

Library code uses [`DiagnosticCollector`](https://github.com/pdugan20/claudelint/blob/main/src/utils/diagnostics/collector.ts) instead of `console` directly:

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

This makes the library testable, supports programmatic usage, and provides structured diagnostics with source tracking.
