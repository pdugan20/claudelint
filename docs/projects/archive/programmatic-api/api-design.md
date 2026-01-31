# Programmatic API - Detailed Design

**Version:** 0.2.0 (Draft)
**Last Updated:** 2026-01-30

## Table of Contents

1. [Overview](#overview)
2. [Main ClaudeLint Class](#main-claude-code-lint-class)
3. [Functional API](#functional-api)
4. [Type Definitions](#type-definitions)
5. [Formatter System](#formatter-system)
6. [Result Format](#result-format)
7. [Configuration System](#configuration-system)
8. [Auto-Fix System](#auto-fix-system)
9. [Error Handling](#error-handling)
10. [Examples](#examples)

---

## Overview

The claude-code-lint programmatic API provides two ways to interact with the linter:

1. **Class-based API** (`ClaudeLint`) - For complex workflows with state management
2. **Functional API** - For simple, stateless operations

Both APIs are fully typed with TypeScript and provide the same underlying functionality.

---

## Main ClaudeLint Class

### Constructor

```typescript
class ClaudeLint {
  constructor(options?: ClaudeLintOptions);
}

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

### Instance Methods

#### `lintFiles(patterns: string[]): Promise<LintResult[]>`

Lints files matching the given glob patterns.

```typescript
const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md', '**/*.json']);

console.log(`Found ${results.length} files`);
console.log(`Errors: ${results.reduce((sum, r) => sum + r.errorCount, 0)}`);
```

**Parameters:**

- `patterns: string[]` - Glob patterns to match files

**Returns:**

- `Promise<LintResult[]>` - Array of lint results, one per file

**Behavior:**

- Discovers files using glob patterns
- Respects ignore patterns from config
- Runs appropriate validators per file type
- Returns results for all files (even if no issues)

#### `lintText(code: string, options?: LintTextOptions): Promise<LintResult[]>`

Lints a string of code without accessing the filesystem.

```typescript
const linter = new ClaudeLint();
const results = await linter.lintText(
  '# CLAUDE.md\n\nSome content',
  { filePath: 'CLAUDE.md' }
);
```

**Parameters:**

- `code: string` - Source code to lint
- `options?: LintTextOptions` - Optional settings
  - `filePath?: string` - Virtual file path (for config resolution)
  - `warnIgnored?: boolean` - Warn if file would be ignored

**Returns:**

- `Promise<LintResult[]>` - Array with single result

**Behavior:**

- Treats code as if it were in `filePath` (if provided)
- Applies configuration based on file path
- Does not write to disk
- Warns if file matches ignore patterns (if `warnIgnored: true`)

#### `calculateConfigForFile(filePath: string): Promise<ClaudeLintConfig>`

Returns the configuration that would be used for a given file.

```typescript
const linter = new ClaudeLint();
const config = await linter.calculateConfigForFile('skills/my-skill/SKILL.md');

console.log(config.rules);
```

**Parameters:**

- `filePath: string` - Path to file

**Returns:**

- `Promise<ClaudeLintConfig>` - Resolved configuration

**Behavior:**

- Resolves base configuration
- Applies overrides matching file path
- Returns merged configuration object

#### `isPathIgnored(filePath: string): boolean`

Checks if a file path would be ignored.

```typescript
const linter = new ClaudeLint();

if (!linter.isPathIgnored('node_modules/foo.md')) {
  // This won't run - node_modules is ignored
}
```

**Parameters:**

- `filePath: string` - Path to check

**Returns:**

- `boolean` - True if path matches ignore patterns

#### `loadFormatter(nameOrPath: string): Promise<Formatter>`

Loads a formatter for formatting results.

```typescript
const linter = new ClaudeLint();
const formatter = await linter.loadFormatter('stylish');

const results = await linter.lintFiles(['**/*.md']);
console.log(formatter.format(results));
```

**Parameters:**

- `nameOrPath: string` - Built-in formatter name or path to custom formatter

**Returns:**

- `Promise<Formatter>` - Formatter instance

**Built-in formatters:**

- `'stylish'` - Human-readable, colored output (default)
- `'json'` - JSON format
- `'compact'` - Compact, one-line-per-issue format

#### `getRules(): Map<string, RuleMetadata>`

Returns metadata for all registered rules.

```typescript
const linter = new ClaudeLint();
const rules = linter.getRules();

for (const [ruleId, meta] of rules) {
  console.log(`${ruleId}: ${meta.description}`);
}
```

**Returns:**

- `Map<string, RuleMetadata>` - Map of rule ID to metadata

#### `getRulesMetaForResults(results: LintResult[]): Map<string, RuleMetadata>`

Returns metadata for rules that triggered in the given results.

```typescript
const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md']);
const meta = linter.getRulesMetaForResults(results);

// Only includes rules that actually triggered
```

**Parameters:**

- `results: LintResult[]` - Lint results

**Returns:**

- `Map<string, RuleMetadata>` - Metadata for triggered rules only

### Static Methods

#### `static outputFixes(results: LintResult[]): Promise<void>`

Writes fixed content to disk for all fixable results.

```typescript
const linter = new ClaudeLint({ fix: true });
const results = await linter.lintFiles(['**/*.md']);

// Apply fixes to files
await ClaudeLint.outputFixes(results);
```

**Parameters:**

- `results: LintResult[]` - Results with fix information

**Returns:**

- `Promise<void>`

**Behavior:**

- Only writes files that have fixes
- Uses `result.output` property
- Preserves file permissions
- Throws on write errors

#### `static getFixedContent(results: LintResult[]): Map<string, string>`

Returns fixed content without writing to disk.

```typescript
const linter = new ClaudeLint({ fix: true });
const results = await linter.lintFiles(['**/*.md']);

const fixed = ClaudeLint.getFixedContent(results);
for (const [filePath, content] of fixed) {
  console.log(`Fixed ${filePath}:`, content);
}
```

**Parameters:**

- `results: LintResult[]` - Results with fix information

**Returns:**

- `Map<string, string>` - Map of file path to fixed content

#### `static getErrorResults(results: LintResult[]): LintResult[]`

Filters results to only those with errors.

```typescript
const results = await linter.lintFiles(['**/*.md']);
const errors = ClaudeLint.getErrorResults(results);

if (errors.length > 0) {
  process.exit(1);
}
```

**Parameters:**

- `results: LintResult[]` - All results

**Returns:**

- `LintResult[]` - Results with `errorCount > 0`

#### `static findConfigFile(cwd: string): Promise<string | null>`

Finds the configuration file starting from a directory.

```typescript
const configPath = await ClaudeLint.findConfigFile(process.cwd());

if (configPath) {
  console.log(`Using config: ${configPath}`);
}
```

**Parameters:**

- `cwd: string` - Directory to start search from

**Returns:**

- `Promise<string | null>` - Path to config file, or null if not found

**Behavior:**

- Walks up directory tree
- Looks for `.claudelintrc.json`, `claude-code-lint.config.js`, etc.
- Returns first match

#### `static getVersion(): string`

Returns the claude-code-lint version.

```typescript
console.log(`Using claude-code-lint ${ClaudeLint.getVersion()}`);
```

**Returns:**

- `string` - Version string (e.g., "0.2.0")

---

## Functional API

Convenience functions for simple, stateless operations.

### `lint(patterns: string[], options?: LintOptions): Promise<LintResult[]>`

Shorthand for creating a linter and running lintFiles.

```typescript
import { lint } from 'claude-code-lint';

const results = await lint(['**/*.md'], {
  fix: true,
  cache: true
});
```

**Equivalent to:**

```typescript
const linter = new ClaudeLint(options);
const results = await linter.lintFiles(patterns);
```

### `lintText(code: string, options: LintTextOptions): Promise<LintResult[]>`

Shorthand for linting text.

```typescript
import { lintText } from 'claude-code-lint';

const results = await lintText(code, {
  filePath: 'CLAUDE.md',
  fix: true
});
```

### `resolveConfig(filePath: string, options?: ConfigOptions): Promise<ClaudeLintConfig | null>`

Resolves configuration for a file path.

```typescript
import { resolveConfig } from 'claude-code-lint';

const config = await resolveConfig('./skills/my-skill/SKILL.md');
console.log(config?.rules);
```

**Parameters:**

- `filePath: string` - Path to resolve config for
- `options?: ConfigOptions`
  - `cwd?: string` - Working directory

**Returns:**

- `Promise<ClaudeLintConfig | null>` - Resolved config or null

### `formatResults(results: LintResult[], format: string): Promise<string>`

Formats results using a built-in or custom formatter.

```typescript
import { formatResults } from 'claude-code-lint';

const output = await formatResults(results, 'json');
console.log(output);
```

**Parameters:**

- `results: LintResult[]` - Results to format
- `format: string` - Formatter name or path

**Returns:**

- `Promise<string>` - Formatted output

### `getFileInfo(filePath: string, options?: FileInfoOptions): Promise<FileInfo>`

Gets information about a file without linting it.

```typescript
import { getFileInfo } from 'claude-code-lint';

const info = await getFileInfo('CLAUDE.md');
console.log(`Ignored: ${info.ignored}`);
console.log(`Validators: ${info.validators.join(', ')}`);
```

**Parameters:**

- `filePath: string` - Path to check
- `options?: FileInfoOptions`
  - `cwd?: string` - Working directory

**Returns:**

- `Promise<FileInfo>` - File information

---

## Type Definitions

### LintResult

Complete result for a single file.

```typescript
interface LintResult {
  // File identification
  filePath: string;

  // Messages
  messages: LintMessage[];
  suppressedMessages: LintMessage[];

  // Counts
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;

  // Content
  source?: string;         // Original content (if available)
  output?: string;         // Fixed content (if fixes applied)

  // Metadata
  stats?: {
    validationTime: number;  // Time in ms
  };
}
```

### LintMessage

Individual validation message.

```typescript
interface LintMessage {
  // Rule information
  ruleId: string | null;

  // Severity
  severity: 'error' | 'warning';

  // Message
  message: string;

  // Location
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;

  // Fix information
  fix?: FixInfo;
  suggestions?: SuggestionInfo[];

  // Additional context
  explanation?: string;
  howToFix?: string;
}
```

### FixInfo

Information about an automatic fix.

```typescript
interface FixInfo {
  range: [number, number];  // Start/end offset in source
  text: string;              // Replacement text
}
```

### SuggestionInfo

Information about a suggested fix.

```typescript
interface SuggestionInfo {
  desc: string;              // Description of suggestion
  fix: FixInfo;              // The suggested fix
}
```

### FileInfo

Information about a file.

```typescript
interface FileInfo {
  ignored: boolean;          // Would be ignored by config
  validators: string[];      // Which validators would run
}
```

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
}
```

---

## Formatter System

### Formatter Interface

```typescript
interface Formatter {
  format(results: LintResult[]): string;
}
```

### Built-in Formatters

#### Stylish (Default)

Human-readable, colored output similar to ESLint.

```typescript
const formatter = await linter.loadFormatter('stylish');
console.log(formatter.format(results));
```

Output:

```
/path/to/file.md
  1:1  error  File exceeds size limit  claude-md-size-limit

x 1 problem (1 error, 0 warnings)
```

#### JSON

Machine-readable JSON output.

```typescript
const formatter = await linter.loadFormatter('json');
console.log(formatter.format(results));
```

Output:

```json
[
  {
    "filePath": "/path/to/file.md",
    "messages": [
      {
        "ruleId": "claude-md-size-limit",
        "severity": "error",
        "message": "File exceeds size limit",
        "line": 1,
        "column": 1
      }
    ],
    "errorCount": 1,
    "warningCount": 0
  }
]
```

#### Compact

One line per issue, suitable for parsing.

```typescript
const formatter = await linter.loadFormatter('compact');
console.log(formatter.format(results));
```

Output:

```
/path/to/file.md: line 1, col 1, Error - File exceeds size limit (claude-md-size-limit)
```

### Custom Formatters

Create a custom formatter:

```typescript
// my-formatter.js
module.exports = {
  format(results) {
    let output = '';
    for (const result of results) {
      output += `${result.filePath}: ${result.errorCount} errors\n`;
    }
    return output;
  }
};
```

Load it:

```typescript
const formatter = await linter.loadFormatter('./my-formatter.js');
```

---

## Result Format

### Successful Validation

```typescript
{
  filePath: '/path/to/CLAUDE.md',
  messages: [],
  suppressedMessages: [],
  errorCount: 0,
  warningCount: 0,
  fixableErrorCount: 0,
  fixableWarningCount: 0,
  source: '# CLAUDE.md\n\nContent here',
  stats: {
    validationTime: 12
  }
}
```

### With Errors

```typescript
{
  filePath: '/path/to/CLAUDE.md',
  messages: [
    {
      ruleId: 'claude-md-size-limit',
      severity: 'error',
      message: 'File exceeds 10MB limit',
      line: 1,
      column: 1,
      explanation: 'Claude has a 10MB context window...',
      howToFix: 'Split into smaller files or use @import'
    }
  ],
  suppressedMessages: [],
  errorCount: 1,
  warningCount: 0,
  fixableErrorCount: 0,
  fixableWarningCount: 0,
  source: '...',
  stats: {
    validationTime: 15
  }
}
```

### With Fixes Applied

```typescript
{
  filePath: '/path/to/SKILL.md',
  messages: [
    {
      ruleId: 'skill-missing-shebang',
      severity: 'error',
      message: 'Script missing shebang',
      line: 1,
      column: 1,
      fix: {
        range: [0, 0],
        text: '#!/usr/bin/env bash\n'
      }
    }
  ],
  suppressedMessages: [],
  errorCount: 1,
  warningCount: 0,
  fixableErrorCount: 1,
  fixableWarningCount: 0,
  source: 'echo "hello"',
  output: '#!/usr/bin/env bash\necho "hello"',
  stats: {
    validationTime: 18
  }
}
```

---

## Configuration System

### Automatic Discovery

```typescript
// Searches for config file automatically
const linter = new ClaudeLint();
```

Search order:

1. `.claudelintrc.json`
2. `.claudelintrc.yaml`
3. `claude-code-lint.config.js`
4. `package.json` (claude-code-lint key)

### Explicit Config

```typescript
const linter = new ClaudeLint({
  config: {
    rules: {
      'claude-md-size-limit': 'error',
      'skill-missing-shebang': 'warn'
    }
  }
});
```

### Config File Override

```typescript
const linter = new ClaudeLint({
  overrideConfigFile: './custom-config.json'
});
```

### Config Per File

```typescript
const config = await linter.calculateConfigForFile('skills/test/SKILL.md');
// Returns merged config with overrides applied
```

---

## Auto-Fix System

### Enable Auto-Fix

```typescript
const linter = new ClaudeLint({ fix: true });
const results = await linter.lintFiles(['**/*.md']);

// results contain both errors and fixes
```

### Apply Fixes to Disk

```typescript
await ClaudeLint.outputFixes(results);
// Files are now fixed on disk
```

### Get Fixed Content

```typescript
const fixed = ClaudeLint.getFixedContent(results);

for (const [filePath, content] of fixed) {
  console.log(`${filePath} would become:`);
  console.log(content);
}
```

### Selective Fixing

```typescript
const linter = new ClaudeLint({
  fix: (message) => {
    // Only fix specific rules
    return message.ruleId === 'skill-missing-shebang';
  }
});
```

### Fix Types

```typescript
const linter = new ClaudeLint({
  fix: true,
  fixTypes: ['problem', 'suggestion']  // Only fix these categories
});
```

---

## Error Handling

### Validation Errors

```typescript
try {
  const results = await linter.lintFiles(['**/*.md']);

  // Check for errors
  if (results.some(r => r.errorCount > 0)) {
    console.error('Validation failed');
    process.exit(1);
  }
} catch (error) {
  // Unexpected error (file system, etc.)
  console.error('Linting failed:', error);
  process.exit(2);
}
```

### Config Errors

```typescript
try {
  const linter = new ClaudeLint({
    overrideConfigFile: './invalid-config.json'
  });
} catch (error) {
  if (error.code === 'CONFIG_INVALID') {
    console.error('Invalid configuration:', error.message);
  }
}
```

### File System Errors

```typescript
try {
  const results = await linter.lintFiles(['/nonexistent/**/*.md']);
} catch (error) {
  if (error.code === 'PATTERN_UNMATCHED') {
    console.error('No files matched pattern');
  }
}
```

---

## Examples

### Basic Usage

```typescript
import { ClaudeLint } from 'claude-code-lint';

const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md']);

const formatter = await linter.loadFormatter('stylish');
console.log(formatter.format(results));

// Exit with error code if problems found
const hasErrors = results.some(r => r.errorCount > 0);
process.exit(hasErrors ? 1 : 0);
```

### Auto-Fix Workflow

```typescript
import { ClaudeLint } from 'claude-code-lint';

const linter = new ClaudeLint({ fix: true });
const results = await linter.lintFiles(['skills/**/*.sh']);

// Show what would be fixed
console.log(`Fixable: ${results.reduce((s, r) => s + r.fixableErrorCount, 0)}`);

// Apply fixes
await ClaudeLint.outputFixes(results);

console.log('Fixes applied!');
```

### Build Integration

```typescript
import { ClaudeLint } from 'claude-code-lint';

async function validateProject() {
  const linter = new ClaudeLint({
    cache: true,
    onProgress: (file, idx, total) => {
      console.log(`[${idx}/${total}] ${file}`);
    }
  });

  const results = await linter.lintFiles(['**/*.md', '**/*.json']);

  const errors = ClaudeLint.getErrorResults(results);

  if (errors.length > 0) {
    const formatter = await linter.loadFormatter('compact');
    console.error(formatter.format(errors));
    process.exit(1);
  }

  console.log('✓ Validation passed');
}

validateProject();
```

### Custom Formatter

```typescript
import { ClaudeLint } from 'claude-code-lint';

const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md']);

// Custom formatting logic
for (const result of results) {
  if (result.errorCount > 0) {
    console.log(`[x] ${result.filePath}`);
    for (const msg of result.messages) {
      console.log(`   Line ${msg.line}: ${msg.message}`);
    }
  }
}
```

### Functional API

```typescript
import { lint, formatResults } from 'claude-code-lint';

// Quick validation
const results = await lint(['CLAUDE.md'], { fix: true });
const output = await formatResults(results, 'json');

console.log(output);
```
