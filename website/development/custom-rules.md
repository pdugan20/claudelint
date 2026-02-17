# Custom Rules Guide

> **Note:** For contributing built-in rules, see the [Contributing Guide](/development/contributing#adding-validation-rules).

claudelint allows you to define custom validation rules to extend the built-in rule set with your own team-specific or project-specific requirements.

## Quick Start

1. Create a `.claudelint/rules/` directory in your project root
2. Add a custom rule file (`.ts` or `.js`)
3. Export a `rule` object that implements the Rule interface
4. Run `claudelint check-all` to load and execute your custom rules

Example custom rule that validates SKILL.md files have cross-references:

```typescript
// .claudelint/rules/require-skill-see-also.ts
import type { Rule } from 'claude-code-lint';
import { hasHeading } from 'claudelint/utils';

export const rule: Rule = {
  meta: {
    id: 'require-skill-see-also',
    name: 'Require Skill See Also',
    description: 'SKILL.md must have a ## See Also section for cross-referencing related skills',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    since: '1.0.0',
  },

  validate: async (context) => {
    if (!context.filePath.endsWith('SKILL.md')) {
      return;
    }

    if (!hasHeading(context.fileContent, 'See Also', 2)) {
      context.report({
        message: 'Missing ## See Also section',
        line: 1,
        fix: 'Add a ## See Also section linking to related skills',
      });
    }
  },
};
```

> This is a real rule from claudelint's own [`.claudelint/rules/`](https://github.com/pdugan20/claudelint/tree/main/.claudelint/rules) directory. All examples in this guide come from working, tested rules that run in CI.

## Directory Structure

Custom rules are automatically discovered in the `.claudelint/rules/` directory:

```text
your-project/
├── .claudelint/
│   └── rules/
│       ├── team-rule.ts
│       ├── project-rule.ts
│       └── conventions/
│           └── naming-rule.ts
├── CLAUDE.md
└── .claudelintrc.json
```

Key features:

- Rules can be organized in subdirectories
- Both `.ts` and `.js` files are supported
- `.d.ts`, `.test.ts`, and `.spec.ts` files are automatically excluded
- Rules are loaded recursively from all subdirectories

## Rule Interface

Every custom rule must implement the `Rule` interface:

```typescript
interface Rule {
  meta: RuleMetadata;
  validate: (context: RuleContext) => Promise<void> | void;
}
```

### Rule Metadata

The `meta` object describes your rule:

```typescript
interface RuleMetadata {
  id: string;              // Unique identifier (e.g., 'no-profanity')
  name: string;            // Human-readable name
  description: string;     // What the rule checks
  category: RuleCategory;  // Must be a valid category (see Valid Categories below)
  severity: 'off' | 'warn' | 'error';  // Default severity level
  fixable: boolean;        // Whether rule can auto-fix violations
  deprecated?: boolean;    // Mark rule as deprecated
  since: string;           // Version when rule was introduced
}
```

**Important:** Rule IDs must be unique across all custom rules and built-in rules. If a custom rule ID conflicts with an existing rule, the loader will reject it.

### Valid Categories

Custom rules must use one of the built-in categories. The category determines which validator executes your rule. The loader rejects rules with invalid categories and lists the valid options in the error message.

| Category | Description |
|----------|-------------|
| `CLAUDE.md` | Rules targeting CLAUDE.md configuration files |
| `Skills` | Rules for skill definitions (SKILL.md) |
| `Settings` | Rules for settings files |
| `Hooks` | Rules for hook configurations |
| `MCP` | Rules for MCP server configurations |
| `Plugin` | Rules for plugin manifests |
| `Commands` | Rules for command definitions |
| `Agents` | Rules for agent definitions |
| `OutputStyles` | Rules for output style configurations |
| `LSP` | Rules for LSP server configurations |

### Validation Function

The `validate` function receives a `RuleContext` and reports issues:

```typescript
interface RuleContext {
  filePath: string;        // Absolute path to file being validated
  fileContent: string;     // Full content of the file
  options: Record<string, unknown>;  // Rule-specific options from config
  report: (issue: RuleIssue) => void;  // Report a validation issue
}

interface RuleIssue {
  message: string;         // Description of the issue
  line?: number;           // Line number (optional)
  fix?: string;            // Quick fix suggestion (optional)
  autoFix?: AutoFix;       // Automatic fix (optional)
}
```

## Examples

Each example below is a working rule from claudelint's [`.claudelint/rules/`](https://github.com/pdugan20/claudelint/tree/main/.claudelint/rules) directory. These rules validate the project's own files and run on every CI build.

### Pattern matching with line reporting

**Source:** [`.claudelint/rules/no-user-paths.ts`](https://github.com/pdugan20/claudelint/blob/main/.claudelint/rules/no-user-paths.ts)

Detects hardcoded user-specific paths (`/Users/name/`, `/home/name/`, `C:\Users\`) with precise line numbers:

```typescript
import type { Rule } from 'claude-code-lint';
import { findLinesMatching } from 'claudelint/utils';

const USER_PATH_PATTERN = /(?:\/Users\/|\/home\/|C:\\Users\\)[^\s/\\]+/;

export const rule: Rule = {
  meta: {
    id: 'no-user-paths',
    name: 'No User Paths',
    description: 'CLAUDE.md must not contain hardcoded user-specific paths',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    since: '1.0.0',
  },

  validate: async (context) => {
    if (!context.filePath.endsWith('CLAUDE.md')) {
      return;
    }

    // Use contentWithoutCode to avoid false positives in code examples
    const content = context.contentWithoutCode ?? context.fileContent;

    const matches = findLinesMatching(content, USER_PATH_PATTERN);
    for (const match of matches) {
      context.report({
        message: `Hardcoded user path: ${match.match}`,
        line: match.line,
        fix: 'Use a relative path or environment variable instead',
      });
    }
  },
};
```

Key techniques:

- `contentWithoutCode` strips fenced code blocks to avoid false positives
- `findLinesMatching()` returns `{ line, match }` pairs for precise line reporting
- Early return on wrong file type

### Auto-fix

Custom rules can provide automatic fixes that users apply with the `--fix` flag. Include an `autoFix` object in your `context.report()` call:

```typescript
interface AutoFix {
  ruleId: string;              // Must match your rule's meta.id
  description: string;         // Human-readable description of the fix
  filePath: string;            // Path to file being fixed (use context.filePath)
  apply: (currentContent: string) => string;  // Function that returns fixed content
}
```

**Source:** [`.claudelint/rules/normalize-code-fences.ts`](https://github.com/pdugan20/claudelint/blob/main/.claudelint/rules/normalize-code-fences.ts)

This rule detects bare code fences (` ``` ` without a language) and auto-fixes them by adding `text`:

```typescript
import type { Rule } from 'claude-code-lint';

/** Add language to bare opening fences, leaving closing fences unchanged */
function addLanguageToBareFences(content: string): string {
  const lines = content.split('\n');
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    if (inCodeBlock) {
      if (/^```\s*$/.test(lines[i])) {
        inCodeBlock = false;
      }
      continue;
    }

    if (/^```\s*$/.test(lines[i])) {
      lines[i] = '```text';
      inCodeBlock = true;
    } else if (/^```\w/.test(lines[i])) {
      inCodeBlock = true;
    }
  }

  return lines.join('\n');
}

export const rule: Rule = {
  meta: {
    id: 'normalize-code-fences',
    // ...
    fixable: true,  // Required for auto-fix
    since: '1.0.0',
  },

  validate: async (context) => {
    // ... detection logic ...

    context.report({
      message: 'Code fence missing language identifier',
      line: i + 1,
      fix: 'Add a language (e.g. ```bash, ```typescript, ```text)',
      autoFix: {
        ruleId: 'normalize-code-fences',
        description: 'Add "text" language to bare code fences',
        filePath: context.filePath,
        apply: addLanguageToBareFences,
      },
    });
  },
};
```

Key techniques:

- Set `fixable: true` in meta when providing `autoFix`
- `apply()` receives current file content, returns fixed content
- Track state (open/close fences) to avoid modifying closing fences
- One `autoFix` can fix all occurrences in a single pass

#### Using auto-fix

Run claudelint with the `--fix` flag to apply automatic fixes:

```bash
# Preview fixes (dry-run)
claudelint check-all --fix --dry-run

# Apply fixes
claudelint check-all --fix
```

#### Auto-fix best practices

1. **Always mark fixable rules**: Set `fixable: true` in meta when providing autoFix
2. **Make fixes idempotent**: Running the fix multiple times should produce the same result
3. **Validate fix results**: Ensure your apply() function returns valid content
4. **One fix per violation**: Don't try to fix multiple unrelated issues in one autoFix
5. **Use simple transformations**: Complex fixes are better done manually

### Configurable options with Zod

Rules can accept user-configurable options via `meta.schema` (a Zod schema) and `meta.defaultOptions`.

**Source:** [`.claudelint/rules/max-section-depth.ts`](https://github.com/pdugan20/claudelint/blob/main/.claudelint/rules/max-section-depth.ts)

This rule limits heading depth to keep documents flat and scannable:

```typescript
import { z } from 'zod';
import type { Rule } from 'claude-code-lint';
import { extractHeadings } from 'claudelint/utils';

const optionsSchema = z.object({
  maxDepth: z.number().int().min(1).max(6).optional(),
});

export const rule: Rule = {
  meta: {
    id: 'max-section-depth',
    name: 'Max Section Depth',
    description: 'CLAUDE.md headings must not exceed a configurable depth',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    since: '1.0.0',
    schema: optionsSchema,
    defaultOptions: {
      maxDepth: 4,
    },
  },

  validate: async (context) => {
    if (!context.filePath.endsWith('CLAUDE.md')) {
      return;
    }

    const maxDepth = (context.options.maxDepth as number) ?? 4;
    const headings = extractHeadings(context.fileContent);

    for (const heading of headings) {
      if (heading.level > maxDepth) {
        context.report({
          message: `Heading "${'#'.repeat(heading.level)} ${heading.text}" exceeds max depth ${maxDepth}`,
          line: heading.line,
          fix: `Restructure to use heading level ${maxDepth} or shallower`,
        });
      }
    }
  },
};
```

Users configure options in `.claudelintrc.json` using the array syntax:

```json
{
  "rules": {
    "max-section-depth": ["warn", { "maxDepth": 3 }]
  }
}
```

Key techniques:

- Define `schema` with Zod for type-safe validation of user options
- `defaultOptions` provides fallbacks when user doesn't configure
- Access options via `context.options` in the validate function

## Configuration

Custom rules can be configured in `.claudelintrc.json`:

```json
{
  "rules": {
    "require-skill-see-also": "warn",
    "no-user-paths": "error",
    "normalize-code-fences": "off"
  }
}
```

Severity levels:

- `"error"` - Treat violations as errors (exit code 2)
- `"warn"` - Treat violations as warnings
- `"off"` - Disable the rule

## Loading Behavior

Custom rules are loaded automatically when you run `claudelint check-all`:

1. claudelint searches for `.claudelint/rules/` in the project root
2. All `.ts` and `.js` files are discovered recursively
3. Each file is loaded and validated
4. Rules are registered with the rule registry
5. Configured rules are executed during validation

### Load Results

If a custom rule fails to load, you'll see an error message:

```text
Failed to load custom rule: .claudelint/rules/broken-rule.ts
Error: Rule does not implement Rule interface (must have meta and validate)
```

Common load failures:

- Missing `rule` export
- Invalid rule interface (missing `meta` or `validate`)
- Rule ID conflicts with existing rule
- Syntax errors in rule file

## Best Practices

### Descriptive IDs and names

```typescript
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

### Helpful error messages

```typescript
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

### Focused rules

Each rule should check one thing. Don't combine multiple validations into a single rule.

### Handle edge cases

```typescript
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

### Appropriate severity

- `error` - For violations that must be fixed (security, breaking conventions)
- `warn` - For suggestions or style preferences

### Test your rules

Create test cases for your custom rules. See the [dogfood rule tests](https://github.com/pdugan20/claudelint/blob/main/tests/integration/dogfood-rules.test.ts) for a tested pattern using a `collectIssues` helper:

```typescript
import { rule } from './.claudelint/rules/my-rule';

async function collectIssues(rule, filePath, fileContent) {
  const issues = [];
  await rule.validate({
    filePath,
    fileContent,
    options: {},
    report: (issue) => issues.push(issue),
  });
  return issues;
}

// Test violation detection
const issues = await collectIssues(rule, '/test/SKILL.md', 'content missing required section');
expect(issues).toHaveLength(1);

// Test clean input passes
const clean = await collectIssues(rule, '/test/SKILL.md', 'content with required section');
expect(clean).toHaveLength(0);

// Test file type filtering
const skipped = await collectIssues(rule, '/test/README.md', 'wrong file type');
expect(skipped).toHaveLength(0);
```

## Helper Library

claudelint provides utility functions for common validation tasks like heading detection, pattern matching, frontmatter parsing, and file system operations.

See the [Helper Library Reference](/development/helper-library) for the complete API with examples.

## Advanced Topics

### File Type Filtering

Only validate specific file types:

```typescript
validate: async (context) => {
  // Only check markdown files
  if (!context.filePath.endsWith('.md')) {
    return;
  }

  // Your validation logic...
}
```

### Multi-line matching

```typescript
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

```typescript
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

- [Helper Library Reference](./helper-library.md) - Utility functions for custom rules
- [Architecture Documentation](./architecture.md) - How custom rules fit into claudelint
- [Built-in Rules](/rules/overview) - Examples of rule implementations
- [Contributing Guide](./contributing.md) - How to contribute rules to claudelint

## Support

If you encounter issues with custom rules:

1. Check the [Troubleshooting](/development/custom-rules-troubleshooting) guide
2. Review example rules in [`.claudelint/rules/`](https://github.com/pdugan20/claudelint/tree/main/.claudelint/rules)
3. Open an issue on [GitHub](https://github.com/pdugan20/claudelint/issues)
