# Validator Development Guide

Comprehensive guide for developing validators in claudelint.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Creating a New Validator](#creating-a-new-validator)
3. [Error Handling Standards](#error-handling-standards)
4. [Testing Guidelines](#testing-guidelines)
5. [Type Safety Requirements](#type-safety-requirements)
6. [Performance Considerations](#performance-considerations)
7. [Common Patterns and Utilities](#common-patterns-and-utilities)
8. [Plugin Development](#plugin-development)

## Architecture Overview

### Core Components

claudelint uses a modular architecture with four main components:

1. **Base Validator** (`src/validators/base.ts`) - Abstract base class for all validators
2. **Validator Registry** (`src/utils/validator-factory.ts`) - Central registry for validator discovery
3. **Rule Registry** (`src/utils/rule-registry.ts`) - Manages all validation rules
4. **Composition Framework** (`src/composition/`) - Functional composition for complex validations

### Component Relationships

```text
┌─────────────────────────────────────────────┐
│              CLI Entry Point                │
│           (src/cli.ts, bin/)                │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│          Validator Registry                 │
│    (ValidatorRegistry.create())             │
│  - Discovers validators                     │
│  - Instantiates by name                     │
│  - Provides metadata                        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         Concrete Validators                 │
│  (ClaudeMdValidator, SkillsValidator, etc.) │
│  - Extend BaseValidator                     │
│  - Register with ValidatorRegistry          │
│  - Implement validate() method              │
└──────────────────┬──────────────────────────┘
                   │
                   ├─────────────┬──────────────┐
                   ▼             ▼              ▼
         ┌─────────────┐ ┌─────────────┐ ┌──────────────┐
         │ Rule        │ │ Composition │ │ Validation   │
         │ Registry    │ │ Framework   │ │ Helpers      │
         │             │ │             │ │              │
         │ - addIssue()│ │ - compose() │ │ - fileExists│
         │ - report()  │ │ - parallel()│ │ - formatErr │
         └─────────────┘ └─────────────┘ └──────────────┘
```

### Validator Lifecycle

1. **Registration**: Validator registers itself with `ValidatorRegistry` at module load time
2. **Discovery**: CLI calls `ValidatorRegistry.getAllMetadata()` to list validators
3. **Instantiation**: CLI calls `ValidatorRegistry.create(name, options)` to create instance
4. **Validation**: CLI calls `validator.validate()` which returns `ValidationResult`
5. **Reporting**: CLI uses `Reporter` to format and display results

## Creating a New Validator

### Step 1: Create Validator File

Create a new file in `src/validators/` following the naming pattern `{name}-validator.ts` or `{name}.ts`.

Example: `src/validators/my-feature.ts`

```typescript
import { BaseValidator, ValidationResult } from './base';
import { ValidatorRegistry } from '../utils/validator-factory';
import { RuleRegistry } from '../utils/rule-registry';

export class MyFeatureValidator extends BaseValidator {
  /**
   * Unique identifier for this validator
   */
  static readonly TYPE = 'my-feature' as const;

  /**
   * Human-readable name
   */
  static readonly DISPLAY_NAME = 'My Feature Validator';

  /**
   * Constructor registers with ValidatorRegistry
   */
  constructor(options: any = {}) {
    super(options);
  }

  /**
   * Main validation entry point
   */
  async validate(): Promise<ValidationResult> {
    // Implementation here
    return {
      valid: true,
      errors: [],
      warnings: [],
    };
  }
}

// Register with ValidatorRegistry
ValidatorRegistry.register({
  name: MyFeatureValidator.TYPE,
  displayName: MyFeatureValidator.DISPLAY_NAME,
  factory: (options) => new MyFeatureValidator(options),
  enabled: true,
});
```

### Step 2: Define Validation Rules

Create rules in `src/rules/my-feature/` and register them with the Rule Registry.

Example: `src/rules/my-feature/index.ts`

```typescript
import { RuleRegistry } from '../../utils/rule-registry';

export const MY_FEATURE_RULES = {
  'invalid-config': {
    id: 'my-feature-invalid-config',
    severity: 'error',
    message: 'Configuration is invalid',
    category: 'my-feature',
  },
  'missing-field': {
    id: 'my-feature-missing-field',
    severity: 'warning',
    message: 'Recommended field is missing',
    category: 'my-feature',
  },
} as const;

// Register rules
for (const rule of Object.values(MY_FEATURE_RULES)) {
  RuleRegistry.register(rule);
}
```

### Step 3: Update Type Definitions

Add your rule IDs to the union type in `src/utils/rule-registry.ts`:

```typescript
export type RuleId =
  | 'size-error'
  | 'size-warning'
  | 'import-missing'
  // ... existing rules
  | 'my-feature-invalid-config'
  | 'my-feature-missing-field';
```

### Step 4: Implement Validation Logic

Use the composition framework for complex validations:

```typescript
import { compose, fileExists } from '../composition';

async validate(): Promise<ValidationResult> {
  const result = this.createResult();

  // Find files to validate
  const files = await this.findFiles();

  // Validate each file
  for (const file of files) {
    await this.validateFile(file, result);
  }

  return result;
}

private async validateFile(
  filePath: string,
  result: ValidationResult
): Promise<void> {
  // Use composition for complex validation
  const validator = compose(
    fileExists(),
    validJSON(),
    zodSchema(MyFeatureSchema)
  );

  const context = this.createContext(filePath);
  const validationResult = await validator(filePath, context);

  // Report errors from composition
  for (const error of validationResult.errors) {
    this.addIssue(result, {
      type: 'error',
      message: error.message,
      file: filePath,
      ruleId: 'my-feature-invalid-config',
    });
  }
}
```

### Step 5: Add CLI Command

Update `src/cli.ts` to add a command for your validator:

```typescript
program
  .command('validate-my-feature')
  .description('Validate my feature configuration')
  .option('--path <path>', 'Custom path to validate')
  .option('-v, --verbose', 'Verbose output')
  .option('--warnings-as-errors', 'Treat warnings as errors')
  .action(async (options: {
    path?: string;
    verbose?: boolean;
    warningsAsErrors?: boolean;
  }) => {
    const validator = ValidatorRegistry.create('my-feature', options);
    const reporter = new Reporter({
      verbose: options.verbose,
      warningsAsErrors: options.warningsAsErrors,
    });

    reporter.section('Validating my feature...');
    const result = await validator.validate();
    reporter.report(result, 'My Feature');

    process.exit(reporter.getExitCode(result));
  });
```

### Step 6: Write Tests

Create test files following the pattern `tests/validators/my-feature.test.ts`:

```typescript
import { MyFeatureValidator } from '../../src/validators/my-feature';
import { myFeature } from '../helpers/fixtures';
import '../helpers/setup-matchers';

describe('MyFeatureValidator', () => {
  let testDir: string;
  let validator: MyFeatureValidator;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'my-feature-test-'));
    validator = new MyFeatureValidator({ basePath: testDir });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should pass validation for valid config', async () => {
    await myFeature(testDir).withMinimalConfig().build();

    const result = await validator.validate();

    expect(result).toPassValidation();
  });

  it('should report error for invalid config', async () => {
    await myFeature(testDir).buildInvalid();

    const result = await validator.validate();

    expect(result).toFailValidation();
    expect(result).toHaveError('Configuration is invalid');
    expect(result).toHaveErrorWithRule('invalid', 'my-feature-invalid-config');
  });
});
```

### Step 7: Add Fixture Builder

Create a fixture builder in `tests/helpers/fixtures.ts`:

```typescript
export class MyFeatureBuilder {
  private config: Record<string, unknown> = {};

  constructor(private baseDir: string) {}

  with(key: string, value: unknown): this {
    this.config[key] = value;
    return this;
  }

  withMinimalConfig(): this {
    this.config = {
      name: 'test',
      enabled: true,
    };
    return this;
  }

  async build(): Promise<string> {
    await mkdir(this.baseDir, { recursive: true });
    const filePath = join(this.baseDir, 'config.json');
    await writeFile(filePath, JSON.stringify(this.config, null, 2));
    return filePath;
  }

  async buildInvalid(): Promise<string> {
    await mkdir(this.baseDir, { recursive: true });
    const filePath = join(this.baseDir, 'config.json');
    await writeFile(filePath, '{ invalid json }');
    return filePath;
  }
}

export function myFeature(baseDir: string): MyFeatureBuilder {
  return new MyFeatureBuilder(baseDir);
}
```

## Error Handling Standards

### Use Utility Functions

Always use the `formatError()` utility for consistent error messages:

```typescript
import { formatError } from '../utils/validation-helpers';

try {
  await someOperation();
} catch (error) {
  this.addIssue(result, {
    type: 'error',
    message: `Failed to process file: ${formatError(error)}`,
    file: filePath,
    ruleId: 'my-feature-invalid-config',
  });
}
```

### Never Suppress Errors Silently

**Bad:**

```typescript
try {
  await riskyOperation();
} catch (error) {
  // Silently ignored - BAD!
}
```

**Good:**

```typescript
try {
  await riskyOperation();
} catch (error) {
  // Log and report the error
  if (this.options.verbose) {
    console.error(`Warning: riskyOperation failed: ${formatError(error)}`);
  }
  this.addIssue(result, {
    type: 'warning',
    message: `Optional operation failed: ${formatError(error)}`,
    file: filePath,
    ruleId: 'my-feature-optional-failed',
  });
}
```

### Validation Context

Use `ValidationContext` for stateful validation:

```typescript
import { ValidationContext } from '../composition';

const context: ValidationContext = {
  filePath,
  options: this.options,
  state: new Map(), // Share state between validators
};

// Use context in composition
const validator = compose(
  fileExists(),
  checkDependency('other-file.json') // Can store in context.state
);

const result = await validator(filePath, context);
```

### Error Messages

Follow these guidelines for error messages:

1. **Be specific**: "Missing required field 'name'" not "Invalid config"
2. **Be actionable**: Include fix suggestion when possible
3. **Use consistent format**: Start with verb, describe what's wrong
4. **Include context**: File name, line number, field name

**Examples:**

```typescript
// Good error messages
this.addIssue(result, {
  type: 'error',
  message: 'Missing required field "name" in frontmatter',
  file: filePath,
  line: 5,
  ruleId: 'skill-missing-name',
  fix: 'Add "name: my-skill" to the frontmatter',
});

this.addIssue(result, {
  type: 'warning',
  message: 'Field "description" should be under 200 characters (currently 250)',
  file: filePath,
  ruleId: 'skill-description-length',
});
```

## Testing Guidelines

### Use Fixture Builders

Always use fixture builders from `tests/helpers/fixtures.ts` instead of manually creating files:

```typescript
// Good - uses fixture builder
await skill(testDir, 'test-skill').withMinimalFields().build();

// Bad - manual file creation
await writeFile(
  join(testDir, '.claude/skills/test-skill/SKILL.md'),
  '---\nname: test-skill\n---'
);
```

### Use Custom Matchers

Use custom matchers from `tests/helpers/matchers.ts` for expressive assertions:

```typescript
// Good - custom matchers
expect(result).toPassValidation();
expect(result).toHaveError('Missing required field');
expect(result).toHaveErrorWithRule('Missing', 'skill-missing-name');
expect(result).toHaveErrorCount(2);

// Bad - manual assertions
expect(result.valid).toBe(true);
expect(result.errors.some(e => e.message.includes('Missing'))).toBe(true);
```

### Test Structure

Follow this structure for validator tests:

```typescript
describe('MyFeatureValidator', () => {
  let testDir: string;
  let validator: MyFeatureValidator;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'test-'));
    validator = new MyFeatureValidator({ basePath: testDir });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('valid configurations', () => {
    it('should pass with minimal config', async () => {
      // Arrange
      await myFeature(testDir).withMinimalConfig().build();

      // Act
      const result = await validator.validate();

      // Assert
      expect(result).toPassValidation();
    });

    it('should pass with complete config', async () => {
      await myFeature(testDir).withCompleteConfig().build();
      const result = await validator.validate();
      expect(result).toPassValidation();
    });
  });

  describe('invalid configurations', () => {
    it('should report error for invalid JSON', async () => {
      await myFeature(testDir).buildInvalid();
      const result = await validator.validate();
      expect(result).toFailValidation();
      expect(result).toHaveError('Invalid JSON syntax');
    });

    it('should report error for missing field', async () => {
      await myFeature(testDir).with('name', '').build();
      const result = await validator.validate();
      expect(result).toHaveErrorWithRule('Missing', 'my-feature-missing-field');
    });
  });

  describe('warnings', () => {
    it('should warn about optional field', async () => {
      await myFeature(testDir).withMinimalConfig().build();
      const result = await validator.validate();
      expect(result).toHaveWarning('Optional field recommended');
    });
  });
});
```

### Integration Tests

Add integration tests in `tests/integration/` to test CLI behavior:

```typescript
describe('validate-my-feature command', () => {
  it('should validate valid config', async () => {
    await myFeature(testDir).withMinimalConfig().build();

    const result = execSync(`${claudelintBin} validate-my-feature`, {
      cwd: testDir,
      encoding: 'utf-8',
    });

    expect(result).toContain('All checks passed');
  });

  it('should exit with code 1 for errors', async () => {
    await myFeature(testDir).buildInvalid();

    const result = spawnSync(claudelintBin, ['validate-my-feature'], {
      cwd: testDir,
      encoding: 'utf-8',
    });

    expect(result.status).toBe(1);
  });
});
```

### Test Coverage Requirements

Aim for these coverage targets:

- **Unit tests**: 90%+ coverage for validator logic
- **Integration tests**: Cover all CLI commands and major flags
- **Edge cases**: Invalid input, missing files, permission errors
- **Error handling**: Every catch block should have a test

## Type Safety Requirements

### Rule ID Type Safety

Always use the `RuleId` union type for rule IDs:

```typescript
import { RuleId } from '../utils/rule-registry';

// Good - type-safe
const ruleId: RuleId = 'my-feature-invalid-config';

// Bad - string literal (no type safety)
const ruleId = 'my-feature-invalid-config';
```

### ValidationResult Type

Always return the correct `ValidationResult` type:

```typescript
import { ValidationResult, ValidationIssue } from './base';

async validate(): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Add issues using helper method
  this.addIssue(result, {
    type: 'error',
    message: 'Error message',
    file: 'path/to/file',
    ruleId: 'my-feature-invalid-config',
  });

  return result;
}
```

### Schema Definitions

Use Zod for schema validation:

```typescript
import { z } from 'zod';

export const MyFeatureSchema = z.object({
  name: z.string().min(1).max(64),
  enabled: z.boolean().default(true),
  config: z.object({
    timeout: z.number().int().positive(),
    retries: z.number().int().nonnegative(),
  }).optional(),
});

export type MyFeatureConfig = z.infer<typeof MyFeatureSchema>;
```

### Validator Options

Define typed options for your validator:

```typescript
export interface MyFeatureValidatorOptions {
  basePath?: string;
  verbose?: boolean;
  maxTimeout?: number;
}

export class MyFeatureValidator extends BaseValidator {
  constructor(private options: MyFeatureValidatorOptions = {}) {
    super(options);
  }
}
```

## Performance Considerations

### Use Caching

Leverage the caching system for expensive operations:

```typescript
import { ValidationCache } from '../utils/cache';

async validate(): Promise<ValidationResult> {
  const cache = new ValidationCache({
    enabled: this.options.cache !== false,
    location: this.options.cacheLocation || '.claudelint-cache',
    strategy: 'mtime',
  });

  const files = await this.findFiles();

  for (const file of files) {
    // Check cache first
    const cached = await cache.get(file);
    if (cached && cached.result) {
      result.errors.push(...cached.result.errors);
      result.warnings.push(...cached.result.warnings);
      continue;
    }

    // Validate and cache result
    const fileResult = await this.validateFile(file);
    await cache.set(file, { result: fileResult });

    result.errors.push(...fileResult.errors);
    result.warnings.push(...fileResult.warnings);
  }

  return result;
}
```

### Async/Await Best Practices

1. **Use Promise.all() for parallel operations:**

```typescript
// Good - parallel
const results = await Promise.all(files.map(f => this.validateFile(f)));

// Bad - sequential
for (const file of files) {
  await this.validateFile(file); // Waits for each file
}
```

1. **Avoid unnecessary awaits:**

```typescript
// Good - return promise directly
return this.validateFile(file);

// Bad - unnecessary await
return await this.validateFile(file);
```

### File System Optimization

1. **Use glob patterns efficiently:**

```typescript
import { glob } from 'glob';

// Good - specific pattern
const files = await glob('**/*.json', { cwd: basePath, ignore: '**/node_modules/**' });

// Bad - overly broad pattern
const files = await glob('**/*', { cwd: basePath });
```

1. **Check file existence before reading:**

```typescript
import { fileExists } from '../utils/validation-helpers';

// Good - check first
if (await fileExists(filePath)) {
  const content = await readFile(filePath, 'utf-8');
}

// Bad - always try to read
try {
  const content = await readFile(filePath, 'utf-8');
} catch (error) {
  // File doesn't exist
}
```

1. **Use streaming for large files:**

```typescript
import { createReadStream } from 'fs';

// Good for large files
const stream = createReadStream(filePath, { encoding: 'utf-8' });
let size = 0;
for await (const chunk of stream) {
  size += chunk.length;
}

// Bad for large files - loads entire file into memory
const content = await readFile(filePath, 'utf-8');
const size = content.length;
```

### Memory Management

1. **Limit concurrent operations:**

```typescript
import pLimit from 'p-limit';

const limit = pLimit(10); // Max 10 concurrent operations

const results = await Promise.all(
  files.map(file => limit(() => this.validateFile(file)))
);
```

1. **Stream results instead of buffering:**

```typescript
// Good - process as you go
async validate(): Promise<ValidationResult> {
  const result = this.createResult();

  for (const file of files) {
    const fileResult = await this.validateFile(file);
    result.errors.push(...fileResult.errors);
    result.warnings.push(...fileResult.warnings);
  }

  return result;
}

// Bad - buffer everything
async validate(): Promise<ValidationResult> {
  const results = await Promise.all(files.map(f => this.validateFile(f)));
  return this.mergeResults(results); // Lots of memory usage
}
```

## Common Patterns and Utilities

### Validation Helpers

Located in `src/utils/validation-helpers.ts`:

```typescript
import {
  fileExists,
  formatError,
  validateEnvVarName,
  isValidToolName,
} from '../utils/validation-helpers';

// Check file existence
if (!(await fileExists(filePath))) {
  this.addIssue(result, {
    type: 'error',
    message: 'File not found',
    file: filePath,
    ruleId: 'my-feature-missing-file',
  });
}

// Format errors consistently
try {
  await operation();
} catch (error) {
  const message = `Operation failed: ${formatError(error)}`;
}

// Validate environment variables
if (!validateEnvVarName('MY_VAR')) {
  // Invalid env var name
}

// Check tool names
if (isValidToolName('Bash')) {
  // Valid tool
}
```

### File System Utilities

Located in `src/utils/file-system.ts`:

```typescript
import { findFiles, readFile, isDirectory } from '../utils/file-system';

// Find files with glob pattern
const files = await findFiles('**/*.json', {
  cwd: basePath,
  ignore: ['**/node_modules/**'],
});

// Read file with error handling
const content = await readFile(filePath);

// Check if path is directory
if (await isDirectory(path)) {
  // It's a directory
}
```

### Constants

Located in `src/validators/constants.ts`:

```typescript
import {
  VALID_TOOLS,
  VALID_MODELS,
  MAX_SKILL_NAME_LENGTH,
  DEFAULT_SIZE_WARNING_THRESHOLD,
  DEFAULT_SIZE_ERROR_THRESHOLD,
} from './constants';

// Use constants instead of magic numbers
if (name.length > MAX_SKILL_NAME_LENGTH) {
  // Name too long
}

// Use predefined lists
if (!VALID_TOOLS.includes(toolName)) {
  // Invalid tool
}
```

### Markdown Parsing

Located in `src/utils/markdown.ts`:

```typescript
import {
  parseFrontmatter,
  extractYAML,
  isValidMarkdown,
} from '../utils/markdown';

// Parse YAML frontmatter
const { frontmatter, content } = parseFrontmatter(markdownContent);

// Extract raw YAML
const yaml = extractYAML(markdownContent);

// Validate markdown structure
if (!isValidMarkdown(content)) {
  // Invalid markdown
}
```

## Plugin Development

Validators can be packaged as plugins and distributed via npm.

### Creating a Plugin Validator

1. **Create package structure:**

```text
my-validator-plugin/
├── package.json
├── src/
│   └── index.ts
└── dist/
    └── index.js
```

1. **Name your package** with the prefix `claudelint-validator-`:

```json
{
  "name": "claudelint-validator-my-feature",
  "version": "1.0.0",
  "main": "dist/index.js",
  "keywords": ["claudelint", "validator"]
}
```

1. **Export your validator:**

```typescript
// src/index.ts
import { BaseValidator, ValidationResult } from '@pdugan20/claudelint';
import { ValidatorRegistry } from '@pdugan20/claudelint';

export class MyFeatureValidator extends BaseValidator {
  static readonly TYPE = 'my-feature';
  static readonly DISPLAY_NAME = 'My Feature Validator';

  async validate(): Promise<ValidationResult> {
    // Implementation
  }
}

// Auto-register when imported
ValidatorRegistry.register({
  name: MyFeatureValidator.TYPE,
  displayName: MyFeatureValidator.DISPLAY_NAME,
  factory: (options) => new MyFeatureValidator(options),
  enabled: true,
});
```

1. **Publish to npm:**

```bash
npm publish
```

1. **Users install and use:**

```bash
npm install claudelint-validator-my-feature

# Automatically discovered by claudelint
claudelint check-all
```

### Plugin Discovery

claudelint automatically discovers plugins in `node_modules/` that:

1. Have package name starting with `claudelint-validator-`
2. Export a validator that registers with `ValidatorRegistry`

See `src/utils/plugin-loader.ts` for implementation details.

## Best Practices Summary

### DO

- ✓ Use `BaseValidator` as the base class
- ✓ Register with `ValidatorRegistry` and `RuleRegistry`
- ✓ Use TypeScript with strict type safety
- ✓ Write comprehensive unit and integration tests
- ✓ Use fixture builders and custom matchers
- ✓ Follow consistent error message format
- ✓ Use utility functions from `validation-helpers.ts`
- ✓ Define Zod schemas for configuration validation
- ✓ Cache expensive operations
- ✓ Use parallel operations with `Promise.all()`
- ✓ Document your rules in `docs/rules/`

### DON'T

- ✗ Suppress errors silently
- ✗ Use magic numbers (use constants)
- ✗ Manually create test files (use fixtures)
- ✗ Use raw assertions (use custom matchers)
- ✗ Read entire large files into memory
- ✗ Perform sequential async operations when parallel is possible
- ✗ Forget to update type definitions for new rule IDs
- ✗ Skip integration tests

## Additional Resources

- [Architecture Documentation](./architecture.md)
- [Complete Rule Reference](./rules/index.md)
- [Validator Reference](./validators.md)
- [Plugin Development Guide](./plugin-development.md)
- [Test Helpers README](../tests/helpers/README.md)

## Getting Help

If you have questions about validator development:

1. Read the existing validator implementations in `src/validators/`
2. Check the test files in `tests/validators/` for examples
3. Review the composition framework in `src/composition/`
4. Open an issue on GitHub for specific questions
