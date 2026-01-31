# Migration Guide

Guide for migrating from CLI to programmatic API usage, or integrating ClaudeLint into custom tools.

## Table of Contents

- [CLI to Programmatic API](#cli-to-programmatic-api)
- [Common Usage Patterns](#common-usage-patterns)
- [Public API Design](#public-api-design)
- [Best Practices](#best-practices)
- [Examples](#examples)

## CLI to Programmatic API

### Basic Validation

**CLI:**

```bash
claudelint check-all
```

**Programmatic API:**

```typescript
import { ClaudeLint } from 'claudelint';

const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md', '!node_modules/**']);

const hasErrors = results.some(r => r.errorCount > 0);
if (hasErrors) {
  process.exit(1);
}
```

Or using the functional API:

```typescript
import { lint } from 'claudelint';

const results = await lint(['**/*.md', '!node_modules/**']);
const hasErrors = results.some(r => r.errorCount > 0);
process.exit(hasErrors ? 1 : 0);
```

### Auto-fix

**CLI:**

```bash
claudelint check-all --fix
```

**Programmatic API:**

```typescript
import { ClaudeLint } from 'claudelint';

const linter = new ClaudeLint({ fix: true });
const results = await linter.lintFiles(['**/*.md', '!node_modules/**']);

// Write fixes to disk
await ClaudeLint.outputFixes(results);
```

Or using the functional API:

```typescript
import { lint } from 'claudelint';

const results = await lint(['**/*.md', '!node_modules/**'], { fix: true });

// Fixes are automatically applied to result.output
// Use ClaudeLint.outputFixes(results) to write them
```

### Format Output

**CLI:**

```bash
claudelint check-all --format json
```

**Programmatic API:**

```typescript
import { ClaudeLint } from 'claudelint';

const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md', '!node_modules/**']);

const formatter = await linter.loadFormatter('json');
const output = formatter.format(results);
console.log(output);
```

Or using the functional API:

```typescript
import { lint, formatResults } from 'claudelint';

const results = await lint(['**/*.md', '!node_modules/**']);
const output = await formatResults(results, 'json');
console.log(output);
```

### Configuration

**CLI:**

```bash
claudelint check-all --config custom.json
```

**Programmatic API:**

```typescript
import { ClaudeLint } from 'claudelint';
import { loadConfig } from 'claudelint';

// Load from file
const config = loadConfig('custom.json');
const linter = new ClaudeLint({ config });

// Or specify inline
const linter2 = new ClaudeLint({
  config: {
    rules: {
      'claude-md-size-warning': 'warn',
    },
  },
});
```

### Ignore Patterns

**CLI:**

Uses `.claudelintignore` file or config `ignorePatterns`.

**Programmatic API:**

```typescript
import { ClaudeLint } from 'claudelint';

const linter = new ClaudeLint({
  config: {
    ignorePatterns: [
      'node_modules/**',
      'dist/**',
      '*.backup.md',
    ],
  },
});
```

Or pass directly to `lintFiles()`:

```typescript
const results = await linter.lintFiles([
  '**/*.md',
  '!node_modules/**',
  '!dist/**',
]);
```

## Common Usage Patterns

### npm Scripts

Replace CLI commands with programmatic scripts:

**Before (package.json):**

```json
{
  "scripts": {
    "lint": "claudelint check-all",
    "lint:fix": "claudelint check-all --fix"
  }
}
```

**After (package.json + validate.js):**

```json
{
  "scripts": {
    "lint": "node scripts/validate.js",
    "lint:fix": "node scripts/validate.js --fix"
  }
}
```

```javascript
// scripts/validate.js
const { lint, formatResults, ClaudeLint } = require('claudelint');

async function main() {
  const shouldFix = process.argv.includes('--fix');

  const results = await lint(['**/*.md', '!node_modules/**'], {
    fix: shouldFix,
  });

  if (shouldFix) {
    await ClaudeLint.outputFixes(results);
  }

  const output = await formatResults(results, 'stylish');
  console.log(output);

  const hasErrors = results.some(r => r.errorCount > 0);
  process.exit(hasErrors ? 1 : 0);
}

main();
```

### Pre-commit Hook

**Before (.git/hooks/pre-commit or husky):**

```bash
#!/bin/bash
claudelint check-all
```

**After (husky/pre-commit):**

```bash
#!/bin/bash
node scripts/pre-commit.js
```

```javascript
// scripts/pre-commit.js
const { execSync } = require('child_process');
const { lint, formatResults } = require('claudelint');

async function main() {
  // Get staged .md files
  const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', {
    encoding: 'utf-8',
  })
    .split('\n')
    .filter(f => f.endsWith('.md') && f.length > 0);

  if (stagedFiles.length === 0) {
    process.exit(0);
  }

  const results = await lint(stagedFiles, {
    errorOnUnmatchedPattern: false,
  });

  const output = await formatResults(results, 'compact');
  console.log(output);

  const hasErrors = results.some(r => r.errorCount > 0);
  process.exit(hasErrors ? 1 : 0);
}

main();
```

### CI/CD Pipeline

**Before (.github/workflows/lint.yml):**

```yaml
- name: Lint
  run: claudelint check-all
```

**After:**

```yaml
- name: Lint
  run: node scripts/ci-lint.js
```

```javascript
// scripts/ci-lint.js
const { ClaudeLint } = require('claudelint');
const { writeFileSync } = require('fs');

async function main() {
  const linter = new ClaudeLint({
    onProgress: (file, index, total) => {
      console.log(`[${Math.round(((index + 1) / total) * 100)}%] ${file}`);
    },
  });

  const results = await linter.lintFiles(['**/*.md', '!node_modules/**']);

  // Generate multiple formats for CI
  const stylish = await linter.loadFormatter('stylish');
  console.log(stylish.format(results));

  const json = await linter.loadFormatter('json');
  writeFileSync('lint-report.json', json.format(results));

  const junit = await linter.loadFormatter('junit');
  writeFileSync('lint-report.xml', junit.format(results));

  const hasErrors = results.some(r => r.errorCount > 0);
  process.exit(hasErrors ? 1 : 0);
}

main();
```

## Public API Design

### What is Exported

ClaudeLint follows ESLint and Prettier patterns by exporting only stable, public APIs:

**Exported:**

- `ClaudeLint` class - Main programmatic API
- Functional API - `lint()`, `lintText()`, `resolveConfig()`, `formatResults()`, `getFileInfo()`
- Configuration utilities - `loadConfig()`, `findConfigFile()`
- Formatter utilities - `loadFormatter()`, `BaseFormatter`, `BUILTIN_FORMATTERS`
- Type definitions - All public interfaces and types

**Not Exported (Internal Implementation):**

- Validators - `SkillsValidator`, `ClaudeMdValidator`, etc.
- `ValidatorRegistry` - Internal registry for validators
- `RuleRegistry` - Internal registry for rules
- Internal utilities - Parsing helpers, schema validators, etc.

### Why This Matters

Internal implementation details may change between versions. Only use the exported public API to ensure your code remains compatible with future versions.

**Good:**

```typescript
import { ClaudeLint } from 'claudelint';

const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md']);
```

**Bad (will break in future versions):**

```typescript
// Don't do this - SkillsValidator is not part of public API
import { SkillsValidator } from 'claudelint/dist/validators/skills';
```

### Stability Guarantees

- **Public API**: Follows semantic versioning. Breaking changes only in major versions.
- **Internal APIs**: No stability guarantees. May change in any version.

## Best Practices

### Use the Right API Level

Choose the API that matches your complexity needs:

**Simple tasks:** Use functional API

```typescript
import { lint, formatResults } from 'claudelint';

const results = await lint(['**/*.md']);
const output = await formatResults(results);
console.log(output);
```

**Complex workflows:** Use class-based API

```typescript
import { ClaudeLint } from 'claudelint';

const linter = new ClaudeLint({
  fix: (msg) => msg.ruleId?.includes('format'),
  onProgress: (file, i, total) => console.log(`${i}/${total}`),
  config: { /* ... */ },
});

const results = await linter.lintFiles(['**/*.md']);
const formatter = await linter.loadFormatter('stylish');
console.log(formatter.format(results));
```

### Error Handling

Always handle errors appropriately:

```typescript
import { lint } from 'claudelint';

async function validate() {
  try {
    const results = await lint(['**/*.md']);

    const hasErrors = results.some(r => r.errorCount > 0);

    if (hasErrors) {
      console.error('Validation failed');
      process.exit(1);
    }

    console.log('Validation passed');
  } catch (error) {
    console.error('Linting error:', error.message);
    process.exit(1);
  }
}
```

### Performance Optimization

Enable caching for repeated linting operations:

```typescript
import { ClaudeLint } from 'claudelint';

const linter = new ClaudeLint({
  cache: true,
  cacheLocation: '.claudelint-cache',
  cacheStrategy: 'content',
});
```

### Configuration Management

Load configuration explicitly for better control:

```typescript
import { ClaudeLint, loadConfig } from 'claudelint';

// Load from file
const config = loadConfig('.claudelintrc.json');

// Modify if needed
config.rules = {
  ...config.rules,
  'custom-rule': 'error',
};

// Use modified config
const linter = new ClaudeLint({ config });
```

## Examples

### Build Tool Plugin

Create a plugin for your build tool:

```javascript
// webpack-plugin-claudelint.js
const { ClaudeLint } = require('claudelint');

class ClaudeLintPlugin {
  constructor(options = {}) {
    this.options = options;
    this.linter = new ClaudeLint(options);
  }

  apply(compiler) {
    compiler.hooks.beforeCompile.tapPromise('ClaudeLintPlugin', async () => {
      const results = await this.linter.lintFiles([
        '**/*.md',
        '!node_modules/**',
      ]);

      const hasErrors = results.some(r => r.errorCount > 0);

      if (hasErrors && !this.options.emitWarning) {
        throw new Error('ClaudeLint validation failed');
      }

      if (hasErrors && this.options.emitWarning) {
        console.warn('ClaudeLint validation warnings found');
      }
    });
  }
}

module.exports = ClaudeLintPlugin;
```

### Custom Reporter

Create a custom reporting tool:

```javascript
// reporter.js
const { ClaudeLint } = require('claudelint');
const { writeFileSync } = require('fs');

class ValidationReporter {
  async generateReport(patterns) {
    const linter = new ClaudeLint();
    const results = await linter.lintFiles(patterns);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: results.length,
        filesWithErrors: results.filter(r => r.errorCount > 0).length,
        totalErrors: results.reduce((sum, r) => sum + r.errorCount, 0),
        totalWarnings: results.reduce((sum, r) => sum + r.warningCount, 0),
      },
      files: results.map(r => ({
        path: r.filePath,
        errors: r.errorCount,
        warnings: r.warningCount,
        messages: r.messages.map(m => ({
          line: m.line,
          rule: m.ruleId,
          message: m.message,
          severity: m.severity,
        })),
      })),
    };

    writeFileSync('validation-report.json', JSON.stringify(report, null, 2));
    return report;
  }
}

module.exports = ValidationReporter;
```

### Test Integration

Integrate validation into tests:

```javascript
// test/validation.test.js
const { lint } = require('claudelint');

describe('Documentation Validation', () => {
  it('should have valid CLAUDE.md files', async () => {
    const results = await lint(['**/CLAUDE.md', '!node_modules/**']);

    const errors = results.filter(r => r.errorCount > 0);

    if (errors.length > 0) {
      const messages = errors.map(e =>
        `${e.filePath}: ${e.messages.map(m => m.message).join(', ')}`
      ).join('\n');

      throw new Error(`Validation errors:\n${messages}`);
    }
  });
});
```

## See Also

- [API Documentation](./README.md) - Complete API reference
- [ClaudeLint Class](./claudelint-class.md) - Detailed class documentation
- [Functional API](./functional-api.md) - Functional API reference
- [Examples](../../examples/) - Complete usage examples
