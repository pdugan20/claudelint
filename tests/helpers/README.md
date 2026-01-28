# Test Helpers

This directory contains shared test utilities, fixture builders, and custom matchers to reduce test duplication and improve test readability.

## Table of Contents

- [Custom Matchers](#custom-matchers)
- [Test Helper Functions](#test-helper-functions)
- [Fixtures](#fixtures)

## Custom Matchers

The `matchers.ts` module provides custom Jest matchers for more expressive validation assertions.

### Setup

Import the matchers setup in your test file:

```typescript
import './helpers/setup-matchers';
// Or extend matchers manually:
import { matchers } from './helpers/matchers';
expect.extend(matchers);
```

### Available Matchers

#### `toPassValidation()`

Assert that validation passed with no errors:

```typescript
const result = await validator.validate();
expect(result).toPassValidation();
// Equivalent to:
// expect(result.valid).toBe(true);
// expect(result.errors).toHaveLength(0);
```

#### `toFailValidation()`

Assert that validation failed:

```typescript
const result = await validator.validate();
expect(result).toFailValidation();
```

#### `toHaveError(message)`

Assert that validation has an error matching the message:

```typescript
const result = await validator.validate();

// String matching
expect(result).toHaveError('File not found');
expect(result).toHaveError('not found'); // Partial match

// Regex matching
expect(result).toHaveError(/Expected \d+ items/);
```

#### `toHaveWarning(message)`

Assert that validation has a warning matching the message:

```typescript
expect(result).toHaveWarning('Deprecated feature');
expect(result).toHaveWarning(/File size: \d+KB/);
```

#### `toHaveErrorCount(count)`

Assert exact number of errors:

```typescript
expect(result).toHaveErrorCount(3);
expect(result).toHaveErrorCount(0); // No errors
```

#### `toHaveWarningCount(count)`

Assert exact number of warnings:

```typescript
expect(result).toHaveWarningCount(2);
```

#### `toHaveErrorWithRule(message, ruleId)`

Assert error with specific message and rule ID:

```typescript
expect(result).toHaveErrorWithRule('File too large', 'size-error');
expect(result).toHaveErrorWithRule(/too large/, 'size-error');
```

#### `toHaveErrorInFile(filePath)`

Assert errors exist in a specific file:

```typescript
expect(result).toHaveErrorInFile('src/index.ts');
```

#### `toHaveNoErrors()`

Assert no errors:

```typescript
expect(result).toHaveNoErrors();
```

#### `toHaveNoWarnings()`

Assert no warnings:

```typescript
expect(result).toHaveNoWarnings();
```

## Test Helper Functions

The `test-helpers.ts` module provides utility functions for common test patterns.

### Validation Helpers

```typescript
import {
  expectValidationToPass,
  expectValidationToFail,
  expectValidationToHaveError,
  expectValidationToHaveWarning,
  expectErrorCount,
  expectWarningCount,
} from './helpers/test-helpers';

// Expect validation to pass
await expectValidationToPass(validator);

// Expect validation to fail
await expectValidationToFail(validator);

// Expect specific error
await expectValidationToHaveError(validator, 'File not found');

// Expect specific warning
await expectValidationToHaveWarning(validator, /deprecated/i);

// Expect exact error count
await expectErrorCount(validator, 3);

// Expect exact warning count
await expectWarningCount(validator, 1);
```

### Result Inspection Helpers

```typescript
import {
  getErrorMessages,
  getWarningMessages,
  hasError,
  hasWarning,
  getErrorsForFile,
  getWarningsForFile,
  getErrorsWithRule,
  getWarningsWithRule,
} from './helpers/test-helpers';

const result = await validator.validate();

// Get all error/warning messages
const errorMsgs = getErrorMessages(result);
const warningMsgs = getWarningMessages(result);

// Check for specific messages
if (hasError(result, 'not found')) {
  // Handle error
}

// Filter by file
const fileErrors = getErrorsForFile(result, 'src/index.ts');
const fileWarnings = getWarningsForFile(result, 'src/index.ts');

// Filter by rule ID
const sizeErrors = getErrorsWithRule(result, 'size-error');
const deprecatedWarnings = getWarningsWithRule(result, 'deprecated-warning');
```

### Assertion Helpers

```typescript
import {
  assertAllErrorsHaveRuleId,
  assertAllWarningsHaveRuleId,
} from './helpers/test-helpers';

// Assert all errors have rule IDs
assertAllErrorsHaveRuleId(result);

// Assert all warnings have rule IDs
assertAllWarningsHaveRuleId(result);
```

### Mock Result Creation

```typescript
import { createMockResult } from './helpers/test-helpers';

// Create mock validation result for testing
const mockResult = createMockResult({
  valid: false,
  errors: [
    { message: 'Error 1', file: 'test.ts', line: 10, ruleId: 'test-rule' },
    { message: 'Error 2' },
  ],
  warnings: [
    { message: 'Warning 1', file: 'test.ts' },
  ],
});
```

## Fixtures

The `fixtures.ts` module provides fluent builders for creating test files. All builders follow a consistent API pattern:

```typescript
import { claudeMd, skill, settings, hooks, mcp, plugin } from './fixtures';

// Create files in a test directory
const testDir = '/path/to/test/dir';
```

### ClaudeMdBuilder

Create CLAUDE.md files for testing:

```typescript
// Minimal content
await claudeMd(testDir)
  .withMinimalContent()
  .build();

// Custom content
await claudeMd(testDir)
  .withContent('# My Project\n\nInstructions here.')
  .build();

// Specific size (for testing size limits)
await claudeMd(testDir)
  .withSize(40000) // 40KB
  .build();

// Custom filename
await claudeMd(testDir)
  .withContent('# Test')
  .build('CUSTOM.md');
```

### SkillBuilder

Create skills with SKILL.md and shell script:

```typescript
// Minimal skill
await skill(testDir, 'my-skill')
  .withMinimalFields()
  .build();

// Complete skill
await skill(testDir, 'my-skill')
  .withAllFields()
  .build();

// Custom skill
await skill(testDir, 'custom-skill')
  .with('name', 'custom-skill')
  .with('description', 'Custom description')
  .with('tools', ['Bash', 'Read'])
  .withScript('#!/bin/bash\necho "Custom script"')
  .build();
```

### SettingsBuilder

Create settings.json files:

```typescript
// Minimal settings
await settings(testDir)
  .withMinimalSettings()
  .build();

// Complete settings
await settings(testDir)
  .withAllSettings()
  .build();

// Custom settings
await settings(testDir)
  .with('model', 'opus')
  .with('maxTokens', 2000)
  .build();

// Invalid JSON (for error testing)
await settings(testDir).buildInvalid();
```

### HooksBuilder

Create hooks.json files:

```typescript
// Minimal hooks
await hooks(testDir)
  .withMinimalHooks()
  .build();

// All lifecycle hooks
await hooks(testDir)
  .withAllHooks()
  .build();

// Custom hooks
await hooks(testDir)
  .addHook('SessionStart', 'echo "Starting"')
  .addHook('CustomHook', 'echo "Custom"')
  .build();

// Invalid JSON
await hooks(testDir).buildInvalid();
```

### MCPBuilder

Create .mcp.json files:

```typescript
// Minimal MCP config
await mcp(testDir)
  .withMinimalConfig()
  .build();

// Complete MCP config
await mcp(testDir)
  .withCompleteConfig()
  .build();

// Custom servers
await mcp(testDir)
  .addServer('my-server', {
    command: 'node',
    args: ['server.js'],
  })
  .build();

// Invalid JSON
await mcp(testDir).buildInvalid();
```

### PluginBuilder

Create plugin.json files:

```typescript
// Minimal plugin
await plugin(testDir)
  .withMinimalManifest()
  .build();

// Complete plugin
await plugin(testDir)
  .withCompleteManifest()
  .build();

// Custom plugin
await plugin(testDir)
  .with('name', 'my-plugin')
  .with('version', '2.0.0')
  .with('skills', ['skill1', 'skill2'])
  .build();

// Invalid JSON
await plugin(testDir).buildInvalid();

// Custom filename
await plugin(testDir)
  .withMinimalManifest()
  .build('custom.json');
```

## Usage Example

Here's a complete example of using fixtures in a test:

```typescript
import { settings } from '../helpers/fixtures';
import { SettingsValidator } from '../../src/validators/settings';
import { setupTestDir } from '../helpers/test-utils';

describe('SettingsValidator', () => {
  const { getTestDir } = setupTestDir();

  it('should validate minimal settings', async () => {
    const filePath = await settings(getTestDir())
      .withMinimalSettings()
      .build();

    const validator = new SettingsValidator({ path: filePath });
    const result = await validator.validate();

    expect(result.valid).toBe(true);
  });

  it('should reject invalid model', async () => {
    const filePath = await settings(getTestDir())
      .with('model', 'invalid-model')
      .build();

    const validator = new SettingsValidator({ path: filePath });
    const result = await validator.validate();

    expect(result.valid).toBe(false);
  });

  it('should handle invalid JSON', async () => {
    const filePath = await settings(getTestDir()).buildInvalid();

    const validator = new SettingsValidator({ path: filePath });
    const result = await validator.validate();

    expect(result.valid).toBe(false);
  });
});
```

## Benefits

- **Fluent API**: Chainable methods make tests readable
- **Consistent**: All builders follow the same pattern
- **Type-safe**: Full TypeScript support with autocomplete
- **Flexible**: Support for minimal, complete, and custom configurations
- **Error testing**: Built-in support for creating invalid files
- **Less duplication**: Reusable across all test files
