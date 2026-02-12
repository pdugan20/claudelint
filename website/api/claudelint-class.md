# ClaudeLint Class API

Complete reference for the `ClaudeLint` class, the primary interface for programmatic linting.

## Table of Contents

- [Constructor](#constructor)
- [Instance Methods](#instance-methods)
  - [lintFiles()](#lintfiles)
  - [lintText()](#linttext)
  - [loadFormatter()](#loadformatter)
  - [calculateConfigForFile()](#calculateconfigforfile)
  - [isPathIgnored()](#ispathignored)
  - [getRulesMetaForResults()](#getrulesmetaforresults)
  - [getRules()](#getrules)
- [Static Methods](#static-methods)
  - [outputFixes()](#outputfixes)
  - [getFixedContent()](#getfixedcontent)
  - [getErrorResults()](#geterrorresults)
  - [getWarningResults()](#getwarningresults)
  - [getVersion()](#getversion)
- [Options Reference](#options-reference)
- [Examples](#examples)

## Constructor

### `new ClaudeLint(options?)`

Creates a new ClaudeLint instance with optional configuration.

**Parameters:**

- `options` (ClaudeLintOptions, optional) - Configuration options

**Returns:** ClaudeLint instance

**Example:**

```typescript
import { ClaudeLint } from 'claude-code-lint';

const linter = new ClaudeLint({
  fix: true,
  cwd: process.cwd(),
  config: {
    rules: {
      'claude-md-size-warning': 'warn',
    },
  },
  onProgress: (file, index, total) => {
    console.log(`Linting ${file} (${index + 1}/${total})`);
  },
});
```

## Instance Methods

### lintFiles()

Lints files matching the provided glob patterns.

```typescript
async lintFiles(patterns: string[], options?: LintOptions): Promise<LintResult[]>
```

**Parameters:**

- `patterns` (string[]) - Array of glob patterns to match files
- `options` (LintOptions, optional) - Additional linting options

**Returns:** Promise&lt;LintResult[]&gt; - Array of lint results, one per file

**Example:**

```typescript
const results = await linter.lintFiles(['**/*.md', '!node_modules/**']);

for (const result of results) {
  console.log(`${result.filePath}: ${result.errorCount} errors, ${result.warningCount} warnings`);
}
```

**Options:**

```typescript
interface LintOptions {
  errorOnUnmatchedPattern?: boolean; // Throw error if no files match (default: true)
}
```

### lintText()

Lints text content without requiring a file on disk.

```typescript
async lintText(code: string, options?: LintTextOptions): Promise<LintResult[]>
```

**Parameters:**

- `code` (string) - The text content to lint
- `options` (LintTextOptions, optional) - Linting options

**Returns:** Promise&lt;LintResult[]&gt; - Array with single lint result

**Example:**

```typescript
const code = '# CLAUDE.md\n\nMy instructions';
const results = await linter.lintText(code, {
  filePath: 'CLAUDE.md',
});

console.log(`Found ${results[0].errorCount} errors`);
```

**Options:**

```typescript
interface LintTextOptions {
  filePath?: string; // Virtual file path for context (default: random temp file)
}
```

**Notes:**

- Creates a temporary file internally, validates it, then cleans up
- The `filePath` option determines which validators run (e.g., 'CLAUDE.md' runs CLAUDE.md validators)
- Ignored files return a warning instead of validation results

### loadFormatter()

Loads a formatter by name or path.

```typescript
async loadFormatter(nameOrPath: string, options?: LoadFormatterOptions): Promise<Formatter>
```

**Parameters:**

- `nameOrPath` (string) - Built-in formatter name ('stylish', 'json', 'compact', 'junit') or path to custom formatter
- `options` (LoadFormatterOptions, optional) - Formatter options

**Returns:** Promise&lt;Formatter&gt; - Loaded formatter instance

**Example:**

```typescript
// Load built-in formatter
const formatter = await linter.loadFormatter('stylish');
const output = formatter.format(results);
console.log(output);

// Load custom formatter
const customFormatter = await linter.loadFormatter('./formatters/my-formatter.js');
const customOutput = customFormatter.format(results);
```

**Built-in Formatters:**

- `stylish` - Human-readable output with colors (default)
- `json` - JSON format for programmatic consumption
- `compact` - Compact single-line format
- `junit` - JUnit XML format for CI/CD integration

**Custom Formatters:**

Custom formatters must export an object implementing the Formatter interface:

```typescript
module.exports = {
  format(results) {
    // Return formatted string
    return results.map(r => `${r.filePath}: ${r.errorCount} errors`).join('\n');
  }
};
```

### calculateConfigForFile()

Calculates the effective configuration for a specific file, including overrides.

```typescript
async calculateConfigForFile(filePath: string): Promise<ClaudeLintConfig>
```

**Parameters:**

- `filePath` (string) - Path to file

**Returns:** Promise&lt;ClaudeLintConfig&gt; - Merged configuration with overrides applied

**Example:**

```typescript
const config = await linter.calculateConfigForFile('skills/test-skill/SKILL.md');

console.log('Active rules:', config.rules);
// Shows rules including any overrides for skills/**/*.md
```

**Notes:**

- Applies configuration overrides based on file pattern matching
- Uses minimatch for glob pattern matching
- Later overrides take precedence over earlier ones

### isPathIgnored()

Checks if a file path matches any ignore patterns.

```typescript
isPathIgnored(filePath: string): boolean
```

**Parameters:**

- `filePath` (string) - Path to check

**Returns:** boolean - True if file should be ignored

**Example:**

```typescript
if (linter.isPathIgnored('node_modules/package/file.md')) {
  console.log('File is ignored');
}
```

**Notes:**

- Uses minimatch for pattern matching
- Checks against `ignorePatterns` in configuration
- Returns false if no ignore patterns configured

### getRulesMetaForResults()

Extracts rule metadata for all rules referenced in results.

```typescript
getRulesMetaForResults(results: LintResult[]): Map<string, RuleMetadata>
```

**Parameters:**

- `results` (LintResult[]) - Lint results to extract rules from

**Returns:** Map&lt;string, RuleMetadata&gt; - Map of rule ID to metadata

**Example:**

```typescript
const results = await linter.lintFiles(['**/*.md']);
const rulesUsed = linter.getRulesMetaForResults(results);

for (const [ruleId, meta] of rulesUsed) {
  console.log(`${ruleId}: ${meta.description}`);
  console.log(`  Category: ${meta.category}`);
  console.log(`  Severity: ${meta.severity}`);
}
```

**RuleMetadata Type:**

```typescript
interface RuleMetadata {
  id: string;
  description: string;
  category: string;
  severity: 'error' | 'warning';
  fixable?: boolean;
}
```

### getRules()

Gets metadata for all registered rules.

```typescript
getRules(): Map<string, RuleMetadata>
```

**Returns:** Map&lt;string, RuleMetadata&gt; - Map of all rule IDs to metadata

**Example:**

```typescript
const allRules = linter.getRules();

console.log(`Total rules: ${allRules.size}`);

// List fixable rules
for (const [ruleId, meta] of allRules) {
  if (meta.fixable) {
    console.log(`${ruleId} (fixable)`);
  }
}
```

## Static Methods

### outputFixes()

Writes auto-fixes to disk for all results with fixes.

```typescript
static async outputFixes(results: LintResult[]): Promise<void>
```

**Parameters:**

- `results` (LintResult[]) - Results with fixes to apply

**Returns:** Promise&lt;void&gt;

**Example:**

```typescript
const linter = new ClaudeLint({ fix: true });
const results = await linter.lintFiles(['**/*.md']);

// Apply fixes to disk
await ClaudeLint.outputFixes(results);
console.log('Fixes applied');
```

**Notes:**

- Only writes files that have fixes (`result.output !== result.source`)
- Throws error if file write fails
- Use with `fix: true` option to enable auto-fix

### getFixedContent()

Returns fixed content without writing to disk.

```typescript
static getFixedContent(results: LintResult[]): Map<string, string>
```

**Parameters:**

- `results` (LintResult[]) - Results with fixes

**Returns:** Map&lt;string, string&gt; - Map of file path to fixed content

**Example:**

```typescript
const linter = new ClaudeLint({ fix: true });
const results = await linter.lintFiles(['**/*.md']);

const fixes = ClaudeLint.getFixedContent(results);

for (const [filePath, fixedContent] of fixes) {
  console.log(`Fixed content for ${filePath}:`);
  console.log(fixedContent);
}
```

**Notes:**

- Returns only files with fixes applied
- Useful for previewing fixes before applying
- Safe for dry-run scenarios

### getErrorResults()

Filters results to only those with errors.

```typescript
static getErrorResults(results: LintResult[]): LintResult[]
```

**Parameters:**

- `results` (LintResult[]) - All lint results

**Returns:** LintResult[] - Results with errorCount > 0

**Example:**

```typescript
const results = await linter.lintFiles(['**/*.md']);
const errors = ClaudeLint.getErrorResults(results);

if (errors.length > 0) {
  console.error(`Found errors in ${errors.length} files`);
  process.exit(1);
}
```

### getWarningResults()

Filters results to only those with warnings.

```typescript
static getWarningResults(results: LintResult[]): LintResult[]
```

**Parameters:**

- `results` (LintResult[]) - All lint results

**Returns:** LintResult[] - Results with warningCount > 0

**Example:**

```typescript
const results = await linter.lintFiles(['**/*.md']);
const warnings = ClaudeLint.getWarningResults(results);

console.log(`Found warnings in ${warnings.length} files`);
```

### getVersion()

Gets the claudelint version.

```typescript
static getVersion(): string
```

**Returns:** string - Version string (e.g., '0.1.0')

**Example:**

```typescript
const version = ClaudeLint.getVersion();
console.log(`Using claudelint v${version}`);
```

## Options Reference

### ClaudeLintOptions

Constructor options for the ClaudeLint class.

```typescript
interface ClaudeLintOptions {
  // Working directory (default: process.cwd())
  cwd?: string;

  // Auto-fix violations
  // - true: Fix all violations
  // - false: Don't fix (default)
  // - function: Selective fix with predicate
  fix?: boolean | ((message: LintMessage) => boolean);

  // Configuration object (overrides config files)
  config?: ClaudeLintConfig;

  // Progress callbacks
  onStart?: (fileCount: number) => void;
  onProgress?: (file: string, index: number, total: number) => void;
  onComplete?: (results: LintResult[]) => void;
}
```

### ClaudeLintConfig

Configuration object for rules and overrides.

```typescript
interface ClaudeLintConfig {
  // Rule configuration
  rules?: Record<string, RuleConfig>;

  // Ignore patterns
  ignorePatterns?: string[];

  // File-specific overrides
  overrides?: ConfigOverride[];
}

type RuleConfig = 'error' | 'warn' | 'off' | [string, any];

interface ConfigOverride {
  files: string[];        // Glob patterns
  rules: Record<string, RuleConfig>;
}
```

**Example:**

```typescript
const config: ClaudeLintConfig = {
  rules: {
    'claude-md-size-warning': 'warn',
    'skill-missing-examples': ['error', { minExamples: 2 }],
  },
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
  ],
  overrides: [
    {
      files: ['skills/**/*.md'],
      rules: {
        'skill-body-too-long': 'off',
      },
    },
  ],
};

const linter = new ClaudeLint({ config });
```

## Examples

### Auto-fix with Predicate

Fix only specific rule violations:

```typescript
const linter = new ClaudeLint({
  fix: (message) => {
    // Only fix formatting issues, not structural problems
    return message.ruleId?.includes('format') || message.ruleId?.includes('style');
  },
});

const results = await linter.lintFiles(['**/*.md']);
await ClaudeLint.outputFixes(results);
```

### Progress Tracking

Monitor linting progress in real-time:

```typescript
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

### Configuration Overrides

Apply different rules to different file types:

```typescript
const linter = new ClaudeLint({
  config: {
    rules: {
      'claude-md-size-warning': 'warn',
    },
    overrides: [
      {
        // Stricter rules for skills
        files: ['skills/**/*.md'],
        rules: {
          'skill-missing-examples': 'error',
          'skill-missing-comments': 'error',
        },
      },
      {
        // Relaxed rules for documentation
        files: ['docs/**/*.md'],
        rules: {
          'claude-md-size-warning': 'off',
        },
      },
    ],
  },
});
```

### Ignore Patterns

Skip files matching patterns:

```typescript
const linter = new ClaudeLint({
  config: {
    ignorePatterns: [
      'node_modules/**',
      'dist/**',
      '**/*.test.md',
      'temp-*',
    ],
  },
});

// Check if file should be ignored
if (linter.isPathIgnored('node_modules/package/CLAUDE.md')) {
  console.log('File is ignored');
}
```

## See Also

- [Functional API](./functional-api.md) - Stateless convenience functions
- [Formatters](./formatters.md) - Result formatting guide
- [Types](./types.md) - TypeScript type reference
- [Examples](https://github.com/pdugan20/claudelint/tree/main/examples) - Complete usage examples
