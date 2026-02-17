---
description: Use the ClaudeLint class for shared configuration, progress tracking, selective auto-fix, and multiple linting operations. Full method and static API reference.
---

# ClaudeLint Class API

The `ClaudeLint` class is the primary interface for programmatic linting. Use it when you need shared configuration, progress tracking, selective auto-fix, or multiple operations on the same instance.

For simple one-off operations, see the [Functional API](./functional-api.md).

## Constructor

### new ClaudeLint(options?)

Creates a new ClaudeLint instance with optional configuration.

- **Parameters:** `options` ([ClaudeLintOptions](./types.md#claudelintoptions), optional) - Configuration options

```typescript
import { ClaudeLint } from 'claude-code-lint';

const linter = new ClaudeLint({
  fix: true,
  cwd: process.cwd(),
  config: {
    rules: { 'claude-md-size': 'warn' },
  },
});
```

## Instance Methods

### lintFiles()

Lints files matching the provided glob patterns.

- **Parameters:** `patterns` (`string[]`) - Glob patterns to match files
- **Returns:** [`LintResult[]`](./types.md#lintresult) - One result per matched file

::: code-group

```typescript [Signature]
async lintFiles(patterns: string[]): Promise<LintResult[]>
```

```typescript [Example]
const results = await linter.lintFiles(['**/*.md', '!node_modules/**']);

for (const result of results) {
  console.log(`${result.filePath}: ${result.errorCount} errors, ${result.warningCount} warnings`);
}
```

:::

### lintText()

Lints text content without requiring a file on disk.

- **Parameters:** `code` (`string`) - The text content to lint; `options` ([LintTextOptions](./types.md#linttextoptions), optional) - The `filePath` option determines which validators run
- **Returns:** [`LintResult[]`](./types.md#lintresult)

::: code-group

```typescript [Signature]
async lintText(code: string, options?: LintTextOptions): Promise<LintResult[]>
```

```typescript [Example]
const results = await linter.lintText('# CLAUDE.md\n\nMy instructions', {
  filePath: 'CLAUDE.md',
});
```

:::

### loadFormatter()

Loads a formatter by name or path.

- **Parameters:** `nameOrPath` (`string`) - Built-in name (`stylish`, `json`, `compact`, `sarif`, `github`) or path to custom formatter
- **Returns:** [`Formatter`](./formatters.md)

::: code-group

```typescript [Signature]
async loadFormatter(nameOrPath: string): Promise<Formatter>
```

```typescript [Example]
const formatter = await linter.loadFormatter('stylish');
console.log(formatter.format(results));
```

:::

### calculateConfigForFile()

Calculates the effective configuration for a specific file, including overrides.

- **Parameters:** `filePath` (`string`) - Path to the file
- **Returns:** [`ClaudeLintConfig`](./types.md#claudelintconfig) - Resolved config with overrides applied

::: code-group

```typescript [Signature]
async calculateConfigForFile(filePath: string): Promise<ClaudeLintConfig>
```

```typescript [Example]
const config = await linter.calculateConfigForFile('skills/test-skill/SKILL.md');
console.log('Active rules:', config.rules);
```

:::

### isPathIgnored()

Checks if a file path matches any ignore patterns.

- **Parameters:** `filePath` (`string`) - Path to check
- **Returns:** `boolean`

::: code-group

```typescript [Signature]
isPathIgnored(filePath: string): boolean
```

```typescript [Example]
if (linter.isPathIgnored('node_modules/package/file.md')) {
  console.log('File is ignored');
}
```

:::

### getRulesMetaForResults()

Extracts rule metadata for all rules referenced in lint results.

- **Parameters:** `results` (`LintResult[]`) - Lint results to extract rule info from
- **Returns:** `Map<string, RuleMetadata>`

::: code-group

```typescript [Signature]
getRulesMetaForResults(results: LintResult[]): Map<string, RuleMetadata>
```

```typescript [Example]
const rulesUsed = linter.getRulesMetaForResults(results);
for (const [ruleId, meta] of rulesUsed) {
  console.log(`${ruleId}: ${meta.description} (${meta.category})`);
}
```

:::

### getRules()

Gets metadata for all registered rules.

- **Returns:** `Map<string, RuleMetadata>`

::: code-group

```typescript [Signature]
getRules(): Map<string, RuleMetadata>
```

```typescript [Example]
const allRules = linter.getRules();
console.log(`Total rules: ${allRules.size}`);
```

:::

## Static Methods

### outputFixes()

Writes auto-fixes to disk for all results that have fixes. Only writes files where `result.output !== result.source`.

- **Parameters:** `results` (`LintResult[]`) - Results from a lint run with `fix: true`

::: code-group

```typescript [Signature]
static async outputFixes(results: LintResult[]): Promise<void>
```

```typescript [Example]
const linter = new ClaudeLint({ fix: true });
const results = await linter.lintFiles(['**/*.md']);
await ClaudeLint.outputFixes(results);
```

:::

### getFixedContent()

Returns fixed content without writing to disk. Useful for previewing fixes.

- **Parameters:** `results` (`LintResult[]`) - Results from a lint run with `fix: true`
- **Returns:** `Map<string, string>` - Map of file path to fixed content

::: code-group

```typescript [Signature]
static getFixedContent(results: LintResult[]): Map<string, string>
```

```typescript [Example]
const fixes = ClaudeLint.getFixedContent(results);
for (const [filePath, fixedContent] of fixes) {
  console.log(`Fixed: ${filePath}`);
}
```

:::

### getErrorResults()

Filters results to only those containing errors.

- **Parameters:** `results` (`LintResult[]`) - Results to filter
- **Returns:** `LintResult[]`

::: code-group

```typescript [Signature]
static getErrorResults(results: LintResult[]): LintResult[]
```

```typescript [Example]
const errors = ClaudeLint.getErrorResults(results);
if (errors.length > 0) process.exit(1);
```

:::

### getWarningResults()

Filters results to only those containing warnings.

- **Parameters:** `results` (`LintResult[]`) - Results to filter
- **Returns:** `LintResult[]`

::: code-group

```typescript [Signature]
static getWarningResults(results: LintResult[]): LintResult[]
```

```typescript [Example]
const warnings = ClaudeLint.getWarningResults(results);
console.log(`${warnings.length} files with warnings`);
```

:::

### findConfigFile()

Finds the nearest configuration file by walking up the directory tree.

- **Parameters:** `cwd` (`string`) - Directory to start searching from
- **Returns:** `string | null`

::: code-group

```typescript [Signature]
static findConfigFile(cwd: string): string | null
```

```typescript [Example]
const configPath = ClaudeLint.findConfigFile(process.cwd());
if (configPath) console.log(`Found config: ${configPath}`);
```

:::

### getVersion()

Returns the claudelint version string.

- **Returns:** `string`

```typescript
static getVersion(): string
```

## See Also

- [Functional API](./functional-api.md) - Stateless convenience functions
- [Types](./types.md) - Complete TypeScript type reference
- [Formatters](./formatters.md) - Built-in and custom formatters
- [Recipes](./recipes.md) - Practical usage patterns and examples
