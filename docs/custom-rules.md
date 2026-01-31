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
