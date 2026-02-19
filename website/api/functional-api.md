---
description: Use claudelint's stateless functional API to lint files and text with a single function call. Covers lint, lintText, formatResults, resolveConfig, and getFileInfo.
---

# Functional API

Stateless convenience functions for simple, one-off linting operations. Each function creates a new `ClaudeLint` instance internally and returns the result.

For shared configuration, progress tracking, or multiple operations, use the [ClaudeLint class](./claudelint-class.md) instead. See the [Overview](./overview.md#choosing-an-api-style) for a comparison.

## Functions

### lint()

Lints files matching glob patterns.

- **Parameters:** `patterns` (`string[]`) - Glob patterns to match files; `options` ([ClaudeLintOptions](./types.md#claudelintoptions), optional) - All constructor options plus `errorOnUnmatchedPattern`
- **Returns:** [`LintResult[]`](./types.md#lintresult)

::: code-group

```typescript [Signature]
async function lint(patterns: string[], options?: LintOptions): Promise<LintResult[]>
```

```typescript [Example]
import { lint } from 'claude-code-lint';

const results = await lint(['**/*.md']);

const hasErrors = results.some(r => r.errorCount > 0);
if (hasErrors) process.exit(1);
```

:::

### lintText()

Lints text content without a file on disk.

- **Parameters:** `code` (`string`) - Text content to lint; `options` ([LintTextOptions](./types.md#linttextoptions), optional) - The `filePath` option determines which validators run
- **Returns:** [`LintResult[]`](./types.md#lintresult)

::: code-group

```typescript [Signature]
async function lintText(code: string, options?: LintTextOptions): Promise<LintResult[]>
```

```typescript [Example]
import { lintText } from 'claude-code-lint';

const results = await lintText('# CLAUDE.md\n\nMy instructions', {
  filePath: 'CLAUDE.md',
});

console.log(`Errors: ${results[0].errorCount}`);
```

:::

### resolveConfig()

Resolves the effective configuration for a file, including overrides.

- **Parameters:** `filePath` (`string`) - Path to resolve config for; `options` ([ConfigOptions](./types.md#configoptions-fileinfooptions-loadformatteroptions), optional)
- **Returns:** [`ClaudeLintConfig`](./types.md#claudelintconfig)

::: code-group

```typescript [Signature]
async function resolveConfig(filePath: string, options?: ConfigOptions): Promise<ClaudeLintConfig>
```

```typescript [Example]
import { resolveConfig } from 'claude-code-lint';

const config = await resolveConfig('skills/test/SKILL.md');
console.log('Active rules:', config.rules);
```

:::

### formatResults()

Formats lint results using a built-in or custom formatter.

- **Parameters:** `results` ([LintResult](./types.md#lintresult)[]) - Results to format; `formatterName` (`string`, optional) - `stylish` (default), `json`, `compact`, `sarif`, `github`, or path to custom formatter; `options` (`{ cwd?: string }`, optional)
- **Returns:** `string`

::: code-group

```typescript [Signature]
async function formatResults(
  results: LintResult[],
  formatterName?: string,
  options?: FormatterOptions
): Promise<string>
```

```typescript [Example]
import { lint, formatResults } from 'claude-code-lint';

const results = await lint(['**/*.md']);

const output = await formatResults(results);          // stylish (default)
const json = await formatResults(results, 'json');     // JSON
const sarif = await formatResults(results, 'sarif');   // SARIF
```

:::

### getFileInfo()

Gets information about a file without linting it.

- **Parameters:** `filePath` (`string`) - Path to check; `options` ([FileInfoOptions](./types.md#configoptions-fileinfooptions-loadformatteroptions), optional)
- **Returns:** [FileInfo](./types.md#fileinfo) - Whether the file is ignored and which validators apply

::: code-group

```typescript [Signature]
async function getFileInfo(filePath: string, options?: FileInfoOptions): Promise<FileInfo>
```

```typescript [Example]
import { getFileInfo } from 'claude-code-lint';

const info = await getFileInfo('CLAUDE.md');
if (!info.ignored) {
  console.log('Validators:', info.validators);
}
```

:::

### loadFormatter()

Loads a formatter by name or path. Standalone version of `ClaudeLint.loadFormatter()`.

- **Parameters:** `nameOrPath` (`string`) - Built-in name or path to custom formatter; `options` (`{ cwd?: string }`, optional)
- **Returns:** [`Formatter`](./formatters.md)

::: code-group

```typescript [Signature]
async function loadFormatter(
  nameOrPath: string,
  options?: { cwd?: string }
): Promise<Formatter>
```

```typescript [Example]
import { loadFormatter } from 'claude-code-lint';

const formatter = await loadFormatter('json');
console.log(formatter.format(results));
```

:::

## Constants

### BuiltinFormatterName

Type representing valid built-in formatter names. The `BUILTIN_FORMATTERS` array is also exported as a runtime value containing these same names.

```typescript
type BuiltinFormatterName = 'stylish' | 'json' | 'compact' | 'sarif' | 'github';
```

## See Also

- [ClaudeLint Class](./claudelint-class.md) - Full class API for advanced use cases
- [Types](./types.md) - Complete TypeScript type reference
- [Formatters](./formatters.md) - Built-in and custom formatters
- [Recipes](./recipes.md) - Practical usage patterns and examples
