# TypeScript Types

Complete TypeScript type reference for the ClaudeLint API.

## Table of Contents

- [Result Types](#result-types)
  - [LintResult](#lintresult)
  - [LintMessage](#lintmessage)
  - [FixInfo](#fixinfo)
  - [SuggestionInfo](#suggestioninfo)
- [Options Types](#options-types)
  - [ClaudeLintOptions](#claudelintoptions)
  - [LintOptions](#lintoptions)
  - [LintTextOptions](#linttextoptions)
  - [ConfigOptions](#configoptions)
  - [FileInfoOptions](#fileinfooptions)
  - [LoadFormatterOptions](#loadformatteroptions)
- [Configuration Types](#configuration-types)
  - [ClaudeLintConfig](#claudelintconfig)
  - [RuleConfig](#ruleconfig)
  - [ConfigOverride](#configoverride)
- [Formatter Types](#formatter-types)
  - [Formatter](#formatter)
  - [FormatterOptions](#formatteroptions)
- [Metadata Types](#metadata-types)
  - [RuleMetadata](#rulemetadata)
  - [FileInfo](#fileinfo)
- [Type Utilities](#type-utilities)

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
  stats?: {
    validationTime: number;
  };
}
```

**Properties:**

- `filePath` - Absolute path to the linted file
- `messages` - Array of validation messages (errors and warnings)
- `suppressedMessages` - Messages suppressed via inline disable comments
- `errorCount` - Number of error-level messages
- `warningCount` - Number of warning-level messages
- `fixableErrorCount` - Number of errors with automatic fixes
- `fixableWarningCount` - Number of warnings with automatic fixes
- `source` - Original source code (when available)
- `output` - Fixed source code (when fixes applied)
- `stats` - Performance and diagnostic statistics

**Example:**

```typescript
const results: LintResult[] = await linter.lintFiles(['**/*.md']);

for (const result of results) {
  console.log(`${result.filePath}:`);
  console.log(`  Errors: ${result.errorCount}`);
  console.log(`  Warnings: ${result.warningCount}`);
  console.log(`  Fixable: ${result.fixableErrorCount + result.fixableWarningCount}`);

  if (result.output && result.output !== result.source) {
    console.log('  Has fixes available');
  }
}
```

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

**Properties:**

- `ruleId` - Unique identifier for the rule (null for non-rule messages)
- `severity` - 'error' or 'warning'
- `message` - Human-readable description of the issue
- `line` - Line number where issue starts (1-based)
- `column` - Column number where issue starts (1-based)
- `endLine` - Line number where issue ends (1-based)
- `endColumn` - Column number where issue ends (1-based)
- `fix` - Automatic fix (if available)
- `suggestions` - Alternative fix suggestions
- `explanation` - Detailed explanation of why this matters
- `howToFix` - Step-by-step fix instructions

**Example:**

```typescript
for (const msg of result.messages) {
  const location = msg.line ? `:${msg.line}` : '';
  const severity = msg.severity.toUpperCase();

  console.log(`[${severity}] ${result.filePath}${location}`);
  console.log(`  ${msg.message}`);

  if (msg.ruleId) {
    console.log(`  Rule: ${msg.ruleId}`);
  }

  if (msg.fix) {
    console.log('  Auto-fix available');
  }

  if (msg.explanation) {
    console.log(`  Why: ${msg.explanation}`);
  }
}
```

### FixInfo

Information about an automatic fix.

```typescript
interface FixInfo {
  range: [number, number];
  text: string;
}
```

**Properties:**

- `range` - Start and end character offsets in source code [start, end]
- `text` - Replacement text to insert at the range

**Example:**

```typescript
for (const msg of result.messages) {
  if (msg.fix) {
    const [start, end] = msg.fix.range;
    console.log(`Replace characters ${start}-${end} with: "${msg.fix.text}"`);
  }
}
```

### SuggestionInfo

Information about a suggested fix.

```typescript
interface SuggestionInfo {
  desc: string;
  fix: FixInfo;
}
```

**Properties:**

- `desc` - Description of what this suggestion does
- `fix` - The suggested fix information

**Example:**

```typescript
for (const msg of result.messages) {
  if (msg.suggestions && msg.suggestions.length > 0) {
    console.log('Suggestions:');
    for (const suggestion of msg.suggestions) {
      console.log(`  - ${suggestion.desc}`);
    }
  }
}
```

## Options Types

### ClaudeLintOptions

Constructor options for the ClaudeLint class.

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

**Key Options:**

**Configuration:**

- `config` - Explicit configuration object (overrides config file)
- `overrideConfigFile` - Path to config file (overrides automatic discovery)

**Linting Behavior:**

- `fix` - Enable auto-fix (boolean or predicate function)
- `fixTypes` - Types of fixes to apply (e.g., ['problem', 'suggestion'])
- `allowInlineConfig` - Allow inline disable comments (default: true)
- `reportUnusedDisableDirectives` - Warn about unused disable comments

**File Handling:**

- `cwd` - Working directory (default: process.cwd())
- `ignore` - Enable ignore patterns (default: true)
- `ignorePatterns` - Additional glob patterns to ignore
- `errorOnUnmatchedPattern` - Throw if patterns match no files

**Caching:**

- `cache` - Enable result caching
- `cacheLocation` - Cache directory (default: '.claude-code-lint-cache')
- `cacheStrategy` - Cache invalidation strategy

**Progress Callbacks:**

- `onStart` - Called when linting starts
- `onProgress` - Called for each file
- `onComplete` - Called when linting completes

**Filtering:**

- `ruleFilter` - Predicate to filter which rules run

**Example:**

```typescript
const options: ClaudeLintOptions = {
  fix: true,
  cwd: '/path/to/project',
  config: {
    rules: {
      'claude-md-size-warning': 'warn',
    },
  },
  ignorePatterns: ['temp-*', '*.backup.md'],
  onProgress: (file, index, total) => {
    console.log(`[${index + 1}/${total}] ${file}`);
  },
};

const linter = new ClaudeLint(options);
```

### LintOptions

Options for linting files (inherits all ClaudeLintOptions).

```typescript
interface LintOptions extends ClaudeLintOptions {
  // Inherits all properties from ClaudeLintOptions
}
```

**Usage:**

```typescript
const options: LintOptions = {
  fix: true,
  errorOnUnmatchedPattern: false,
};

const results = await linter.lintFiles(['**/*.md'], options);
```

### LintTextOptions

Options for linting text content.

```typescript
interface LintTextOptions {
  filePath?: string;
  warnIgnored?: boolean;
}
```

**Properties:**

- `filePath` - Virtual file path for rule application (default: random temp file)
- `warnIgnored` - Warn if file path would be ignored

**Example:**

```typescript
const options: LintTextOptions = {
  filePath: 'CLAUDE.md',  // Determines which validators run
  warnIgnored: true,
};

const results = await linter.lintText(code, options);
```

### ConfigOptions

Options for resolving configuration.

```typescript
interface ConfigOptions {
  cwd?: string;
}
```

**Example:**

```typescript
const config = await resolveConfig('test.md', {
  cwd: '/path/to/project',
});
```

### FileInfoOptions

Options for getting file information.

```typescript
interface FileInfoOptions {
  cwd?: string;
}
```

**Example:**

```typescript
const info = await getFileInfo('test.md', {
  cwd: '/path/to/project',
});
```

### LoadFormatterOptions

Options for loading a formatter.

```typescript
interface LoadFormatterOptions {
  cwd?: string;
}
```

**Example:**

```typescript
const formatter = await linter.loadFormatter('stylish', {
  cwd: '/path/to/project',
});
```

## Configuration Types

### ClaudeLintConfig

Configuration object for rules and overrides.

```typescript
interface ClaudeLintConfig {
  rules?: Record<string, RuleConfig>;
  ignorePatterns?: string[];
  overrides?: ConfigOverride[];
}
```

**Properties:**

- `rules` - Rule configuration map
- `ignorePatterns` - Glob patterns to ignore
- `overrides` - File-specific rule overrides

**Example:**

```typescript
const config: ClaudeLintConfig = {
  rules: {
    'claude-md-size-warning': 'warn',
    'skill-missing-examples': 'error',
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
```

### RuleConfig

Configuration value for a single rule.

```typescript
type RuleConfig = 'error' | 'warn' | 'off' | [string, any];
```

**Values:**

- `'error'` - Treat violations as errors
- `'warn'` - Treat violations as warnings
- `'off'` - Disable the rule
- `['error', options]` - Error with rule options
- `['warn', options]` - Warning with rule options

**Example:**

```typescript
const rules: Record<string, RuleConfig> = {
  'claude-md-size-warning': 'warn',
  'skill-missing-examples': 'off',
  'skill-body-too-long': ['error', { maxLength: 5000 }],
};
```

### ConfigOverride

File-specific configuration override.

```typescript
interface ConfigOverride {
  files: string[];
  rules: Record<string, RuleConfig>;
}
```

**Properties:**

- `files` - Glob patterns to match files
- `rules` - Rule configuration to apply

**Example:**

```typescript
const overrides: ConfigOverride[] = [
  {
    files: ['skills/**/*.md'],
    rules: {
      'skill-missing-examples': 'error',
      'skill-body-too-long': 'off',
    },
  },
  {
    files: ['docs/**/*.md'],
    rules: {
      'claude-md-size-warning': 'off',
    },
  },
];
```

## Formatter Types

### Formatter

Interface for formatting lint results.

```typescript
interface Formatter {
  format(results: LintResult[]): string;
}
```

**Example:**

```typescript
const customFormatter: Formatter = {
  format(results: LintResult[]): string {
    return results
      .map(r => `${r.filePath}: ${r.errorCount} errors`)
      .join('\n');
  },
};
```

### FormatterOptions

Options for formatter instances.

```typescript
interface FormatterOptions {
  cwd?: string;
  color?: boolean;
}
```

**Properties:**

- `cwd` - Working directory for path resolution
- `color` - Enable color output (if supported)

## Metadata Types

### RuleMetadata

Metadata about a validation rule.

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

**Properties:**

- `ruleId` - Unique rule identifier
- `description` - Brief description
- `category` - Rule category
- `severity` - Default severity level
- `fixable` - Whether rule can auto-fix
- `explanation` - Detailed explanation
- `docs` - Documentation URL

**Example:**

```typescript
const rules = linter.getRules();

for (const [ruleId, meta] of rules) {
  if (meta.fixable) {
    console.log(`${ruleId} - ${meta.description} (fixable)`);
  }
}
```

### FileInfo

Information about a file without linting it.

```typescript
interface FileInfo {
  ignored: boolean;
  validators: string[];
}
```

**Properties:**

- `ignored` - Whether file matches ignore patterns
- `validators` - Names of validators that would run

**Example:**

```typescript
const info = await getFileInfo('CLAUDE.md');

if (info.ignored) {
  console.log('File is ignored');
} else {
  console.log('Validators:', info.validators.join(', '));
}
```

## Type Utilities

### Type Guards

Check types at runtime:

```typescript
function isLintMessage(value: any): value is LintMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'severity' in value &&
    'message' in value
  );
}

function hasFixInfo(message: LintMessage): message is LintMessage & { fix: FixInfo } {
  return message.fix !== undefined;
}
```

### Type Narrowing

Use discriminated unions:

```typescript
function handleMessage(message: LintMessage) {
  if (message.severity === 'error') {
    // TypeScript knows severity is 'error'
    console.error(message.message);
  } else {
    // TypeScript knows severity is 'warning'
    console.warn(message.message);
  }
}
```

### Utility Types

Create derived types:

```typescript
// Extract only fixable messages
type FixableMessage = LintMessage & { fix: FixInfo };

// Partial configuration
type PartialConfig = Partial<ClaudeLintConfig>;

// Required cwd option
type RequiredCwdOptions = ClaudeLintOptions & { cwd: string };

// Read-only results
type ReadonlyResults = ReadonlyArray<Readonly<LintResult>>;
```

### Generic Functions

Type-safe generic functions:

```typescript
function filterMessages<T extends LintMessage>(
  messages: T[],
  predicate: (msg: T) => boolean
): T[] {
  return messages.filter(predicate);
}

// Usage
const errors = filterMessages(result.messages, msg => msg.severity === 'error');
```

## Examples

### Full Type Safety

```typescript
import {
  ClaudeLint,
  ClaudeLintOptions,
  LintResult,
  LintMessage,
  RuleMetadata,
} from 'claude-code-lint';

const options: ClaudeLintOptions = {
  fix: (message: LintMessage): boolean => {
    return message.ruleId?.includes('format') ?? false;
  },
  onProgress: (file: string, index: number, total: number): void => {
    console.log(`[${index + 1}/${total}] ${file}`);
  },
};

const linter = new ClaudeLint(options);
const results: LintResult[] = await linter.lintFiles(['**/*.md']);

const rules: Map<string, RuleMetadata> = linter.getRules();
```

### Type Assertions

```typescript
import { LintResult } from 'claude-code-lint';

const results = await linter.lintFiles(['**/*.md']);

// Assert specific structure
const hasErrors: boolean = results.some(r => r.errorCount > 0);

// Type assertion for custom properties
interface CustomResult extends LintResult {
  customField: string;
}

const customResults = results as CustomResult[];
```

## See Also

- [ClaudeLint Class](./claudelint-class.md) - Class API documentation
- [Functional API](./functional-api.md) - Function API documentation
- [Examples](../../examples/) - Usage examples with types
