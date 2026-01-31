# Rule Development Guide

This comprehensive guide explains how to write validation rules for claudelint, whether you're creating custom rules for your team or contributing built-in rules to the project.

## Quick Navigation

**For External Developers:**

- [Part 1: Understanding Rules](#part-1-understanding-rules) - How rules work
- [Part 2: Writing Custom Rules](#part-2-writing-custom-rules) - Create team-specific rules

**For Contributors:**

- [Part 1: Understanding Rules](#part-1-understanding-rules) - Architecture overview
- [Part 3: Contributing Built-in Rules](#part-3-contributing-built-in-rules) - Add rules to claudelint

---

## Part 1: Understanding Rules

### Overview

claudelint validates Claude Code configuration files (CLAUDE.md, settings.json, hooks, skills, etc.) using a rule-based architecture. Each rule validates one specific aspect of a configuration file.

### Rule Structure

All rules follow this structure:

```typescript
// src/rules/{category}/{rule-id}.ts
import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'rule-id',
    name: 'Human Readable Name',
    description: 'Brief description of what this rule validates',
    category: 'Category',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/{category}/{rule-id}.md',
  },

  validate: async (context) => {
    const { filePath, fileContent } = context;

    // Validation logic
    if (someCondition) {
      context.report({
        message: 'Clear description of the issue',
        line: 42,  // Optional: only for line-specific issues
        fix: 'Actionable suggestion to fix the issue',  // Optional
      });
    }
  },
};
```

### Rule Metadata

#### Required Fields

- **id**: Kebab-case identifier matching the filename (e.g., `skill-missing-version`)
- **name**: Human-readable title (e.g., `Skill Missing Version`)
- **description**: One-line description of what the rule validates
- **category**: One of: `ClaudeMd`, `Skills`, `Hooks`, `MCP`, `Plugin`, `Settings`, `Commands`, `Agents`, `LSP`, `OutputStyles`
- **severity**: `error` (must fix) or `warn` (should fix)
- **fixable**: `true` if the rule can suggest an automatic fix
- **deprecated**: `false` for new rules
- **since**: Version when the rule was introduced

#### Optional Fields

- **docUrl**: Link to the rule's documentation
- **replacedBy**: Array of rule IDs that replace this deprecated rule
- **schema**: Zod schema for rule options
- **defaultOptions**: Default values for configurable options

### Validation Context

The `validate` function receives a context object with:

```typescript
interface ValidationContext {
  filePath: string;        // Path to file being validated
  fileContent: string;     // Full content of the file
  options: unknown;        // Rule options from config
  report: (violation: Violation) => void;  // Report a violation
}
```

### Reporting Violations

The `context.report()` method accepts three fields:

#### message (required)

The error message shown to the user.

**Guidelines:**

- Start with a capital letter
- End with a period
- Be clear and specific
- Include relevant values/context
- Keep it concise (1-2 sentences)

**Good examples:**

```typescript
message: 'File exceeds 100KB limit (152340 bytes).'
message: 'Referenced skill not found: authentication (expected at .claude/skills/authentication/SKILL.md).'
message: 'Invalid semantic version: 1.0. Must follow semver format (e.g., 1.0.0, 2.1.3-beta).'
```

**Bad examples:**

```typescript
message: 'error'  // Too vague
message: 'file is too big'  // Not capitalized, no period, no details
message: 'The file that you have created appears to be exceeding...'  // Too verbose
```

#### line (optional)

The line number where the issue occurs.

**When to use:**

- YES: Line-specific issues (import on wrong line, problematic content on specific line)
- NO: File-level issues (file too large, missing required file, invalid JSON structure)

**Default behavior:** If omitted, the issue applies to the entire file.

#### fix (optional)

An actionable suggestion for fixing the issue.

**When to use:**

- The fix is straightforward and clear
- You can provide concrete steps or examples
- The user needs guidance on how to resolve the issue

**Good examples:**

```typescript
fix: 'Add "version: 1.0.0" to the SKILL.md frontmatter'
fix: 'Split content into smaller files in .claude/rules/ and use @imports'
fix: 'Change the transport type to one of: stdio, sse, http, websocket'
```

---

## Part 2: Writing Custom Rules

Custom rules allow you to extend claudelint with team-specific or project-specific validation requirements.

### Quick Start

1. Create a `.claudelint/rules/` directory in your project root
2. Add a custom rule file (`.js` or `.ts`)
3. Export a `rule` object that implements the Rule interface
4. Run `claudelint check-all` to load and execute your custom rules

### Directory Structure

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

### Example: Basic Custom Rule

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

### Example: File Size Limit

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

### Example: Required Heading

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

### Auto-Fix Support

Custom rules can provide automatic fixes that users can apply with the `--fix` flag.

#### AutoFix Interface

```typescript
interface AutoFix {
  ruleId: string;              // Must match your rule's meta.id
  description: string;         // Human-readable description of the fix
  filePath: string;            // Path to file being fixed (use context.filePath)
  apply: (currentContent: string) => string;  // Function that returns fixed content
}
```

#### Example: Auto-Fix Trailing Whitespace

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

### Configuration

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

### Helper Library

claudelint provides utility functions to simplify common validation tasks:

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

See [Part 2 Helper Functions](#helper-functions) below for complete documentation.

### Troubleshooting Custom Rules

#### Rule Not Loading

**Problem:** Custom rule doesn't appear in output

**Solutions:**

- Verify file is in `.claudelint/rules/` directory
- Check file extension is `.js` or `.ts` (not `.d.ts`, `.test.ts`, etc.)
- Ensure `module.exports.rule` is used (not ES6 `export`)
- Check for syntax errors in the rule file

#### Rule Not Executing

**Problem:** Rule loads but doesn't report violations

**Solutions:**

- Check rule is enabled in `.claudelintrc.json`
- Verify `context.report()` is being called
- Add debug logging to validate function
- Ensure file being checked matches your rule's logic

For more troubleshooting tips, see the [Troubleshooting](#troubleshooting) section below.

---

## Part 3: Contributing Built-in Rules

This section is for contributors who want to add rules to the claudelint codebase.

### File Organization

```text
src/rules/
├── {category}/
│   ├── {rule-id}.ts           # Rule implementation
│   └── ...
tests/rules/
├── {category}/
│   ├── {rule-id}.test.ts      # Rule tests
│   └── ...
docs/rules/
├── {category}/
│   ├── {rule-id}.md           # Rule documentation
│   └── ...
```

### Auto-Registration

Rules are automatically discovered and registered:

1. Place your rule in `src/rules/{category}/{rule-id}.ts`
2. Export a `rule` constant with the `Rule` interface
3. Run `npm run build` - the build script auto-generates:
   - `src/rules/rule-ids.ts` (TypeScript types)
   - `src/rules/index.ts` (runtime registration)

No manual registration needed!

### Writing Validation Logic

#### File Type Filtering

Most rules should only run on specific file types:

```typescript
validate: async (context) => {
  const { filePath, fileContent } = context;

  // Only validate SKILL.md files
  if (!filePath.endsWith('SKILL.md')) {
    return;
  }

  // Your validation logic here
}
```

#### Parsing Files

For JSON files, handle parse errors gracefully (schema validation handles these):

```typescript
let config: SettingsConfig;
try {
  config = JSON.parse(fileContent);
} catch {
  return; // JSON parse errors handled by schema validation
}
```

For markdown files, use utility functions:

```typescript
import { extractFrontmatter } from '../../utils/formats/markdown';

const { frontmatter, body } = extractFrontmatter<SkillFrontmatter>(fileContent);
```

#### Using Schemas

Use schema-derived types instead of creating duplicate interfaces:

```typescript
import { PluginManifestSchema } from '../../validators/schemas';
import { z } from 'zod';

type PluginManifest = z.infer<typeof PluginManifestSchema>;
```

### Common Patterns

#### Cross-File Validation

```typescript
import { fileExists } from '../../utils/filesystem/files';
import { dirname, join } from 'path';

validate: async (context) => {
  const { filePath, fileContent } = context;
  const config = JSON.parse(fileContent);

  for (const skillName of config.skills) {
    const skillPath = join(dirname(filePath), '.claude', 'skills', skillName, 'SKILL.md');

    if (!(await fileExists(skillPath))) {
      context.report({
        message: `Referenced skill not found: ${skillName} (expected at ${skillPath}).`,
      });
    }
  }
}
```

#### Pattern Matching

```typescript
const SEMVER_PATTERN = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;

if (!SEMVER_PATTERN.test(version)) {
  context.report({
    message: `Invalid semantic version: ${version}. Must follow semver format (e.g., 1.0.0, 2.1.3-beta).`,
  });
}
```

#### Line-by-Line Analysis

```typescript
const lines = fileContent.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (DATE_PATTERN.test(line)) {
    context.report({
      message: `Time-sensitive content detected: "${line.trim()}".`,
      line: i + 1,  // Line numbers are 1-based
      fix: 'Use relative terms like "recent versions" or update regularly.',
    });
  }
}
```

### Testing Rules

Every rule must have comprehensive tests in `tests/rules/{category}/{rule-id}.test.ts`:

```typescript
import { rule } from '../../../src/rules/skills/skill-missing-version';
import { createTestContext } from '../../helpers/context';

describe('skill-missing-version', () => {
  it('should report when version is missing', async () => {
    const context = createTestContext({
      filePath: '/project/skill/SKILL.md',
      fileContent: '---\nname: test\n---\nContent',
    });

    await rule.validate(context);

    expect(context.report).toHaveBeenCalledWith({
      message: 'Skill frontmatter lacks "version" field',
      fix: 'Add "version: 1.0.0" to the SKILL.md frontmatter',
    });
  });

  it('should not report when version exists', async () => {
    const context = createTestContext({
      filePath: '/project/skill/SKILL.md',
      fileContent: '---\nname: test\nversion: 1.0.0\n---\nContent',
    });

    await rule.validate(context);

    expect(context.report).not.toHaveBeenCalled();
  });
});
```

### Two-Level Testing Strategy

#### Level 1: Rule Unit Tests (Required)

Every rule must have focused unit tests:

**Purpose:**

- Test the rule's validation logic in isolation
- Fast execution (no filesystem, no validators)
- Easy to debug
- Comprehensive coverage of edge cases

#### Level 2: Validator Integration Tests (Recommended)

Test that validators properly orchestrate rules:

**Purpose:**

- Test that rules are discovered and executed
- Test config integration (enable/disable, severity, options)
- Test rule aggregation and result formatting
- Test validator-specific logic (file discovery, caching)

### Rule Options and Configuration

For rules that support configuration options:

#### 1. Define Schema and Defaults

```typescript
import { z } from 'zod';

/**
 * Options for my-rule rule
 */
export interface MyRuleOptions {
  /** Maximum threshold (default: 100) */
  maxThreshold?: number;
}

export const rule: Rule = {
  meta: {
    id: 'my-rule',
    schema: z.object({
      maxThreshold: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxThreshold: 100,
    },
    // ... other meta
  },

  validate: async (context) => {
    const threshold = (context.options as MyRuleOptions).maxThreshold ?? 100;

    if (someValue > threshold) {
      context.report({
        message: `Value exceeds threshold of ${threshold}.`,
      });
    }
  },
};
```

#### 2. Document Options

In `docs/rules/{category}/{rule-id}.md`, add an Options section with configuration examples.

#### 3. Test with Options

```typescript
await ruleTester.run('my-rule', rule, {
  valid: [
    {
      content: '99',
      filePath: '/test.txt',
      options: { maxThreshold: 100 },
    },
  ],
  invalid: [
    {
      content: '150',
      filePath: '/test.txt',
      options: { maxThreshold: 100 },
      errors: [{ message: 'threshold' }],
    },
  ],
});
```

### Integrating Rules into Validators

While rules are automatically registered, validators orchestrate rule execution for specific file types.

#### RuleRegistry.getRulesByCategory()

```typescript
import { RuleRegistry } from '../core/rule-registry';

// In your validator's validate() method
const rules = RuleRegistry.getRulesByCategory('Skills');

// Returns all rules with meta.category === 'Skills'
```

#### executeRulesForCategory()

Helper function that runs all rules for a category:

```typescript
import { executeRulesForCategory } from '../utils/execute-rules';

async validate(context: ValidationContext): Promise<ValidationResult> {
  const config = await this.loadConfig();

  // Automatically executes all rules for this category
  const result = await executeRulesForCategory({
    category: 'Skills',
    filePath: '/path/to/SKILL.md',
    fileContent: content,
    config,
    context: this.createRuleContext(),
  });

  return result;
}
```

### Best Practices

1. **Single Responsibility**: Each rule validates one thing
2. **Performance**: Return early when the file type doesn't match
3. **Error Handling**: Let schema validation handle parse errors
4. **Type Safety**: Use schema-derived types, not duplicate interfaces
5. **Clear Messages**: Users should understand the issue and how to fix it
6. **Test Coverage**: Test both violation and non-violation cases
7. **Export Interfaces**: Export option interfaces for TypeScript users
8. **Standard Naming**: Use `{RuleIdInPascalCase}Options` for option interfaces
9. **Document Options**: Include Options section in docs for configurable rules
10. **1:1:1 Mapping**: Every rule must have implementation, test, and documentation

---

## Helper Functions

claudelint provides utility functions to simplify common validation tasks.

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

// Check first heading is H1
if (headings[0]?.level !== 1) {
  context.report({
    message: 'First heading must be level 1',
    line: headings[0]?.line,
  });
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
```

#### countOccurrences(content, search)

Count how many times a string or pattern appears.

```javascript
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
  });
});
```

### Frontmatter & Metadata

#### extractFrontmatter(content)

Extract YAML frontmatter from markdown files.

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
```

#### validateSemver(version)

Validate semantic versioning format.

```javascript
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
if (!(await fileExists('./README.md'))) {
  context.report({ message: 'README.md not found' });
}
```

#### readFileContent(filePath)

Read file content asynchronously.

```javascript
const configContent = await readFileContent('./config.json');

if (configContent === null) {
  context.report({ message: 'Failed to read config.json' });
  return;
}
```

### Parsing

#### parseJSON(content)

Safely parse JSON content.

```javascript
const data = parseJSON(context.fileContent);

if (!data) {
  context.report({ message: 'Invalid JSON' });
  return;
}
```

#### parseYAML(content)

Safely parse YAML content.

```javascript
const data = parseYAML(context.fileContent);

if (!data) {
  context.report({ message: 'Invalid YAML' });
  return;
}
```

---

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

### Auto-Fix Not Working

**Problem:** Auto-fix doesn't apply when using `--fix` flag

**Solutions:**

- Verify `meta.fixable: true` in rule metadata
- Ensure `autoFix` object is passed to `context.report()`
- Check that `apply()` function returns modified content
- Make sure `apply()` is pure (doesn't mutate input)

### Performance Issues

**Problem:** Rule is slow on large files

**Solutions:**

- Use `matchesPattern()` before expensive operations
- Early return if file type doesn't match
- Avoid calling `split('\n')` multiple times (cache it)
- Use `findLinesMatching()` instead of manual iteration

---

## Further Reading

- [Architecture Documentation](./architecture.md) - System design and components
- [Built-in Rules](./rules/) - Examples of rule implementations
- [API Documentation](./api/README.md) - Programmatic usage
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute to claudelint

---

## Support

If you encounter issues with rules:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review example rules in `docs/examples/custom-rules/`
3. Check existing built-in rules in `src/rules/`
4. Open an issue on [GitHub](https://github.com/pdugan20/claudelint/issues)
