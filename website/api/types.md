---
description: Learn the complete TypeScript type definitions for the claudelint API, including LintResult, LintMessage, ClaudeLintOptions, RuleMetadata, and Formatter interfaces.
---

# TypeScript Types

Complete TypeScript type reference for the claudelint API. All types are exported from `claude-code-lint`.

```typescript
import {
  ClaudeLint, LintResult, LintMessage, ClaudeLintOptions,
  ClaudeLintConfig, Formatter, RuleMetadata,
} from 'claude-code-lint';
```

## Result Types

### LintResult

Complete validation result for a single file.

```typescript
interface LintResult {
  filePath: string;
  messages: LintMessage[];
  suppressedMessages: LintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source?: string;
  output?: string;
  deprecatedRulesUsed?: DeprecatedRuleUsage[];
  stats?: {
    validationTime: number;
  };
}
```

| Property | Type | Description |
|----------|------|-------------|
| `filePath` | `string` | Absolute path to the linted file |
| `messages` | `LintMessage[]` | Validation messages (errors and warnings) |
| `suppressedMessages` | `LintMessage[]` | Messages suppressed via inline disable comments |
| `errorCount` | `number` | Number of error-level messages |
| `warningCount` | `number` | Number of warning-level messages |
| `fixableErrorCount` | `number` | Number of errors with automatic fixes |
| `fixableWarningCount` | `number` | Number of warnings with automatic fixes |
| `source` | `string?` | Original source code (when available) |
| `output` | `string?` | Fixed source code (when fixes applied) |
| `deprecatedRulesUsed` | `DeprecatedRuleUsage[]?` | Deprecated rules that were triggered |
| `stats` | `object?` | Performance statistics (`validationTime` in ms) |

### LintMessage

Individual validation message for a specific issue.

```typescript
interface LintMessage {
  ruleId: string | null;
  severity: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  fix?: FixInfo;
  suggestions?: SuggestionInfo[];
  explanation?: string;
  howToFix?: string;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `ruleId` | `string \| null` | Rule identifier (null for non-rule messages) |
| `severity` | `'error' \| 'warning'` | Severity level |
| `message` | `string` | Human-readable description of the issue |
| `line` | `number?` | Line number where issue starts (1-based) |
| `column` | `number?` | Column number where issue starts (1-based) |
| `endLine` | `number?` | Line number where issue ends (1-based). Reserved for future use. |
| `endColumn` | `number?` | Column number where issue ends (1-based). Reserved for future use. |
| `fix` | `FixInfo?` | Automatic fix information |
| `suggestions` | `SuggestionInfo[]?` | Alternative fix suggestions. Reserved for future use. |
| `explanation` | `string?` | Detailed explanation of why this matters |
| `howToFix` | `string?` | Step-by-step fix instructions |

### FixInfo

Information about an automatic fix.

```typescript
interface FixInfo {
  range: [number, number];
  text: string;
}
```

- `range` - Start and end character offsets (0-based, start inclusive, end exclusive)
- `text` - Replacement text to insert at the range

When `fix` is present on a `LintMessage`, you can apply it by splicing the source string:

```typescript
const fixed = source.slice(0, fix.range[0]) + fix.text + source.slice(fix.range[1]);
```

You can also use `ClaudeLint.outputFixes(results)` or check `result.output` for auto-fixed content.

### SuggestionInfo

Information about a suggested fix.

```typescript
interface SuggestionInfo {
  desc: string;
  fix: FixInfo;
}
```

- `desc` - Description of what this suggestion does
- `fix` - The suggested fix information

## Options Types

### ClaudeLintOptions

Constructor options for the `ClaudeLint` class. Also used by the functional `lint()` wrapper as `LintOptions`.

```typescript
interface ClaudeLintOptions {
  // Configuration
  config?: ClaudeLintConfig;
  overrideConfigFile?: string;

  // Linting behavior
  fix?: boolean | ((message: LintMessage) => boolean);
  fixTypes?: string[];
  allowInlineConfig?: boolean;
  reportUnusedDisableDirectives?: boolean;

  // File handling
  cwd?: string;
  ignore?: boolean;
  ignorePatterns?: string[];
  errorOnUnmatchedPattern?: boolean;

  // Caching
  cache?: boolean;
  cacheLocation?: string;
  cacheStrategy?: 'metadata' | 'content';

  // Progress callbacks
  onStart?: (fileCount: number) => void;
  onProgress?: (file: string, index: number, total: number) => void;
  onComplete?: (results: LintResult[]) => void;

  // Filtering
  ruleFilter?: (ruleId: string) => boolean;
}
```

**Configuration:**

- `config` - Explicit `ClaudeLintConfig` object (overrides config file)
- `overrideConfigFile` - Path to config file (overrides auto-discovery)

**Linting behavior:**

- `fix` - Enable auto-fix: `boolean` or predicate function (default: `false`)
- `fixTypes` - Types of fixes to apply (e.g., `['problem', 'suggestion']`)
- `allowInlineConfig` - Allow inline disable comments (default: `true`)
- `reportUnusedDisableDirectives` - Warn about unused disable comments (default: `false`)

**File handling:**

- `cwd` - Working directory (default: `process.cwd()`)
- `ignore` - Enable ignore patterns from config (default: `true`)
- `ignorePatterns` - Additional glob patterns to ignore
- `errorOnUnmatchedPattern` - Throw if patterns match no files (default: `true`)

**Caching:**

- `cache` - Enable result caching (default: `false`)
- `cacheLocation` - Cache directory (default: `'.claudelint-cache'`)
- `cacheStrategy` - `'metadata'` or `'content'` (default: `'metadata'`)

**Progress callbacks:**

- `onStart` - Called when linting starts with file count
- `onProgress` - Called for each file with path, index, and total
- `onComplete` - Called when linting completes with results

**Filtering:**

- `ruleFilter` - Predicate to filter which rules run

### LintTextOptions

Options for linting text content.

```typescript
interface LintTextOptions {
  filePath?: string;
  warnIgnored?: boolean;
}
```

- `filePath` - Virtual file path that determines which validators run (default: random temp file)
- `warnIgnored` - Warn if the file path would be ignored

### ConfigOptions, FileInfoOptions, LoadFormatterOptions

These option types all accept a single optional field:

```typescript
interface ConfigOptions {
  cwd?: string;  // Working directory (default: process.cwd())
}
// FileInfoOptions and LoadFormatterOptions have the same shape
```

## Configuration Types

### ClaudeLintConfig

Complete claudelint configuration object.

```typescript
interface ClaudeLintConfig {
  extends?: string | string[];
  rules?: Record<string, RuleConfig | 'off' | 'warn' | 'error'>;
  overrides?: ConfigOverride[];
  ignorePatterns?: string[];
  output?: {
    format?: 'stylish' | 'json' | 'compact' | 'sarif' | 'github';
    verbose?: boolean;
    color?: boolean;
    collapseRepetitive?: boolean;
  };
  reportUnusedDisableDirectives?: boolean;
  maxWarnings?: number;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `extends` | `string \| string[]` | Extend base configuration(s) |
| `rules` | `Record<string, RuleConfig \| 'off' \| 'warn' \| 'error'>` | Rule configuration map (accepts objects or shorthand strings) |
| `overrides` | `ConfigOverride[]` | File-specific rule overrides |
| `ignorePatterns` | `string[]` | Glob patterns to ignore |
| `output` | `object` | Output settings: `format` (built-in name), `verbose`, `color`, `collapseRepetitive` |
| `reportUnusedDisableDirectives` | `boolean` | Warn about unused disable comments |
| `maxWarnings` | `number` | Maximum warnings before exit code 1 |

**Example:**

```typescript
const config: ClaudeLintConfig = {
  extends: 'recommended',
  rules: {
    'claude-md-size': 'warn',
    'skill-missing-examples': { severity: 'error', options: { minExamples: 2 } },
  },
  ignorePatterns: ['node_modules/**', 'dist/**'],
  overrides: [
    {
      files: ['skills/**/*.md'],
      rules: { 'skill-body-too-long': 'off' },
    },
  ],
  maxWarnings: 10,
};
```

### RuleConfig

Configuration for a single rule. The `rules` map accepts both shorthand strings and full objects.

```typescript
// Shorthand (in rules map values)
type RuleConfigShorthand = 'error' | 'warn' | 'off';

// Full form
interface RuleConfig {
  severity: 'off' | 'warn' | 'error';
  options?: Record<string, unknown>;
}
```

**Usage:**

```typescript
const rules = {
  'claude-md-size': 'warn',                                    // shorthand
  'skill-missing-examples': 'off',                                     // shorthand
  'skill-body-too-long': { severity: 'error', options: { maxLength: 5000 } },  // full
};
```

### ConfigOverride

File-specific rule overrides applied by glob pattern.

```typescript
interface ConfigOverride {
  files: string[];
  rules: Record<string, RuleConfig | 'off' | 'warn' | 'error'>;
}
```

- `files` - Glob patterns to match (uses minimatch)
- `rules` - Rule configuration to apply to matched files

### LintOptions

Alias for `ClaudeLintOptions`, used by the functional `lint()` wrapper.

```typescript
type LintOptions = ClaudeLintOptions;
```

### DeprecatedRuleUsage

Information about a deprecated rule that was triggered during linting.

```typescript
interface DeprecatedRuleUsage {
  ruleId: string;
  reason: string;
  replacedBy?: string[];
  deprecatedSince?: string;
  removeInVersion?: string | null;
  url?: string;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `ruleId` | `string` | Rule ID of the deprecated rule |
| `reason` | `string` | Why this rule is deprecated |
| `replacedBy` | `string[]?` | Replacement rule IDs |
| `deprecatedSince` | `string?` | Version when deprecated |
| `removeInVersion` | `string \| null?` | Version when it will be removed |
| `url` | `string?` | URL to migration guide |

## Formatter Types

### Formatter

Interface for formatting lint results. Both built-in and custom formatters implement this.

```typescript
interface Formatter {
  format(results: LintResult[]): string;
}
```

### BaseFormatter

Abstract base class for custom formatters with path resolution helpers.

```typescript
abstract class BaseFormatter implements Formatter {
  abstract format(results: LintResult[]): string;
  protected getRelativePath(filePath: string): string;
  protected getSummary(results: LintResult[]): {
    fileCount: number;
    errorCount: number;
    warningCount: number;
    fixableErrorCount: number;
    fixableWarningCount: number;
    totalIssues: number;
  };
}
```

### FormatterOptions

```typescript
interface FormatterOptions {
  cwd?: string;
  color?: boolean;
}
```

## Metadata Types

### RuleMetadata

Metadata about a validation rule, returned by `getRules()` and `getRulesMetaForResults()`.

```typescript
interface RuleMetadata {
  ruleId: string;
  description: string;
  category: string;
  severity: 'error' | 'warning';
  fixable: boolean;
  explanation?: string;
  docs?: string;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `ruleId` | `string` | Unique rule identifier |
| `description` | `string` | Brief description |
| `category` | `string` | Rule category (e.g., 'CLAUDE.md', 'Skills') |
| `severity` | `'error' \| 'warning'` | Default severity level |
| `fixable` | `boolean` | Whether the rule supports auto-fix |
| `explanation` | `string?` | Detailed explanation |
| `docs` | `string?` | Documentation URL |

### FileInfo

Information about a file without linting it.

```typescript
interface FileInfo {
  ignored: boolean;
  validators: string[];
}
```

- `ignored` - Whether the file matches ignore patterns
- `validators` - Names of validators that would run on this file

## Utility Functions

These helper functions are also exported from `claude-code-lint`:

| Function | Description |
|----------|-------------|
| `isBuiltinFormatter(name: string): boolean` | Check if a formatter name is built-in |
| `isFormatter(obj: unknown): obj is Formatter` | Type guard to validate the Formatter interface |
| `findConfigFile(startDir: string): string \| null` | Find the nearest config file by walking up the directory tree |
| `loadConfig(configPath: string): ClaudeLintConfig` | Load and parse a configuration file |

## See Also

- [ClaudeLint Class](./claudelint-class.md) - Class API reference
- [Functional API](./functional-api.md) - Stateless function reference
- [Schemas](./schemas.md) - Configuration file schema reference
- [Recipes](./recipes.md) - Practical usage patterns and examples
