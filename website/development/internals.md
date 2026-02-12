# Internals

This page covers claudelint's internal systems: caching, parallel validation, progress indicators, the CLI, and plugin integration.

## Parallel Validation

**Location:** `src/cli/commands/check-all.ts`

All validators run concurrently using `Promise.all()` for maximum performance.

```typescript
// Simplified from src/cli/commands/check-all.ts
const validators = ValidatorRegistry.getEnabled(options);

const results = await Promise.all(
  validators.map((validator) =>
    reporter.runValidator(validator.constructor.name, () => validator.validate())
  )
);
```

### Performance

**Sequential (before):** Total time = sum of all validator times (~63ms)

**Parallel (current):** Total time = max of all validator times (~18ms)

Actual wall-clock time including Node.js startup: ~128ms. Validation itself is ~3.5x faster than sequential.

## Caching

**Location:** `src/utils/cache.ts`

The `ValidationCache` class caches validation results based on file content hashes.

```typescript
// src/utils/cache.ts
export interface CacheOptions {
  enabled: boolean;
  location: string;          // Default: '.claudelint-cache'
  strategy: 'content' | 'mtime';
}

export class ValidationCache {
  async get(filePath: string, config: unknown): Promise<ValidationResult | null>;
  async set(filePath: string, config: unknown, result: ValidationResult): Promise<void>;
  clear(): void;
}
```

### Cache Key Generation

Cache keys are generated from: claudelint version + file content hash + config hash. This ensures cache invalidation when any of these change.

### CLI Flags

```bash
# Caching enabled by default
claudelint check-all

# Disable caching
claudelint check-all --no-cache

# Custom cache location
claudelint check-all --cache-location /tmp/cache

# Clear cache
claudelint cache-clear
```

### Performance

- Cold cache: ~204ms
- Warm cache: ~84ms (~2.4x faster)
- Cache hit rate: 90%+ on subsequent runs with no file changes
- Best for: local development, pre-commit hooks

## Progress Indicators

**Location:** `src/utils/reporting/progress.ts`

The `ProgressIndicator` class provides visual feedback during validation.

```typescript
// src/utils/reporting/progress.ts
export class ProgressIndicator {
  constructor(options?: { enabled?: boolean });
  start(text: string): void;
  succeed(text: string): void;
  fail(text: string): void;
  stop(): void;
}
```

### CI Detection

The progress system automatically detects CI environments:

```typescript
private detectCI(): boolean {
  return !!(
    process.env.CI ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.CIRCLECI ||
    !process.stdin.isTTY
  );
}
```

- **Terminal:** Animated spinners using `ora`
- **CI:** Plain text progress messages
- **JSON mode:** No progress output

## CLI Implementation

**Location:** `src/cli.ts` and `src/cli/commands/`

The CLI uses [Commander.js](https://github.com/tj/commander.js) for argument parsing. Commands are organized in `src/cli/commands/`:

- `check-all.ts` - Run all validators (parallel execution)
- `validator-commands.ts` - Factory for individual validator commands (`validate-claude-md`, `validate-skills`, etc.)
- `watch.ts` - Watch mode for file change monitoring
- `list-rules.ts` - List all available rules
- `check-deprecated.ts` - List deprecated rules in config
- `migrate.ts` - Auto-migrate deprecated rules in config
- `format.ts` - Format Claude Code files
- `cache-clear.ts` - Clear validation cache

### Validator Command Factory

Individual validator commands are created through a factory pattern to eliminate duplication:

```typescript
// src/cli/commands/validator-commands.ts
export function createValidatorCommand(
  program: Command,
  metadata: ValidatorCommandMetadata
): Command {
  const cmd = program
    .command(metadata.command)
    .description(metadata.description)
    .option('--path <path>', `Custom path to ${metadata.displayName}`)
    .option('-v, --verbose', 'Verbose output')
    .option('--warnings-as-errors', 'Treat warnings as errors')
    .option('-c, --config <path>', 'Path to configuration file');

  if (metadata.alias) {
    cmd.alias(metadata.alias);
  }

  cmd.action(async (options) => {
    const config = loadAndValidateConfig(options);
    const validator = ValidatorRegistry.create(metadata.id, { ...options, config });
    const result = await validator.validate();
    // ... report results
  });

  return cmd;
}
```

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

**Why:** Makes the library testable (no console spam), allows programmatic usage, provides structured diagnostics with source tracking.

**Where console IS allowed:**

- CLI layer: `src/cli/utils/logger.ts`
- Output formatting: `src/utils/reporting/`
- Script utilities: `scripts/util/logger.ts`

## Claude Code Plugin Integration

claudelint is distributed as a Claude Code plugin. Skills in the `skills/` directory wrap CLI commands. Each skill's `SKILL.md` contains frontmatter (name, description, allowed-tools) and a body with bash commands that invoke the CLI:

```yaml
# skills/validate-all/SKILL.md frontmatter
name: validate-all
description: Run all Claude Code validators
allowed-tools: [Bash]
```

```bash
# The skill body runs:
npx claude-code-lint check-all --verbose
```

## Watch Mode

**Location:** `src/cli/commands/watch.ts`

Watch mode monitors the working directory for changes to Claude configuration files and re-runs the appropriate validators:

```bash
claudelint watch
```

File patterns are mapped to validators (e.g., changes to `CLAUDE.md` trigger the CLAUDE.md validator, changes to `hooks.json` trigger the Hooks validator).
