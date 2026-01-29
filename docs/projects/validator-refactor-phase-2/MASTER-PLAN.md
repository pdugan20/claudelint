# Validator Refactor Phase 2: Ghost Rule Elimination & Architectural Cleanup

**Status:** Planning
**Created:** 2026-01-29
**Target Completion:** TBD
**Estimated Effort:** 10-15 hours

## Executive Summary

Phase 2 completes the Phase 5 migration by eliminating "ghost rules" (validations without configurable ruleIds) and implementing proper rule discovery patterns. This refactor will make ALL validations configurable, remove code duplication, and establish consistent patterns across validators.

## Problem Statement

### Current State Issues

1. **Ghost Rules (66+ instances)** - Validators call `reportError()`/`reportWarning()` without ruleIds, bypassing the config system
2. **Manual Rule Imports (38 imports)** - Validators manually import and execute rules instead of using RuleRegistry discovery
3. **Code Duplication** - Frontmatter validation, body content checks, and file walking patterns repeated across 4-7 validators
4. **Inconsistent Error Handling** - Different validators handle errors differently with no unified pattern
5. **Mixed Responsibilities** - Some validations in utility functions, some in validator methods, some in rules

### Impact

- [X] Users cannot disable/configure 66+ validations
- [X] Adding new rules requires editing validator files
- [X] Same bugs must be fixed in multiple places
- [X] Inconsistent user experience across validators
- [X] Technical debt blocking future improvements

## Goals

### Primary Goals

1. **Eliminate All Ghost Rules** - Convert 66+ unconfigurable validations to proper rules with ruleIds
2. **Implement Rule Discovery** - Use RuleRegistry instead of manual imports
3. **Extract Common Patterns** - Remove duplication in frontmatter, body content, and file validation
4. **Unify Error Handling** - Consistent optional vs required file handling

### Success Criteria

- [YES] Zero `reportError()`/`reportWarning()` calls without ruleIds
- [YES] Zero manual rule imports in validators
- [YES] All validations configurable via `.claudelintrc.json`
- [YES] No code duplication in validation patterns
- [YES] 688+ tests still passing
- [YES] No breaking changes to user-facing APIs

## Architecture

### Current Architecture (Broken)

```
┌──────────────┐
│  Validator   │
│              │
│  ┌────────┐  │     ┌──────────┐
│  │ Method │──┼────→│ Ghost    │ [X] Not configurable
│  │        │  │     │ Rule     │
│  └────────┘  │     └──────────┘
│              │
│  ┌────────┐  │     ┌──────────┐
│  │executeR│──┼────→│ Real     │ [YES] Configurable
│  │ule()   │  │     │ Rule     │
│  └────────┘  │     └──────────┘
└──────────────┘
```

**Problems:**
- Ghost rules bypass config system
- Manual imports create tight coupling
- No centralized rule management

### Target Architecture (Fixed)

```
┌──────────────┐
│  Validator   │
│              │
│  ┌────────┐  │     ┌──────────────┐     ┌──────────┐
│  │execute │──┼────→│ RuleRegistry │────→│ Rules    │ [YES] All configurable
│  │Rules() │  │     │ (Discovery)  │     │ (66)     │
│  └────────┘  │     └──────────────┘     └──────────┘
│              │              ↑
│              │              │
└──────────────┘              │
                         ┌────┴─────┐
                         │ Config   │
                         │ System   │
                         └──────────┘
```

**Benefits:**
- All validations go through config
- Auto-discovery via RuleRegistry
- Centralized rule management
- Consistent user experience

## Phases

### Phase 2.0: Infrastructure (2-3 hours)

**Goal:** Set up patterns and utilities needed for migration

**Tasks:**
- [ ] Enhance RuleRegistry with category-based discovery
- [ ] Create `executeRulesForCategory()` in BaseValidator
- [ ] Add abstract patterns for common validations
- [ ] Document migration patterns

**Deliverables:**
- `RuleRegistry.getRulesByCategory(category)` method
- `BaseValidator.executeRulesForCategory()` helper
- Abstract methods for frontmatter/body validation
- Migration guide for converting ghost rules

### Phase 2.1: Ghost Rule Audit (1-2 hours)

**Goal:** Identify and categorize all ghost rules

**Tasks:**
- [ ] Audit all validators for `reportError`/`reportWarning` without ruleIds
- [ ] Categorize by validation type (schema, format, content, etc.)
- [ ] Identify which can become rules vs need different approach
- [ ] Document edge cases and special handling

**Deliverables:**
- Complete ghost rule inventory (GHOST-RULES-AUDIT.md)
- Categorization by type and complexity
- Migration difficulty ratings
- Exception cases documented

### Phase 2.2: Convert Ghost Rules to Real Rules (4-6 hours)

**Goal:** Create rule files for all ghost validations

**Tasks:**
- [ ] Create rule files for MCP ghost rules (10 rules)
- [ ] Create rule files for Claude.md ghost rules (8 rules)
- [ ] Create rule files for Skills ghost rules (12 rules)
- [ ] Create rule files for Agents ghost rules (6 rules)
- [ ] Create rule files for other validators (8 rules)
- [ ] Update rule-ids.ts with new rule IDs
- [ ] Update RuleRegistry auto-generation

**Deliverables:**
- ~44 new rule files in `src/rules/*/`
- Updated `rule-ids.ts`
- Auto-generated registry includes all rules
- Documentation for each new rule

### Phase 2.3: Implement Rule Discovery (2-3 hours)

**Goal:** Remove manual rule imports, use RuleRegistry discovery

**Tasks:**
- [ ] Replace manual imports in claude-md.ts with discovery (6 imports)
- [ ] Replace manual imports in skills.ts with discovery (14 imports)
- [ ] Replace manual imports in plugin.ts with discovery (6 imports)
- [ ] Replace manual imports in mcp.ts with discovery (3 imports)
- [ ] Replace manual imports in hooks.ts with discovery (3 imports)
- [ ] Replace manual imports in settings.ts with discovery (4 imports)
- [ ] Replace manual imports in commands.ts with discovery (2 imports)
- [ ] Remove executeRule calls, use executeRulesForCategory

**Deliverables:**
- Zero manual rule imports in validators
- All validators use RuleRegistry discovery
- Cleaner, more maintainable validator code

### Phase 2.4: Extract Common Patterns (2-3 hours)

**Goal:** Remove code duplication through abstraction

**Tasks:**
- [ ] Extract frontmatter validation pattern to BaseValidator
- [ ] Extract body content validation pattern to BaseValidator
- [ ] Extract file walking pattern to BaseValidator
- [ ] Extract directory filtering pattern to BaseValidator
- [ ] Unify error handling with optional check helpers

**Deliverables:**
- Reusable `validateFrontmatterWithNameCheck()` method
- Reusable `validateBodyContentStructure()` method
- Reusable `validateFilesInDirectory()` method
- Reusable `tryReadDirectory()` error handler
- 100+ lines of duplication removed

### Phase 2.5: Testing & Validation (1-2 hours)

**Goal:** Ensure nothing broke

**Tasks:**
- [ ] Run full test suite (688 tests)
- [ ] Test config disable for new rules
- [ ] Test config severity override for new rules
- [ ] Test rule options for configurable rules
- [ ] Manual validation of each validator
- [ ] Performance testing (should be same or better)

**Deliverables:**
- All tests passing
- Config system works for all rules
- No performance regressions
- Documentation updates

## Risk Management

### High Risk Items

1. **Breaking Changes** - Converting ghost rules to real rules changes behavior
   - **Mitigation:** Use same default severity, extensive testing, clear changelog

2. **Performance Regression** - RuleRegistry lookup could be slower than direct imports
   - **Mitigation:** Benchmark before/after, cache registry results

3. **Test Failures** - Changing validation flow might break tests
   - **Mitigation:** Fix tests incrementally, one validator at a time

### Medium Risk Items

1. **Edge Cases** - Some ghost rules might have special handling
   - **Mitigation:** Document exceptions in GHOST-RULES-AUDIT.md

2. **Config Compatibility** - Existing configs might not work
   - **Mitigation:** Ensure backward compatibility, migration guide

## Dependencies

### Internal Dependencies

- Phase 2.1 must complete before 2.2 (need audit to know what to convert)
- Phase 2.0 must complete before 2.3 (need infrastructure for discovery)
- Phase 2.2 must complete before 2.3 (need rules to discover)
- Phase 2.4 can run parallel to 2.2/2.3

### External Dependencies

- None - all work is internal refactoring

## Success Metrics

### Code Quality Metrics

- **Ghost Rules:** 66 → 0
- **Manual Imports:** 38 → 0
- **Duplicated Lines:** ~200 → ~50
- **Validator Complexity:** HIGH → MEDIUM

### User Experience Metrics

- **Configurable Rules:** 66 → 110+
- **Config Options:** Same or more
- **Error Messages:** Same quality
- **Performance:** Same or better

## Timeline Estimate

| Phase | Description | Estimated Time | Dependencies |
|-------|-------------|----------------|--------------|
| 2.0 | Infrastructure | 2-3 hours | None |
| 2.1 | Ghost Rule Audit | 1-2 hours | None |
| 2.2 | Convert Ghost Rules | 4-6 hours | 2.1 |
| 2.3 | Rule Discovery | 2-3 hours | 2.0, 2.2 |
| 2.4 | Extract Patterns | 2-3 hours | None (parallel) |
| 2.5 | Testing | 1-2 hours | All above |
| **Total** | | **12-19 hours** | |

**Realistic Estimate:** 15-18 hours with typical interruptions and edge cases

## Implementation Order

### Week 1: Foundation (5-7 hours)
1. Phase 2.0: Infrastructure (2-3 hours)
2. Phase 2.1: Ghost Rule Audit (1-2 hours)
3. Start Phase 2.2: High-priority validators (2 hours)

### Week 2: Conversion (6-8 hours)
4. Complete Phase 2.2: Convert all ghost rules (4-6 hours)
5. Phase 2.3: Implement discovery pattern (2-3 hours)

### Week 3: Polish (4-5 hours)
6. Phase 2.4: Extract common patterns (2-3 hours)
7. Phase 2.5: Testing and validation (1-2 hours)
8. Documentation and cleanup (1 hour)

## Post-Completion

### Follow-up Work

1. Update all rule documentation for new rules
2. Write migration guide for users
3. Update CHANGELOG.md with breaking changes
4. Consider adding more rule options based on user feedback

### Future Improvements

1. Auto-generate rule documentation from metadata
2. Interactive config builder for common scenarios
3. Rule dependency system (rule A requires rule B)
4. Performance profiling for rule execution order

## References

- [IMPLEMENTATION-TRACKER.md](./IMPLEMENTATION-TRACKER.md) - Detailed task tracking
- [GHOST-RULES-AUDIT.md](./GHOST-RULES-AUDIT.md) - Complete ghost rule inventory
- [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) - How to convert ghost rules
- [PATTERNS.md](./PATTERNS.md) - New architectural patterns
- [../../architecture.md](../../architecture.md) - Overall system architecture
- [../rule-implementation/](../rule-implementation/) - Phase 5 rule system

## Sign-off

**Plan Approved By:** TBD
**Start Date:** TBD
**Completion Date:** TBD
