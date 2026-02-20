---
description: Build custom claudelint validation rules for your team or project. Learn the Rule interface, validation patterns, auto-fix, configurable options, and testing strategies.
---

# Custom Rules Guide

claudelint allows you to define custom validation rules to extend the built-in rule set with your own team-specific or project-specific requirements. For contributing built-in rules, see the [Contributing Guide](/development/contributing#adding-validation-rules).

## Quick Start

1. Create a `.claudelint/rules/` directory in your project root
2. Add a custom rule file (`.ts` or `.js`)
3. Export a `rule` object that implements the [Rule interface](/development/rule-system#rule-interface)
4. Run `claudelint check-all` to load and execute your custom rules

Example custom rule that validates SKILL.md files have cross-references:

```typescript
import type { Rule } from 'claude-code-lint';
import { hasHeading } from 'claude-code-lint/utils';

export const rule: Rule = {
  meta: {
    id: 'require-skill-see-also',
    name: 'Require Skill See Also',
    description: 'SKILL.md must have a ## See Also section for cross-referencing related skills',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
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

## Directory Structure

Custom rules are automatically discovered in `.claudelint/rules/`:

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

- Rules can be organized in subdirectories
- Both `.ts` and `.js` files are supported
- `.d.ts`, `.test.ts`, and `.spec.ts` files are automatically excluded

## Valid Categories

Custom rules must use one of the built-in categories. The category determines which validator executes your rule.

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

## Examples

See the [Custom Rule Examples](/development/custom-rules-examples) page for three worked examples covering pattern matching, auto-fix, and configurable options. All examples are real rules from claudelint's own [`.claudelint/rules/`](https://github.com/pdugan20/claudelint/tree/main/.claudelint/rules) directory.

## Configuration

Custom rules can be configured in `.claudelintrc.json` just like built-in rules:

```json
{
  "rules": {
    "require-skill-see-also": "warn",
    "no-user-paths": "error",
    "normalize-code-fences": "off"
  }
}
```

## Best Practices

| Practice | Do | Don't |
|----------|-----|-------|
| Rule IDs | `no-todo-comments` | `rule1` |
| Messages | `Found TODO comment on line 42. Create a GitHub issue instead.` | `Invalid` |
| Scope | One check per rule | Multiple unrelated checks in one rule |
| Severity | `error` for security/breaking, `warn` for style | Everything as `error` |
| Auto-fix | Idempotent, precise ranges, simple transforms | Complex multi-step rewrites |

## Testing

Create test cases using a `collectIssues` helper. See the [dogfood rule tests](https://github.com/pdugan20/claudelint/blob/main/tests/integration/dogfood-rules.test.ts) for a working example:

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

const issues = await collectIssues(rule, '/test/SKILL.md', 'content missing required section');
expect(issues).toHaveLength(1);
```

## Helper Library

claudelint provides utility functions for common validation tasks like heading detection, pattern matching, frontmatter parsing, and file system operations. See the [Helper Library Reference](/development/helper-library) for the complete API.

## See Also

- [Rule System](/development/rule-system) - Rule interface, registry, and validation patterns
- [Helper Library Reference](/development/helper-library) - Utility functions for custom rules
- [Built-in Rules](/rules/overview) - Examples of rule implementations
- [Contributing Guide](/development/contributing) - How to contribute rules to claudelint
- [Example rules on GitHub](https://github.com/pdugan20/claudelint/tree/main/.claudelint/rules) - Working custom rules
