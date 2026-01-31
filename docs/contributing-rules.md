# Contributing Rules to ClaudeLint

> **Note:** This guide has been consolidated into the [Rule Development Guide](./rule-development.md). Please refer to **Part 3: Contributing Built-in Rules** in that document for the most up-to-date information on contributing rules to claudelint.
>
> This file is kept for backward compatibility with existing links.

---

This guide explains how to write and contribute validation rules to ClaudeLint.

## Overview

ClaudeLint validates Claude Code configuration files (CLAUDE.md, settings.json, hooks, skills, etc.) using a rule-based architecture. Each rule validates one specific aspect of a configuration file.

## Rule Structure

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

## Rule Metadata

### Required Fields

- **id**: Kebab-case identifier matching the filename (e.g., `skill-missing-version`)
- **name**: Human-readable title (e.g., `Skill Missing Version`)
- **description**: One-line description of what the rule validates
- **category**: One of: `ClaudeMd`, `Skills`, `Hooks`, `MCP`, `Plugin`, `Settings`, `Commands`, `Agents`, `LSP`, `OutputStyles`
- **severity**: `error` (must fix) or `warn` (should fix)
- **fixable**: `true` if the rule can suggest an automatic fix
- **deprecated**: `false` for new rules
- **since**: Version when the rule was introduced (use `1.0.0` for new rules)

### Optional Fields

- **docUrl**: Link to the rule's documentation
- **replacedBy**: Array of rule IDs that replace this deprecated rule

## Writing Validation Logic

### File Type Filtering

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

### Parsing Files

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
import { extractFrontmatter } from '../../utils/markdown';

const { frontmatter, body } = extractFrontmatter<SkillFrontmatter>(fileContent);
```

### Using Schemas

Use schema-derived types instead of creating duplicate interfaces:

```typescript
import { PluginManifestSchema } from '../../validators/schemas';
import { z } from 'zod';

type PluginManifest = z.infer<typeof PluginManifestSchema>;
```

## Reporting Issues

The `context.report()` method accepts three fields:

### message (required)

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
message: 'The file that you have created appears to be exceeding the maximum allowable size limit that has been configured for this particular validation rule.'  // Too verbose
```

### line (optional)

The line number where the issue occurs.

**When to use:**

- YES: **Line-specific issues**: Import on wrong line, time-sensitive content on line 42
- NO: **File-level issues**: File too large, missing required file, invalid JSON structure

**Examples:**

```typescript
// YES: Good - pointing to specific problematic line
context.report({
  message: 'Import statement in code block will not be processed.',
  line: importInfo.line,
});

// NO: Bad - file-level issue doesn't need line number
context.report({
  message: 'File exceeds size limit.',
  line: 1,  // Don't do this
});
```

**Default behavior:** If omitted, the issue applies to the entire file.

### fix (optional)

An actionable suggestion for fixing the issue.

**When to use:**

- The fix is straightforward and clear
- You can provide concrete steps or examples
- The user needs guidance on how to resolve the issue

**When to omit:**

- The message already makes the fix obvious
- The fix is complex and better documented in the rule docs
- Multiple valid approaches exist

**Good examples:**

```typescript
fix: 'Add "version: 1.0.0" to the SKILL.md frontmatter'
fix: 'Split content into smaller files in .claude/rules/ and use @imports'
fix: 'Change the transport type to one of: stdio, sse, http, websocket'
```

**Bad examples:**

```typescript
fix: 'Fix it'  // Not actionable
fix: 'This needs to be corrected by...'  // Too verbose, use imperative mood
fix: 'You should probably consider...'  // Wishy-washy, be direct
```

## Rule Categories

### Schema-Based Rules

For simple validation of JSON/YAML structure, create a Zod schema in `src/schemas/`:

```typescript
// src/schemas/my-config.schema.ts
import { z } from 'zod';

export const MyConfigSchema = z.object({
  version: z.string(),
  enabled: z.boolean(),
});
```

Then use it in your validator (not in individual rules).

### Custom Logic Rules

For complex validation beyond schema checks:

```typescript
// src/rules/skills/skill-dangerous-command.ts
export const rule: Rule = {
  meta: { /* ... */ },
  validate: async (context) => {
    const { fileContent } = context;

    const dangerousPatterns = [
      /rm\s+-rf\s+\//,
      /:\(\)\{\s*:\|\:&\s*\};:/,  // Fork bomb
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(fileContent)) {
        context.report({
          message: 'Dangerous command detected in skill script.',
          fix: 'Review and remove potentially destructive commands.',
        });
      }
    }
  },
};
```

## Testing Rules

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

## File Organization

```
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
│   ├── {rule-id}.md           # Rule documentation (auto-generated)
│   └── ...
```

## Auto-Registration

Rules are automatically discovered and registered:

1. Place your rule in `src/rules/{category}/{rule-id}.ts`
2. Export a `rule` constant with the `Rule` interface
3. Run `npm run build` - the build script auto-generates:
   - `src/rules/rule-ids.ts` (TypeScript types)
   - `src/rules/index.ts` (runtime registration)

No manual registration needed!

## Message Writing Guidelines

### Use Specific Language

NO: Bad: "Invalid value"
YES: Good: "Invalid semantic version: 1.0. Must follow semver format (e.g., 1.0.0)."

### Include Context

NO: Bad: "File not found"
YES: Good: "Referenced skill not found: authentication (expected at .claude/skills/authentication/SKILL.md)."

### Be Actionable

NO: Bad: "This is wrong"
YES: Good: "Environment variable name should be uppercase with underscores: apiKey."

### Use Imperative Mood for Fixes

NO: Bad: "You should add a version field"
YES: Good: "Add version: 1.0.0 to the frontmatter"

### Avoid Jargon

NO: Bad: "AST node is malformed"
YES: Good: "Invalid JSON syntax: Unexpected token }"

## Common Patterns

### Cross-File Validation

```typescript
import { fileExists } from '../../utils/file-system';
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

### Pattern Matching

```typescript
const SEMVER_PATTERN = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;

if (!SEMVER_PATTERN.test(version)) {
  context.report({
    message: `Invalid semantic version: ${version}. Must follow semver format (e.g., 1.0.0, 2.1.3-beta).`,
  });
}
```

### Line-by-Line Analysis

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

## Integrating Rules into Validators

While rules are automatically registered, validators orchestrate rule execution for specific file types. Understanding this integration helps when adding rules to new categories.

### RuleRegistry.getRulesByCategory()

Use this to get all rules for a category:

```typescript
import { RuleRegistry } from '../core/rule-registry';

// In your validator's validate() method
const rules = RuleRegistry.getRulesByCategory('Skills');

// Returns all rules with meta.category === 'Skills'
// Each rule has: id, name, description, severity, validate(), etc.
```

### executeRulesForCategory()

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

**What it does:**

1. Gets all rules for the category via `RuleRegistry.getRulesByCategory()`
2. Checks config to see if each rule is enabled
3. Applies rule options from config
4. Executes each enabled rule's `validate()` function
5. Aggregates results into a `ValidationResult`

### Validator Implementation Pattern

```typescript
// src/validators/my-validator.ts
import { BaseValidator } from './base-validator';
import { executeRulesForCategory } from '../utils/execute-rules';

export class MyValidator extends BaseValidator {
  constructor() {
    super({
      id: 'my-validator',
      name: 'My Validator',
      filePatterns: ['**/*.myfile'],
    });
  }

  async validate(context: ValidationContext): Promise<ValidationResult> {
    const { filePath, fileContent } = context;

    // Load config
    const config = await this.loadConfig();

    // Execute all rules for this category
    const result = await executeRulesForCategory({
      category: 'MyCategory',
      filePath,
      fileContent,
      config,
      context: this.createRuleContext(filePath, fileContent),
    });

    return result;
  }
}
```

## Two-Level Testing Strategy

ClaudeLint uses a two-level testing approach:

### Level 1: Rule Unit Tests (Required)

Every rule must have focused unit tests:

```typescript
// tests/rules/{category}/{rule-id}.test.ts
import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-missing-version';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-missing-version', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-missing-version', rule, {
      valid: [
        {
          content: '---\nname: test\nversion: 1.0.0\n---\nBody',
          filePath: '/test/SKILL.md',
        },
      ],
      invalid: [
        {
          content: '---\nname: test\n---\nBody',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'version',
            },
          ],
        },
      ],
    });
  });
});
```

**Purpose:**

- Test the rule's validation logic in isolation
- Fast execution (no filesystem, no validators)
- Easy to debug
- Comprehensive coverage of edge cases

### Level 2: Validator Integration Tests (Recommended)

Test that validators properly orchestrate rules:

```typescript
// tests/validators/my-validator.test.ts
import { MyValidator } from '../../src/validators/my-validator';

describe('MyValidator', () => {
  it('should aggregate results from multiple rules', async () => {
    const validator = new MyValidator();

    const result = await validator.validate({
      filePath: '/test/config.json',
      fileContent: invalidContent,
    });

    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].ruleId).toBe('my-rule-one');
    expect(result.errors[1].ruleId).toBe('my-rule-two');
  });

  it('should respect config disable', async () => {
    const validator = new MyValidator();
    validator.setConfig({
      rules: {
        'my-rule-one': 'off',
      },
    });

    const result = await validator.validate({
      filePath: '/test/config.json',
      fileContent: invalidContent,
    });

    // my-rule-one should be skipped
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].ruleId).toBe('my-rule-two');
  });
});
```

**Purpose:**

- Test that rules are discovered and executed
- Test config integration (enable/disable, severity, options)
- Test rule aggregation and result formatting
- Test validator-specific logic (file discovery, caching)

### When to Use Each Level

**Rule Tests (Always):**

- Testing rule validation logic
- Testing error messages
- Testing edge cases and boundary conditions
- Testing rule options

**Validator Tests (When needed):**

- Testing multiple rules work together
- Testing config affects rule execution
- Testing file discovery patterns
- Testing validator-specific features

## Rule Options and Configuration

For rules that support configuration options:

### 1. Define Schema and Defaults

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

### 2. Document Options

In `docs/rules/{category}/{rule-id}.md`, add an Options section:

```markdown
## Options

### `maxThreshold`

Maximum threshold before reporting an error.

Type: `number`
Default: `100`

Example configuration:

\`\`\`json
{
  "rules": {
    "my-rule": ["error", { "maxThreshold": 200 }]
  }
}
\`\`\`
```

### 3. Test with Options

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

## Best Practices

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

## Questions?

Check existing rules in `src/rules/` for examples, or open an issue for guidance.
