# Migration Guide - Rule Architecture Refactor

**Audience**: Contributors, Plugin Developers
**Date**: 2026-01-28

## Overview

This guide explains how to work with the new ESLint-style rule architecture, both for migrating existing rules and creating new ones.

## Quick Start

### Adding a New Rule (After Refactor)

1. **Create rule file**: `src/rules/{category}/{rule-id}.ts`
2. **Export rule object** with `meta` and `validate`
3. **Run `npm run generate:types`** to update `RuleId` type
4. **Write tests** in `tests/rules/{category}/{rule-id}.test.ts`
5. **Document** in `docs/rules/{category}/{rule-id}.md`

That's it! No manual registration needed.

## Rule File Structure

Every rule is a single file exporting a `Rule` object:

```typescript
// src/rules/claude-md/size-error.ts
import { Rule } from '../../types/rule';
import { z } from 'zod';

export const rule: Rule = {
  // Metadata (replaces RuleRegistry.register)
  meta: {
    id: 'size-error',                    // Must match filename
    name: 'File Size Error',             // Human-readable name
    description: 'CLAUDE.md exceeds maximum file size limit',
    category: 'CLAUDE.md',              // Group for docs
    severity: 'error',                   // Default severity
    fixable: false,                      // Can auto-fix?
    deprecated: false,                   // Deprecated rule?
    since: '1.0.0',                     // Version added
    docUrl: 'https://...',              // Optional doc URL

    // Zod schema for options (optional)
    schema: z.object({
      maxSize: z.number().positive().int().optional()
    }),

    // Default option values (optional)
    defaultOptions: {
      maxSize: 40000
    }
  },

  // Validation logic (replaces validator method)
  validate: async (context) => {
    const { filePath, fileContent, options } = context;

    // Access typed options
    const maxSize = (options as { maxSize?: number })?.maxSize ?? 40000;

    // Validation logic
    if (fileContent.length >= maxSize) {
      // Report issues via context
      context.report({
        message: `File exceeds ${maxSize / 1000}KB limit`,
        line: undefined,                    // Optional line number
        fix: 'Split into smaller files',    // Quick fix text
        explanation: 'Why this matters...',  // Detailed explanation
        howToFix: '1. Do this\n2. Do that'  // Step-by-step fix
      });
    }
  }
};
```

## Migrating Existing Rules

### Step 1: Identify Rule Logic

Find the validation logic in the old validator:

```typescript
// OLD: src/validators/claude-md.ts
export class ClaudeMdValidator extends BaseValidator {
  private async checkFileSize(filePath: string): Promise<void> {
    this.setCurrentFile(filePath);
    const options = this.getRuleOptions<SizeErrorOptions>('size-error');
    const maxSize = options?.maxSize ?? 40000;
    const size = await getFileSize(filePath);

    if (size >= maxSize) {
      this.report(
        `File exceeds ${maxSize / 1000}KB limit`,
        filePath,
        undefined,
        'size-error',
        { fix: 'Split into smaller files' }
      );
    }
  }
}
```

### Step 2: Extract Metadata

Find the rule registration:

```typescript
// OLD: src/rules/index.ts
RuleRegistry.register({
  id: 'size-error',
  name: 'File Size Error',
  description: 'CLAUDE.md exceeds maximum file size',
  category: 'CLAUDE.md',
  severity: 'error',
  schema: z.object({ maxSize: z.number() }),
  defaultOptions: { maxSize: 40000 }
});
```

### Step 3: Create New Rule File

Combine metadata and logic into one file:

```typescript
// NEW: src/rules/claude-md/size-error.ts
import { Rule } from '../../types/rule';
import { getFileSize } from '../../utils/file-system';
import { z } from 'zod';

export const rule: Rule = {
  // Copy metadata from RuleRegistry.register
  meta: {
    id: 'size-error',
    name: 'File Size Error',
    description: 'CLAUDE.md exceeds maximum file size limit',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    schema: z.object({
      maxSize: z.number().positive().int().optional()
    }),
    defaultOptions: {
      maxSize: 40000
    }
  },

  // Copy validation logic from validator method
  validate: async (context) => {
    const { filePath, fileContent, options } = context;
    const maxSize = (options as { maxSize?: number })?.maxSize ?? 40000;

    // Can still use helper functions
    const size = await getFileSize(filePath);

    if (size >= maxSize) {
      context.report({
        message: `File exceeds ${maxSize / 1000}KB limit`,
        fix: 'Split into smaller files'
      });
    }
  }
};
```

### Step 4: Update Tests

Update tests to import and test the rule directly:

```typescript
// NEW: tests/rules/claude-md/size-error.test.ts
import { rule } from '../../../src/rules/claude-md/size-error';

describe('size-error rule', () => {
  it('should report error for large files', async () => {
    const issues: any[] = [];
    const context = {
      filePath: 'test.md',
      fileContent: 'x'.repeat(50000),
      options: {},
      report: (issue: any) => issues.push(issue)
    };

    await rule.validate(context);

    expect(issues.length).toBe(1);
    expect(issues[0].message).toContain('exceeds');
  });
});
```

### Step 5: Remove Old Code

After migration is complete:

1. Delete validator method (`checkFileSize`)
2. Delete rule registration from `src/rules/index.ts`
3. Delete type definition from `src/rules/rule-ids.ts`

## Common Patterns

### Accessing Options

```typescript
validate: async (context) => {
  // Define interface for type safety
  interface SizeErrorOptions {
    maxSize?: number;
  }

  // Cast and access with fallback
  const opts = context.options as SizeErrorOptions;
  const maxSize = opts?.maxSize ?? 40000;
}
```

### Using Helper Functions

```typescript
// Helper functions still work
import { getFileSize, readFileContent } from '../../utils/file-system';

validate: async (context) => {
  const size = await getFileSize(context.filePath);
  const content = await readFileContent(context.filePath);
  // ... validation logic
}
```

### Reporting Multiple Issues

```typescript
validate: async (context) => {
  // Report multiple issues in one rule
  if (issue1) {
    context.report({ message: 'Issue 1', line: 10 });
  }

  if (issue2) {
    context.report({ message: 'Issue 2', line: 20 });
  }
}
```

### Conditional Validation

```typescript
validate: async (context) => {
  const { filePath, fileContent } = context;

  // Skip certain files
  if (!filePath.endsWith('.md')) {
    return;
  }

  // Conditional logic
  if (someCondition) {
    context.report({ message: 'Problem found' });
  }
}
```

## Testing Rules

### Unit Test Template

```typescript
import { rule } from '../../../src/rules/{category}/{rule-id}';

describe('{rule-id} rule', () => {
  function createContext(overrides = {}) {
    const issues: any[] = [];

    return {
      filePath: 'test.md',
      fileContent: 'test content',
      options: {},
      report: (issue: any) => issues.push(issue),
      issues, // For assertions
      ...overrides
    };
  }

  it('should pass for valid content', async () => {
    const context = createContext({
      fileContent: 'valid content'
    });

    await rule.validate(context);

    expect(context.issues.length).toBe(0);
  });

  it('should report error for invalid content', async () => {
    const context = createContext({
      fileContent: 'invalid content'
    });

    await rule.validate(context);

    expect(context.issues.length).toBe(1);
    expect(context.issues[0].message).toContain('expected text');
  });

  it('should respect options', async () => {
    const context = createContext({
      options: { maxSize: 100 }
    });

    await rule.validate(context);

    // Assert option was used
  });
});
```

## Directory Structure

```
src/
  rules/
    claude-md/
      size-error.ts
      size-warning.ts
      import-circular.ts
      ...
    skills/
      missing-shebang.ts
      dangerous-command.ts
      ...
    settings/
      invalid-schema.ts
      ...
    hooks/
    mcp/
    plugin/
    commands/
    agents/
    rule-ids.ts        # Auto-generated
  types/
    rule.ts            # Rule interfaces
  utils/
    rule-loader.ts     # Auto-discovery

tests/
  rules/
    claude-md/
      size-error.test.ts
      ...
    skills/
      ...
```

## Auto-Discovery Details

Rules are auto-discovered at build time:

1. **Build script scans** `src/rules/**/*.ts` (except tests, index, rule-ids)
2. **Generates `rule-ids.ts`** with union type of all rule IDs
3. **RuleLoader imports all rules** and builds registry
4. **Validators load rules** via RuleLoader
5. **No manual registration** needed

## Generating Types

After adding a new rule file:

```bash
npm run generate:types
```

This regenerates `src/rules/rule-ids.ts` with updated `RuleId` type.

## Plugin Development

Plugins can now contribute rules easily:

```typescript
// my-plugin/rules/custom-rule.ts
export const rule: Rule = {
  meta: {
    id: 'my-plugin:custom-rule',  // Namespaced
    name: 'Custom Rule',
    // ... metadata
  },
  validate: async (context) => {
    // Custom validation logic
  }
};
```

Plugin rules are loaded the same way as core rules.

## Backward Compatibility

During migration, both systems work:

- **Old validators** still work with manual registration
- **New rules** work via auto-discovery
- **Tests** pass for both systems
- **Gradual migration** possible

After migration completes, old system is removed.

## FAQs

### Q: Do I need to update all tests?

A: Tests need minor updates to import rules directly instead of through validators. The test logic stays mostly the same.

### Q: Can rules share code?

A: Yes! Create helper functions in `src/utils/` and import them in your rules.

### Q: What about schema validation?

A: Zod schemas work the same way - include them in `rule.meta.schema`.

### Q: How do options work?

A: Options are passed via `context.options` - cast to your interface and use.

### Q: Can rules access filesystem?

A: Yes - import helpers like `readFileContent`, `getFileSize` from utils.

### Q: Do rules need documentation?

A: Yes - create `docs/rules/{category}/{rule-id}.md` using the template.

### Q: What if my rule needs validator state?

A: Pass necessary data through `RuleContext`. If complex state is needed, consider refactoring.

## Migration Checklist

For each rule you migrate:

- [ ] Create rule file in `src/rules/{category}/{rule-id}.ts`
- [ ] Export `rule` object with `meta` and `validate`
- [ ] Ensure `meta.id` matches filename
- [ ] Copy metadata from old `RuleRegistry.register` call
- [ ] Copy validation logic from old validator method
- [ ] Run `npm run generate:types`
- [ ] Update tests to import rule directly
- [ ] Verify tests pass
- [ ] Remove old validator method
- [ ] Remove old RuleRegistry call
- [ ] Update documentation if needed

## Getting Help

- See `PROPOSAL.md` for architectural details
- See `IMPLEMENTATION-PLAN.md` for migration timeline
- See example rules in `src/rules/claude-md/` for reference
- Ask in GitHub Discussions for questions

## Examples

Full working examples:

- `src/rules/claude-md/size-error.ts` - Simple rule with options
- `src/rules/claude-md/import-circular.ts` - Complex rule with multiple checks
- `src/rules/skills/dangerous-command.ts` - Pattern matching rule
