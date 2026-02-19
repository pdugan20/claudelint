---
description: Use claudelint's built-in helper functions in custom rules for heading detection, pattern matching, frontmatter parsing, file system operations, and JSON/YAML parsing.
---

# Helper Library

claudelint provides utility functions for [custom rules](/development/custom-rules). All helpers are imported from `claude-code-lint/utils`.

## Quick Start

```typescript
import { hasHeading, extractFrontmatter } from 'claude-code-lint/utils';

export const rule: Rule = {
  meta: { id: 'my-rule', /* ... */ },
  validate: async (context) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);
    if (!hasHeading(context.fileContent, 'Usage', 2)) {
      context.report({ message: 'Missing ## Usage section' });
    }
  },
};
```

## Available Helpers

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; margin: 16px 0;">

<HelperCard
  name="Headings"
  returns="hasHeading, extractHeadings"
  description="Check for specific headings and analyze document structure."
  link="#headings"
/>

<HelperCard
  name="Pattern Matching"
  returns="matchesPattern, countOccurrences, findLinesMatching"
  description="Search content with strings and regular expressions."
  link="#pattern-matching"
/>

<HelperCard
  name="Frontmatter"
  returns="extractFrontmatter, validateSemver"
  description="Parse YAML frontmatter and validate version fields."
  link="#frontmatter"
/>

<HelperCard
  name="File System"
  returns="fileExists, readFileContent"
  description="Check file existence and read file content."
  link="#file-system"
/>

<HelperCard
  name="Parsing"
  returns="parseJSON, parseYAML"
  description="Safely parse JSON and YAML data formats."
  link="#parsing"
/>

<HelperCard
  name="Markdown Utilities"
  returns="extractBodyContent, stripCodeBlocks, extractImports, extractImportsWithLineNumbers, getFrontmatterFieldLine, countLines"
  description="Manipulate markdown structure: extract body, strip fences, find imports."
  link="#markdown-utilities"
/>

<HelperCard
  name="Patterns and Constants"
  returns="escapeRegExp, containsEnvVar, isValidSemver, isImportPath"
  description="Regex escaping, environment variable detection, and path classification."
  link="#patterns-and-constants"
/>

</div>

## Headings

### hasHeading(content, text, level?)

Returns `boolean`. Check if markdown contains a specific heading. Pass an optional `level` (1-6) to match a specific heading depth.

```typescript
if (!hasHeading(context.fileContent, 'Overview')) {
  context.report({ message: 'Missing Overview section' });
}

if (!hasHeading(context.fileContent, 'Installation', 2)) {
  context.report({ message: 'Missing ## Installation section' });
}
```

### extractHeadings(content)

Returns `Array<{ text, level, line }>`. Get all headings with their levels and line numbers.

```typescript
const headings = extractHeadings(context.fileContent);

if (headings[0]?.level !== 1) {
  context.report({
    message: 'First heading must be level 1',
    line: headings[0]?.line,
  });
}
```

## Pattern Matching

### matchesPattern(content, pattern)

Returns `boolean`. Test content against a regular expression.

```typescript
if (matchesPattern(context.fileContent, /TODO:|FIXME:/i)) {
  context.report({ message: 'Found TODO/FIXME comments' });
}
```

### countOccurrences(content, search)

Returns `number`. Count how many times a string or regex pattern appears.

```typescript
const todoCount = countOccurrences(context.fileContent, /\bTODO\b/g);
if (todoCount > 0) {
  context.report({ message: `Found ${todoCount} TODO comments` });
}
```

### findLinesMatching(content, pattern)

Returns `Array<{ line, content }>`. Find all matching lines with line numbers.

```typescript
const matches = findLinesMatching(context.fileContent, /password\s*=/i);

matches.forEach(m => {
  context.report({
    message: 'Hardcoded password detected',
    line: m.line,
  });
});
```

## Frontmatter

### extractFrontmatter(content)

Returns `{ frontmatter, content, hasFrontmatter }`. Parse YAML frontmatter from markdown files.

```typescript
const result = extractFrontmatter(context.fileContent);

if (!result.hasFrontmatter || !result.frontmatter) {
  context.report({ message: 'Missing frontmatter' });
  return;
}

if (!result.frontmatter.version) {
  context.report({ message: 'Frontmatter missing version field' });
}
```

### validateSemver(version)

Returns `boolean`. Check if a string is a valid semantic version (e.g., `1.0.0`, `2.1.3-beta`).

```typescript
if (fm?.version && !validateSemver(fm.version)) {
  context.report({ message: `Invalid version format: ${fm.version}` });
}
```

## File System

### fileExists(filePath)

Returns `Promise<boolean>`. Check if a file exists.

```typescript
if (!(await fileExists('./README.md'))) {
  context.report({ message: 'README.md not found' });
}
```

### readFileContent(filePath)

Returns `Promise<string | null>`. Read file content. Returns `null` on failure.

```typescript
const content = await readFileContent('./config.json');

if (content === null) {
  context.report({ message: 'Failed to read config.json' });
  return;
}

const config = parseJSON(content);
```

## Parsing

### parseJSON(content)

Returns `object | null`. Safely parse JSON content.

```typescript
const data = parseJSON(context.fileContent);

if (!data) {
  context.report({ message: 'Invalid JSON' });
  return;
}
```

### parseYAML(content)

Returns `object | null`. Safely parse YAML content.

```typescript
const data = parseYAML(context.fileContent);

if (!data) {
  context.report({ message: 'Invalid YAML' });
  return;
}
```

## Markdown Utilities

### extractBodyContent(content)

Returns `string`. Strip frontmatter and return only the markdown body.

```typescript
const body = extractBodyContent(context.fileContent);
```

### stripCodeBlocks(content)

Returns `string`. Remove all fenced code blocks (backtick and tilde) from content.

```typescript
const prose = stripCodeBlocks(context.fileContent);
if (matchesPattern(prose, /TODO:/)) {
  context.report({ message: 'TODO found outside code blocks' });
}
```

### extractImports(content)

Returns `string[]`. Get all `@path` import references from markdown content.

```typescript
const imports = extractImports(context.fileContent);
```

### extractImportsWithLineNumbers(content)

Returns `Array<{ path, line }>`. Like `extractImports` but includes line numbers.

```typescript
const imports = extractImportsWithLineNumbers(context.fileContent);
imports.forEach(imp => {
  context.report({ message: `Import: ${imp.path}`, line: imp.line });
});
```

### getFrontmatterFieldLine(content, field)

Returns `number | undefined`. Find the line number of a specific frontmatter field.

```typescript
const line = getFrontmatterFieldLine(context.fileContent, 'version');
if (line) {
  context.report({ message: 'Invalid version', line });
}
```

### countLines(content)

Returns `number`. Count the number of lines in a string.

```typescript
const lines = countLines(context.fileContent);
if (lines > 500) {
  context.report({ message: 'File too long' });
}
```

## Patterns and Constants

### escapeRegExp(str)

Returns `string`. Escape special regex characters in a string for use in `new RegExp()`.

```typescript
const pattern = new RegExp(escapeRegExp(userInput), 'g');
```

### containsEnvVar(str)

Returns `boolean`. Check if a string contains environment variable syntax (`$VAR`, `${VAR}`, `%VAR%`).

```typescript
if (containsEnvVar(url)) {
  return; // Skip validation — URL uses env vars
}
```

### isValidSemver(str)

Returns `boolean`. Check if a string matches semver format (e.g., `1.0.0`, `2.1.3-beta.1`).

```typescript
if (!isValidSemver(version)) {
  context.report({ message: 'Invalid semver' });
}
```

### isImportPath(str)

Returns `boolean`. Check if an `@`-prefixed string is an import path (contains `/` or file extension) vs. a decorator or email.

```typescript
if (isImportPath(match)) {
  // It's an @import reference like @.claude/rules/git.md
}
```

## See Also

- [Custom Rules Guide](/development/custom-rules#examples) - Full working examples using these helpers
- [Custom Rules Troubleshooting](/development/custom-rules-troubleshooting) - Common issues and solutions
