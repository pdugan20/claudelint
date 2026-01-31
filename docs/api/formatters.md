# Formatters

Guide to formatting lint results for display, reporting, and integration.

## Overview

Formatters transform lint results into human-readable or machine-parseable output. ClaudeLint includes built-in formatters for common use cases and supports custom formatters for specialized needs.

## Built-in Formatters

### stylish

Human-readable output with colors and formatting. Best for terminal display.

**Usage:**

```typescript
import { ClaudeLint } from 'claude-code-lint';

const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md']);

const formatter = await linter.loadFormatter('stylish');
const output = formatter.format(results);
console.log(output);
```

**Output Example:**

```text
CLAUDE.md
  10:1  error    File size exceeds 30,000 characters  claude-md-size-error
  25:1  warning  Missing examples section              claude-md-content-too-many-sections

skills/test/SKILL.md
  5:1   error    Missing description field             skill-description

3 problems (2 errors, 1 warning)
```

**Features:**

- Color-coded severity (red for errors, yellow for warnings)
- Grouped by file
- Shows line numbers and rule IDs
- Summary of total problems

### json

Machine-parseable JSON output. Best for programmatic consumption and CI/CD integration.

**Usage:**

```typescript
const formatter = await linter.loadFormatter('json');
const output = formatter.format(results);

// Parse and use
const data = JSON.parse(output);
for (const result of data) {
  console.log(`${result.filePath}: ${result.errorCount} errors`);
}
```

**Output Example:**

```json
[
  {
    "filePath": "CLAUDE.md",
    "messages": [
      {
        "ruleId": "claude-md-size-error",
        "severity": "error",
        "message": "File size exceeds 30,000 characters",
        "line": 10
      }
    ],
    "errorCount": 1,
    "warningCount": 0,
    "fixableErrorCount": 0,
    "fixableWarningCount": 0
  }
]
```

**Features:**

- Valid JSON array
- Complete result data
- Easy to parse and process
- Suitable for logging systems

### compact

Compact single-line format. Best for grep-able output and simple logging.

**Usage:**

```typescript
const formatter = await linter.loadFormatter('compact');
const output = formatter.format(results);
console.log(output);
```

**Output Example:**

```text
CLAUDE.md: line 10, error - File size exceeds 30,000 characters (claude-md-size-error)
CLAUDE.md: line 25, warning - Missing examples section (claude-md-content-too-many-sections)
skills/test/SKILL.md: line 5, error - Missing description field (skill-description)
```

**Features:**

- One violation per line
- Easily grep-able
- Compact format
- File path prefix for easy navigation

### junit

JUnit XML format. Best for CI/CD test reporting and integration with test runners.

**Usage:**

```typescript
const formatter = await linter.loadFormatter('junit');
const output = formatter.format(results);

// Write to file for CI/CD
await writeFile('lint-report.xml', output);
```

**Output Example:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="claude-code-lint" tests="2" failures="2">
  <testsuite name="CLAUDE.md" tests="2" failures="2">
    <testcase name="claude-md-size-error" classname="CLAUDE.md">
      <failure message="File size exceeds 30,000 characters">
        Line 10: File size exceeds 30,000 characters
      </failure>
    </testcase>
    <testcase name="claude-md-content-too-many-sections" classname="CLAUDE.md">
      <failure message="Missing examples section">
        Line 25: Missing examples section
      </failure>
    </testcase>
  </testsuite>
</testsuites>
```

**Features:**

- Standard JUnit XML format
- Compatible with CI/CD systems
- Test case per violation
- Suitable for Jenkins, GitLab CI, GitHub Actions

## Loading Formatters

### Class API

```typescript
import { ClaudeLint } from 'claude-code-lint';

const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md']);

// Load by name
const formatter = await linter.loadFormatter('stylish');
const output = formatter.format(results);

// Load custom formatter
const custom = await linter.loadFormatter('./formatters/my-formatter.js');
const customOutput = custom.format(results);
```

### Functional API

```typescript
import { lint, formatResults } from 'claude-code-lint';

const results = await lint(['**/*.md']);

// Default formatter (stylish)
const output = await formatResults(results);

// Specify formatter
const json = await formatResults(results, 'json');
const compact = await formatResults(results, 'compact');

// Custom formatter
const custom = await formatResults(results, './formatters/my-formatter.js');
```

## Custom Formatters

### Formatter Interface

Custom formatters must implement the Formatter interface:

```typescript
interface Formatter {
  format(results: LintResult[]): string;
}
```

### Basic Custom Formatter

Create a file that exports a formatter object:

```javascript
// formatters/summary.js
module.exports = {
  format(results) {
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);
    const filesWithIssues = results.filter(r => r.errorCount + r.warningCount > 0).length;

    return `
Validation Summary
==================
Files checked: ${results.length}
Files with issues: ${filesWithIssues}
Total errors: ${totalErrors}
Total warnings: ${totalWarnings}
    `.trim();
  }
};
```

**Usage:**

```typescript
const formatter = await linter.loadFormatter('./formatters/summary.js');
const output = formatter.format(results);
console.log(output);

// Output:
// Validation Summary
// ==================
// Files checked: 15
// Files with issues: 3
// Total errors: 5
// Total warnings: 2
```

### Advanced Custom Formatter

Formatter with colors and detailed breakdown:

```javascript
// formatters/detailed.js
const chalk = require('chalk');

module.exports = {
  format(results) {
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
          if (msg.fix) {
            output += chalk.green(`      Fix: ${msg.fix.description}\n`);
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
```

### TypeScript Custom Formatter

Use TypeScript for type safety:

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

      if (result.messages.length > 0) {
        output += '### Issues\n\n';
        for (const msg of result.messages) {
          const icon = msg.severity === 'error' ? '[ERROR]' : '[WARNING]';
          output += `${icon} **Line ${msg.line}**: ${msg.message}\n`;
          if (msg.ruleId) {
            output += `  - Rule: \`${msg.ruleId}\`\n`;
          }
          output += '\n';
        }
      }
    }

    return output;
  }
};

export default markdownFormatter;
```

### Formatter with Grouping

Group results by rule ID:

```javascript
// formatters/by-rule.js
module.exports = {
  format(results) {
    const byRule = new Map();

    for (const result of results) {
      for (const msg of result.messages) {
        const ruleId = msg.ruleId || 'unknown';
        if (!byRule.has(ruleId)) {
          byRule.set(ruleId, []);
        }
        byRule.get(ruleId).push({
          file: result.filePath,
          line: msg.line,
          message: msg.message,
          severity: msg.severity,
        });
      }
    }

    let output = 'Issues Grouped by Rule\n';
    output += '======================\n\n';

    for (const [ruleId, violations] of byRule) {
      output += `${ruleId} (${violations.length} violations)\n`;
      output += '-'.repeat(ruleId.length + 20) + '\n';

      for (const v of violations) {
        output += `  [${v.severity}] ${v.file}:${v.line} - ${v.message}\n`;
      }

      output += '\n';
    }

    return output;
  }
};
```

## Formatter Patterns

### HTML Report Formatter

Generate an HTML report:

```javascript
// formatters/html.js
module.exports = {
  format(results) {
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);

    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>ClaudeLint Report</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
    .file { margin: 20px 0; }
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
  </div>
`;

    for (const result of results) {
      if (result.messages.length === 0) continue;

      html += `
  <div class="file">
    <h2>${result.filePath}</h2>
`;

      for (const msg of result.messages) {
        const cssClass = msg.severity;
        html += `
    <div class="message ${cssClass}">
      <strong>Line ${msg.line}</strong>: ${msg.message}
      ${msg.ruleId ? `<br><small>${msg.ruleId}</small>` : ''}
    </div>
`;
      }

      html += `  </div>\n`;
    }

    html += `
</body>
</html>
`;

    return html;
  }
};
```

### CSV Export Formatter

Export to CSV for spreadsheet analysis:

```javascript
// formatters/csv.js
module.exports = {
  format(results) {
    let csv = 'File,Line,Severity,Rule,Message\n';

    for (const result of results) {
      for (const msg of result.messages) {
        const row = [
          result.filePath,
          msg.line || '',
          msg.severity || '',
          msg.ruleId || '',
          `"${(msg.message || '').replace(/"/g, '""')}"`,
        ].join(',');

        csv += row + '\n';
      }
    }

    return csv;
  }
};
```

### GitHub Actions Formatter

Output in GitHub Actions annotation format:

```javascript
// formatters/github-actions.js
module.exports = {
  format(results) {
    let output = '';

    for (const result of results) {
      for (const msg of result.messages) {
        const level = msg.severity === 'error' ? 'error' : 'warning';
        const line = msg.line || 1;

        // GitHub Actions annotation format
        output += `::${level} file=${result.filePath},line=${line}::${msg.message}`;

        if (msg.ruleId) {
          output += ` (${msg.ruleId})`;
        }

        output += '\n';
      }
    }

    return output;
  }
};
```

## Best Practices

### Formatter Development

1. **Return strings** - Always return a string from `format()`
2. **Handle empty results** - Check for results with no messages
3. **Escape output** - Escape special characters for your format (HTML, XML, CSV)
4. **Be consistent** - Follow conventions of your output format
5. **Document usage** - Add comments explaining formatter purpose

### Choosing a Formatter

- **Terminal display** → `stylish`
- **CI/CD integration** → `junit` or `json`
- **Log files** → `compact`
- **Programmatic parsing** → `json`
- **Custom reporting** → Create custom formatter

### Performance

- Formatters are cached after first load
- Custom formatters are loaded from disk once
- Use built-in formatters when possible for best performance

## Examples

### Multi-format Output

Generate multiple report formats:

```typescript
import { ClaudeLint } from 'claude-code-lint';
import { writeFile } from 'fs/promises';

const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md']);

// Console output
const stylish = await linter.loadFormatter('stylish');
console.log(stylish.format(results));

// JSON artifact
const json = await linter.loadFormatter('json');
await writeFile('lint-report.json', json.format(results));

// JUnit XML for CI
const junit = await linter.loadFormatter('junit');
await writeFile('lint-report.xml', junit.format(results));

// HTML report
const html = await linter.loadFormatter('./formatters/html.js');
await writeFile('lint-report.html', html.format(results));
```

### Conditional Formatting

Use different formatters based on environment:

```typescript
import { lint, formatResults } from 'claude-code-lint';

const results = await lint(['**/*.md']);

const formatterName = process.env.CI ? 'json' : 'stylish';
const output = await formatResults(results, formatterName);

console.log(output);
```

## See Also

- [ClaudeLint Class](./claude-code-lint-class.md) - Main API documentation
- [Functional API](./functional-api.md) - Stateless functions
- [Types](./types.md) - TypeScript type reference
- [Examples](../../examples/) - Complete usage examples
