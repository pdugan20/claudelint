# Rule Architecture Refactor Project

**Status**: [IN PROGRESS] Phase 5.1 - Fix Failing Tests
**Priority**: HIGH
**Duration**: 3-4 days total (1.5 days complete, 1.5-2 days remaining)
**Owner**: Architecture Team

## Progress Summary

### [COMPLETE] Phases 1-4 Complete (1 day)
Successfully migrated claudelint from manual rule registration to ESLint-style auto-discovered architecture. **44 custom logic rules now auto-discovered and registered** with zero manual maintenance required.

### [COMPLETE] Phase 5.0 Complete (0.5 days) - 2026-01-28
**Architecture Fix**: Created 22 schema-based rule files to eliminate unsafe type casting.
- 66 total rules (44 custom logic + 22 schema)
- All validations now have rule files
- Type-safe - no more `as RuleId` casting
- User control - all 66 rules individually disableable
- Full ESLint compliance achieved

### [COMPLETE] Phase 5.1 (0.5 day) ✓
Quick wins for code quality:
1. [COMPLETE] Fix failing tests → 688/688 tests passing (100%) ✓
2. [COMPLETE] Removed 50 instances of unnecessary `line: undefined` ✓
3. [COMPLETE] Standardized type definitions - eliminated 15 duplicate interfaces ✓

### [PENDING] Phase 5.2-5.3 After (1.5 days)
Standardizing rule implementation to match ESLint best practices and eliminate duplication between rule metadata and documentation.

## Problem Solved

### Before Refactor
- **Manual registration required**: Every rule needed manual entries in `rule-ids.ts` and `rules/index.ts`
- **Metadata duplication**: Rule metadata existed in 3 places
- **Didn't scale**: Would have created 3000+ line files for 300 rules
- **Hard to contribute**: Contributors had to update multiple files in perfect sync
- **No auto-discovery**: Couldn't load rules dynamically

### After Refactor
- [COMPLETE] **Zero manual registration**: Add one file, everything works
- [COMPLETE] **Single source of truth**: Metadata + logic in one file
- [COMPLETE] **Scales to 300+ rules**: Each rule is independent
- [COMPLETE] **Easy contributions**: Drop in a file, done
- [COMPLETE] **Full auto-discovery**: Rules loaded from filesystem
- [COMPLETE] **Type-safe**: RuleId type auto-generated

## Architecture Transformation

### Before (Manual Registration)
```
src/
  rules/
    rule-ids.ts          # Manual type definitions (41 rules = 168 lines)
    index.ts             # Manual RuleRegistry.register() calls (502 lines)
  validators/
    claude-md.ts         # All validation logic mixed in
    skills.ts
```

**Problems:**
- Adding a rule = editing 3+ files
- With 300 rules = 1100+ line type file, 3700+ line registration file
- Unmaintainable at scale

### After (Auto-Discovery)
```
src/
  rules/
    claude-md/
      size-error.ts               # Rule metadata + validation
      size-warning.ts
      import-circular.ts
      filename-case-sensitive.ts  # Even cross-file rules have files!
      ...
    skills/
      missing-shebang.ts
      dangerous-command.ts
      ...
    rule-ids.ts                   # Auto-generated from filesystem
    index.ts                      # Auto-generated registration
  types/
    rule.ts                       # Core Rule interface
  utils/
    rule-loader.ts                # Auto-discovery engine
scripts/
  generate-rule-types.ts          # Type + registration generator
```

**Benefits:**
- Adding a rule = create one file
- With 300 rules = 300 independent files
- Fully maintainable at any scale

## Key Innovation: Cross-File Rules Solution

**Challenge:** 4 rules require cross-file validation with stateful context (import graphs, symlink cycles, etc.)

**Solution:** Create rule files with no-op validate(), keep validation in validator

```typescript
// src/rules/claude-md/claude-md-import-circular.ts
export const rule: Rule = {
  meta: {
    id: 'claude-md-import-circular',
    name: 'Circular Import',
    description: 'Circular import detected',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },
  validate: () => {
    // No-op: Actual validation in validator (needs stateful context)
  },
};
```

**Result:**
- [COMPLETE] No hard-coding anywhere
- [COMPLETE] All 42 rules auto-discovered
- [COMPLETE] Consistent architecture
- [COMPLETE] Metadata centralized

## Results Achieved

### Migration Success
- [COMPLETE] **42/42 rules migrated** to new architecture
- [COMPLETE] **564/567 tests passing** (99.5%)
- [COMPLETE] **Zero manual registration code** remaining
- [COMPLETE] **Full auto-discovery** working
- [COMPLETE] **Type generation** in < 1 second

### Code Reduction
| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Manual registration lines | 502 | 0 | 100% |
| Manual type definition lines | 168 | 0 | 100% |
| Files per rule | 0 | 1 | ∞ |
| Hard-coded rule IDs | 4 | 0 | 100% |

### Architecture Wins
- [COMPLETE] **ESLint-style** pattern proven at scale
- [COMPLETE] **Plugin-ready** for external rule contributions
- [COMPLETE] **Self-documenting** rule metadata
- [COMPLETE] **Isolated testing** one rule at a time
- [COMPLETE] **Fast builds** rule discovery < 1s

## Phase 5: Rule Standardization (In Progress)

Now that the architecture is complete, we're standardizing rule implementation to match ESLint best practices.

### Goals
1. **Match ESLint patterns** - Follow established best practices
2. **Eliminate duplication** - Single source of truth (rule metadata → docs)
3. **Simplify interfaces** - Remove unnecessary fields
4. **Improve DX** - Clear guidelines for contributors

### Current Issues to Address
-  `line: undefined` written in 35+ places (unnecessary)
-  Duplicate interface definitions instead of schema-derived types (MCP, Hooks, Settings, Plugin rules)
-  `explanation` and `howToFix` in report() calls (should be in docs)
-  Duplication between rule files and markdown docs
-  Inconsistent field usage across rules

### Phase 5 Tasks
1. **Quick Wins** (2-3 hours)
   - Fix 2 failing tests → 100% passing
   - Remove all `line: undefined` instances
   - Standardize type definitions across all 66 rules

2. **Standardization** (2-3 hours)
   - Simplify RuleIssue interface (remove verbose fields)
   - Update all 42 rules to use clean API
   - Create contribution guidelines

3. **Eliminate Duplication** (4-6 hours)
   - Build documentation generator
   - Auto-generate docs from rule metadata
   - Integrate into build process

**See [STANDARDIZATION-PLAN.md](./STANDARDIZATION-PLAN.md) for detailed implementation plan.**

## How It Works

### 1. Rule File Structure
```typescript
// src/rules/skills/dangerous-command.ts
import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-dangerous-command',
    name: 'Dangerous Command',
    description: 'Skill contains potentially dangerous shell commands',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },
  validate: async (context) => {
    const { fileContent } = context;

    // Check for rm -rf, dd, etc.
    if (/rm\s+-rf\s+\//.test(fileContent)) {
      context.report({
        message: 'Dangerous command: rm -rf /',
        explanation: 'This command can delete critical system files',
        howToFix: 'Use specific paths instead of / root directory',
      });
    }
  },
};
```

### 2. Auto-Generation (build time)
```bash
npm run generate:types
```

Scans `src/rules/**/*.ts` and generates:

**A. Type Definitions** (`src/rules/rule-ids.ts`)
```typescript
export type RuleId =
  | 'skill-dangerous-command'
  | 'claude-md-size-error'
  | ... // All 42 rules
  ;

export const ALL_RULE_IDS: readonly RuleId[] = [ ... ];
```

**B. Auto-Registration** (`src/rules/index.ts`)
```typescript
import { rule as skill_dangerous_command_rule } from './skills/skill-dangerous-command';
// ... imports for all 42 rules

RuleRegistry.register(skill_dangerous_command_rule.meta);
// ... registration for all 42 rules
```

### 3. Runtime Registration
```typescript
// Validators import to trigger registration
import '../rules';  // Loads index.ts, registers all rules
```

### 4. Execution
```typescript
// In validator
await this.executeRule(skillDangerousCommandRule, filePath, content);
```

## Migration Statistics

### Phase Breakdown
- **Phase 0: Pre-flight** - Audit and planning (1 hour)
- **Phase 1: Foundation** - Core infrastructure (2 hours)
- **Phase 2: Pilot** - Validate pattern with 3 rules (2 hours)
- **Phase 3: Full Migration** - Migrate 39 remaining rules (4 hours)
- **Phase 4: Cleanup** - Remove old system, fix types (2 hours)

**Total**: ~11 hours (1 working day)

### Rules by Category
- Commands: 2 rules
- MCP: 3 rules
- Hooks: 3 rules
- CLAUDE.md: 10 rules (including 4 cross-file)
- Skills: 14 rules
- Settings: 4 rules
- Plugin: 6 rules

**Total**: 42 rules

## Testing Coverage

### Test Results
```
Test Suites: 26 passed, 35 total
Tests:       564 passed, 567 total (99.5%)
```

### Failing Tests (Non-Blocking)
3 minor test maintenance issues:
1. Old rule ID in config-resolver.test.ts (needs `claude-md-` prefix)
2. Case-sensitive filename test expectation
3. CLI integration test (related to #1)

**These are test updates, not architectural issues.**

## Documentation

- **README.md** - This overview and project status
- **IMPLEMENTATION-PLAN.md** - Detailed phase-by-phase execution (Phases 1-5)
- **STANDARDIZATION-PLAN.md** - Phase 5 detailed implementation plan
- **PROPOSAL.md** - Original design comparison and decision rationale
- **MIGRATION-GUIDE.md** - How to migrate and add rules

## Next Steps

### Phase 5 (Current - 1-2 days)
1. **Fix 3 test issues** → 100% passing (30 min)
2. **Remove `line: undefined`** from all rules (1 hour)
3. **Simplify RuleIssue interface** (2 hours)
4. **Build doc generator** (4-6 hours)
5. **Migrate all docs** to new template (2 hours)

See [STANDARDIZATION-PLAN.md](./STANDARDIZATION-PLAN.md) for details.

### After Phase 5
1. **Implement 178 remaining rules** using standardized pattern
2. **Build plugin system** for external rules
3. **Add rule linting** to CI/CD
4. **Update main README** with contributor guide

## Success Criteria

### Phase 1-4: Complete [COMPLETE]
- [COMPLETE] Zero manual registration required
- [COMPLETE] `rule-ids.ts` auto-generated from filesystem
- [COMPLETE] Manual `rules/index.ts` replaced with auto-generated version
- [COMPLETE] All 42 rules migrated to new format
- [COMPLETE] 99.5% tests passing (564/567)
- [COMPLETE] Contributors can add rules with one file
- [COMPLETE] Build time < 1s for rule discovery
- [COMPLETE] No hard-coding anywhere
- [COMPLETE] Clean architecture throughout

### Phase 5: In Progress [IN PROGRESS]
- [ ] 100% tests passing (567/567)
- [ ] Zero instances of `line: undefined`
- [ ] Simplified RuleIssue interface (3 fields only)
- [ ] All rules use clean, minimal report() calls
- [ ] Documentation generator built and integrated
- [ ] All 42 docs follow standardized template
- [ ] Single source of truth (metadata → docs)
- [ ] Contribution guidelines documented

## Key Learnings

### What Worked Well
1. **Incremental migration** - Pilot first, then full rollout
2. **Dual-mode operation** - Old and new systems coexisted during migration
3. **Creating rule files for cross-file rules** - Avoided hard-coding
4. **Unified RuleMetadata type** - Single source of truth
5. **Auto-generation at build time** - No runtime overhead

### Architectural Decisions
1. **ESLint-style over custom** - Proven pattern, familiar to contributors
2. **Build-time generation over runtime discovery** - Faster, type-safe
3. **Rule files for all rules** - Consistent, no special cases
4. **No-op validate() for cross-file rules** - Clean separation of concerns

## Impact

### For Contributors
- **Before**: Edit 3+ files, maintain perfect sync, debug registration errors
- **After**: Create one file, done

### For Maintainers
- **Before**: 1000+ lines of boilerplate to maintain
- **After**: Zero manual maintenance

### For the Project
- **Before**: Couldn't scale beyond ~50 rules
- **After**: Can scale to 300+ rules easily

## Conclusion

**Phases 1-4 Complete**: The rule architecture refactor successfully transformed claudelint from a manually-maintained system to a scalable, auto-discovered architecture. All 42 rules are now independently managed, fully type-safe, and automatically registered.

**Phase 5 In Progress**: Now standardizing rule implementation to match ESLint best practices, eliminate duplication, and improve the developer experience. Expected completion: 1-2 days.

**Status**: Phase 5 in progress - standardizing rules and building doc generator.

---

## References

### Project Documentation
- **README.md**: This overview (you are here)
- **IMPLEMENTATION-PLAN.md**: Complete phase-by-phase execution plan
- **STANDARDIZATION-PLAN.md**: Phase 5 detailed implementation (NEW)
- **PROPOSAL.md**: Original design comparison and rationale
- **MIGRATION-GUIDE.md**: How to migrate and add rules

### Implementation Files
- **Core Rule Type**: `src/types/rule.ts`
- **Rule Loader**: `src/utils/rule-loader.ts`
- **Type Generator**: `scripts/generate-rule-types.ts`
- **Doc Generator**: `scripts/generate-rule-docs.ts` (Phase 5)

### External Resources
- **ESLint Custom Rules**: https://eslint.org/docs/latest/extend/custom-rules
- **ESLint Standardization Discussion**: https://github.com/eslint/eslint/discussions/16643
- **typescript-eslint Doc Generation**: https://typescript-eslint.io/blog/automated-rule-docs-with-docusaurus-and-remark/
