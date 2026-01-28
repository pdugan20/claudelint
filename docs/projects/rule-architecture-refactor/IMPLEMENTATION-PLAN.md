# Rule Architecture Refactor - Implementation Plan

**Date**: 2026-01-28
**Status**: Planning
**Duration**: 2-3 days
**Prerequisite**: Complete Config Integration (Phase 2-4)

## Overview

This plan details the step-by-step migration from manual rule registration to ESLint-style auto-discovered rule files.

## Timeline

```
Day 1 (4-5 hours):  Foundation - Build infrastructure
Day 2 (6-8 hours):  Migration - Move 42 rules to new format
Day 3 (2-3 hours):  Testing - Validate everything works
```

## Phase 1: Foundation (Day 1, 4-5 hours)

Build the infrastructure for the new rule system.

### Task 1.1: Define Rule Types (1 hour)

Create core type definitions for the new rule system.

- [ ] Create `src/types/rule.ts`
  - [ ] Define `Rule` interface with `meta` and `validate`
  - [ ] Define `RuleContext` interface for passing data to rules
  - [ ] Define `RuleMetadata` interface for rule metadata
  - [ ] Add JSDoc comments for all types
  - [ ] Add examples in comments

**File to create:**

```typescript
// src/types/rule.ts
import { z } from 'zod';
import { RuleId } from '../rules/rule-ids';

export interface RuleMetadata {
  id: RuleId;
  name: string;
  description: string;
  category: 'CLAUDE.md' | 'Skills' | 'Settings' | 'Hooks' | 'MCP' | 'Plugin' | 'Commands' | 'Agents';
  severity: 'off' | 'warn' | 'error';
  fixable: boolean;
  deprecated: boolean;
  since: string;
  docUrl?: string;
  schema?: z.ZodType<any>;
  defaultOptions?: Record<string, unknown>;
}

export interface RuleContext {
  filePath: string;
  fileContent: string;
  options: Record<string, unknown>;
  report: (issue: {
    message: string;
    line?: number;
    fix?: string;
    explanation?: string;
    howToFix?: string;
  }) => void;
}

export interface Rule {
  meta: RuleMetadata;
  validate: (context: RuleContext) => Promise<void> | void;
}
```

**Validation:**
- [ ] TypeScript compiles with no errors
- [ ] Types are exported correctly

### Task 1.2: Build Rule Loader (2 hours)

Create auto-discovery system for loading rules from filesystem.

- [ ] Create `src/utils/rule-loader.ts`
  - [ ] Implement `scanRuleDirectory()` - Find all rule files
  - [ ] Implement `loadRule()` - Import and validate a rule file
  - [ ] Implement `buildRuleRegistry()` - Create Map of rules
  - [ ] Add caching for performance
  - [ ] Add error handling for malformed rule files
  - [ ] Add validation that rule.meta.id matches filename

**File to create:**

```typescript
// src/utils/rule-loader.ts
import { Rule } from '../types/rule';
import { RuleId } from '../rules/rule-ids';
import { glob } from 'glob';
import { join, basename } from 'path';

export class RuleLoader {
  private rulesCache = new Map<RuleId, Rule>();
  private rulesDir: string;

  constructor(rulesDir: string = join(__dirname, '../rules')) {
    this.rulesDir = rulesDir;
  }

  async loadAllRules(): Promise<Map<RuleId, Rule>> {
    if (this.rulesCache.size > 0) {
      return this.rulesCache;
    }

    const ruleFiles = await glob('**/*.ts', {
      cwd: this.rulesDir,
      ignore: ['**/*.test.ts', '**/index.ts', '**/rule-ids.ts']
    });

    for (const file of ruleFiles) {
      const rule = await this.loadRule(file);
      if (rule) {
        this.rulesCache.set(rule.meta.id, rule);
      }
    }

    return this.rulesCache;
  }

  private async loadRule(file: string): Promise<Rule | null> {
    try {
      const module = await import(join(this.rulesDir, file));
      const rule: Rule = module.rule;

      // Validate rule structure
      if (!rule || !rule.meta || !rule.validate) {
        console.warn(`Invalid rule file: ${file} - missing meta or validate`);
        return null;
      }

      // Validate rule ID matches filename
      const expectedId = basename(file, '.ts');
      if (rule.meta.id !== expectedId) {
        console.warn(
          `Rule ID mismatch: ${file} exports '${rule.meta.id}' but filename is '${expectedId}'`
        );
      }

      return rule;
    } catch (error) {
      console.error(`Failed to load rule ${file}:`, error);
      return null;
    }
  }

  clearCache(): void {
    this.rulesCache.clear();
  }
}

export const ruleLoader = new RuleLoader();
```

**Validation:**
- [ ] Can scan rule directories
- [ ] Can load individual rule files
- [ ] Handles errors gracefully
- [ ] Caching works correctly

### Task 1.3: Generate RuleId Type (1 hour)

Create build script to auto-generate `RuleId` type from filesystem.

- [ ] Create `scripts/generate-rule-types.ts`
  - [ ] Scan `src/rules/**/*.ts` files
  - [ ] Extract rule IDs from filenames
  - [ ] Generate TypeScript union type
  - [ ] Write to `src/rules/rule-ids.ts`
  - [ ] Add generated file disclaimer comment
  - [ ] Add to build process

**Script to create:**

```typescript
// scripts/generate-rule-types.ts
import { glob } from 'glob';
import { writeFile } from 'fs/promises';
import { basename, join } from 'path';

async function generateRuleIds() {
  const rulesDir = join(__dirname, '../src/rules');

  const ruleFiles = await glob('**/*.ts', {
    cwd: rulesDir,
    ignore: ['**/*.test.ts', '**/index.ts', '**/rule-ids.ts']
  });

  const ruleIds = ruleFiles.map(file => basename(file, '.ts')).sort();

  const content = `/**
 * Auto-generated Rule IDs
 * DO NOT EDIT MANUALLY - Generated by scripts/generate-rule-types.ts
 * Run 'npm run generate:types' to regenerate
 */

export type RuleId =
${ruleIds.map(id => `  | '${id}'`).join('\n')};

export const ALL_RULE_IDS: readonly RuleId[] = [
${ruleIds.map(id => `  '${id}',`).join('\n')}
] as const;

export function isRuleId(value: string): value is RuleId {
  return ALL_RULE_IDS.includes(value as RuleId);
}
`;

  const outputPath = join(rulesDir, 'rule-ids.ts');
  await writeFile(outputPath, content);

  console.log(`Generated ${ruleIds.length} rule IDs in ${outputPath}`);
}

generateRuleIds().catch(console.error);
```

- [ ] Add script to `package.json`:
  ```json
  {
    "scripts": {
      "generate:types": "tsx scripts/generate-rule-types.ts",
      "prebuild": "npm run generate:types"
    }
  }
  ```

**Validation:**
- [ ] Script generates valid TypeScript
- [ ] Generated type includes all rule IDs
- [ ] Script runs as part of build

### Task 1.4: Update BaseValidator (30 min)

Integrate new rule system into BaseValidator.

- [ ] Update `src/validators/base.ts`
  - [ ] Add `protected rules: Map<RuleId, Rule>` field
  - [ ] Accept rules map in constructor or load via RuleLoader
  - [ ] Update `report()` method to work with new system
  - [ ] Keep backward compatibility with old system during migration

**Validation:**
- [ ] BaseValidator compiles
- [ ] Old validators still work (backward compat)
- [ ] Can pass rules map to constructor

**Checkpoint: Phase 1 Complete**
- [ ] All new types compile
- [ ] Rule loader works
- [ ] Type generation script runs
- [ ] BaseValidator updated
- [ ] All existing tests still pass

---

## Phase 2: Migration (Day 2, 6-8 hours)

Migrate existing rules from validators to separate files.

### Task 2.1: Setup Rule Directories (15 min)

Create directory structure for rules.

- [ ] Create directories:
  ```bash
  mkdir -p src/rules/claude-md
  mkdir -p src/rules/skills
  mkdir -p src/rules/settings
  mkdir -p src/rules/hooks
  mkdir -p src/rules/mcp
  mkdir -p src/rules/plugin
  mkdir -p src/rules/commands
  mkdir -p src/rules/agents
  ```

### Task 2.2: Migrate CLAUDE.md Rules (2 hours)

Extract 8 rules from `claude-md.ts`.

**Rules to migrate:**
- [ ] `size-error` (30 min)
  - Extract checkFileSize logic
  - Create `src/rules/claude-md/size-error.ts`
  - Test in isolation
  - Update validator to use new rule

- [ ] `size-warning` (15 min)
- [ ] `import-missing` (15 min)
- [ ] `import-circular` (20 min)
- [ ] `import-in-code-block` (15 min)
- [ ] `rules-circular-symlink` (15 min)
- [ ] `filename-case-sensitive` (15 min)
- [ ] `file-not-found` (10 min)

**Migration Process per Rule:**
1. Copy logic from validator method
2. Create new rule file with meta + validate
3. Test rule loads correctly
4. Update validator to use new rule (temporary)
5. Verify existing tests pass

**Validation after each rule:**
- [ ] Rule file exports `rule` object
- [ ] `meta.id` matches filename
- [ ] Rule loads via RuleLoader
- [ ] Tests pass

### Task 2.3: Migrate Skills Rules (2 hours)

Extract 14 rules from `skills.ts`.

**Rules to migrate:**
- [ ] `skill-missing-shebang` (15 min)
- [ ] `skill-missing-comments` (15 min)
- [ ] `skill-dangerous-command` (20 min)
- [ ] `skill-eval-usage` (15 min)
- [ ] `skill-path-traversal` (15 min)
- [ ] `skill-missing-changelog` (15 min)
- [ ] `skill-missing-examples` (15 min)
- [ ] `skill-missing-version` (10 min)
- [ ] `skill-too-many-files` (10 min)
- [ ] `skill-deep-nesting` (10 min)
- [ ] `skill-naming-inconsistent` (10 min)
- [ ] `skill-time-sensitive-content` (10 min)
- [ ] `skill-body-too-long` (10 min)
- [ ] `skill-large-reference-no-toc` (10 min)

### Task 2.4: Migrate Remaining Rules (2-3 hours)

Extract 20 rules from other validators.

**Settings (4 rules):**
- [ ] `settings-invalid-schema` (15 min)
- [ ] `settings-invalid-permission` (20 min)
- [ ] `settings-invalid-env-var` (15 min)
- [ ] `settings-permission-invalid-rule` (15 min)

**Hooks (3 rules):**
- [ ] `hooks-invalid-event` (15 min)
- [ ] `hooks-missing-script` (15 min)
- [ ] `hooks-invalid-config` (15 min)

**MCP (3 rules):**
- [ ] `mcp-invalid-server` (15 min)
- [ ] `mcp-invalid-transport` (15 min)
- [ ] `mcp-invalid-env-var` (15 min)

**Plugin (5 rules):**
- [ ] `plugin-invalid-manifest` (20 min)
- [ ] `plugin-invalid-version` (15 min)
- [ ] `plugin-missing-file` (15 min)
- [ ] `plugin-circular-dependency` (15 min)
- [ ] `plugin-dependency-invalid-version` (15 min)

**Commands (3 rules):**
- [ ] `commands-deprecated-directory` (10 min)
- [ ] `commands-migrate-to-skills` (10 min)
- [ ] `commands-in-plugin-deprecated` (10 min)

**Agents (2 rules):**
- [ ] `agent-hooks-invalid-schema` (15 min)
- [ ] `agent-skills-not-found` (15 min)

### Task 2.5: Update Validators (1 hour)

Update validator classes to use new rule system.

- [ ] Update `ClaudeMdValidator` to load rules
- [ ] Update `SkillsValidator` to load rules
- [ ] Update remaining validators
- [ ] Remove old validation methods (or mark deprecated)

**Validation:**
- [ ] All validators compile
- [ ] All validators load rules correctly
- [ ] Old tests pass with new rule system

### Task 2.6: Cleanup Old System (30 min)

Remove or archive old registration system.

- [ ] Delete manual `src/rules/index.ts` (or move to archive)
- [ ] Delete manual rule type definitions
- [ ] Update imports across codebase
- [ ] Remove unused helper functions

**Checkpoint: Phase 2 Complete**
- [ ] All 42 rules migrated to separate files
- [ ] All rules loadable via RuleLoader
- [ ] Validators use new rule system
- [ ] Old registration system removed
- [ ] All tests pass

---

## Phase 3: Testing & Polish (Day 3, 2-3 hours)

Validate everything works and document the new system.

### Task 3.1: Update Tests (1 hour)

Adapt test suite to new architecture.

- [ ] Update unit tests for individual rules
  - [ ] Test rules can load in isolation
  - [ ] Test rule metadata is correct
  - [ ] Test rule validation logic

- [ ] Update validator tests
  - [ ] Test validators load rules correctly
  - [ ] Test rules execute via validators
  - [ ] Test config integration still works

- [ ] Update integration tests
  - [ ] Test end-to-end validation
  - [ ] Test CLI commands
  - [ ] Test file-specific overrides

**Validation:**
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Test coverage maintained (90%+)

### Task 3.2: Performance Testing (30 min)

Ensure rule loading doesn't impact build times.

- [ ] Benchmark rule loading time
  - [ ] Should be < 100ms for 42 rules
  - [ ] Should be < 500ms for 300 rules (projected)

- [ ] Benchmark full validation run
  - [ ] Compare before/after refactor
  - [ ] Should be within 10% of old system

- [ ] Test caching works
  - [ ] Second load should be instant
  - [ ] Cache invalidation works correctly

**Acceptance Criteria:**
- [ ] Build time < 5 seconds total
- [ ] Rule loading < 100ms
- [ ] Validation speed within 10% of before

### Task 3.3: Documentation (1 hour)

Update documentation for new architecture.

- [ ] Update `docs/architecture.md`
  - [ ] Remove old "Rule Registry" section
  - [ ] Add "Rule System" section explaining new approach
  - [ ] Update diagrams

- [ ] Update `docs/rule-development-enforcement.md`
  - [ ] Update "Rule Registration" section
  - [ ] Remove manual registration steps
  - [ ] Add auto-discovery explanation

- [ ] Create `MIGRATION-GUIDE.md` (see separate file)
  - [ ] How to migrate existing rules
  - [ ] How to add new rules
  - [ ] Examples and templates

- [ ] Update `README.md`
  - [ ] Update rule count (if visible)
  - [ ] Update contribution guide

**Validation:**
- [ ] All docs accurate
- [ ] No broken links
- [ ] Examples work as documented

### Task 3.4: Create Migration Examples (30 min)

Provide examples for contributors.

- [ ] Create example rule file with extensive comments
- [ ] Create example rule test file
- [ ] Add to `examples/` directory
- [ ] Update CONTRIBUTING.md with rule creation steps

**Validation:**
- [ ] Examples work
- [ ] Examples are clear and well-documented
- [ ] New contributors can follow examples

**Checkpoint: Phase 3 Complete**
- [ ] All tests pass
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Examples created
- [ ] Migration guide complete

---

## Final Validation

Before marking project complete, verify:

- [ ] **Functionality**: All 42 rules work identically to before
- [ ] **Tests**: 100% of tests pass (690/690)
- [ ] **Performance**: Build time < 5s, validation within 10% of before
- [ ] **Documentation**: All docs updated and accurate
- [ ] **Type Safety**: TypeScript compiles with zero errors
- [ ] **Rule Addition**: Can add new rule with single file
- [ ] **Auto-Generation**: `npm run generate:types` works correctly

## Success Metrics

- [ ] Zero manual registration required
- [ ] 42 rules in separate files
- [ ] `rule-ids.ts` auto-generated
- [ ] No `src/rules/index.ts` (deleted)
- [ ] All tests pass
- [ ] Build time < 5s
- [ ] Documentation complete

## Rollback Plan

If refactor fails or takes too long:

1. **Checkpoint commits** - Commit after each phase
2. **Feature flag** - Keep old system working during migration
3. **Revert option** - Can revert to last working commit
4. **Incremental** - Can stop mid-migration, finish later

## Post-Refactor Work

After this refactor completes:

1. [DONE] Continue with config integration (finish Phase 3-4)
2. [DONE] Implement 177 remaining rules (using new architecture)
3. [DONE] Enable plugin contributions
4. [DONE] Document plugin API

## Notes

- Commit frequently (after each major task)
- Test after each rule migration
- Keep validator compatibility during migration
- Don't optimize prematurely - get it working first
- Document as you go
