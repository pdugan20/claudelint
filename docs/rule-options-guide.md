# Rule Options Development Guide

This guide explains how to add configurable options to claude-code-lint rules.

## Quick Start

**Before implementing:** Read `docs/projects/rule-implementation/CONFIG-INTEGRATION-PROPOSAL.md` for architecture overview.

### 1. Define Options Interface

```typescript
// In your validator file (e.g., src/validators/claude-md.ts)
interface SizeErrorOptions {
  maxSize?: number;
  reportZeroSize?: boolean;
}
```

### 2. Create Zod Schema

```typescript
import { z } from 'zod';

const SizeErrorOptionsSchema = z.object({
  maxSize: z.number().positive().optional()
    .describe('Maximum file size in bytes'),
  reportZeroSize: z.boolean().optional()
    .describe('Report files with zero size')
});
```

### 3. Register Rule with Schema

```typescript
// In rule registration (usually at end of validator file)
import { RuleRegistry } from '../utils/rule-registry';

RuleRegistry.register({
  id: 'size-error',
  name: 'File Size Error',
  description: 'Files must not exceed maximum size',
  category: 'CLAUDE.md',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
  schema: SizeErrorOptionsSchema,
  defaultOptions: {
    maxSize: 50000,
    reportZeroSize: false
  }
});
```

### 4. Use Options in Validator

```typescript
async validate(): Promise<ValidationResult> {
  const files = await this.findFiles();

  for (const file of files) {
    // IMPORTANT: Set file context for config resolution
    this.setCurrentFile(file);

    // Get typed options with defaults
    const options = this.getRuleOptions<SizeErrorOptions>('size-error');
    const maxSize = options?.maxSize ?? 50000;
    const reportZeroSize = options?.reportZeroSize ?? false;

    // Use options in validation logic
    const content = await readFileContent(file);
    const size = Buffer.byteLength(content, 'utf-8');

    if (size === 0 && reportZeroSize) {
      this.reportWarning('File is empty', file, undefined, 'size-error');
    }

    if (size > maxSize) {
      this.reportError(
        `File size (${size} bytes) exceeds limit (${maxSize} bytes)`,
        file,
        undefined,
        'size-error'
      );
    }
  }

  return this.getResult();
}
```

## Testing Options

### Unit Test Schema Validation

```typescript
describe('SizeErrorOptions schema', () => {
  it('accepts valid options', () => {
    const result = SizeErrorOptionsSchema.parse({
      maxSize: 60000,
      reportZeroSize: true
    });

    expect(result.maxSize).toBe(60000);
    expect(result.reportZeroSize).toBe(true);
  });

  it('rejects invalid maxSize', () => {
    expect(() => {
      SizeErrorOptionsSchema.parse({ maxSize: -100 });
    }).toThrow();
  });

  it('uses defaults when options omitted', () => {
    const result = SizeErrorOptionsSchema.parse({});
    expect(result).toEqual({});
  });
});
```

### Integration Test with Config

```typescript
describe('size-error with custom options', () => {
  it('uses custom maxSize from config', async () => {
    const validator = new ClaudeMdValidator({
      config: {
        rules: {
          'size-error': {
            severity: 'error',
            options: {
              maxSize: 60000
            }
          }
        }
      }
    });

    // File between default (50KB) and custom (60KB)
    await createTestFile('CLAUDE.md', 'x'.repeat(55000));

    const result = await validator.validate();

    // Should pass with custom threshold
    expect(result.errors).toHaveLength(0);
  });

  it('reports zero-size files when enabled', async () => {
    const validator = new ClaudeMdValidator({
      config: {
        rules: {
          'size-error': {
            severity: 'error',
            options: {
              reportZeroSize: true
            }
          }
        }
      }
    });

    await createTestFile('CLAUDE.md', '');

    const result = await validator.validate();

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].message).toContain('empty');
  });
});
```

## Common Option Patterns

### Numeric Thresholds

```typescript
interface ThresholdOptions {
  max?: number;
  min?: number;
}

const schema = z.object({
  max: z.number().positive().optional(),
  min: z.number().nonnegative().optional()
}).refine(
  data => !data.max || !data.min || data.max > data.min,
  'max must be greater than min'
);
```

### Ignore Patterns

```typescript
interface IgnoreOptions {
  ignorePatterns?: string[];
}

const schema = z.object({
  ignorePatterns: z.array(z.string()).optional()
    .describe('Glob patterns to ignore')
});

// Usage:
const options = this.getRuleOptions<IgnoreOptions>('my-rule');
const shouldIgnore = options?.ignorePatterns?.some(
  pattern => minimatch(file, pattern)
);
```

### Enums and Modes

```typescript
interface ModeOptions {
  mode?: 'strict' | 'lenient' | 'off';
}

const schema = z.object({
  mode: z.enum(['strict', 'lenient', 'off']).optional()
    .describe('Validation strictness level')
});
```

### Complex Nested Options

```typescript
interface ComplexOptions {
  validation?: {
    enabled: boolean;
    level: 'basic' | 'full';
    customRules?: string[];
  };
}

const schema = z.object({
  validation: z.object({
    enabled: z.boolean(),
    level: z.enum(['basic', 'full']),
    customRules: z.array(z.string()).optional()
  }).optional()
});
```

## Documentation

### Add Options Section to Rule Docs

```markdown
## Options

This rule supports the following options:

### `maxSize`

- **Type**: `number`
- **Default**: `50000`

Maximum file size in bytes. Files exceeding this size will trigger an error.

### `reportZeroSize`

- **Type**: `boolean`
- **Default**: `false`

When enabled, reports empty files as warnings.

## Configuration Examples

### Basic Configuration

{
  "rules": {
    "size-error": "error"
  }
}

### Custom Threshold

{
  "rules": {
    "size-error": {
      "severity": "error",
      "options": {
        "maxSize": 60000
      }
    }
  }
}

### Enable Zero-Size Detection

{
  "rules": {
    "size-error": {
      "severity": "error",
      "options": {
        "maxSize": 50000,
        "reportZeroSize": true
      }
    }
  }
}
```

## Best Practices

### 1. Always Provide Defaults

```typescript
// Good: Handles missing options
const maxSize = options?.maxSize ?? 50000;

// Bad: Could be undefined
const maxSize = options?.maxSize;
```

### 2. Validate Options Early

Use Zod schemas to validate options at config load time, not during validation.

### 3. Document All Options

Every option needs:

- Description
- Type
- Default value
- Example usage

### 4. Set File Context

Always call `setCurrentFile()` before accessing options:

```typescript
for (const file of files) {
  this.setCurrentFile(file); // REQUIRED
  const options = this.getRuleOptions('my-rule');
  // ... validation logic
}
```

### 5. Keep Options Simple

Prefer flat options objects over deeply nested structures.

### 6. Use TypeScript Types

Define interfaces for type safety:

```typescript
// Type-safe access
const options = this.getRuleOptions<MyOptions>('my-rule');

// Can't misspell or use wrong type
const max = options?.maxSize; // number | undefined
```

## Troubleshooting

### Options Not Applied

**Problem**: Rule ignores configured options

**Solution**: Ensure you're calling `setCurrentFile()` before `getRuleOptions()`

### Schema Validation Errors

**Problem**: Config rejected with validation error

**Solution**: Check Zod schema matches expected option types

### Options Always Undefined

**Problem**: `getRuleOptions()` returns undefined

**Solution**: Verify rule is registered with schema and defaultOptions

### File Overrides Not Working

**Problem**: File-specific overrides not applying

**Solution**: Check glob patterns in config match file paths

## Examples

See complete working examples:

- `src/validators/claude-md.ts` - size-error, size-warning with maxSize option
- `src/validators/claude-md.ts` - import-circular with multiple options
- `tests/integration/config-*.test.ts` - Integration test patterns

## API Reference

### BaseValidator Methods

```typescript
protected setCurrentFile(filePath: string): void
```

Sets the current file context for config resolution. Must be called before `getRuleOptions()`.

```typescript
protected isRuleEnabled(ruleId: RuleId): boolean
```

Checks if a rule is enabled in the current config.

```typescript
protected getRuleOptions<T>(ruleId: RuleId): T | undefined
```

Gets typed options for a rule, with defaults applied.

### RuleRegistry

```typescript
static register(rule: RuleMetadata): void
```

Registers a rule with its metadata and optional schema.

```typescript
interface RuleMetadata {
  id: RuleId;
  // ... other fields
  schema?: z.ZodType<any>;
  defaultOptions?: Record<string, unknown>;
}
```

## Related Documentation

- [Configuration Integration Proposal](./projects/rule-implementation/CONFIG-INTEGRATION-PROPOSAL.md) - Full architecture
- [Configuration Guide](./configuration.md) - User-facing config docs
- [ESLint Custom Rules](https://eslint.org/docs/latest/extend/custom-rules) - ESLint's approach
