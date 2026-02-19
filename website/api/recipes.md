---
description: Practical code examples for claudelint progress tracking, selective auto-fix, configuration inspection, and custom formatters.
---

# Recipes

Practical examples for claudelint integration scenarios that go beyond basic API usage. For API fundamentals, see the [ClaudeLint Class](./claudelint-class.md) or [Functional API](./functional-api.md) reference.

## Configuration Inspector

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

## Progress Tracking

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

## Selective Auto-fix

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

For a basic custom formatter example, see [Formatters](./formatters.md#custom-formatters).

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
