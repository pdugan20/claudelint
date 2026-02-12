# ClaudeLint Class API

The `ClaudeLint` class is the primary interface for programmatic linting. Use it when you need shared configuration, progress tracking, selective auto-fix, or multiple operations on the same instance.

For simple one-off operations, see the [Functional API](./functional-api.md).

## Constructor

### `new ClaudeLint(options?)`

Creates a new ClaudeLint instance with optional configuration.

- `options` ([ClaudeLintOptions](./types.md#claudelintoptions), optional) - Configuration options

```typescript
import { ClaudeLint } from 'claude-code-lint';

const linter = new ClaudeLint({
  fix: true,
  cwd: process.cwd(),
  config: {
    rules: { 'claude-md-size-warning': 'warn' },
  },
});
```

## Instance Methods

### lintFiles()

Lints files matching the provided glob patterns.

```typescript
async lintFiles(patterns: string[]): Promise<LintResult[]>
```

- `patterns` (`string[]`) - Array of glob patterns to match files

```typescript
const results = await linter.lintFiles(['**/*.md', '!node_modules/**']);

for (const result of results) {
  console.log(`${result.filePath}: ${result.errorCount} errors, ${result.warningCount} warnings`);
}
```

### lintText()

Lints text content without requiring a file on disk.

```typescript
async lintText(code: string, options?: LintTextOptions): Promise<LintResult[]>
```

- `code` (`string`) - The text content to lint
- `options` ([LintTextOptions](./types.md#linttextoptions), optional) - The `filePath` option determines which validators run

```typescript
const results = await linter.lintText('# CLAUDE.md\n\nMy instructions', {
  filePath: 'CLAUDE.md',
});
```

### loadFormatter()

Loads a formatter by name or path.

```typescript
async loadFormatter(nameOrPath: string): Promise<Formatter>
```

- `nameOrPath` (`string`) - Built-in name (`stylish`, `json`, `compact`, `sarif`) or path to custom formatter

```typescript
const formatter = await linter.loadFormatter('stylish');
console.log(formatter.format(results));
```

### calculateConfigForFile()

Calculates the effective configuration for a specific file, including overrides.

```typescript
async calculateConfigForFile(filePath: string): Promise<ClaudeLintConfig>
```

```typescript
const config = await linter.calculateConfigForFile('skills/test-skill/SKILL.md');
console.log('Active rules:', config.rules);
```

### isPathIgnored()

Checks if a file path matches any ignore patterns.

```typescript
isPathIgnored(filePath: string): boolean
```

```typescript
if (linter.isPathIgnored('node_modules/package/file.md')) {
  console.log('File is ignored');
}
```

### getRulesMetaForResults()

Extracts rule metadata for all rules referenced in lint results.

```typescript
getRulesMetaForResults(results: LintResult[]): Map<string, RuleMetadata>
```

```typescript
const rulesUsed = linter.getRulesMetaForResults(results);
for (const [ruleId, meta] of rulesUsed) {
  console.log(`${ruleId}: ${meta.description} (${meta.category})`);
}
```

### getRules()

Gets metadata for all registered rules.

```typescript
getRules(): Map<string, RuleMetadata>
```

```typescript
const allRules = linter.getRules();
console.log(`Total rules: ${allRules.size}`);
```

## Static Methods

### outputFixes()

Writes auto-fixes to disk for all results that have fixes.

```typescript
static async outputFixes(results: LintResult[]): Promise<void>
```

```typescript
const linter = new ClaudeLint({ fix: true });
const results = await linter.lintFiles(['**/*.md']);
await ClaudeLint.outputFixes(results);
```

::: tip
Only writes files where `result.output !== result.source`. Use with `fix: true` in constructor options.
:::

### getFixedContent()

Returns fixed content without writing to disk. Useful for previewing fixes.

```typescript
static getFixedContent(results: LintResult[]): Map<string, string>
```

```typescript
const fixes = ClaudeLint.getFixedContent(results);
for (const [filePath, fixedContent] of fixes) {
  console.log(`Fixed: ${filePath}`);
}
```

### getErrorResults()

Filters results to only those containing errors.

```typescript
static getErrorResults(results: LintResult[]): LintResult[]
```

```typescript
const errors = ClaudeLint.getErrorResults(results);
if (errors.length > 0) process.exit(1);
```

### getWarningResults()

Filters results to only those containing warnings.

```typescript
static getWarningResults(results: LintResult[]): LintResult[]
```

### findConfigFile()

Finds the nearest configuration file by walking up the directory tree.

```typescript
static findConfigFile(cwd: string): string | null
```

```typescript
const configPath = ClaudeLint.findConfigFile(process.cwd());
if (configPath) console.log(`Found config: ${configPath}`);
```

### getVersion()

Returns the claudelint version string.

```typescript
static getVersion(): string
```

## See Also

- [Functional API](./functional-api.md) - Stateless convenience functions
- [Types](./types.md) - Complete TypeScript type reference
- [Formatters](./formatters.md) - Built-in and custom formatters
- [Recipes](./recipes.md) - Practical usage patterns and examples
