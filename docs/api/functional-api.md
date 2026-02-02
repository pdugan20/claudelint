# Functional API

Stateless convenience functions for simple, one-off linting operations.

## Overview

The functional API provides lightweight wrappers around the ClaudeLint class for cases where you don't need to maintain state or perform multiple operations. Each function creates a new ClaudeLint instance internally and returns the result.

**When to use:**

- Simple, one-off linting operations
- Build scripts and CI/CD pipelines
- Command-line utilities
- Quick validation checks

**When not to use:**

- Multiple operations on the same configuration
- Need to reuse formatter instances
- Custom progress tracking
- Advanced configuration with overrides

For complex workflows, use the [ClaudeLint class](./claudelint-class.md) instead.

## Functions

### lint()

Lints files matching glob patterns.

```typescript
function lint(patterns: string[], options?: LintOptions): Promise<LintResult[]>
```

**Parameters:**

- `patterns` (string[]) - Array of glob patterns
- `options` (LintOptions, optional) - Linting options

**Returns:** Promise<LintResult[]>

**Example:**

```typescript
import { lint } from 'claude-code-lint';

// Basic usage
const results = await lint(['**/*.md']);

// With options
const results = await lint(['**/*.md'], {
  fix: true,
  cwd: '/path/to/project',
});

// Check for errors
const hasErrors = results.some(r => r.errorCount > 0);
if (hasErrors) {
  process.exit(1);
}
```

**Options:**

```typescript
interface LintOptions extends ClaudeLintOptions {
  errorOnUnmatchedPattern?: boolean; // Throw if no files match (default: true)
}
```

### lintText()

Lints text content without a file on disk.

```typescript
function lintText(code: string, options?: LintTextOptions): Promise<LintResult[]>
```

**Parameters:**

- `code` (string) - Text content to lint
- `options` (LintTextOptions, optional) - Options

**Returns:** Promise<LintResult[]> - Array with single result

**Example:**

```typescript
import { lintText } from 'claude-code-lint';

const code = `
# CLAUDE.md

My instructions for Claude
`;

const results = await lintText(code, {
  filePath: 'CLAUDE.md',
});

console.log(`Errors: ${results[0].errorCount}`);
console.log(`Warnings: ${results[0].warningCount}`);

// Display messages
for (const msg of results[0].messages) {
  console.log(`Line ${msg.line}: ${msg.message}`);
}
```

**Options:**

```typescript
interface LintTextOptions {
  filePath?: string; // Virtual file path (determines which validators run)
}
```

**Notes:**

- The `filePath` determines which validators run (e.g., 'CLAUDE.md' runs CLAUDE.md validators)
- If omitted, uses a random temporary filename
- Creates and cleans up temporary file automatically

### resolveConfig()

Resolves the effective configuration for a file.

```typescript
function resolveConfig(filePath: string, options?: ConfigOptions): Promise<ClaudeLintConfig>
```

**Parameters:**

- `filePath` (string) - Path to resolve config for
- `options` (ConfigOptions, optional) - Options

**Returns:** Promise<ClaudeLintConfig> - Merged configuration with overrides

**Example:**

```typescript
import { resolveConfig } from 'claude-code-lint';

// Get config for specific file
const config = await resolveConfig('skills/test/SKILL.md');

console.log('Active rules:', config.rules);
console.log('Ignore patterns:', config.ignorePatterns);

// Check if specific rule is enabled
const ruleConfig = config.rules?.['skill-missing-examples'];
if (ruleConfig && ruleConfig !== 'off') {
  console.log('skill-missing-examples is enabled');
}
```

**Options:**

```typescript
interface ConfigOptions {
  cwd?: string; // Working directory (default: process.cwd())
}
```

### formatResults()

Formats lint results using a formatter.

```typescript
function formatResults(
  results: LintResult[],
  formatterName?: string,
  options?: FormatterOptions
): Promise<string>
```

**Parameters:**

- `results` (LintResult[]) - Results to format
- `formatterName` (string, optional) - Formatter name or path (default: 'stylish')
- `options` (FormatterOptions, optional) - Options

**Returns:** Promise<string> - Formatted output

**Example:**

```typescript
import { lint, formatResults } from 'claude-code-lint';

const results = await lint(['**/*.md']);

// Use default formatter (stylish)
const output = await formatResults(results);
console.log(output);

// Use JSON formatter
const json = await formatResults(results, 'json');
const parsed = JSON.parse(json);

// Use custom formatter
const custom = await formatResults(results, './my-formatter.js');
```

**Built-in Formatters:**

- `stylish` - Human-readable with colors (default)
- `json` - JSON output
- `compact` - Compact single-line format
- `junit` - JUnit XML format

**Options:**

```typescript
interface FormatterOptions {
  cwd?: string; // Working directory
}
```

### getFileInfo()

Gets information about a file (ignored status, validators).

```typescript
function getFileInfo(filePath: string, options?: FileInfoOptions): Promise<FileInfo>
```

**Parameters:**

- `filePath` (string) - Path to check
- `options` (FileInfoOptions, optional) - Options

**Returns:** Promise<FileInfo>

**Example:**

```typescript
import { getFileInfo } from 'claude-code-lint';

const info = await getFileInfo('CLAUDE.md');

if (info.ignored) {
  console.log('File is ignored');
} else {
  console.log('Validators:', info.validators);
  // ['ClaudeMdValidator', 'FileValidator', ...]
}
```

**FileInfo Type:**

```typescript
interface FileInfo {
  ignored: boolean;        // Whether file matches ignore patterns
  validators: string[];    // Names of validators that apply to this file
}
```

**Options:**

```typescript
interface FileInfoOptions {
  cwd?: string; // Working directory
}
```

## Usage Patterns

### Build Script

Simple build validation:

```typescript
import { lint, formatResults } from 'claude-code-lint';

async function validateProject() {
  console.log('Validating Claude Code files...');

  const results = await lint(['**/*.md']);
  const hasErrors = results.some(r => r.errorCount > 0);

  if (hasErrors) {
    const output = await formatResults(results, 'stylish');
    console.error(output);
    process.exit(1);
  }

  console.log('Validation passed!');
}

validateProject();
```

### Pre-commit Hook

Validate staged files:

```typescript
import { execSync } from 'child_process';
import { lint, formatResults } from 'claude-code-lint';

async function validateStaged() {
  // Get staged .md files
  const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM')
    .toString()
    .split('\n')
    .filter(f => f.endsWith('.md'));

  if (stagedFiles.length === 0) {
    console.log('No .md files to validate');
    return;
  }

  const results = await lint(stagedFiles, {
    errorOnUnmatchedPattern: false,
  });

  const hasErrors = results.some(r => r.errorCount > 0);

  if (hasErrors) {
    const output = await formatResults(results, 'compact');
    console.error('Validation failed:');
    console.error(output);
    process.exit(1);
  }
}

validateStaged();
```

### CI/CD Pipeline

Validate and generate reports:

```typescript
import { writeFile } from 'fs/promises';
import { lint, formatResults } from 'claude-code-lint';

async function ciValidation() {
  const results = await lint(['**/*.md']);

  // Human-readable output
  const stylish = await formatResults(results, 'stylish');
  console.log(stylish);

  // JSON report for artifacts
  const json = await formatResults(results, 'json');
  await writeFile('lint-report.json', json);

  // JUnit XML for test reporting
  const junit = await formatResults(results, 'junit');
  await writeFile('lint-report.xml', junit);

  // Exit with error code
  const hasErrors = results.some(r => r.errorCount > 0);
  process.exit(hasErrors ? 1 : 0);
}

ciValidation();
```

### Text Validation

Validate dynamic content:

```typescript
import { lintText } from 'claude-code-lint';

async function validateGeneratedContent(content: string) {
  const results = await lintText(content, {
    filePath: 'CLAUDE.md',
  });

  const issues = results[0].messages;

  if (issues.length > 0) {
    console.log('Content has issues:');
    for (const issue of issues) {
      console.log(`Line ${issue.line}: ${issue.message}`);
    }
    return false;
  }

  return true;
}

// Example: Validate AI-generated content
const aiContent = generateClaudeInstructions();
const isValid = await validateGeneratedContent(aiContent);
```

### Configuration Inspector

Check effective configuration:

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

## Comparison: Functional vs Class API

### Use Functional API When

- Performing a single operation
- Don't need to maintain state
- Simple build scripts
- Quick validation checks
- Code is short and simple

**Example:**

```typescript
// Simple: lint and display results
const results = await lint(['**/*.md']);
const output = await formatResults(results);
console.log(output);
```

### Use Class API When

- Multiple related operations
- Reusing configuration
- Custom progress tracking
- Advanced features (fix predicates, etc.)
- Complex workflows

**Example:**

```typescript
// Complex: custom configuration, progress tracking, selective fixing
const linter = new ClaudeLint({
  fix: (msg) => msg.ruleId?.includes('format'),
  onProgress: (file, i, total) => console.log(`[${i}/${total}] ${file}`),
  config: {
    rules: { /* ... */ },
    overrides: [ /* ... */ ],
  },
});

const results = await linter.lintFiles(['**/*.md']);
const formatter = await linter.loadFormatter('stylish');
const output = formatter.format(results);
console.log(output);

await ClaudeLint.outputFixes(results);
```

## TypeScript Support

All functions are fully typed:

```typescript
import { lint, formatResults, LintResult } from 'claude-code-lint';

async function example() {
  // Type inference
  const results = await lint(['**/*.md']); // LintResult[]

  // Type safety
  const output = await formatResults(results, 'stylish'); // string

  // Autocomplete for options
  const results2 = await lint(['**/*.md'], {
    fix: true,  // boolean | ((message: LintMessage) => boolean)
    cwd: '/path',
  });
}
```

## See Also

- [ClaudeLint Class](./claudelint-class.md) - Full class API
- [Types](./types.md) - TypeScript type reference
- [Formatters](./formatters.md) - Formatter documentation
- [Examples](../../examples/) - Complete examples
