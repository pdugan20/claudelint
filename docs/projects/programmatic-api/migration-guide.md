# Programmatic API - Migration Guide

**Version:** 0.2.0
**Last Updated:** 2026-01-30

## Overview

This guide helps you adopt claudelint's programmatic API. Whether you're upgrading from CLI-only usage, building custom integrations, or starting fresh, this guide covers common usage scenarios.

**Note:** claudelint follows ESLint/Prettier patterns by exporting only stable, documented public APIs. The ClaudeLint class is the recommended way to integrate claudelint programmatically.

---

## Quick Start

### Before (CLI Only)

```bash
claudelint check-all
```

### After (Programmatic API)

```typescript
import { ClaudeLint } from '@pdugan20/claudelint';

const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md']);

const formatter = await linter.loadFormatter('stylish');
console.log(formatter.format(results));
```

---

## Migration Scenarios

### Scenario 1: From CLI to Programmatic

**Before:** Using CLI in scripts

```bash
#!/bin/bash
claudelint check-all --fix
if [ $? -ne 0 ]; then
  echo "Linting failed"
  exit 1
fi
```

**After:** Using API in Node.js

```typescript
import { ClaudeLint } from '@pdugan20/claudelint';

async function validate() {
  const linter = new ClaudeLint({ fix: true });
  const results = await linter.lintFiles(['**/*.md']);

  const formatter = await linter.loadFormatter('stylish');
  console.log(formatter.format(results));

  const hasErrors = results.some(r => r.errorCount > 0);
  if (hasErrors) {
    console.error('Linting failed');
    process.exit(1);
  }
}

validate();
```

**Benefits:**
- [x] No shell execution overhead
- [x] Access to structured results
- [x] Better error handling
- [x] Progress callbacks
- [x] Easier to test

---

### Scenario 2: Custom Validation Script

**Before:** Custom shell script

```bash
#!/bin/bash

# validate-skills.sh
cd skills
find . -name "*.sh" -type f | while read file; do
  if ! bash -n "$file"; then
    echo "Syntax error in $file"
    exit 1
  fi
done
```

**After:** Using ClaudeLint API

```typescript
import { ClaudeLint } from '@pdugan20/claudelint';

async function validateSkills() {
  const linter = new ClaudeLint({
    cwd: './skills',
    onProgress: (file, idx, total) => {
      console.log(`Validating ${file} (${idx}/${total})`);
    }
  });

  const results = await linter.lintFiles(['**/*.sh', '**/*.md']);

  const formatter = await linter.loadFormatter('stylish');
  console.log(formatter.format(results));

  const hasErrors = results.some(r => r.errorCount > 0);
  process.exit(hasErrors ? 1 : 0);
}

validateSkills();
```

**Benefits:**
- [x] Runs all applicable validators automatically
- [x] Unified result format
- [x] Better error reporting
- [x] Progress callbacks
- [x] Configuration support

---

### Scenario 3: Build Tool Integration

**Before:** Shell out to CLI

```typescript
// webpack.config.js
const { execSync } = require('child_process');

module.exports = {
  plugins: [
    {
      apply(compiler) {
        compiler.hooks.beforeCompile.tap('ClaudeLint', () => {
          try {
            execSync('claudelint check-all', { stdio: 'inherit' });
          } catch (error) {
            throw new Error('Linting failed');
          }
        });
      }
    }
  ]
};
```

**After:** Use API directly

```typescript
// webpack.config.js
const { ClaudeLint } = require('@pdugan20/claudelint');

module.exports = {
  plugins: [
    {
      apply(compiler) {
        compiler.hooks.beforeCompile.tapPromise('ClaudeLint', async () => {
          const linter = new ClaudeLint({ cache: true });
          const results = await linter.lintFiles(['**/*.md']);

          const errors = ClaudeLint.getErrorResults(results);
          if (errors.length > 0) {
            const formatter = await linter.loadFormatter('compact');
            console.error(formatter.format(errors));
            throw new Error('Linting failed');
          }
        });
      }
    }
  ]
};
```

**Benefits:**
- [x] Faster (no process spawning)
- [x] Integrated error handling
- [x] Access to structured results
- [x] Better progress reporting

---

### Scenario 4: CI/CD Integration

**Before:** GitHub Actions with CLI

```yaml
# .github/workflows/lint.yml
- name: Run claudelint
  run: |
    npm install -g @pdugan20/claudelint
    claudelint check-all
```

**After:** Custom script with API

```yaml
# .github/workflows/lint.yml
- name: Run claudelint
  run: node scripts/lint.js
```

```typescript
// scripts/lint.js
import { ClaudeLint } from '@pdugan20/claudelint';

async function lint() {
  const linter = new ClaudeLint({
    cache: false, // CI environments
    onProgress: (file, idx, total) => {
      console.log(`::notice::[${idx}/${total}] Linting ${file}`);
    }
  });

  const results = await linter.lintFiles(['**/*.md']);

  // Output annotations for GitHub Actions
  for (const result of results) {
    for (const message of result.messages) {
      const level = message.severity === 'error' ? 'error' : 'warning';
      console.log(
        `::${level} file=${result.filePath},line=${message.line}::${message.message}`
      );
    }
  }

  const hasErrors = results.some(r => r.errorCount > 0);
  process.exit(hasErrors ? 1 : 0);
}

lint();
```

**Benefits:**
- [x] GitHub Actions annotations
- [x] Custom output formatting
- [x] Better progress reporting
- [x] Easier to extend

---

### Scenario 5: Editor Extension

**Before:** Not easily possible

**After:** Build VS Code extension

```typescript
// extension.ts
import * as vscode from 'vscode';
import { ClaudeLint } from '@pdugan20/claudelint';

export function activate(context: vscode.ExtensionContext) {
  const linter = new ClaudeLint();
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('claudelint');

  // Lint on save
  vscode.workspace.onDidSaveTextDocument(async (document) => {
    if (!document.fileName.endsWith('.md')) return;

    const results = await linter.lintText(document.getText(), {
      filePath: document.fileName
    });

    const diagnostics: vscode.Diagnostic[] = [];
    for (const message of results[0].messages) {
      const range = new vscode.Range(
        message.line! - 1, message.column! - 1,
        message.line! - 1, message.column! - 1
      );

      const diagnostic = new vscode.Diagnostic(
        range,
        message.message,
        message.severity === 'error'
          ? vscode.DiagnosticSeverity.Error
          : vscode.DiagnosticSeverity.Warning
      );

      diagnostic.code = message.ruleId;
      diagnostics.push(diagnostic);
    }

    diagnosticCollection.set(document.uri, diagnostics);
  });
}
```

**Benefits:**
- [x] Real-time validation
- [x] In-editor diagnostics
- [x] Auto-fix integration
- [x] Rule-specific code actions

---

## Public API Exports

claudelint follows ESLint and Prettier patterns by exporting only stable, documented public APIs.

### What's Exported (Stable Public API)

```typescript
// Main programmatic API class
import { ClaudeLint } from '@pdugan20/claudelint';

// Type definitions
import type {
  LintResult,
  LintMessage,
  ClaudeLintOptions,
  Formatter
} from '@pdugan20/claudelint';

// Formatter utilities
import { loadFormatter, BaseFormatter } from '@pdugan20/claudelint';

// Configuration utilities
import { findConfigFile, loadConfig } from '@pdugan20/claudelint';
```

### What's NOT Exported (Internal Implementation)

```typescript
// Internal validators are NOT part of the public API
// Use the ClaudeLint class instead:

const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md']);
```

---

## Common Patterns

### Pattern: One-Off Validation

```typescript
// Quick validation with functional API
import { lint } from '@pdugan20/claudelint';

const results = await lint(['CLAUDE.md']);
console.log(`Errors: ${results[0].errorCount}`);
```

### Pattern: Persistent Linter

```typescript
// Create linter once, use many times
const linter = new ClaudeLint({ cache: true });

// Lint different files
await linter.lintFiles(['**/*.md']);
await linter.lintFiles(['**/*.json']);
await linter.lintFiles(['skills/**/*.sh']);
```

### Pattern: Custom Output

```typescript
// Build custom output format
const results = await linter.lintFiles(['**/*.md']);

console.log('Validation Summary:');
console.log(`Files: ${results.length}`);
console.log(`Errors: ${results.reduce((s, r) => s + r.errorCount, 0)}`);
console.log(`Warnings: ${results.reduce((s, r) => s + r.warningCount, 0)}`);

for (const result of results) {
  if (result.errorCount > 0) {
    console.log(`\n${result.filePath}:`);
    for (const msg of result.messages.filter(m => m.severity === 'error')) {
      console.log(`  Line ${msg.line}: ${msg.message}`);
    }
  }
}
```

### Pattern: Progressive Validation

```typescript
// Show progress during validation
const linter = new ClaudeLint({
  onStart: (count) => {
    console.log(`Starting validation of ${count} files...`);
  },
  onProgress: (file, idx, total) => {
    const percent = Math.round((idx / total) * 100);
    console.log(`[${percent}%] ${file}`);
  },
  onComplete: (results) => {
    console.log('Validation complete!');
  }
});

await linter.lintFiles(['**/*.md']);
```

### Pattern: Selective Fixing

```typescript
// Only fix specific rules
const linter = new ClaudeLint({
  fix: (message) => {
    // Only auto-fix low-risk rules
    return [
      'skill-missing-shebang',
      'claude-md-trailing-whitespace'
    ].includes(message.ruleId || '');
  }
});

const results = await linter.lintFiles(['**/*.md']);
await ClaudeLint.outputFixes(results);
```

---

## API Comparison

### ClaudeLint vs ESLint

If you're familiar with ESLint's API:

| ESLint | ClaudeLint | Notes |
|--------|------------|-------|
| `new ESLint()` | `new ClaudeLint()` | Nearly identical constructor |
| `lintFiles(patterns)` | `lintFiles(patterns)` | Same method |
| `lintText(code, options)` | `lintText(code, options)` | Same method |
| `calculateConfigForFile()` | `calculateConfigForFile()` | Same method |
| `loadFormatter(name)` | `loadFormatter(name)` | Same method |
| `ESLint.outputFixes()` | `ClaudeLint.outputFixes()` | Same static method |

**Design Philosophy:** claudelint's API intentionally mirrors ESLint for familiarity.

---

## TypeScript Support

### Type Imports

```typescript
import {
  ClaudeLint,
  LintResult,
  LintMessage,
  ClaudeLintOptions,
  Formatter
} from '@pdugan20/claudelint';

// Fully typed
const linter: ClaudeLint = new ClaudeLint();
const results: LintResult[] = await linter.lintFiles(['**/*.md']);
const formatter: Formatter = await linter.loadFormatter('stylish');
```

### Type Inference

```typescript
// Types are inferred automatically
const linter = new ClaudeLint({ fix: true });
const results = await linter.lintFiles(['**/*.md']);

// TypeScript knows:
// - results is LintResult[]
// - results[0].errorCount is number
// - results[0].messages is LintMessage[]
```

---

## Performance Considerations

### Caching

```typescript
// Enable caching for repeated runs
const linter = new ClaudeLint({
  cache: true,
  cacheLocation: '.claudelint-cache'
});

// First run: slow (validates all files)
await linter.lintFiles(['**/*.md']);

// Second run: fast (uses cache)
await linter.lintFiles(['**/*.md']);
```

### Parallel vs Sequential

```typescript
// API runs validators in parallel automatically
const results = await linter.lintFiles(['**/*.md']);
// Internally uses Promise.all() for speed

// No need to manage parallelism yourself
```

### Memory Management

```typescript
// For very large projects, process in batches
const patterns = ['dir1/**/*.md', 'dir2/**/*.md', 'dir3/**/*.md'];

for (const pattern of patterns) {
  const results = await linter.lintFiles([pattern]);
  // Process results
  // Memory is freed between batches
}
```

---

## Testing Your Migration

### Test Equivalence

Verify API produces same results as CLI:

```typescript
import { execSync } from 'child_process';
import { ClaudeLint } from '@pdugan20/claudelint';

// CLI output
const cliOutput = execSync('claudelint check-all', { encoding: 'utf8' });

// API output
const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md']);
const formatter = await linter.loadFormatter('stylish');
const apiOutput = formatter.format(results);

// Should be identical
expect(apiOutput).toBe(cliOutput);
```

### Test Your Integration

```typescript
// Example test for build integration
describe('Build Integration', () => {
  it('should fail build on errors', async () => {
    const linter = new ClaudeLint();
    const results = await linter.lintFiles(['tests/fixtures/invalid/**/*.md']);

    const errors = ClaudeLint.getErrorResults(results);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass build on valid files', async () => {
    const linter = new ClaudeLint();
    const results = await linter.lintFiles(['tests/fixtures/valid/**/*.md']);

    const errors = ClaudeLint.getErrorResults(results);
    expect(errors.length).toBe(0);
  });
});
```

---

## Troubleshooting

### Issue: Results are different from CLI

**Cause:** Different configuration being loaded

**Solution:** Specify config explicitly

```typescript
const linter = new ClaudeLint({
  overrideConfigFile: './.claudelintrc.json'
});
```

### Issue: Performance is slower than CLI

**Cause:** Cache not enabled

**Solution:** Enable caching

```typescript
const linter = new ClaudeLint({
  cache: true,
  cacheLocation: '.claudelint-cache'
});
```

### Issue: TypeScript errors with types

**Cause:** Types not imported

**Solution:** Import types explicitly

```typescript
import type { LintResult, LintMessage } from '@pdugan20/claudelint';
```

### Issue: File paths not resolving

**Cause:** Wrong working directory

**Solution:** Set `cwd` option

```typescript
const linter = new ClaudeLint({
  cwd: '/path/to/project'
});
```

---

## Getting Help

- **Documentation:** [API Reference](./API_DESIGN.md)
- **Examples:** `examples/` directory
- **Issues:** [GitHub Issues](https://github.com/pdugan20/claudelint/issues)
- **Discussions:** [GitHub Discussions](https://github.com/pdugan20/claudelint/discussions)

---

## Feedback

We want to hear about your migration experience! Please:

- Report bugs in GitHub Issues
- Share your integration in Discussions
- Submit PRs for documentation improvements
- Request features you need

---

## Next Steps

1. [x] Install claudelint v0.2.0+
2. [x] Try the Quick Start example
3. [x] Read the [API Design document](./API_DESIGN.md)
4. [x] Migrate one script/integration at a time
5. [x] Share feedback!

Happy linting! 
