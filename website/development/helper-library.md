# Helper Library

claudelint provides utility functions to simplify common validation tasks in [custom rules](/development/custom-rules). Import them in your custom rules:

```typescript
import {
  hasHeading,
  extractHeadings,
  matchesPattern,
  countOccurrences,
  extractFrontmatter,
  validateSemver,
  fileExists,
  readFileContent,
  parseJSON,
  parseYAML,
  findLinesMatching,
} from 'claudelint/utils';
```

## Heading Functions

### hasHeading(content, text, level?)

Check if markdown contains a specific heading.

```typescript
// Check for any level heading
if (!hasHeading(context.fileContent, 'Overview')) {
  context.report({ message: 'Missing Overview section' });
}

// Check for specific level (1-6)
if (!hasHeading(context.fileContent, 'Installation', 2)) {
  context.report({ message: 'Missing ## Installation section' });
}
```

### extractHeadings(content)

Get all headings with their levels and line numbers.

```typescript
const headings = extractHeadings(context.fileContent);

// Check heading structure
if (headings.length === 0) {
  context.report({ message: 'File has no headings' });
}

// Check first heading is H1
if (headings[0]?.level !== 1) {
  context.report({
    message: 'First heading must be level 1',
    line: headings[0]?.line,
  });
}

// Find specific heading
const overview = headings.find(h => h.text === 'Overview');
if (!overview) {
  context.report({ message: 'Missing Overview heading' });
}
```

## Pattern Matching

### matchesPattern(content, pattern)

Check if content matches a regular expression.

```typescript
// Check for TODO comments
if (matchesPattern(context.fileContent, /TODO:|FIXME:/i)) {
  context.report({ message: 'Found TODO/FIXME comments' });
}

// Check for hardcoded secrets
if (matchesPattern(context.fileContent, /api[_-]?key\s*=\s*['"][^'"]+['"]/i)) {
  context.report({ message: 'Possible hardcoded API key detected' });
}
```

### countOccurrences(content, search)

Count how many times a string or pattern appears.

```typescript
// Count string occurrences
const count = countOccurrences(context.fileContent, 'deprecated');
if (count > 5) {
  context.report({ message: `Too many deprecated items (${count})` });
}

// Count regex matches
const todoCount = countOccurrences(context.fileContent, /\bTODO\b/g);
if (todoCount > 0) {
  context.report({ message: `Found ${todoCount} TODO comments` });
}
```

### findLinesMatching(content, pattern)

Find all lines that match a pattern with line numbers.

```typescript
const matches = findLinesMatching(
  context.fileContent,
  /password\s*=\s*['"](.+)['"]/i
);

matches.forEach(m => {
  context.report({
    message: 'Hardcoded password detected',
    line: m.line,
    fix: 'Use environment variables for sensitive data',
  });
});
```

## Frontmatter & Metadata

### extractFrontmatter(content)

Extract YAML frontmatter from markdown files. Returns an object with:

- `frontmatter` - The parsed frontmatter object (or null if none)
- `content` - The markdown content without frontmatter
- `hasFrontmatter` - Boolean indicating if frontmatter exists

```typescript
const result = extractFrontmatter(context.fileContent);

if (!result.hasFrontmatter || !result.frontmatter) {
  context.report({ message: 'Missing frontmatter' });
  return;
}

const fm = result.frontmatter;

// Check required fields
if (!fm.version) {
  context.report({ message: 'Frontmatter missing version field' });
}

if (!fm.name || typeof fm.name !== 'string') {
  context.report({ message: 'Frontmatter must have name field' });
}

// Validate field values
if (fm.deprecated === true && !fm.replacedBy) {
  context.report({ message: 'Deprecated items must specify replacedBy' });
}
```

### validateSemver(version)

Validate semantic versioning format.

```typescript
const result = extractFrontmatter(context.fileContent);
const fm = result.frontmatter;

if (fm?.version && !validateSemver(fm.version)) {
  context.report({
    message: `Invalid version format: ${fm.version}`,
    fix: 'Use semantic versioning (e.g., 1.0.0, 2.1.3-beta)',
  });
}
```

## File System

### fileExists(filePath)

Check if a file exists (asynchronous).

```typescript
// Check for required files
if (!(await fileExists('./README.md'))) {
  context.report({ message: 'README.md not found' });
}

// Check referenced files
const result = extractFrontmatter(context.fileContent);
const fm = result.frontmatter;

if (fm?.icon && !(await fileExists(fm.icon))) {
  context.report({
    message: `Icon file not found: ${fm.icon}`,
    line: 1,
  });
}
```

### readFileContent(filePath)

Read file content asynchronously.

```typescript
validate: async (context) => {
  // Read related file
  const configContent = await readFileContent('./config.json');

  if (configContent === null) {
    context.report({ message: 'Failed to read config.json' });
    return;
  }

  const config = parseJSON(configContent);
  // Validate config matches current file...
}
```

## Parsing

### parseJSON(content)

Safely parse JSON content.

```typescript
// Parse JSON files
if (context.filePath.endsWith('.json')) {
  const data = parseJSON(context.fileContent);

  if (!data) {
    context.report({ message: 'Invalid JSON' });
    return;
  }

  // Validate JSON structure
  if (!data.name || !data.version) {
    context.report({ message: 'Missing required fields' });
  }
}
```

### parseYAML(content)

Safely parse YAML content.

```typescript
// Parse YAML files
if (context.filePath.endsWith('.yml') || context.filePath.endsWith('.yaml')) {
  const data = parseYAML(context.fileContent);

  if (!data) {
    context.report({ message: 'Invalid YAML' });
    return;
  }

  // Validate YAML structure
  if (Array.isArray(data.rules) && data.rules.length === 0) {
    context.report({ message: 'Rules array is empty' });
  }
}
```

## Complete Example

```typescript
// .claudelint/rules/skill-quality.ts
import type { Rule } from 'claude-code-lint';
import {
  extractFrontmatter,
  validateSemver,
  hasHeading,
  extractHeadings,
  countOccurrences,
  findLinesMatching,
} from 'claudelint/utils';

export const rule: Rule = {
  meta: {
    id: 'skill-quality',
    name: 'Skill Quality Checks',
    description: 'Enforce quality standards for skill documentation',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },

  validate: async (context) => {
    // Only check skill SKILL.md files
    if (!context.filePath.endsWith('SKILL.md')) {
      return;
    }

    // Check frontmatter
    const result = extractFrontmatter(context.fileContent);
    if (!result.hasFrontmatter || !result.frontmatter) {
      context.report({ message: 'SKILL.md must have frontmatter', line: 1 });
      return;
    }

    const fm = result.frontmatter;

    // Validate version
    if (fm.version && !validateSemver(fm.version)) {
      context.report({
        message: `Invalid version format: ${fm.version}`,
        line: 2,
      });
    }

    // Check required headings
    if (!hasHeading(context.fileContent, 'Usage', 2)) {
      context.report({ message: 'Missing ## Usage section' });
    }

    if (!hasHeading(context.fileContent, 'Examples', 2)) {
      context.report({ message: 'Missing ## Examples section' });
    }

    // Check heading hierarchy
    const headings = extractHeadings(context.fileContent);
    if (headings[0]?.level !== 1) {
      context.report({
        message: 'First heading must be level 1',
        line: headings[0]?.line,
      });
    }

    // Check for TODOs
    const todoCount = countOccurrences(context.fileContent, /TODO:/g);
    if (todoCount > 3) {
      context.report({
        message: `Too many TODO comments (${todoCount})`,
        fix: 'Complete or remove TODO items',
      });
    }

    // Check for sensitive data
    const secrets = findLinesMatching(
      context.fileContent,
      /password|api[_-]?key|secret/i
    );

    secrets.forEach(match => {
      context.report({
        message: 'Possible sensitive data in documentation',
        line: match.line,
        fix: 'Use placeholders like YOUR_API_KEY',
      });
    });
  },
};
```
