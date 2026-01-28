# Plugin Development Guide

This guide covers how to create custom validators for claudelint using the plugin system.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Plugin Structure](#plugin-structure)
- [Creating a Validator](#creating-a-validator)
- [Plugin API Reference](#plugin-api-reference)
- [Testing Your Plugin](#testing-your-plugin)
- [Publishing Your Plugin](#publishing-your-plugin)
- [Best Practices](#best-practices)

## Overview

The claudelint plugin system allows you to extend the tool with custom validators. Plugins are npm packages that:

- Follow a naming convention (`claudelint-plugin-*`)
- Implement the `ValidatorPlugin` interface
- Register one or more validators with the `ValidatorRegistry`

## Quick Start

### 1. Create a New Package

```bash
mkdir claudelint-plugin-myvalidator
cd claudelint-plugin-myvalidator
npm init -y
```

### 2. Install Dependencies

```bash
npm install --save-peer @pdugan20/claudelint
npm install --save-dev @pdugan20/claudelint typescript
```

### 3. Create Plugin Entry Point

Create `src/index.ts`:

```typescript
import { ValidatorPlugin } from '@pdugan20/claudelint/dist/utils/plugin-loader';
import { ValidatorRegistry } from '@pdugan20/claudelint/dist/utils/validator-factory';
import { BaseValidator, ValidationResult } from '@pdugan20/claudelint/dist/validators/base';

class MyValidator extends BaseValidator {
  async validate(): Promise<ValidationResult> {
    // Your validation logic here
    this.reportError('Example error', 'file.ts', 10, 'example-rule');
    return this.getResult();
  }
}

const plugin: ValidatorPlugin = {
  name: 'claudelint-plugin-myvalidator',
  version: '1.0.0',

  register(registry: typeof ValidatorRegistry): void {
    registry.register(
      {
        id: 'my-validator',
        name: 'My Custom Validator',
        description: 'Validates custom files',
        filePatterns: ['**/*.custom'],
        enabled: true,
      },
      (options) => new MyValidator(options)
    );
  },
};

export default plugin;
```

### 4. Build and Test

```bash
npx tsc
npm link
cd /path/to/test/project
npm link claudelint-plugin-myvalidator
claudelint check-all
```

## Plugin Structure

### Required Files

```text
claudelint-plugin-myvalidator/
├── package.json          # Package metadata
├── src/
│   └── index.ts         # Plugin entry point
├── dist/                # Compiled JavaScript
│   └── index.js
├── tsconfig.json        # TypeScript config
└── README.md            # Documentation
```

### package.json Requirements

```json
{
  "name": "claudelint-plugin-myvalidator",
  "version": "1.0.0",
  "description": "Custom validator for claudelint",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["claudelint", "claudelint-plugin"],
  "peerDependencies": {
    "@pdugan20/claudelint": ">=0.1.0"
  }
}
```

**Important**: Package name must start with `claudelint-plugin-` for automatic discovery.

## Creating a Validator

### Extending BaseValidator

All custom validators should extend `BaseValidator`:

```typescript
import { BaseValidator, ValidationResult, BaseValidatorOptions } from '@pdugan20/claudelint/dist/validators/base';

class MyValidator extends BaseValidator {
  constructor(options: BaseValidatorOptions = {}) {
    super(options);
  }

  async validate(): Promise<ValidationResult> {
    // Implementation here
    return this.getResult();
  }
}
```

### Reporting Errors and Warnings

```typescript
// Report an error
this.reportError(
  'Error message',
  'path/to/file.ts',
  42,                    // Line number (optional)
  'rule-id'              // Rule ID (optional)
);

// Report a warning
this.reportWarning(
  'Warning message',
  'path/to/file.ts',
  42,
  'rule-id'
);
```

### Using Composable Validators

Leverage the composition framework for cleaner validation:

```typescript
import { compose, all } from '@pdugan20/claudelint/dist/composition/operators';
import { readJSON, zodSchema } from '@pdugan20/claudelint/dist/composition/json-validators';
import { z } from 'zod';

class JsonValidator extends BaseValidator {
  async validate(): Promise<ValidationResult> {
    const context = {
      filePath: 'config.json',
      options: this.options,
      state: new Map(),
    };

    const validator = compose(
      readJSON(),
      zodSchema(z.object({ name: z.string() }))
    );

    const result = await validator('config.json', context);

    // Report results
    for (const error of result.errors) {
      this.reportError(error.message, error.file, error.line);
    }

    return this.getResult();
  }
}
```

## Plugin API Reference

### ValidatorPlugin Interface

```typescript
interface ValidatorPlugin {
  /** Plugin name (should match package name) */
  name: string;

  /** Plugin version (semver) */
  version: string;

  /** Registration function called when plugin is loaded */
  register: (registry: typeof ValidatorRegistry) => void;
}
```

### ValidatorMetadata Interface

```typescript
interface ValidatorMetadata {
  /** Unique identifier for the validator */
  id: string;

  /** Human-readable name */
  name: string;

  /** Brief description of what this validator checks */
  description: string;

  /** File patterns this validator applies to */
  filePatterns: string[];

  /** Whether this validator is enabled by default */
  enabled: boolean;
}
```

### BaseValidator Methods

#### Protected Methods

```typescript
// Report an error
protected reportError(
  message: string,
  file?: string,
  line?: number,
  ruleId?: RuleId,
  options?: { explanation?: string; howToFix?: string; fix?: string }
): void

// Report a warning
protected reportWarning(
  message: string,
  file?: string,
  line?: number,
  ruleId?: RuleId,
  options?: { explanation?: string; howToFix?: string }
): void

// Get final validation result
protected getResult(): ValidationResult
```

#### Available Options

```typescript
interface BaseValidatorOptions {
  /** Path to validate (file or directory) */
  path?: string;

  /** Enable verbose output */
  verbose?: boolean;

  /** Treat warnings as errors */
  warningsAsErrors?: boolean;

  /** Configuration object */
  config?: ClaudeLintConfig;
}
```

## Testing Your Plugin

### Unit Tests

Create tests for your validator:

```typescript
import { MyValidator } from '../src';

describe('MyValidator', () => {
  it('should detect issues', async () => {
    const validator = new MyValidator({ path: '/test/path' });
    const result = await validator.validate();

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });
});
```

### Integration Tests

Test with actual claudelint CLI:

```bash
# Link your plugin
npm link

# Create a test project
mkdir test-project
cd test-project
npm link claudelint-plugin-myvalidator

# Run claudelint
claudelint check-all
```

## Publishing Your Plugin

### 1. Prepare for Publication

```bash
# Build
npm run build

# Test
npm test

# Check package contents
npm pack --dry-run
```

### 2. Publish to npm

```bash
npm publish
```

### 3. Document Usage

Include clear usage instructions in your README:

- Installation steps
- What the plugin validates
- Configuration options (if any)
- Examples

## Best Practices

### Performance

- **Async Operations**: Use async/await for I/O operations
- **File Filtering**: Use glob patterns to limit files scanned
- **Caching**: Consider caching expensive operations

```typescript
import { glob } from 'glob';

async validate(): Promise<ValidationResult> {
  const files = await glob('**/*.custom', {
    ignore: ['node_modules/**', 'dist/**']
  });

  // Only process relevant files
  for (const file of files) {
    await this.validateFile(file);
  }

  return this.getResult();
}
```

### Error Messages

- **Be Specific**: Clearly describe what's wrong
- **Provide Context**: Include file path and line number
- **Suggest Fixes**: Use the `howToFix` option when possible

```typescript
this.reportError(
  'Invalid configuration format',
  'config.json',
  10,
  'invalid-config',
  {
    explanation: 'The "timeout" field must be a number',
    howToFix: 'Change "timeout": "30s" to "timeout": 30',
  }
);
```

### Type Safety

- Use TypeScript
- Leverage Zod schemas for validation
- Define clear interfaces for your validator options

### Documentation

- Document all rules and what they check
- Provide examples of valid and invalid code
- Include migration guides if you introduce breaking changes

### Versioning

Follow semantic versioning:

- **Major**: Breaking changes to plugin API
- **Minor**: New validators or features
- **Patch**: Bug fixes

## Examples

See the [example plugin](../examples/custom-validator-plugin) for a complete reference implementation.

## Support

- [GitHub Issues](https://github.com/pdugan20/claudelint/issues)
- [Contributing Guide](../CONTRIBUTING.md)
