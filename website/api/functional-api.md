# Functional API

Stateless convenience functions for simple, one-off linting operations. Each function creates a new `ClaudeLint` instance internally and returns the result.

For shared configuration, progress tracking, or multiple operations, use the [ClaudeLint class](./claudelint-class.md) instead. See the [Overview](./overview.md#choosing-an-api-style) for a comparison.

## Functions

### lint()

Lints files matching glob patterns.

```typescript
async function lint(patterns: string[], options?: LintOptions): Promise<LintResult[]>
```

**Parameters:**

- `patterns` (`string[]`) - Array of glob patterns
- `options` ([ClaudeLintOptions](./types.md#claudelintoptions), optional) - All constructor options plus `errorOnUnmatchedPattern`

```typescript
import { lint } from 'claude-code-lint';

const results = await lint(['**/*.md']);

const hasErrors = results.some(r => r.errorCount > 0);
if (hasErrors) process.exit(1);
```

### lintText()

Lints text content without a file on disk.

```typescript
async function lintText(code: string, options?: LintTextOptions): Promise<LintResult[]>
```

**Parameters:**

- `code` (`string`) - Text content to lint
- `options` ([LintTextOptions](./types.md#linttextoptions), optional) - The `filePath` option determines which validators run

```typescript
import { lintText } from 'claude-code-lint';

const results = await lintText('# CLAUDE.md\n\nMy instructions', {
  filePath: 'CLAUDE.md',
});

console.log(`Errors: ${results[0].errorCount}`);
```

### resolveConfig()

Resolves the effective configuration for a file, including overrides.

```typescript
async function resolveConfig(filePath: string, options?: ConfigOptions): Promise<ClaudeLintConfig>
```

**Parameters:**

- `filePath` (`string`) - Path to resolve config for
- `options` ([ConfigOptions](./types.md#configoptions-fileinfooptions-loadformatteroptions), optional)

```typescript
import { resolveConfig } from 'claude-code-lint';

const config = await resolveConfig('skills/test/SKILL.md');
console.log('Active rules:', config.rules);
```

### formatResults()

Formats lint results using a built-in or custom formatter.

```typescript
async function formatResults(
  results: LintResult[],
  formatterName?: string,
  options?: FormatterOptions
): Promise<string>
```

**Parameters:**

- `results` ([LintResult](./types.md#lintresult)[]) - Results to format
- `formatterName` (`string`, optional) - `stylish` (default), `json`, `compact`, `sarif`, or path to custom formatter
- `options` ([FormatterOptions](./types.md#formatteroptions), optional)

```typescript
import { lint, formatResults } from 'claude-code-lint';

const results = await lint(['**/*.md']);

const output = await formatResults(results);          // stylish (default)
const json = await formatResults(results, 'json');     // JSON
const sarif = await formatResults(results, 'sarif');   // SARIF
```

### getFileInfo()

Gets information about a file without linting it.

```typescript
async function getFileInfo(filePath: string, options?: FileInfoOptions): Promise<FileInfo>
```

**Parameters:**

- `filePath` (`string`) - Path to check
- `options` ([FileInfoOptions](./types.md#configoptions-fileinfooptions-loadformatteroptions), optional)

**Returns:** [FileInfo](./types.md#fileinfo) - Whether the file is ignored and which validators apply

```typescript
import { getFileInfo } from 'claude-code-lint';

const info = await getFileInfo('CLAUDE.md');
if (!info.ignored) {
  console.log('Validators:', info.validators);
}
```

## See Also

- [ClaudeLint Class](./claudelint-class.md) - Full class API for advanced use cases
- [Types](./types.md) - Complete TypeScript type reference
- [Formatters](./formatters.md) - Built-in and custom formatters
- [Recipes](./recipes.md) - Build scripts, CI/CD, pre-commit hooks, and more
