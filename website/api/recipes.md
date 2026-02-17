# Recipes

Practical examples and usage patterns for common claudelint integration scenarios.

For API fundamentals, see the [ClaudeLint Class](./claudelint-class.md) or [Functional API](./functional-api.md) reference.

## Linting Patterns

### Build Script

Simple build validation that fails on errors:

```typescript
import { lint, formatResults } from 'claude-code-lint';

async function validateProject() {
  console.log('Validating Claude Code files...');

  const results = await lint(['**/*.md']);
  const hasErrors = results.some(r => r.errorCount > 0);

  if (hasErrors) {
    const output = await formatResults(results, 'stylish');
    console.error(output);
    process.exit(1);
  }

  console.log('Validation passed!');
}

validateProject();
```

### Pre-commit Hook

Validate only staged markdown files:

```typescript
import { execSync } from 'child_process';
import { lint, formatResults } from 'claude-code-lint';

async function validateStaged() {
  const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM')
    .toString()
    .split('\n')
    .filter(f => f.endsWith('.md'));

  if (stagedFiles.length === 0) return;

  const results = await lint(stagedFiles, {
    errorOnUnmatchedPattern: false,
  });

  const hasErrors = results.some(r => r.errorCount > 0);

  if (hasErrors) {
    const output = await formatResults(results, 'compact');
    console.error('Validation failed:');
    console.error(output);
    process.exit(1);
  }
}

validateStaged();
```

### CI/CD Pipeline

Generate multiple report formats for CI artifacts:

```typescript
import { writeFile } from 'fs/promises';
import { lint, formatResults } from 'claude-code-lint';

async function ciValidation() {
  const results = await lint(['**/*.md']);

  // Human-readable output
  const stylish = await formatResults(results, 'stylish');
  console.log(stylish);

  // JSON report for artifacts
  const json = await formatResults(results, 'json');
  await writeFile('lint-report.json', json);

  // SARIF for GitHub Code Scanning
  const sarif = await formatResults(results, 'sarif');
  await writeFile('lint-report.sarif', sarif);

  const hasErrors = results.some(r => r.errorCount > 0);
  process.exit(hasErrors ? 1 : 0);
}

ciValidation();
```

### Text Validation

Validate dynamically generated content without writing to disk:

```typescript
import { lintText } from 'claude-code-lint';

async function validateGeneratedContent(content: string) {
  const results = await lintText(content, {
    filePath: 'CLAUDE.md',
  });

  const issues = results[0].messages;

  if (issues.length > 0) {
    console.log('Content has issues:');
    for (const issue of issues) {
      console.log(`Line ${issue.line}: ${issue.message}`);
    }
    return false;
  }

  return true;
}
```

### Configuration Inspector

Check the effective configuration for a specific file:

```typescript
import { resolveConfig, getFileInfo } from 'claude-code-lint';

async function inspectFile(filePath: string) {
  const [config, info] = await Promise.all([
    resolveConfig(filePath),
    getFileInfo(filePath),
  ]);

  console.log(`File: ${filePath}`);
  console.log(`Ignored: ${info.ignored}`);
  console.log(`Validators: ${info.validators.join(', ')}`);
  console.log('\nActive Rules:');

  for (const [ruleId, ruleConfig] of Object.entries(config.rules || {})) {
    if (ruleConfig !== 'off') {
      console.log(`  ${ruleId}: ${ruleConfig}`);
    }
  }
}

inspectFile('skills/test-skill/SKILL.md');
```

### Progress Tracking

Monitor linting progress with callbacks:

```typescript
import { ClaudeLint } from 'claude-code-lint';

const linter = new ClaudeLint({
  onStart: (fileCount) => {
    console.log(`Starting validation of ${fileCount} files`);
  },
  onProgress: (file, index, total) => {
    const percent = Math.round((index / total) * 100);
    console.log(`[${percent}%] ${file}`);
  },
  onComplete: (results) => {
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
    console.log(`Completed with ${totalErrors} total errors`);
  },
});

await linter.lintFiles(['**/*.md']);
```

### Selective Auto-fix

Fix only specific rule categories:

```typescript
import { ClaudeLint } from 'claude-code-lint';

const linter = new ClaudeLint({
  fix: (message) => {
    // Only fix formatting issues, not structural problems
    return message.ruleId?.includes('format') || message.ruleId?.includes('style');
  },
});

const results = await linter.lintFiles(['**/*.md']);
await ClaudeLint.outputFixes(results);
```

## Custom Formatters

### Summary Formatter

A minimal formatter that outputs only aggregate counts:

```typescript
// formatters/summary.ts
import type { Formatter, LintResult } from 'claude-code-lint';

const summaryFormatter: Formatter = {
  format(results: LintResult[]): string {
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);
    const filesWithIssues = results.filter(r => r.errorCount + r.warningCount > 0).length;

    return [
      'Validation Summary',
      '==================',
      `Files checked: ${results.length}`,
      `Files with issues: ${filesWithIssues}`,
      `Total errors: ${totalErrors}`,
      `Total warnings: ${totalWarnings}`,
    ].join('\n');
  }
};

export default summaryFormatter;
```

### Detailed Formatter with Colors

Uses chalk for color-coded output with explanations:

```typescript
// formatters/detailed.ts
import chalk from 'chalk';
import type { Formatter, LintResult } from 'claude-code-lint';

const detailedFormatter: Formatter = {
  format(results: LintResult[]): string {
    let output = '';

    for (const result of results) {
      if (result.messages.length === 0) continue;

      output += chalk.underline(result.filePath) + '\n';

      const errors = result.messages.filter(m => m.severity === 'error');
      const warnings = result.messages.filter(m => m.severity === 'warning');

      if (errors.length > 0) {
        output += chalk.red.bold(`\n  Errors (${errors.length}):\n`);
        for (const msg of errors) {
          output += `    Line ${msg.line}: ${msg.message}\n`;
          if (msg.explanation) {
            output += chalk.gray(`      ${msg.explanation}\n`);
          }
        }
      }

      if (warnings.length > 0) {
        output += chalk.yellow.bold(`\n  Warnings (${warnings.length}):\n`);
        for (const msg of warnings) {
          output += `    Line ${msg.line}: ${msg.message}\n`;
        }
      }

      output += '\n';
    }

    return output;
  }
};

export default detailedFormatter;
```

### TypeScript Markdown Formatter

Type-safe formatter that outputs a Markdown report:

```typescript
// formatters/markdown.ts
import { Formatter, LintResult } from 'claude-code-lint';

const markdownFormatter: Formatter = {
  format(results: LintResult[]): string {
    let output = '# Lint Report\n\n';

    const filesWithIssues = results.filter(
      r => r.errorCount + r.warningCount > 0
    );

    if (filesWithIssues.length === 0) {
      return output + 'No issues found.\n';
    }

    output += `Found issues in ${filesWithIssues.length} file(s):\n\n`;

    for (const result of filesWithIssues) {
      output += `## ${result.filePath}\n\n`;
      output += `- Errors: ${result.errorCount}\n`;
      output += `- Warnings: ${result.warningCount}\n\n`;

      for (const msg of result.messages) {
        const icon = msg.severity === 'error' ? '[ERROR]' : '[WARNING]';
        output += `${icon} **Line ${msg.line}**: ${msg.message}`;
        if (msg.ruleId) output += ` (\`${msg.ruleId}\`)`;
        output += '\n';
      }

      output += '\n';
    }

    return output;
  }
};

export default markdownFormatter;
```

### Group-by-Rule Formatter

Groups all violations by rule ID instead of by file:

```typescript
// formatters/by-rule.ts
import type { Formatter, LintResult } from 'claude-code-lint';

interface Violation {
  file: string;
  line: number;
  message: string;
  severity: string;
}

const byRuleFormatter: Formatter = {
  format(results: LintResult[]): string {
    const byRule = new Map<string, Violation[]>();

    for (const result of results) {
      for (const msg of result.messages) {
        const ruleId = msg.ruleId || 'unknown';
        if (!byRule.has(ruleId)) byRule.set(ruleId, []);
        byRule.get(ruleId)!.push({
          file: result.filePath,
          line: msg.line,
          message: msg.message,
          severity: msg.severity,
        });
      }
    }

    let output = '';
    for (const [ruleId, violations] of byRule) {
      output += `${ruleId} (${violations.length} violations)\n`;
      for (const v of violations) {
        output += `  [${v.severity}] ${v.file}:${v.line} - ${v.message}\n`;
      }
      output += '\n';
    }

    return output;
  }
};

export default byRuleFormatter;
```

### GitHub Actions Formatter

Outputs annotations that GitHub Actions renders inline on PRs:

```typescript
// formatters/github-actions.ts
import type { Formatter, LintResult } from 'claude-code-lint';

const githubActionsFormatter: Formatter = {
  format(results: LintResult[]): string {
    let output = '';

    for (const result of results) {
      for (const msg of result.messages) {
        const level = msg.severity === 'error' ? 'error' : 'warning';
        const line = msg.line || 1;
        output += `::${level} file=${result.filePath},line=${line}::${msg.message}`;
        if (msg.ruleId) output += ` (${msg.ruleId})`;
        output += '\n';
      }
    }

    return output;
  }
};

export default githubActionsFormatter;
```

### CSV Export Formatter

Export violations to CSV for spreadsheet analysis:

```typescript
// formatters/csv.ts
import type { Formatter, LintResult } from 'claude-code-lint';

const csvFormatter: Formatter = {
  format(results: LintResult[]): string {
    let csv = 'File,Line,Severity,Rule,Message\n';

    for (const result of results) {
      for (const msg of result.messages) {
        csv += [
          result.filePath,
          msg.line || '',
          msg.severity || '',
          msg.ruleId || '',
          `"${(msg.message || '').replace(/"/g, '""')}"`,
        ].join(',') + '\n';
      }
    }

    return csv;
  }
};

export default csvFormatter;
```

### HTML Report Formatter

Generates a standalone HTML report:

```typescript
// formatters/html.ts
import type { Formatter, LintResult } from 'claude-code-lint';

const htmlFormatter: Formatter = {
  format(results: LintResult[]): string {
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);

    let html = `<!DOCTYPE html>
<html>
<head>
  <title>ClaudeLint Report</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
    .error { color: #d32f2f; }
    .warning { color: #f57c00; }
    .message { margin: 10px 0; padding: 10px; border-left: 3px solid #ccc; }
  </style>
</head>
<body>
  <h1>ClaudeLint Report</h1>
  <div class="summary">
    <p>Files: ${results.length}</p>
    <p class="error">Errors: ${totalErrors}</p>
    <p class="warning">Warnings: ${totalWarnings}</p>
  </div>`;

    for (const result of results) {
      if (result.messages.length === 0) continue;
      html += `\n  <h2>${result.filePath}</h2>`;
      for (const msg of result.messages) {
        html += `\n  <div class="message ${msg.severity}">`;
        html += `<strong>Line ${msg.line}</strong>: ${msg.message}`;
        if (msg.ruleId) html += `<br><small>${msg.ruleId}</small>`;
        html += `</div>`;
      }
    }

    html += '\n</body>\n</html>';
    return html;
  }
};

export default htmlFormatter;
```

## See Also

- [ClaudeLint Class](./claudelint-class.md) - Full class API reference
- [Functional API](./functional-api.md) - Stateless convenience functions
- [Formatters](./formatters.md) - Built-in formatter reference
