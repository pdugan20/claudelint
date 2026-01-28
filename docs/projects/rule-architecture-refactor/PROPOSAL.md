# Rule Architecture Refactor - Design Proposal

**Date**: 2026-01-28
**Status**: Draft

## Executive Summary

This document compares three architectural approaches for managing 300+ validation rules and recommends the best path forward.

## Current Architecture

### Structure

```typescript
// src/rules/rule-ids.ts (150 lines for 42 rules)
export type ClaudeMdRuleId = 'size-error' | 'size-warning' | ...;
export type SkillsRuleId = 'skill-missing-shebang' | ...;
export type RuleId = ClaudeMdRuleId | SkillsRuleId | ...;

// src/rules/index.ts (300 lines for 42 rules)
RuleRegistry.register({
  id: 'size-error',
  name: 'File Size Error',
  description: '...',
  category: 'CLAUDE.md',
  severity: 'error',
  schema: z.object({ maxSize: z.number() })
});
// ... 41 more manual registrations

// src/validators/claude-md.ts
class ClaudeMdValidator {
  private async checkFileSize(filePath: string) {
    const options = this.getRuleOptions<SizeErrorOptions>('size-error');
    // validation logic here
    this.report('File too large', filePath, undefined, 'size-error');
  }
}
```

### Pros

- Grouped by validator (all CLAUDE.md rules together)
- Can share validator state/helpers
- Fewer total files

### Cons

- **Manual registration** - Every rule needs 3 manual entries
- **Metadata scattered** - Type defs, registry, and docs separate
- **Doesn't scale** - 300 rules = 3000+ lines of boilerplate
- **Hard to test** - Must instantiate full validator
- **Can't disable at load time** - All validators always load
- **Plugin-hostile** - Plugins can't easily add rules

### Estimated Size at 300 Rules

- `rule-ids.ts`: ~1000 lines
- `rules/index.ts`: ~2500 lines
- Completely unmaintainable

## Option 1: ESLint-Style (Separate Files)

### Structure

```typescript
// src/rules/claude-md/size-error.ts
import { Rule, RuleContext } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'size-error',
    name: 'File Size Error',
    description: 'CLAUDE.md exceeds maximum file size',
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

  validate: async (context: RuleContext) => {
    const { filePath, fileContent, options } = context;
    const maxSize = options?.maxSize ?? 40000;

    if (fileContent.length >= maxSize) {
      context.report({
        message: `File exceeds ${maxSize / 1000}KB limit`,
        line: undefined,
        fix: 'Split into smaller files'
      });
    }
  }
};

// Auto-generated at build time
// src/rules/rule-ids.ts
export type RuleId =
  | 'size-error'
  | 'size-warning'
  | ... // generated from filesystem

// Auto-generated at build time
// src/utils/rule-loader.ts
const rules = new Map<RuleId, Rule>();
// Scan src/rules/**/*.ts, import each, register

export function getAllRules(): Map<RuleId, Rule> {
  return rules;
}
```

### Pros

- [DONE] **Single source of truth** - Metadata and logic together
- [DONE] **Auto-discovery** - Scan directory, build registry automatically
- [DONE] **Easy to test** - Import one file, test one rule
- [DONE] **Easy to contribute** - Add one file, done
- [DONE] **Plugin-friendly** - Plugins drop in rule files
- [DONE] **No duplication** - One place defines everything
- [DONE] **Tree-shakeable** - Only load rules you need
- [DONE] **Type-safe** - Generate `RuleId` from discovered files
- [DONE] **Scales perfectly** - 300 rules = 300 files (manageable)

### Cons

- [CON] More files overall (300 files vs 10 validators)
- [CON] Shared logic needs utility functions
- [CON] Can't easily share state between related rules
- [CON] **Big migration effort** - Extract all rule logic from validators

### ESLint Compatibility

This matches ESLint exactly:
- `lib/rules/no-unused-vars.js` exports metadata + `create()` function
- Plugins drop rule files in, auto-discovered
- Each rule is independently loadable

## Option 2: Hybrid (Decorators + Method-Based)

### Structure

```typescript
// src/validators/claude-md.ts
import { rule } from '../decorators/rule';

export class ClaudeMdValidator extends BaseValidator {

  @rule({
    id: 'size-error',
    name: 'File Size Error',
    description: 'CLAUDE.md exceeds maximum file size',
    category: 'CLAUDE.md',
    severity: 'error',
    schema: z.object({ maxSize: z.number().positive().int() }),
    defaultOptions: { maxSize: 40000 }
  })
  private async checkFileSize(context: RuleContext) {
    const options = context.options as SizeErrorOptions;
    const maxSize = options?.maxSize ?? 40000;

    if (context.fileContent.length >= maxSize) {
      context.report({
        message: `File exceeds ${maxSize / 1000}KB limit`,
        fix: 'Split into smaller files'
      });
    }
  }
}

// Build-time reflection extracts metadata
// src/utils/rule-registry.ts
export class RuleRegistry {
  static init() {
    // Scan all validators, extract @rule decorated methods
    // Build registry from decorators
  }
}
```

### Pros

- [DONE] Keep method-based approach (less refactoring)
- [DONE] Metadata co-located with logic (decorators)
- [DONE] Can share validator state
- [DONE] Auto-discovery from decorators
- [DONE] Grouped by validator still

### Cons

- [CON] Decorators add complexity
- [CON] TypeScript decorator metadata can be fragile
- [CON] Harder to test individual rules
- [CON] Still can't load validators selectively
- [CON] Not idiomatic (no other linter does this)
- [CON] Plugin support harder (need to extend validators)

### Decorator Limitations

- Requires `experimentalDecorators` in tsconfig
- Metadata extraction at build time can break
- Not as explicit as separate files
- Harder for contributors to understand

## Option 3: Keep Current + Generate

### Structure

Keep current architecture but auto-generate the boilerplate:

```typescript
// src/rules/claude-md/size-error.meta.ts (metadata only)
export const meta = {
  id: 'size-error',
  name: 'File Size Error',
  description: '...',
  category: 'CLAUDE.md',
  severity: 'error',
  schema: z.object({ maxSize: z.number() })
};

// src/validators/claude-md.ts (logic only)
class ClaudeMdValidator {
  checkFileSize() { /* logic */ }
}

// Build script generates:
// - src/rules/rule-ids.ts (from *.meta.ts files)
// - src/rules/index.ts (RuleRegistry calls)
```

### Pros

- [DONE] Minimal refactoring needed
- [DONE] Keep validator-based grouping
- [DONE] Reduce manual work

### Cons

- [CON] Still scattered (metadata separate from logic)
- [CON] Still can't test rules independently
- [CON] Still loads all validators always
- [CON] Plugin support still difficult
- [CON] Just automates the wrong pattern

## Recommendation: Option 1 (ESLint-Style)

**Rationale:**

1. **Industry standard** - ESLint's approach is proven at scale
2. **Best long-term** - Scales to 1000+ rules without issues
3. **Plugin ecosystem** - Enables community contributions
4. **Testing** - Each rule testable in isolation
5. **Type safety** - Generate types from filesystem
6. **No magic** - Explicit, understandable, no decorators

**Trade-off:**
- Significant migration effort NOW
- But pays off immediately (248 rules to add)
- And forever (maintainability)

## Implementation Strategy

### Phase 1: Foundation (Day 1, 4-5 hours)

Create the infrastructure:

1. **Define Rule interface**
   - `src/types/rule.ts` - Rule, RuleContext, RuleMetadata

2. **Build rule loader**
   - `src/utils/rule-loader.ts` - Scans `src/rules/**/*.ts`
   - Auto-discovers and registers rules

3. **Generate RuleId type**
   - Build script: `scripts/generate-rule-types.ts`
   - Outputs: `src/rules/rule-ids.ts` (auto-generated)

4. **Update BaseValidator**
   - Accept Map<RuleId, Rule> in constructor
   - Execute rules via `rule.validate(context)`

### Phase 2: Migration (Day 2, 6-8 hours)

Migrate existing rules:

1. **Migrate 8 CLAUDE.md rules** (2 hours)
   - Extract from `claude-md.ts` to separate files
   - Test each as you go

2. **Migrate 14 Skills rules** (2 hours)

3. **Migrate remaining 20 rules** (2-4 hours)
   - Settings, Hooks, MCP, Plugin, Commands, Agents

4. **Delete old files**
   - Remove manual `src/rules/index.ts`
   - Remove manual `src/rules/rule-ids.ts`

### Phase 3: Testing & Polish (Day 3, 2-3 hours)

1. Update all tests
2. Update documentation
3. Verify build times
4. Create MIGRATION-GUIDE.md

## Migration Example

### Before (Current)

```typescript
// src/validators/claude-md.ts (100+ lines with many rules)
export class ClaudeMdValidator extends BaseValidator {
  private async checkFileSize(filePath: string): Promise<void> {
    this.setCurrentFile(filePath);
    const options = this.getRuleOptions<SizeErrorOptions>('size-error');
    const maxSize = options?.maxSize ?? 40000;
    const size = await getFileSize(filePath);

    if (size >= maxSize) {
      this.report(
        `File exceeds ${maxSize / 1000}KB limit (${size} bytes)`,
        filePath,
        undefined,
        'size-error',
        { fix: 'Split into smaller files' }
      );
    }
  }
}

// src/rules/index.ts
RuleRegistry.register({
  id: 'size-error',
  name: 'File Size Error',
  description: 'CLAUDE.md exceeds maximum file size',
  category: 'CLAUDE.md',
  severity: 'error',
  schema: z.object({ maxSize: z.number() })
});

// src/rules/rule-ids.ts
export type ClaudeMdRuleId = 'size-error' | ...;
```

### After (ESLint-Style)

```typescript
// src/rules/claude-md/size-error.ts (single file, ~40 lines)
import { Rule } from '../../types/rule';
import { getFileSize } from '../../utils/file-system';
import { z } from 'zod';

export const rule: Rule = {
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

  validate: async (context) => {
    const { filePath, options } = context;
    const maxSize = (options as { maxSize?: number })?.maxSize ?? 40000;
    const size = await getFileSize(filePath);

    if (size >= maxSize) {
      context.report({
        message: `File exceeds ${maxSize / 1000}KB limit (${size} bytes)`,
        line: undefined,
        fix: 'Split into smaller files',
        explanation: 'Claude Code has a context window limit...',
        howToFix: '1. Create separate files in .claude/rules/...'
      });
    }
  }
};

// src/rules/rule-ids.ts (auto-generated at build time)
export type RuleId = 'size-error' | 'size-warning' | ...;

// No manual src/rules/index.ts needed!
```

## Risk Analysis

### High Risk
- **Migration complexity** - Extracting 42 rules from validators
  - Mitigation: Migrate incrementally, test each rule

- **Breaking changes** - Tests may need updates
  - Mitigation: Keep old system working during migration

### Medium Risk
- **Build time** - Scanning filesystem on every build
  - Mitigation: Cache discovery results, only re-scan on changes

- **Type generation** - Auto-generating RuleId type could break
  - Mitigation: Validate generated types, fail build on error

### Low Risk
- **Plugin compatibility** - Old plugins won't work
  - Mitigation: Document migration path, provide examples

## Success Metrics

- [ ] Zero lines in `src/rules/index.ts` (deleted or auto-generated)
- [ ] Zero manual type definitions in `src/rules/rule-ids.ts`
- [ ] All 42 rules migrated to separate files
- [ ] All tests pass
- [ ] Build time < 5 seconds
- [ ] Can add new rule with one file
- [ ] Documentation complete

## Alternatives Considered

1. **Status quo** - Keep manual registration
   - Rejected: Doesn't scale to 300 rules

2. **Decorators** - TypeScript decorators for metadata
   - Rejected: Too magical, not idiomatic

3. **Monorepo** - Separate package per validator
   - Rejected: Overkill for this project

4. **Code generation only** - Generate boilerplate
   - Rejected: Doesn't solve core architecture issues

## Next Steps

1. Review and approve this proposal
2. Create IMPLEMENTATION-PLAN.md with detailed tasks
3. Finish current config integration work
4. Execute refactor (2-3 days)
5. Continue with 177 remaining rule implementations

## Questions for Review

1. Do we agree ESLint-style is the right approach?
2. Is 2-3 days reasonable for this refactor?
3. Should we migrate all 42 rules, or do a subset first?
4. Any concerns about breaking changes?
5. Do we need a feature flag to toggle old/new system?
