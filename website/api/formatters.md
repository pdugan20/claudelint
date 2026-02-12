# Formatters

Formatters transform lint results into human-readable or machine-parseable output.

## Built-in Formatters

### stylish

Human-readable output with colors. Best for terminal display.

```text
CLAUDE.md
  10:1  error    File exceeds 40KB limit                  claude-md-size-error
  25:1  warning  Missing examples section                 claude-md-content-too-many-sections

skills/test/SKILL.md
  5:1   error    Missing description field                skill-description

3 problems (2 errors, 1 warning)
```

Features: color-coded severity, grouped by file, line numbers, rule IDs, summary totals.

### json

Machine-parseable JSON output. Best for programmatic consumption and CI/CD artifacts.

```json
[
  {
    "filePath": "CLAUDE.md",
    "messages": [
      {
        "ruleId": "claude-md-size-error",
        "severity": "error",
        "message": "File exceeds 40KB limit",
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

### compact

One violation per line. Best for grep-able output and log files.

```text
CLAUDE.md: line 10, error - File exceeds 40KB limit (claude-md-size-error)
CLAUDE.md: line 25, warning - Missing examples section (claude-md-content-too-many-sections)
skills/test/SKILL.md: line 5, error - Missing description field (skill-description)
```

### sarif

[SARIF](https://sarifweb.azurewebsites.net/) (Static Analysis Results Interchange Format) output. Best for GitHub Code Scanning, VS Code SARIF Viewer, and other SARIF-compatible tools.

See the [SARIF Integration Guide](/integrations/sarif) for setup instructions.

## Loading Formatters

### Class API

```typescript
const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md']);

const formatter = await linter.loadFormatter('stylish');
console.log(formatter.format(results));
```

### Functional API

```typescript
import { lint, formatResults } from 'claude-code-lint';

const results = await lint(['**/*.md']);
const output = await formatResults(results, 'json');
```

## Custom Formatters

Custom formatters must implement the [Formatter](./types.md#formatter) interface:

```typescript
interface Formatter {
  format(results: LintResult[]): string;
}
```

You can also extend [BaseFormatter](./types.md#baseformatter) for access to `getRelativePath()` and `getSummary()` helpers.

### Basic Example

```javascript
// formatters/summary.js
module.exports = {
  format(results) {
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);
    return `${results.length} files checked: ${totalErrors} errors, ${totalWarnings} warnings`;
  }
};
```

Load a custom formatter by path:

```typescript
// Class API
const formatter = await linter.loadFormatter('./formatters/summary.js');

// Functional API
const output = await formatResults(results, './formatters/summary.js');
```

For more custom formatter examples (Markdown, HTML, CSV, GitHub Actions annotations, group-by-rule), see [Recipes](./recipes.md#custom-formatters).

## Choosing a Formatter

| Use Case | Formatter |
|----------|-----------|
| Terminal display | `stylish` |
| CI/CD artifacts | `json` or `sarif` |
| GitHub Code Scanning | `sarif` |
| Log files | `compact` |
| Programmatic parsing | `json` |
| Custom reporting | [Create a custom formatter](./recipes.md#custom-formatters) |

## See Also

- [ClaudeLint Class](./claudelint-class.md) - `loadFormatter()` method
- [Functional API](./functional-api.md) - `formatResults()` function
- [Types](./types.md#formatter-types) - Formatter, BaseFormatter, FormatterOptions types
- [Recipes](./recipes.md#custom-formatters) - Custom formatter examples
