# Custom Rules Guide

claudelint allows you to define custom validation rules to extend the built-in rule set with your own team-specific or project-specific requirements.

## Quick Start

1. Create a `.claudelint/rules/` directory in your project root
2. Add a custom rule file (`.js` or `.ts`)
3. Export a `rule` object that implements the Rule interface
4. Run `claudelint check-all` to load and execute your custom rules

Example custom rule:

```javascript
// .claudelint/rules/no-profanity.js
module.exports.rule = {
  meta: {
    id: 'no-profanity',
    name: 'No Profanity',
    description: 'Disallow profanity in Claude Code files',
    category: 'Custom',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },
  validate: async (context) => {
    const profanityWords = ['badword1', 'badword2'];
    const content = context.fileContent.toLowerCase();

    for (const word of profanityWords) {
      if (content.includes(word)) {
        context.report({
          message: `Found profanity: "${word}"`,
          line: 1,
        });
      }
    }
  },
};
```

## Directory Structure

Custom rules are automatically discovered in the `.claudelint/rules/` directory:

```text
your-project/
├── .claudelint/
│   └── rules/
│       ├── team-rule.js
│       ├── project-rule.js
│       └── conventions/
│           └── naming-rule.js
├── CLAUDE.md
└── .claudelintrc.json
```

Key features:

- Rules can be organized in subdirectories
- Both `.js` and `.ts` files are supported
- `.d.ts`, `.test.ts`, and `.spec.ts` files are automatically excluded
- Rules are loaded recursively from all subdirectories

## Rule Interface

Every custom rule must implement the `Rule` interface:

```typescript
interface Rule {
  meta: RuleMetadata;
  validate: (context: ValidationContext) => Promise<void>;
}
```

### Rule Metadata

The `meta` object describes your rule:

```typescript
interface RuleMetadata {
  id: string;              // Unique identifier (e.g., 'no-profanity')
  name: string;            // Human-readable name
  description: string;     // What the rule checks
  category: string;        // Group rules by category (typically 'Custom')
  severity: 'error' | 'warn';  // Default severity level
  fixable?: boolean;       // Whether rule can auto-fix violations
  deprecated?: boolean;    // Mark rule as deprecated
  since?: string;          // Version when rule was introduced
}
```

**Important:** Rule IDs must be unique across all custom rules and built-in rules. If a custom rule ID conflicts with an existing rule, the loader will reject it.

### Validation Function

The `validate` function receives a `ValidationContext` and reports violations:

```typescript
interface ValidationContext {
  filePath: string;        // Path to file being validated
  fileContent: string;     // Full content of the file
  report: (violation: Violation) => void;  // Report a violation
}

interface Violation {
  message: string;         // Description of the violation
  line?: number;           // Line number (optional)
  column?: number;         // Column number (optional)
  severity?: 'error' | 'warn';  // Override default severity
}
```

## Example Custom Rules

### Example 1: Enforce Maximum File Size

```javascript
// .claudelint/rules/max-file-size.js
module.exports.rule = {
  meta: {
    id: 'max-file-size',
    name: 'Maximum File Size',
    description: 'Enforce maximum file size limit',
    category: 'Custom',
    severity: 'warn',
  },
  validate: async (context) => {
    const maxSize = 5000; // characters
    const size = context.fileContent.length;

    if (size > maxSize) {
      context.report({
        message: `File size (${size}) exceeds maximum (${maxSize})`,
        line: 1,
      });
    }
  },
};
```

### Example 2: Require Specific Heading

```javascript
// .claudelint/rules/require-overview.js
module.exports.rule = {
  meta: {
    id: 'require-overview',
    name: 'Require Overview Section',
    description: 'CLAUDE.md must include an overview section',
    category: 'Custom',
    severity: 'error',
  },
  validate: async (context) => {
    if (!context.filePath.endsWith('CLAUDE.md')) {
      return; // Only check CLAUDE.md files
    }

    if (!context.fileContent.includes('## Overview')) {
      context.report({
        message: 'CLAUDE.md must include "## Overview" section',
        line: 1,
      });
    }
  },
};
```

### Example 3: Pattern Matching

```javascript
// .claudelint/rules/no-absolute-paths.js
module.exports.rule = {
  meta: {
    id: 'no-absolute-paths',
    name: 'No Absolute Paths',
    description: 'Disallow absolute file paths in documentation',
    category: 'Custom',
    severity: 'warn',
  },
  validate: async (context) => {
    const absolutePathPattern = /\/Users\/|\/home\/|C:\\/gi;
    const lines = context.fileContent.split('\n');

    lines.forEach((line, index) => {
      if (absolutePathPattern.test(line)) {
        context.report({
          message: 'Avoid absolute file paths in documentation',
          line: index + 1,
        });
      }
    });
  },
};
```

## Auto-Fix Support

Custom rules can provide automatic fixes that users can apply with the `--fix` flag.

### AutoFix Interface

To enable auto-fix, include an `autoFix` object in your `context.report()` call:

```typescript
interface AutoFix {
  ruleId: string;              // Must match your rule's meta.id
  description: string;         // Human-readable description of the fix
  filePath: string;            // Path to file being fixed (use context.filePath)
  apply: (currentContent: string) => string;  // Function that returns fixed content
}
```

### Example: Auto-Fix Trailing Whitespace

```javascript
// .claudelint/rules/no-trailing-whitespace.js
module.exports.rule = {
  meta: {
    id: 'no-trailing-whitespace',
    name: 'No Trailing Whitespace',
    description: 'Remove trailing whitespace from lines',
    category: 'Custom',
    severity: 'warning',
    fixable: true,  // Mark as fixable
    deprecated: false,
    since: '1.0.0',
  },

  validate: async (context) => {
    const lines = context.fileContent.split('\n');
    let hasViolations = false;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i] !== lines[i].trimEnd()) {
        hasViolations = true;
        break;
      }
    }

    if (hasViolations) {
      context.report({
        message: 'Found trailing whitespace',
        line: 1,
        fix: 'Remove trailing whitespace',
        autoFix: {
          ruleId: 'no-trailing-whitespace',
          description: 'Remove trailing whitespace from all lines',
          filePath: context.filePath,
          apply: (currentContent) => {
            return currentContent
              .split('\n')
              .map((line) => line.trimEnd())
              .join('\n');
          },
        },
      });
    }
  },
};
```

### Using Auto-Fix

Run claudelint with the `--fix` flag to apply automatic fixes:

```bash
# Preview fixes (dry-run)
claudelint check-all --fix --dry-run

# Apply fixes
claudelint check-all --fix
```

### Best Practices for Auto-Fix

1. **Always mark fixable rules**: Set `fixable: true` in meta when providing autoFix
2. **Make fixes idempotent**: Running the fix multiple times should produce the same result
3. **Validate fix results**: Ensure your apply() function returns valid content
4. **One fix per violation**: Don't try to fix multiple unrelated issues in one autoFix
5. **Use simple transformations**: Complex fixes are better done manually

### Example: Pattern Replacement Fix

```javascript
// .claudelint/rules/use-correct-term.js
module.exports.rule = {
  meta: {
    id: 'use-correct-term',
    name: 'Use Correct Terminology',
    description: 'Replace deprecated terms with preferred ones',
    category: 'Custom',
    severity: 'warning',
    fixable: true,
    deprecated: false,
    since: '1.0.0',
  },

  validate: async (context) => {
    const replacements = {
      'whitelist': 'allowlist',
      'blacklist': 'blocklist',
      'master': 'main',
    };

    for (const [oldTerm, newTerm] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${oldTerm}\\b`, 'gi');

      if (regex.test(context.fileContent)) {
        context.report({
          message: `Use "${newTerm}" instead of "${oldTerm}"`,
          fix: `Replace all instances`,
          autoFix: {
            ruleId: 'use-correct-term',
            description: `Replace "${oldTerm}" with "${newTerm}"`,
            filePath: context.filePath,
            apply: (content) => {
              return content.replace(regex, newTerm);
            },
          },
        });
      }
    }
  },
};
```

## Configuration

Custom rules can be configured in `.claudelintrc.json`:

```json
{
  "rules": {
    "no-profanity": "error",
    "max-file-size": "warn",
    "require-overview": "off"
  }
}
```

Severity levels:
- `"error"` - Treat violations as errors (exit code 1)
- `"warn"` - Treat violations as warnings
- `"off"` - Disable the rule

## Loading Behavior

Custom rules are loaded automatically when you run `claudelint check-all`:

1. claudelint searches for `.claudelint/rules/` in the project root
2. All `.js` and `.ts` files are discovered recursively
3. Each file is loaded and validated
4. Rules are registered with the rule registry
5. Configured rules are executed during validation

### Load Results

If a custom rule fails to load, you'll see an error message:

```text
Failed to load custom rule: .claudelint/rules/broken-rule.js
Error: Rule does not implement Rule interface (must have meta and validate)
```

Common load failures:
- Missing `rule` export
- Invalid rule interface (missing `meta` or `validate`)
- Rule ID conflicts with existing rule
- Syntax errors in rule file

## Best Practices

### 1. Use Descriptive IDs and Names

```javascript
// Good
meta: {
  id: 'no-todo-comments',
  name: 'No TODO Comments',
}

// Bad
meta: {
  id: 'rule1',
  name: 'Rule',
}
```

### 2. Provide Helpful Error Messages

```javascript
// Good
context.report({
  message: 'Found TODO comment on line 42. Please create a GitHub issue instead.',
  line: 42,
});

// Bad
context.report({
  message: 'Invalid',
});
```

### 3. Make Rules Focused

Each rule should check one thing. Don't combine multiple validations into a single rule.

### 4. Handle Edge Cases

```javascript
validate: async (context) => {
  // Check if file is relevant
  if (!context.filePath.endsWith('.md')) {
    return;
  }

  // Handle empty files
  if (!context.fileContent.trim()) {
    return;
  }

  // Your validation logic...
}
```

### 5. Use Appropriate Severity

- `error` - For violations that must be fixed (security, breaking conventions)
- `warn` - For suggestions or style preferences

### 6. Test Your Rules

Create test cases for your custom rules:

```javascript
// .claudelint/rules/__tests__/no-profanity.test.js
const { rule } = require('../no-profanity');

describe('no-profanity rule', () => {
  it('should detect profanity', async () => {
    const violations = [];
    const context = {
      filePath: 'test.md',
      fileContent: 'This contains badword1',
      report: (v) => violations.push(v),
    };

    await rule.validate(context);

    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('badword1');
  });
});
```

## Troubleshooting

### Rule Not Loading

**Problem:** Custom rule doesn't appear in output

**Solutions:**
- Verify file is in `.claudelint/rules/` directory
- Check file extension is `.js` or `.ts` (not `.d.ts`, `.test.ts`, etc.)
- Ensure `module.exports.rule` is used (not ES6 `export`)
- Check for syntax errors in the rule file

### Rule ID Conflicts

**Problem:** `Error: Rule ID conflicts with existing rule`

**Solutions:**
- Choose a unique ID that doesn't match built-in rules
- Check for duplicate IDs across your custom rules
- Prefix custom rules with a namespace (e.g., `team-no-profanity`)

### TypeScript Compilation Errors

**Problem:** `Parameter 'context' implicitly has an 'any' type`

**Solutions:**
- Use `.js` files instead of `.ts` for simpler setup
- If using TypeScript, add type annotations:

```typescript
import type { ValidationContext } from 'claudelint';

module.exports.rule = {
  // ...
  validate: async (context: ValidationContext) => {
    // ...
  },
};
```

### Rule Not Executing

**Problem:** Rule loads but doesn't report violations

**Solutions:**
- Check rule is enabled in `.claudelintrc.json`
- Verify `context.report()` is being called
- Add debug logging to validate function
- Ensure file being checked matches your rule's logic

### Helper Functions Not Found

**Problem:** `Cannot find module 'claudelint/utils'`

**Solutions:**
- Use `require('claudelint/utils')` not `import`
- For `.ts` files, import types separately: `import type { RuleContext } from 'claudelint'`
- Ensure you're using the helpers within the `validate` function
- Check that helpers are exported from your rule file

Example:
```javascript
const { hasHeading, extractFrontmatter } = require('claudelint/utils');

module.exports.rule = {
  validate: async (context) => {
    const fm = extractFrontmatter(context.fileContent);
    // ...
  },
};
```

### Auto-Fix Not Working

**Problem:** Auto-fix doesn't apply when using `--fix` flag

**Solutions:**
- Verify `meta.fixable: true` in rule metadata
- Ensure `autoFix` object is passed to `context.report()`
- Check that `apply()` function returns modified content
- Make sure `apply()` is pure (doesn't mutate input)
- Test `apply()` function independently

Example:
```javascript
meta: {
  fixable: true,  // Required for auto-fix
  // ...
},
validate: async (context) => {
  context.report({
    message: 'Issue found',
    autoFix: {
      ruleId: 'my-rule',
      description: 'Fix description',
      filePath: context.filePath,
      apply: (content) => {
        return content.replace(/old/g, 'new');
      },
    },
  });
},
```

### Regular Expression Issues

**Problem:** Pattern doesn't match expected content

**Solutions:**
- Test regex at [regex101.com](https://regex101.com) first
- Use `matchesPattern()` for quick existence checks
- Use `findLinesMatching()` to get line numbers
- Remember: `.` doesn't match newlines by default
- Use `\s` for whitespace, `\S` for non-whitespace
- Escape special characters: `\.`, `\?`, `\*`, etc.

Example:
```javascript
// Find all TODO comments with line numbers
const todos = findLinesMatching(context.fileContent, /TODO:/gi);
todos.forEach(match => {
  context.report({
    message: 'Found TODO comment',
    line: match.line,
  });
});
```

### Frontmatter Parsing Fails

**Problem:** `extractFrontmatter()` returns `null`

**Solutions:**
- Verify frontmatter has `---` delimiters at start/end
- Check YAML syntax is valid (no tabs, proper indentation)
- Ensure frontmatter is at the very beginning of file
- Test YAML at [yamllint.com](http://www.yamllint.com)

Valid frontmatter format:
```yaml
---
name: My File
version: 1.0.0
tags: [example, test]
---
```

### File Existence Checks Failing

**Problem:** `fileExists()` returns false for existing files

**Solutions:**
- Use absolute paths, not relative paths
- Join paths with `path.join()` for cross-platform compatibility
- Get file directory with `path.dirname(context.filePath)`
- Check for typos in file path

Example:
```javascript
const { join, dirname } = require('path');
const { fileExists } = require('claudelint/utils');

const dir = dirname(context.filePath);
const targetFile = join(dir, '../README.md');

if (!(await fileExists(targetFile))) {
  context.report({ message: 'README.md not found' });
}
```

### Async/Await Errors

**Problem:** `await is only valid in async function`

**Solutions:**
- Mark `validate` function as `async`
- Use `await` for async helpers like `readFileContent()` and `fileExists()`
- Don't use `await` with sync helpers (parseJSON, parseYAML, matchesPattern, etc.)

Example:
```javascript
validate: async (context) => {  // Note: async keyword
  const content = await readFileContent('./config.json');
  const exists = await fileExists('./README.md');  // await needed
  const data = parseJSON(content);  // No await needed (sync)
},
```

### Performance Issues

**Problem:** Rule is slow on large files

**Solutions:**
- Use `matchesPattern()` before expensive operations
- Early return if file type doesn't match
- Avoid calling `split('\n')` multiple times (cache it)
- Use `findLinesMatching()` instead of manual iteration
- Limit regex backtracking with atomic groups

Example:
```javascript
validate: async (context) => {
  // Early exit for irrelevant files
  if (!context.filePath.endsWith('.md')) {
    return;
  }

  // Quick check before expensive operation
  if (!matchesPattern(context.fileContent, /TODO:/)) {
    return;  // No TODOs, skip detailed analysis
  }

  // Only parse frontmatter if needed
  const fm = extractFrontmatter(context.fileContent);
  // ...
},
```

### Debugging Tips

**Problem:** Can't figure out why rule isn't working

**Solutions:**

1. Add console.log statements:
```javascript
validate: async (context) => {
  console.log('Validating:', context.filePath);
  const fm = extractFrontmatter(context.fileContent);
  console.log('Frontmatter:', fm);
  // ...
},
```

2. Test rule in isolation:
```javascript
// test-my-rule.js
const { rule } = require('./.claudelint/rules/my-rule');

const mockContext = {
  filePath: './test.md',
  fileContent: '---\nversion: 1.0.0\n---\n# Test',
  options: {},
  report: (issue) => console.log('Issue:', issue),
};

rule.validate(mockContext);
```

3. Check file is being validated:
```bash
claudelint check-all --verbose
```

4. Verify rule loads successfully:
```javascript
const { CustomRuleLoader } = require('claudelint/utils');
const loader = new CustomRuleLoader();
loader.loadCustomRules('.').then(results => {
  console.log(results);
});
```

## Helper Library

claudelint provides utility functions to simplify common validation tasks. Import them in your custom rules:

```javascript
const {
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
} = require('claudelint/utils');
```

### Heading Functions

#### hasHeading(content, text, level?)

Check if markdown contains a specific heading.

```javascript
// Check for any level heading
if (!hasHeading(context.fileContent, 'Overview')) {
  context.report({ message: 'Missing Overview section' });
}

// Check for specific level (1-6)
if (!hasHeading(context.fileContent, 'Installation', 2)) {
  context.report({ message: 'Missing ## Installation section' });
}
```

#### extractHeadings(content)

Get all headings with their levels and line numbers.

```javascript
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

### Pattern Matching

#### matchesPattern(content, pattern)

Check if content matches a regular expression.

```javascript
// Check for TODO comments
if (matchesPattern(context.fileContent, /TODO:|FIXME:/i)) {
  context.report({ message: 'Found TODO/FIXME comments' });
}

// Check for hardcoded secrets
if (matchesPattern(context.fileContent, /api[_-]?key\s*=\s*['"][^'"]+['"]/i)) {
  context.report({ message: 'Possible hardcoded API key detected' });
}
```

#### countOccurrences(content, search)

Count how many times a string or pattern appears.

```javascript
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

#### findLinesMatching(content, pattern)

Find all lines that match a pattern with line numbers.

```javascript
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

### Frontmatter & Metadata

#### extractFrontmatter(content)

Extract YAML frontmatter from markdown files. Returns an object with:
- `frontmatter` - The parsed frontmatter object (or null if none)
- `content` - The markdown content without frontmatter
- `hasFrontmatter` - Boolean indicating if frontmatter exists

```javascript
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

#### validateSemver(version)

Validate semantic versioning format.

```javascript
const result = extractFrontmatter(context.fileContent);
const fm = result.frontmatter;

if (fm?.version && !validateSemver(fm.version)) {
  context.report({
    message: `Invalid version format: ${fm.version}`,
    fix: 'Use semantic versioning (e.g., 1.0.0, 2.1.3-beta)',
  });
}
```

### File System

#### fileExists(filePath)

Check if a file exists (asynchronous).

```javascript
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

#### readFileContent(filePath)

Read file content asynchronously.

```javascript
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

### Parsing

#### parseJSON(content)

Safely parse JSON content.

```javascript
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

#### parseYAML(content)

Safely parse YAML content.

```javascript
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

### Complete Example Using Helpers

```javascript
// .claudelint/rules/skill-quality.js
const {
  extractFrontmatter,
  validateSemver,
  hasHeading,
  extractHeadings,
  countOccurrences,
  findLinesMatching,
} = require('claudelint/utils');

module.exports.rule = {
  meta: {
    id: 'skill-quality',
    name: 'Skill Quality Checks',
    description: 'Enforce quality standards for skill documentation',
    category: 'Custom',
    severity: 'warning',
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

## Advanced Topics

### File Type Filtering

Only validate specific file types:

```javascript
validate: async (context) => {
  // Only check markdown files
  if (!context.filePath.endsWith('.md')) {
    return;
  }

  // Your validation logic...
}
```

### Multi-line Pattern Matching

```javascript
validate: async (context) => {
  // Find code blocks
  const codeBlockPattern = /```[\s\S]*?```/g;
  const matches = context.fileContent.matchAll(codeBlockPattern);

  for (const match of matches) {
    // Validate code block content...
  }
}
```

### Line Number Calculation

```javascript
validate: async (context) => {
  const lines = context.fileContent.split('\n');

  lines.forEach((line, index) => {
    if (someCondition(line)) {
      context.report({
        message: 'Violation found',
        line: index + 1, // Lines are 1-indexed
      });
    }
  });
}
```

## Further Reading

- [Architecture Documentation](./architecture.md) - How custom rules fit into claudelint
- [Built-in Rules](./rules/) - Examples of rule implementations
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute rules to claudelint

## Support

If you encounter issues with custom rules:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review example rules in `tests/fixtures/custom-rules/`
3. Open an issue on [GitHub](https://github.com/pdugan20/claudelint/issues)
