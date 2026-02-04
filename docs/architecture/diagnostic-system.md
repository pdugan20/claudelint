# Diagnostic Collection System

## Overview

The Diagnostic Collection System is ClaudeLint's standardized approach to reporting warnings, errors, and information during validation. It follows industry-standard patterns used by ESLint, TypeScript, Prettier, and Webpack.

**Core Principle**: Library code collects structured diagnostics; output layers format and display them.

## Architecture

### Three-Layer Design

```text
┌────────────────────────────────────────┐
│   CLI Layer (src/cli/)                 │
│   - CLI Logger                          │
│   - Reporters (stylish, compact, JSON)  │
│   - Progress indicators                 │
│   └─ Formats and prints diagnostics     │
└────────────────────────────────────────┘
                  ↑
                  │ ValidationResult.warnings
                  │
┌────────────────────────────────────────┐
│   Library Layer (src/)                 │
│   - Validators                          │
│   - ConfigResolver                      │
│   - WorkspaceDetector                   │
│   - ValidationCache                     │
│   └─ Collects diagnostics silently     │
└────────────────────────────────────────┘
                  ↑
                  │ diagnostics?: DiagnosticCollector
                  │
┌────────────────────────────────────────┐
│   DiagnosticCollector                  │
│   - Collects warnings/errors/info       │
│   - Structures with source & code       │
│   - Provides filtering methods          │
└────────────────────────────────────────┘
```

### Data Flow

1. **Collection**: Library components collect diagnostics via `DiagnosticCollector`
2. **Aggregation**: FileValidator gathers diagnostics and includes them in `ValidationResult`
3. **Reporting**: CLI layer formats diagnostics for display

## Usage

### In Library Functions

For standalone functions, accept an optional `diagnostics` parameter:

```typescript
import { DiagnosticCollector } from '../utils/diagnostics';

export async function detectWorkspace(
  dir: string,
  diagnostics?: DiagnosticCollector
): Promise<WorkspaceInfo | null> {
  if (invalidFormat) {
    diagnostics?.warn(
      'package.json workspaces must be an array or { packages: [...] }',
      'WorkspaceDetector',
      'WORKSPACE_INVALID_FORMAT'
    );
    return null;
  }

  // Continue processing...
}
```

### In Library Classes

For classes, accept `DiagnosticCollector` in constructor:

```typescript
import { DiagnosticCollector } from '../utils/diagnostics';

export class ConfigResolver {
  constructor(
    private config: ClaudeLintConfig,
    private diagnostics?: DiagnosticCollector
  ) {}

  private normalizeRuleConfig(ruleId: RuleId, config: unknown) {
    try {
      rule.schema.parse(options);
    } catch (error) {
      this.diagnostics?.warn(
        `Invalid options for rule '${ruleId}': ${error.message}. Rule will be disabled.`,
        'ConfigResolver',
        'CONFIG_INVALID_OPTIONS'
      );
      return null;
    }
  }
}
```

### In Validators

FileValidator creates a DiagnosticCollector and threads it through components:

```typescript
export class FileValidator {
  private diagnostics = new DiagnosticCollector();

  constructor(options: BaseValidatorOptions = {}) {
    // Thread diagnostics through to components
    if (options.config) {
      this.configResolver = new ConfigResolver(
        options.config,
        this.diagnostics  // Pass collector
      );
    }
  }

  async validate(): Promise<ValidationResult> {
    // ... run validation ...

    // Collect diagnostics as warnings
    return {
      valid: errors.length === 0,
      errors,
      warnings: this.diagnostics.getWarnings().map(d => ({
        message: d.message,
        severity: 'warning' as const,
        source: d.source,
        code: d.code,
      })),
    };
  }
}
```

## Diagnostic Codes

Diagnostic codes help identify the source and type of issue. Format: `COMPONENT_ISSUE_TYPE`

### Config Resolver Codes

- `CONFIG_INVALID_OPTIONS` - Rule configuration options failed schema validation

### Workspace Detector Codes

- `WORKSPACE_INVALID_YAML` - pnpm-workspace.yaml contains invalid YAML
- `WORKSPACE_PARSE_ERROR` - Failed to parse workspace configuration
- `WORKSPACE_INVALID_FORMAT` - Workspace config has invalid structure

### Cache Manager Codes

- `CACHE_SAVE_FAILED` - Failed to save cache index (non-critical)
- `CACHE_WRITE_FAILED` - Failed to write cached result (non-critical)
- `CACHE_CLEAR_FAILED` - Failed to clear cache (critical - user requested)

## API Reference

### DiagnosticCollector

```typescript
class DiagnosticCollector {
  // Add diagnostics
  warn(message: string, source: string, code?: string, context?: unknown): void
  error(message: string, source: string, code?: string, context?: unknown): void
  info(message: string, source: string, code?: string, context?: unknown): void
  add(diagnostic: Diagnostic): void

  // Retrieve diagnostics
  getAll(): Diagnostic[]
  getWarnings(): Diagnostic[]
  getErrors(): Diagnostic[]
  getInfo(): Diagnostic[]

  // Check for diagnostics
  hasWarnings(): boolean
  hasErrors(): boolean
  count(): number

  // Clear all diagnostics
  clear(): void
}
```

### Diagnostic Interface

```typescript
interface Diagnostic {
  message: string;           // Human-readable message
  source: string;            // Component that created diagnostic
  severity: 'warning' | 'error' | 'info';
  code?: string;             // Optional diagnostic code
  context?: unknown;         // Optional additional context
}
```

## Testing Diagnostics

### Unit Tests

Test that diagnostics are collected:

```typescript
import { DiagnosticCollector } from '../src/utils/diagnostics';
import { ConfigResolver } from '../src/utils/config/resolver';

it('should warn about invalid rule options', () => {
  const diagnostics = new DiagnosticCollector();
  const config = {
    rules: {
      'claude-md-size-warning': {
        severity: 'error',
        options: { maxSize: -100 }  // Invalid
      }
    }
  };

  const resolver = new ConfigResolver(config, diagnostics);
  resolver.resolveForFile('test.md');

  const warnings = diagnostics.getWarnings();
  expect(warnings.length).toBeGreaterThan(0);
  expect(warnings[0].message).toContain('Invalid options');
  expect(warnings[0].source).toBe('ConfigResolver');
  expect(warnings[0].code).toBe('CONFIG_INVALID_OPTIONS');
});
```

### Integration Tests

Test that diagnostics propagate to ValidationResult:

```typescript
it('should propagate config warnings to ValidationResult', async () => {
  const config = {
    rules: {
      'claude-md-size-warning': {
        severity: 'error',
        options: { maxSize: -1 }  // Invalid
      }
    }
  };

  const validator = new ClaudeMdValidator({ path: filePath, config });
  const result = await validator.validate();

  // Config warning should be in result.warnings
  expect(result.warnings.length).toBeGreaterThan(0);
  const configWarning = result.warnings.find(w =>
    w.message.includes('Invalid options')
  );
  expect(configWarning).toBeDefined();
});
```

### Console Output Tests

Verify library code produces no console output:

```typescript
it('should not output to console during validation', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
  const errorSpy = jest.spyOn(console, 'error').mockImplementation();

  try {
    const validator = new ClaudeMdValidator({ path: filePath, config });
    await validator.validate();

    // Library code should NOT use console
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  } finally {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  }
});
```

## Benefits

### For Library Users

- **Testable**: No console spam during tests
- **Programmatic**: Full control over diagnostic output
- **Structured**: Diagnostics have source, code, and context
- **Flexible**: Can filter, format, or suppress diagnostics

### For Contributors

- **Clear Architecture**: Separation of concerns (collection vs. presentation)
- **Industry Standard**: Matches ESLint, TypeScript, Webpack patterns
- **Easy to Extend**: Add new diagnostic codes without changing infrastructure
- **Easy to Test**: Mock-free testing with structured data

## Comparison with Other Tools

### ESLint

```typescript
// ESLint collects structured diagnostics
context.report({
  node,
  message: 'Unexpected var',
  data: { name }
});

// CLI formats them for output
// Library code never uses console
```

### TypeScript

```typescript
// TypeScript collects diagnostics in Program
const diagnostics = program.getSemanticDiagnostics();

// tsc CLI formats them
// Library (typescript npm package) is silent
```

### ClaudeLint (Our Pattern)

```typescript
// Library collects diagnostics
diagnostics?.warn(
  'Invalid options for rule',
  'ConfigResolver',
  'CONFIG_INVALID_OPTIONS'
);

// CLI formats them via Reporter
// Library code never uses console
```

## Enforcement

### Automated Checks

The `scripts/check/logger-usage.sh` script enforces this pattern:

```bash
# Runs in CI and pre-commit
npm run check:logger-usage
```

It checks for:

- Console usage in library code (src/) - **NOT ALLOWED**
- Console usage only in CLI layer (src/cli/, src/utils/reporting/) - **ALLOWED**
- Proper use of DiagnosticCollector - **REQUIRED**

### Pre-commit Hook

The pre-commit hook runs `logger-usage.sh` to prevent accidental console usage:

```json
{
  "hooks": {
    "pre-commit": [
      "npm run check:logger-usage",
      "npm run check:logger-spacing"
    ]
  }
}
```

## Migration Guide

### Before (Old Pattern)

```typescript
// BAD: Direct console usage in library
export class MyClass {
  doThing() {
    if (invalid) {
      console.warn('Invalid thing');
    }
  }
}
```

### After (DiagnosticCollector Pattern)

```typescript
// GOOD: Use DiagnosticCollector
import { DiagnosticCollector } from '../utils/diagnostics';

export class MyClass {
  constructor(private diagnostics?: DiagnosticCollector) {}

  doThing() {
    if (invalid) {
      this.diagnostics?.warn(
        'Invalid thing',
        'MyClass',
        'MY_INVALID_THING'
      );
    }
  }
}
```

## See Also

- [Contributing Guide](../../CONTRIBUTING.md) - Contribution guidelines including diagnostic patterns
- [Architecture](../architecture.md) - Overall system architecture
- [Custom Rules](../custom-rules.md) - Creating custom rules with diagnostics
