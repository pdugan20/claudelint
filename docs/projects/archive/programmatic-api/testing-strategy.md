# Programmatic API - Testing Strategy

**Version:** 1.0
**Last Updated:** 2026-01-30

## Overview

This document outlines the testing strategy for the programmatic API implementation. We aim for >90% code coverage while ensuring the API is robust, reliable, and regression-free.

## Testing Goals

1. **Comprehensive Coverage:** >90% line and branch coverage for all API code
2. **No Regressions:** All existing tests continue to pass
3. **Type Safety:** Verify TypeScript types work correctly
4. **Integration Testing:** Test API with real files and scenarios
5. **Performance:** Ensure API performance matches CLI performance

## Testing Layers

### 1. Unit Tests

Test individual methods and functions in isolation.

**Location:** `tests/api/`

**Coverage:**

- `ClaudeLint` class methods
- Result builders
- Message converters
- Configuration resolution
- Formatter loading
- Utility functions

**Example:**

```typescript
// tests/api/claude-code-lint.test.ts
describe('ClaudeLint', () => {
  describe('constructor', () => {
    it('should initialize with default options', () => {
      const linter = new ClaudeLint();
      expect(linter).toBeInstanceOf(ClaudeLint);
    });

    it('should accept custom config', () => {
      const linter = new ClaudeLint({
        config: { rules: { 'test-rule': 'error' } }
      });
      // Verify config is set
    });

    it('should throw on invalid config', () => {
      expect(() => {
        new ClaudeLint({ config: 'invalid' as any });
      }).toThrow();
    });
  });

  describe('lintFiles', () => {
    it('should lint matching files', async () => {
      const linter = new ClaudeLint();
      const results = await linter.lintFiles(['tests/fixtures/valid/*.md']);
      expect(results).toHaveLength(2);
    });

    it('should respect ignore patterns', async () => {
      const linter = new ClaudeLint({
        ignorePatterns: ['**/ignored/**']
      });
      const results = await linter.lintFiles(['**/*.md']);
      expect(results.every(r => !r.filePath.includes('ignored'))).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const linter = new ClaudeLint();
      const results = await linter.lintFiles(['nonexistent/**/*.md']);
      expect(results).toEqual([]);
    });
  });

  describe('lintText', () => {
    it('should lint provided text', async () => {
      const linter = new ClaudeLint();
      const results = await linter.lintText('# CLAUDE.md\n\nContent');
      expect(results).toHaveLength(1);
    });

    it('should use filePath for config resolution', async () => {
      const linter = new ClaudeLint({
        config: {
          overrides: [
            {
              files: ['skills/**/*.md'],
              rules: { 'test-rule': 'error' }
            }
          ]
        }
      });
      const results = await linter.lintText('content', {
        filePath: 'skills/test/SKILL.md'
      });
      // Verify override was applied
    });
  });
});
```

### 2. Integration Tests

Test API with real validators and files.

**Location:** `tests/integration/api/`

**Coverage:**

- Full linting workflows
- Auto-fix application
- Configuration loading
- Formatter output
- Progress callbacks

**Example:**

```typescript
// tests/integration/api/full-workflow.test.ts
describe('Full API Workflow', () => {
  it('should lint, fix, and format real project', async () => {
    const linter = new ClaudeLint({
      fix: true,
      cache: false
    });

    // Lint real files
    const results = await linter.lintFiles(['tests/fixtures/project/**/*.md']);

    // Verify results structure
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('filePath');
    expect(results[0]).toHaveProperty('messages');

    // Apply fixes
    await ClaudeLint.outputFixes(results);

    // Format results
    const formatter = await linter.loadFormatter('stylish');
    const output = formatter.format(results);
    expect(typeof output).toBe('string');
  });

  it('should work with configuration file', async () => {
    const tempDir = createTempDir();
    writeConfigFile(tempDir, {
      rules: { 'claude-md-size-limit': 'error' }
    });

    const linter = new ClaudeLint({ cwd: tempDir });
    const results = await linter.lintFiles(['**/*.md']);

    // Config was loaded and applied
    expect(results.some(r =>
      r.messages.some(m => m.ruleId === 'claude-md-size-limit')
    )).toBe(true);
  });
});
```

### 3. Type Tests

Verify TypeScript type definitions and inference.

**Location:** `tests/types/`

**Tool:** `tsd` or `@typescript/lib-types`

**Coverage:**

- Exported types
- Type inference
- Generic constraints
- Method signatures

**Example:**

```typescript
// tests/types/api.test-d.ts
import { expectType, expectError } from 'tsd';
import { ClaudeLint, LintResult, LintMessage } from 'claude-code-lint';

// Constructor types
expectType<ClaudeLint>(new ClaudeLint());
expectType<ClaudeLint>(new ClaudeLint({ fix: true }));
expectError(new ClaudeLint({ fix: 'invalid' }));

// Method return types
const linter = new ClaudeLint();
expectType<Promise<LintResult[]>>(linter.lintFiles(['**/*.md']));
expectType<Promise<LintResult[]>>(linter.lintText('code'));

// Result types
declare const results: LintResult[];
expectType<number>(results[0].errorCount);
expectType<LintMessage[]>(results[0].messages);
expectType<string | undefined>(results[0].output);

// Static methods
expectType<Promise<void>>(ClaudeLint.outputFixes(results));
expectType<Map<string, string>>(ClaudeLint.getFixedContent(results));
```

### 4. Regression Tests

Ensure existing functionality still works.

**Location:** Existing test suite

**Strategy:**

- Run all existing tests against new implementation
- Verify CLI still works (uses new API internally)
- Check all existing validators function correctly

**Example:**

```typescript
// tests/regression/cli.test.ts
describe('CLI Regression', () => {
  it('should produce same output with new API', async () => {
    // Run CLI command
    const cliOutput = execSync('claude-code-lint check-all').toString();

    // Run via API
    const linter = new ClaudeLint();
    const results = await linter.lintFiles(['**/*.md']);
    const formatter = await linter.loadFormatter('stylish');
    const apiOutput = formatter.format(results);

    // Compare outputs (should be identical)
    expect(apiOutput).toBe(cliOutput);
  });
});
```

### 5. Performance Tests

Benchmark API performance vs CLI.

**Location:** `tests/performance/`

**Metrics:**

- Execution time
- Memory usage
- Cache effectiveness

**Example:**

```typescript
// tests/performance/api-benchmark.test.ts
describe('API Performance', () => {
  it('should match CLI performance within 5%', async () => {
    const files = ['tests/fixtures/large-project/**/*.md'];

    // Benchmark CLI
    const cliStart = Date.now();
    execSync(`claude-code-lint check-all ${files.join(' ')}`);
    const cliTime = Date.now() - cliStart;

    // Benchmark API
    const linter = new ClaudeLint();
    const apiStart = Date.now();
    await linter.lintFiles(files);
    const apiTime = Date.now() - apiStart;

    // API should be within 5% of CLI
    const difference = Math.abs(apiTime - cliTime) / cliTime;
    expect(difference).toBeLessThan(0.05);
  });

  it('should benefit from caching', async () => {
    const linter = new ClaudeLint({ cache: true });

    // First run (cold cache)
    const coldStart = Date.now();
    await linter.lintFiles(['**/*.md']);
    const coldTime = Date.now() - coldStart;

    // Second run (warm cache)
    const warmStart = Date.now();
    await linter.lintFiles(['**/*.md']);
    const warmTime = Date.now() - warmStart;

    // Warm cache should be significantly faster
    expect(warmTime).toBeLessThan(coldTime * 0.5);
  });
});
```

## Test Fixtures

### Directory Structure

```
tests/fixtures/api/
├── valid/
│   ├── CLAUDE.md           # Valid CLAUDE.md
│   ├── SKILL.md            # Valid SKILL.md
│   └── settings.json       # Valid settings
├── invalid/
│   ├── oversized.md        # Exceeds size limit
│   ├── missing-import.md   # Invalid @import
│   └── bad-json.json       # Invalid JSON
├── fixable/
│   ├── missing-shebang.sh  # Fixable issue
│   └── trailing-space.md   # Fixable whitespace
└── configs/
    ├── .claudelintrc.json  # Test config
    ├── overrides.json      # Config with overrides
    └── package.json        # Package.json config
```

### Fixture Creation

Create comprehensive fixtures for testing:

```typescript
// tests/fixtures/api/setup.ts
export function createValidClaudeMd(): string {
  return `# CLAUDE.md

This is valid content under 10MB.
`;
}

export function createInvalidClaudeMd(): string {
  return `# CLAUDE.md

@import nonexistent-file.md
`;
}

export function createFixableSkillScript(): string {
  return `echo "missing shebang"`;
}

export function createTestConfig(): ClaudeLintConfig {
  return {
    rules: {
      'claude-md-size-limit': 'error',
      'skill-missing-shebang': 'warn'
    }
  };
}
```

## Test Coverage Requirements

### Minimum Coverage Thresholds

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    },
    "src/api/**/*.ts": {
      "branches": 95,
      "functions": 95,
      "lines": 95,
      "statements": 95
    }
  }
}
```

### Priority Coverage Areas

1. **ClaudeLint class** - 100% coverage (core API)
2. **Result builders** - 100% coverage (critical)
3. **Configuration** - 95% coverage
4. **Formatters** - 90% coverage
5. **Utilities** - 90% coverage

## Test Execution Strategy

### During Development

```bash
# Run API tests only
npm test -- tests/api/

# Run with coverage
npm test -- --coverage tests/api/

# Run specific test file
npm test -- tests/api/claude-code-lint.test.ts

# Watch mode
npm test -- --watch tests/api/
```

### Pre-Commit

```bash
# Run all tests
npm test

# Run type checks
npm run type-check

# Run linting
npm run lint
```

### CI Pipeline

```yaml
# .github/workflows/test.yml
name: Test Programmatic API

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- tests/api/

      - name: Run integration tests
        run: npm test -- tests/integration/api/

      - name: Run type tests
        run: npm run test:types

      - name: Run regression tests
        run: npm test -- tests/regression/

      - name: Check coverage
        run: npm test -- --coverage --coverageThreshold='{"global":{"lines":90}}'

      - name: Run performance tests
        run: npm test -- tests/performance/
```

## Testing Best Practices

### 1. Test Isolation

Each test should be independent:

```typescript
describe('ClaudeLint', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create fresh temp directory
    tempDir = createTempDir();
  });

  afterEach(() => {
    // Clean up
    removeTempDir(tempDir);
  });

  it('should do something', () => {
    // Test uses tempDir
  });
});
```

### 2. Descriptive Test Names

Use clear, specific names:

```typescript
// Bad
it('should work', () => { ... });

// Good
it('should return empty array when no files match pattern', () => { ... });
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should apply fixes when fix option is enabled', async () => {
  // Arrange
  const linter = new ClaudeLint({ fix: true });
  const content = 'echo "test"'; // Missing shebang

  // Act
  const results = await linter.lintText(content, {
    filePath: 'test.sh'
  });

  // Assert
  expect(results[0].output).toContain('#!/usr/bin/env bash');
});
```

### 4. Test Edge Cases

```typescript
describe('lintFiles', () => {
  it('should handle empty pattern array', async () => {
    const results = await linter.lintFiles([]);
    expect(results).toEqual([]);
  });

  it('should handle non-existent directory', async () => {
    const results = await linter.lintFiles(['/nonexistent/**/*.md']);
    expect(results).toEqual([]);
  });

  it('should handle permission errors gracefully', async () => {
    // Test with unreadable file
  });
});
```

### 5. Mock External Dependencies

```typescript
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn()
}));

it('should handle file read errors', async () => {
  (readFile as jest.Mock).mockRejectedValue(new Error('EACCES'));

  await expect(linter.lintFiles(['test.md'])).rejects.toThrow('EACCES');
});
```

## Test Documentation

Each test file should include:

```typescript
/**
 * Tests for ClaudeLint.lintFiles() method
 *
 * Coverage:
 * - File discovery with glob patterns
 * - Ignore pattern handling
 * - Validator execution
 * - Result aggregation
 * - Error handling
 *
 * Fixtures:
 * - tests/fixtures/api/valid/
 * - tests/fixtures/api/invalid/
 */
describe('ClaudeLint.lintFiles', () => {
  // Tests here
});
```

## Success Criteria

API testing is complete when:

- [ ] >90% code coverage achieved
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Type tests verify all exported types
- [ ] No regressions in existing tests
- [ ] Performance tests show <5% difference from CLI
- [ ] All edge cases covered
- [ ] Documentation includes test examples
- [ ] CI pipeline runs all tests successfully

## Timeline

- **Week 1:** Unit tests for Phase 1 (Foundation)
- **Week 2:** Unit tests for Phase 2 (Core Features) + Integration tests
- **Week 3:** Unit tests for Phase 3 (Advanced Features) + Type tests
- **Week 4:** Regression tests, performance tests, final coverage push

## References

- [Jest Documentation](https://jestjs.io/)
- [TSD Type Testing](https://github.com/SamVerschueren/tsd)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
