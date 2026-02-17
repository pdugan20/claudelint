---
description: Build claudelint integrations with practical code examples for build scripts, pre-commit hooks, CI pipelines, progress tracking, selective auto-fix, and custom formatters.
---

# Recipes

Practical examples and usage patterns for common claudelint integration scenarios. For API fundamentals, see the [ClaudeLint Class](./claudelint-class.md) or [Functional API](./functional-api.md) reference.

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

For a basic custom formatter example, see [Formatters](./formatters.md#custom-formatters). The examples below demonstrate more advanced patterns.

### Markdown Report Formatter

Outputs a Markdown report suitable for PR comments or documentation artifacts:

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

Groups all violations by rule ID instead of by file — useful for identifying the most common issues across a project:

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

## See Also

- [ClaudeLint Class](./claudelint-class.md) - Full class API reference
- [Functional API](./functional-api.md) - Stateless convenience functions
- [Formatters](./formatters.md) - Built-in formatter reference
