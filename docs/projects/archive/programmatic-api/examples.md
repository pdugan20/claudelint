# Programmatic API - Code Examples

**Version:** 0.2.0 (Draft)
**Last Updated:** 2026-01-30

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Auto-Fix Examples](#auto-fix-examples)
3. [Custom Formatters](#custom-formatters)
4. [Build Integration](#build-integration)
5. [CI/CD Integration](#cicd-integration)
6. [Editor Integration](#editor-integration)
7. [Advanced Patterns](#advanced-patterns)

---

## Basic Usage

### Example 1: Simple Validation

Validate all markdown files in a project.

```typescript
import { ClaudeLint } from 'claudelint';

async function validateProject() {
  const linter = new ClaudeLint();
  const results = await linter.lintFiles(['**/*.md']);

  const formatter = await linter.loadFormatter('stylish');
  console.log(formatter.format(results));

  // Exit with error if problems found
  const hasErrors = results.some(r => r.errorCount > 0);
  process.exit(hasErrors ? 1 : 0);
}

validateProject();
```

### Example 2: Functional API (One-Liner)

Quick validation with functional API.

```typescript
import { lint, formatResults } from 'claudelint';

const results = await lint(['CLAUDE.md']);
console.log(await formatResults(results, 'stylish'));
```

### Example 3: Validate Text Content

Lint text without filesystem access.

```typescript
import { ClaudeLint } from 'claudelint';

const linter = new ClaudeLint();

const content = `
# CLAUDE.md

@import file-that-doesnt-exist.md
`;

const results = await linter.lintText(content, {
  filePath: 'CLAUDE.md'
});

console.log(`Errors: ${results[0].errorCount}`);
for (const msg of results[0].messages) {
  console.log(`Line ${msg.line}: ${msg.message}`);
}
```

---

## Auto-Fix Examples

### Example 4: Apply Fixes to Files

Fix issues and write changes to disk.

```typescript
import { ClaudeLint } from 'claudelint';

async function fixProject() {
  const linter = new ClaudeLint({ fix: true });
  const results = await linter.lintFiles(['**/*.md']);

  const fixableCount = results.reduce(
    (sum, r) => sum + r.fixableErrorCount + r.fixableWarningCount,
    0
  );

  console.log(`Found ${fixableCount} fixable issues`);

  // Write fixes to disk
  await ClaudeLint.outputFixes(results);

  console.log('Fixes applied!');
}

fixProject();
```

### Example 5: Preview Fixes Without Writing

See what would be fixed without modifying files.

```typescript
import { ClaudeLint } from 'claudelint';

const linter = new ClaudeLint({ fix: true });
const results = await linter.lintFiles(['skills/**/*.sh']);

// Get fixed content without writing
const fixed = ClaudeLint.getFixedContent(results);

for (const [filePath, content] of fixed) {
  console.log(`\n${filePath} would become:`);
  console.log('---');
  console.log(content);
  console.log('---');
}
```

### Example 6: Selective Auto-Fix

Only fix specific rules.

```typescript
import { ClaudeLint } from 'claudelint';

const linter = new ClaudeLint({
  fix: (message) => {
    // Only auto-fix these safe rules
    const safeFixes = [
      'skill-missing-shebang',
      'claude-md-trailing-whitespace'
    ];
    return safeFixes.includes(message.ruleId || '');
  }
});

const results = await linter.lintFiles(['**/*.md']);
await ClaudeLint.outputFixes(results);

console.log('Safe fixes applied. Manual review needed for others.');
```

---

## Custom Formatters

### Example 7: Custom Formatter

Create a custom output format.

```typescript
// custom-formatter.js
module.exports = {
  format(results) {
    let output = '';

    const totalErrors = results.reduce((s, r) => s + r.errorCount, 0);
    const totalWarnings = results.reduce((s, r) => s + r.warningCount, 0);

    output += `┌─ Validation Report ─┐\n`;
    output += `│ Files:    ${results.length.toString().padEnd(10)}│\n`;
    output += `│ Errors:   ${totalErrors.toString().padEnd(10)}│\n`;
    output += `│ Warnings: ${totalWarnings.toString().padEnd(10)}│\n`;
    output += `└────────────────────┘\n\n`;

    for (const result of results) {
      if (result.errorCount > 0 || result.warningCount > 0) {
        output += ` ${result.filePath}\n`;
        for (const msg of result.messages) {
          const icon = msg.severity === 'error' ? '[x]' : '! ';
          output += `  ${icon} Line ${msg.line}: ${msg.message}\n`;
        }
        output += '\n';
      }
    }

    return output;
  }
};

// Usage
import { ClaudeLint } from 'claudelint';

const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md']);
const formatter = await linter.loadFormatter('./custom-formatter.js');

console.log(formatter.format(results));
```

### Example 8: JSON Report

Generate JSON report for tooling.

```typescript
import { ClaudeLint } from 'claudelint';
import { writeFileSync } from 'fs';

const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md']);

// Use built-in JSON formatter
const formatter = await linter.loadFormatter('json');
const jsonOutput = formatter.format(results);

// Write to file
writeFileSync('lint-report.json', jsonOutput);

console.log('Report written to lint-report.json');
```

---

## Build Integration

### Example 9: Webpack Plugin

Integrate into webpack build.

```typescript
// webpack-claudelint-plugin.js
const { ClaudeLint } = require('claudelint');

class ClaudeLintPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.beforeCompile.tapPromise('ClaudeLintPlugin', async () => {
      console.log('Running claudelint...');

      const linter = new ClaudeLint({
        cache: true,
        ...this.options
      });

      const results = await linter.lintFiles(['**/*.md']);
      const errors = ClaudeLint.getErrorResults(results);

      if (errors.length > 0) {
        const formatter = await linter.loadFormatter('compact');
        console.error(formatter.format(errors));

        if (this.options.failOnError !== false) {
          throw new Error(`ClaudeLint found ${errors.length} errors`);
        }
      }
    });
  }
}

module.exports = ClaudeLintPlugin;

// webpack.config.js
const ClaudeLintPlugin = require('./webpack-claudelint-plugin');

module.exports = {
  // ... other config
  plugins: [
    new ClaudeLintPlugin({
      failOnError: true,
      cache: true
    })
  ]
};
```

### Example 10: Rollup Plugin

Integrate into rollup build.

```typescript
// rollup-plugin-claudelint.js
import { ClaudeLint } from 'claudelint';

export default function claudelint(options = {}) {
  return {
    name: 'claudelint',
    async buildStart() {
      const linter = new ClaudeLint(options);
      const results = await linter.lintFiles(['**/*.md']);

      const errors = ClaudeLint.getErrorResults(results);
      if (errors.length > 0) {
        const formatter = await linter.loadFormatter('stylish');
        console.error(formatter.format(errors));

        if (options.throwOnError) {
          this.error('ClaudeLint validation failed');
        }
      }
    }
  };
}

// rollup.config.js
import claudelint from './rollup-plugin-claudelint';

export default {
  // ... other config
  plugins: [
    claudelint({ throwOnError: true })
  ]
};
```

### Example 11: npm Script

Create custom npm script with advanced features.

```typescript
// scripts/validate.js
import { ClaudeLint } from 'claudelint';
import { writeFileSync } from 'fs';

async function validate() {
  const linter = new ClaudeLint({
    cache: true,
    onProgress: (file, idx, total) => {
      process.stdout.write(`\r[${idx}/${total}] Linting ${file}...`);
    }
  });

  console.log('Starting validation...\n');

  const results = await linter.lintFiles(['**/*.md', '**/*.json']);

  console.log('\n\nValidation complete!\n');

  // Generate reports
  const stylish = await linter.loadFormatter('stylish');
  console.log(stylish.format(results));

  // Save JSON report
  const json = await linter.loadFormatter('json');
  writeFileSync('reports/lint.json', json.format(results));

  // Exit with error if needed
  const hasErrors = results.some(r => r.errorCount > 0);
  if (hasErrors) {
    console.error('\n[x] Validation failed\n');
    process.exit(1);
  } else {
    console.log('\n[x] Validation passed\n');
  }
}

validate();

// package.json
{
  "scripts": {
    "validate": "node scripts/validate.js"
  }
}
```

---

## CI/CD Integration

### Example 12: GitHub Actions

Custom GitHub Actions integration.

```yaml
# .github/workflows/lint.yml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run claudelint
        run: node scripts/ci-lint.js
```

```typescript
// scripts/ci-lint.js
import { ClaudeLint } from 'claudelint';

async function lint() {
  const linter = new ClaudeLint({
    cache: false, // CI doesn't benefit from cache
    onProgress: (file, idx, total) => {
      console.log(`::notice::[${idx}/${total}] Linting ${file}`);
    }
  });

  const results = await linter.lintFiles(['**/*.md']);

  // Output GitHub Actions annotations
  for (const result of results) {
    for (const message of result.messages) {
      const level = message.severity === 'error' ? 'error' : 'warning';
      const line = message.line || 1;

      console.log(
        `::${level} file=${result.filePath},line=${line}::` +
        `[${message.ruleId}] ${message.message}`
      );
    }
  }

  // Summary
  const totalErrors = results.reduce((s, r) => s + r.errorCount, 0);
  const totalWarnings = results.reduce((s, r) => s + r.warningCount, 0);

  console.log(`\n::notice::${results.length} files checked`);
  console.log(`::notice::${totalErrors} errors, ${totalWarnings} warnings`);

  // Exit with error if needed
  process.exit(totalErrors > 0 ? 1 : 0);
}

lint();
```

### Example 13: GitLab CI

GitLab CI integration with artifacts.

```yaml
# .gitlab-ci.yml
lint:
  stage: test
  script:
    - npm ci
    - node scripts/gitlab-lint.js
  artifacts:
    when: always
    reports:
      junit: reports/lint.xml
    paths:
      - reports/
```

```typescript
// scripts/gitlab-lint.js
import { ClaudeLint } from 'claudelint';
import { writeFileSync, mkdirSync } from 'fs';

async function lint() {
  const linter = new ClaudeLint();
  const results = await linter.lintFiles(['**/*.md']);

  // Create reports directory
  mkdirSync('reports', { recursive: true });

  // Save JSON report
  const json = await linter.loadFormatter('json');
  writeFileSync('reports/lint.json', json.format(results));

  // Convert to JUnit format for GitLab
  const junit = convertToJUnit(results);
  writeFileSync('reports/lint.xml', junit);

  // Console output
  const stylish = await linter.loadFormatter('stylish');
  console.log(stylish.format(results));

  const hasErrors = results.some(r => r.errorCount > 0);
  process.exit(hasErrors ? 1 : 0);
}

function convertToJUnit(results) {
  // Convert LintResult[] to JUnit XML format
  // Implementation details...
  return junitXml;
}

lint();
```

---

## Editor Integration

### Example 14: VS Code Extension

Build VS Code extension with claudelint.

```typescript
// extension.ts
import * as vscode from 'vscode';
import { ClaudeLint, LintMessage } from 'claudelint';

let diagnosticCollection: vscode.DiagnosticCollection;
let linter: ClaudeLint;

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('claudelint');
  linter = new ClaudeLint();

  // Lint on save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(lintDocument)
  );

  // Lint on open
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(lintDocument)
  );

  // Lint current file command
  context.subscriptions.push(
    vscode.commands.registerCommand('claudelint.lintFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        lintDocument(editor.document);
      }
    })
  );

  // Fix current file command
  context.subscriptions.push(
    vscode.commands.registerCommand('claudelint.fixFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await fixDocument(editor.document);
      }
    })
  );
}

async function lintDocument(document: vscode.TextDocument) {
  // Only lint markdown files
  if (!document.fileName.endsWith('.md')) {
    return;
  }

  const results = await linter.lintText(document.getText(), {
    filePath: document.fileName
  });

  const diagnostics: vscode.Diagnostic[] = [];

  for (const message of results[0].messages) {
    const diagnostic = createDiagnostic(message);
    diagnostics.push(diagnostic);
  }

  diagnosticCollection.set(document.uri, diagnostics);
}

async function fixDocument(document: vscode.TextDocument) {
  const fixLinter = new ClaudeLint({ fix: true });
  const results = await fixLinter.lintText(document.getText(), {
    filePath: document.fileName
  });

  if (results[0].output) {
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(document.getText().length)
    );
    edit.replace(document.uri, fullRange, results[0].output);
    await vscode.workspace.applyEdit(edit);
  }
}

function createDiagnostic(message: LintMessage): vscode.Diagnostic {
  const line = (message.line || 1) - 1;
  const col = (message.column || 1) - 1;

  const range = new vscode.Range(line, col, line, col + 1);

  const diagnostic = new vscode.Diagnostic(
    range,
    message.message,
    message.severity === 'error'
      ? vscode.DiagnosticSeverity.Error
      : vscode.DiagnosticSeverity.Warning
  );

  diagnostic.code = message.ruleId;
  diagnostic.source = 'claudelint';

  return diagnostic;
}

export function deactivate() {
  diagnosticCollection.clear();
  diagnosticCollection.dispose();
}
```

---

## Advanced Patterns

### Example 15: Progress Reporting

Show detailed progress during validation.

```typescript
import { ClaudeLint } from 'claudelint';
import ora from 'ora';

async function validateWithProgress() {
  const spinner = ora();

  const linter = new ClaudeLint({
    onStart: (count) => {
      spinner.start(`Linting ${count} files...`);
    },
    onProgress: (file, idx, total) => {
      const percent = Math.round((idx / total) * 100);
      spinner.text = `[${percent}%] ${file}`;
    },
    onComplete: (results) => {
      spinner.stop();
    }
  });

  const results = await linter.lintFiles(['**/*.md']);

  const errors = results.reduce((s, r) => s + r.errorCount, 0);
  const warnings = results.reduce((s, r) => s + r.warningCount, 0);

  if (errors > 0) {
    console.log(`[x] ${errors} errors, ${warnings} warnings`);
  } else {
    console.log(`[x] No errors, ${warnings} warnings`);
  }
}

validateWithProgress();
```

### Example 16: Incremental Validation

Only validate changed files.

```typescript
import { ClaudeLint } from 'claudelint';
import { execSync } from 'child_process';

async function validateChanged() {
  // Get changed files from git
  const changed = execSync('git diff --name-only HEAD', { encoding: 'utf8' })
    .split('\n')
    .filter(f => f.endsWith('.md'));

  if (changed.length === 0) {
    console.log('No markdown files changed');
    return;
  }

  console.log(`Validating ${changed.length} changed files...`);

  const linter = new ClaudeLint();
  const results = await linter.lintFiles(changed);

  const formatter = await linter.loadFormatter('stylish');
  console.log(formatter.format(results));

  const hasErrors = results.some(r => r.errorCount > 0);
  process.exit(hasErrors ? 1 : 0);
}

validateChanged();
```

### Example 17: Parallel Validation of Multiple Projects

Validate multiple projects in parallel.

```typescript
import { ClaudeLint } from 'claudelint';

async function validateProjects() {
  const projects = [
    { name: 'Project A', path: './project-a' },
    { name: 'Project B', path: './project-b' },
    { name: 'Project C', path: './project-c' }
  ];

  // Validate all projects in parallel
  const validations = projects.map(async (project) => {
    const linter = new ClaudeLint({ cwd: project.path });
    const results = await linter.lintFiles(['**/*.md']);

    return {
      project: project.name,
      results,
      errors: results.reduce((s, r) => s + r.errorCount, 0)
    };
  });

  const allResults = await Promise.all(validations);

  // Report results
  for (const { project, errors } of allResults) {
    const status = errors === 0 ? '[x]' : '[x]';
    console.log(`${status} ${project}: ${errors} errors`);
  }

  const totalErrors = allResults.reduce((s, r) => s + r.errors, 0);
  process.exit(totalErrors > 0 ? 1 : 0);
}

validateProjects();
```

### Example 18: Custom Rule Filtering

Only run specific rules.

```typescript
import { ClaudeLint } from 'claudelint';

const linter = new ClaudeLint({
  ruleFilter: (ruleId) => {
    // Only run security-related rules
    return ruleId.includes('security') || ruleId.includes('permission');
  }
});

const results = await linter.lintFiles(['**/*.md']);

console.log('Security validation complete');
const formatter = await linter.loadFormatter('stylish');
console.log(formatter.format(results));
```

---

## More Examples

See the `examples/` directory in the repository for more complete, runnable examples:

- `examples/basic-usage.js` - Simple validation
- `examples/auto-fix.js` - Auto-fix workflow
- `examples/custom-formatter.js` - Custom output format
- `examples/build-integration.js` - Build tool integration
- `examples/editor-extension.js` - Editor extension pattern
- `examples/ci-integration.js` - CI/CD integration

---

**Questions?** See the [API Design](./API_DESIGN.md) or [Migration Guide](./MIGRATION_GUIDE.md).
