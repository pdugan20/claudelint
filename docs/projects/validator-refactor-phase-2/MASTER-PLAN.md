# Validator Refactor Phase 2: Ghost Rule Elimination & Architectural Cleanup

**Status:** In Progress - Phase 2.2 (Building Testing Infrastructure)
**Created:** 2026-01-29
**Revised:** 2026-01-29 (Added testing infrastructure, fixed duplication issues)
**Target Completion:** TBD
**Estimated Effort:** 20-25 hours (revised from 16-20)

## Executive Summary

Phase 2 completes the Phase 5 migration by eliminating "ghost rules" (validations without configurable ruleIds) and implementing proper rule discovery patterns. This refactor will make ALL validations configurable, remove code duplication, and establish consistent patterns across validators.

**CRITICAL UPDATE (2026-01-29):** After initial implementation of MCP and Claude.md validators, we discovered serious architectural issues that required revising the plan. See "Critical Discovery" section below.

## Critical Discovery (2026-01-29)

### What Happened

After "completing" MCP and Claude.md validators and claiming success, the user discovered that 2 rules (`claude-md-paths` and `claude-md-rules-circular-symlink`) still had empty `validate()` functions. Investigation revealed:

1. **25 Stub Rules Total** - Rules with no-op validate() functions:
   - 10 agents rules (agent-name, agent-description, etc.)
   - 11 skills rules (skill-name, skill-description, etc.)
   - 3 output-styles rules
   - 2 claude-md rules (the ones caught by user)

2. **Duplicate Validation** - Both Zod schemas AND rules validate same things:
   - Example: `claude-md-paths` validates "must be array" in BOTH schema AND rule
   - Example: MCP schemas validate required fields, rules also validate them
   - Confusion about source of truth

3. **Integration Tests Don't Verify Rules** - Tests passed despite empty rules:
   - Integration tests only check validator output
   - Zod schema errors make tests pass even with empty rule logic
   - No way to verify individual rules actually execute

4. **Two Validation Patterns** - Inconsistent architecture:
   - MCP/Claude.md: Call `executeRulesForCategory()` (correct pattern, but has duplication)
   - Agents/Skills/Output-styles: Call `mergeSchemaValidationResult()` (old pattern, rules are stubs)

### Root Cause

- Agents/Skills/Output-styles validators use Zod schemas for validation (`.min()`, `.max()`, `.refine()`)
- Rule files exist but are stubs with comments like "Schema handles this"
- `mergeSchemaValidationResult()` injects schema errors directly into validator results
- Integration tests verify validator output, not that rules execute
- This architecture made it impossible to detect missing implementations

### Impact on Plan

**Original Plan (Incorrect):**
1. Move validation logic from validators to rules
2. Delete validation methods
3. Remove reportError/reportWarning calls
4. Implement rule discovery

**Revised Plan (Correct):**
1. **NEW Phase 2.2:** Build RuleTester infrastructure (3-4 hours)
2. **NEW Phase 2.2:** Add unit tests for existing rules (verify they work)
3. **REVISED Phase 2.3:** Remove validation from Zod schemas + implement 25 stubs WITH tests (6-8 hours)
4. **NEW Phase 2.4:** Fix duplication in completed validators (1-2 hours)
5. Continue with discovery and cleanup phases (shifted down)

**Estimate Impact:** +4-5 hours (20-25 total, was 16-20)

### Lessons Learned

1. **Integration tests aren't enough** - Need unit tests for individual rules
2. **Assumptions need verification** - Can't assume tests passing = code working
3. **Schemas should be structure-only** - Validation belongs in rules, not schemas
4. **Verification scripts matter** - Need automated checks for stub implementations
5. **Test at the right level** - Integration tests for workflows, unit tests for components

### How We're Fixing It

1. Build ClaudeLintRuleTester (inspired by ESLint's RuleTester)
2. Unit test every existing rule to verify they execute
3. Remove ALL validation from Zod schemas (keep structure only)
4. Implement all 25 stub rules with unit tests
5. Run verification script to confirm zero stubs remain
6. Then continue with discovery and cleanup

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

### Phase 2.0: Infrastructure (2-3 hours) ✓ COMPLETE

**Goal:** Set up patterns and utilities needed for migration

**Status:** COMPLETE

**Deliverables:**
- [X] `RuleRegistry.getRulesByCategory(category)` method
- [X] `BaseValidator.executeRulesForCategory()` helper
- [X] Abstract methods for frontmatter/body validation
- [X] Migration guide for converting ghost rules

### Phase 2.1: Ghost Rule Audit (1-2 hours) ✓ COMPLETE

**Goal:** Identify and categorize all ghost rules

**Status:** COMPLETE

**Deliverables:**
- [X] Complete ghost rule inventory (GHOST-RULES-AUDIT.md)
- [X] Categorization by type and complexity
- [X] Migration difficulty ratings
- [X] Exception cases documented

### Phase 2.2: Build Testing Infrastructure (3-4 hours) **IN PROGRESS**

**Goal:** Create RuleTester utility and verify existing rules work

**Status:** NOT STARTED

**CRITICAL:** Must verify rules actually execute before continuing. Integration tests alone don't catch stub implementations.

**Tasks:**
- [ ] Create ClaudeLintRuleTester utility (inspired by ESLint)
- [ ] Add unit tests for MCP rules (8 rules)
- [ ] Add unit tests for Claude.md rules (13 rules)

**Deliverables:**
- ClaudeLintRuleTester class in tests/helpers/rule-tester.ts
- Unit test for each MCP rule in tests/rules/mcp/
- Unit test for each Claude.md rule in tests/rules/claude-md/
- Verification that all 21 rules actually execute

**Why This Phase:**
After completing MCP/Claude.md validators, discovered:
1. 25 stub rules with empty validate() functions
2. Integration tests didn't catch missing implementations
3. Zod schema errors masked missing rule logic
4. Need unit tests to verify rules actually work

### Phase 2.3: Migrate Remaining Validators (6-8 hours)

**Goal:** For each validator: remove schema validation, implement stubs with tests, convert to pure orchestration

**Status:** NOT STARTED

**CRITICAL:** Each validator must be fully complete with tests before moving to next.

**Approach:**
1. Remove ALL validation from Zod schema (keep structure only)
2. Implement stub rules with FULL validation logic
3. Create unit tests using RuleTester
4. Convert validator to pure orchestration
5. Verify integration tests still pass

**Tasks:**
- [ ] Migrate Skills validator (11 stub rules → real implementations)
- [ ] Migrate Agents validator (10 stub rules → real implementations)
- [ ] Migrate Output-styles validator (3 stub rules → real implementations)
- [ ] Remove mergeSchemaValidationResult() pattern from all validators
- [ ] Verify zero stub rules remain (verification script)
- [ ] Create Plugin ghost rules with tests
- [ ] Create Hooks ghost rules with tests
- [ ] Create Settings ghost rules with tests
- [ ] Update rule-ids.ts with all new rules

**Deliverables:**
- 24+ stub rules fully implemented with unit tests
- Zero calls to mergeSchemaValidationResult()
- All Zod schemas used ONLY for structure, not validation
- All validators converted to pure orchestration
- Verification script confirms zero stubs remain

### Phase 2.4: Fix Early Validators (1-2 hours)

**Goal:** Remove duplicate validation from MCP and Claude.md schemas

**Status:** NOT STARTED

**Tasks:**
- [ ] Remove validation logic from MCPConfigSchema (keep structure only)
- [ ] Remove validation logic from ClaudeMdFrontmatterSchema (keep structure only)
- [ ] Verify rule unit tests still pass
- [ ] Verify integration tests still pass

**Deliverables:**
- MCP schema has NO validation (.min, .max, .refine removed)
- Claude.md schema has NO validation (.min, .max, .refine removed)
- ALL validation happens in rules, NEVER in schemas

**Why This Phase:**
MCP and Claude.md validators have duplicate validation:
- Schemas validate "must be array", rules also validate it
- Creates confusion about source of truth
- After adding unit tests and removing schema validation from other validators, need to fix these too

### Phase 2.5: Implement Rule Discovery (2-3 hours)

**Goal:** Remove manual rule imports, use RuleRegistry category-based discovery, deprecate old methods

**Status:** NOT STARTED

**Tasks:**
- [ ] Refactor all validators to use executeRulesForCategory()
- [ ] Remove manual rule imports from all validators
- [ ] Verify zero manual imports remain
- [ ] Verify zero reportError/reportWarning calls remain
- [ ] Mark reportError/reportWarning as @deprecated

**Deliverables:**
- Zero manual rule imports in validators
- All validators use RuleRegistry discovery
- reportError/reportWarning marked @deprecated
- Documentation updated with discovery pattern

### Phase 2.6: Extract Common Patterns (2-3 hours)

**Goal:** Remove code duplication through abstraction

**Status:** NOT STARTED

**Tasks:**
- [ ] Refactor agents.ts to use base class abstractions
- [ ] Refactor skills.ts to use base class abstractions
- [ ] Refactor output-styles.ts to use base class abstractions
- [ ] Unify error handling across validators
- [ ] Remove dead code and migration comments

**Deliverables:**
- 100+ lines of duplication removed
- Consistent patterns across all validators
- Cleaner, more maintainable code

### Phase 2.7: Testing & Validation (2.5-3 hours)

**Goal:** Ensure nothing broke, documentation complete, architecture clean

**Status:** NOT STARTED

**Tasks:**
- [ ] Run full test suite (688+ tests)
- [ ] Test config disable/severity override
- [ ] Test rule options
- [ ] Manual validation
- [ ] Performance testing
- [ ] REMOVE reportError/reportWarning methods entirely from base.ts
- [ ] Create rule documentation
- [ ] Update CHANGELOG.md
- [ ] Update contributing guide

**Deliverables:**
- All tests passing (integration + unit)
- reportError/reportWarning methods DELETED
- 100% rule-based architecture
- Complete documentation
- No performance regressions

## Risk Management

### High Risk Items (Discovered Issues - 2026-01-29)

1. **Stub Rules Not Caught by Tests** - 25 rules with empty validate() functions passed all tests
   - **Issue:** Integration tests don't verify individual rules execute
   - **Mitigation:** Build RuleTester infrastructure, unit test every rule
   - **Status:** Being addressed in Phase 2.2

2. **Duplicate Validation** - Both Zod schemas AND rules validate same things
   - **Issue:** Confusing source of truth, potential inconsistencies
   - **Mitigation:** Remove ALL validation from schemas, keep structure only
   - **Status:** Will fix in Phases 2.3 and 2.4

3. **Performance Regression** - More rules = more execution time
   - **Mitigation:** Benchmark before/after, cache registry results
   - **Status:** Will test in Phase 2.7

### Medium Risk Items

1. **Breaking Changes** - Converting ghost rules to real rules changes behavior
   - **Mitigation:** Use same default severity, extensive testing, clear changelog

2. **Test Failures** - Removing schema validation might break integration tests
   - **Mitigation:** Fix tests incrementally, one validator at a time

3. **Config Compatibility** - Existing configs might not work
   - **Mitigation:** Ensure backward compatibility, migration guide

## Dependencies

### Internal Dependencies

- Phase 2.1 must complete before 2.3 (need audit) ✓
- Phase 2.0 must complete before 2.5 (need infrastructure) ✓
- **Phase 2.2 must complete before 2.3** (need test infrastructure first) **CRITICAL**
- Phase 2.3 must complete before 2.4 (need to migrate validators before fixing schemas)
- Phase 2.4 must complete before 2.5 (need all validation in rules before discovery)
- Phases 2.6-2.7 can run in sequence after 2.5

### External Dependencies

- None - all work is internal refactoring

## Success Metrics

### Code Quality Metrics

- **Ghost Rules:** 66 → 0
- **Stub Rules:** 25 → 0 (NEW)
- **Manual Imports:** 38 → 0
- **Duplicated Lines:** ~200 → ~50
- **Schema Validation:** Present → None (structure only)
- **Validator Complexity:** HIGH → MEDIUM

### Testing Metrics (NEW)

- **Integration Tests:** 688+ (existing)
- **Rule Unit Tests:** 0 → 91+ (NEW requirement)
- **Test Coverage:** Validator-level → Rule-level
- **Verification:** Manual → Automated (verification script)

### User Experience Metrics

- **Configurable Rules:** 66 → 91+ (revised)
- **Config Options:** Same or more
- **Error Messages:** Same quality
- **Performance:** Same or better

## Timeline Estimate (REVISED)

| Phase | Description | Estimated Time | Status | Dependencies |
|-------|-------------|----------------|--------|--------------|
| 2.0 | Infrastructure | 2-3 hours | ✓ DONE | None |
| 2.1 | Ghost Rule Audit | 1-2 hours | ✓ DONE | None |
| 2.2 | **Build Testing Infra** | **3-4 hours** | IN PROGRESS | None |
| 2.3 | **Migrate Validators** | **6-8 hours** | NOT STARTED | 2.2 |
| 2.4 | **Fix Early Validators** | **1-2 hours** | NOT STARTED | 2.3 |
| 2.5 | Rule Discovery | 2-3 hours | NOT STARTED | 2.4 |
| 2.6 | Extract Patterns | 2-3 hours | NOT STARTED | 2.5 |
| 2.7 | Testing & Documentation | 2.5-3 hours | NOT STARTED | 2.6 |
| **Total** | | **20-28 hours** | | |

**Realistic Estimate:** 20-25 hours with typical interruptions and edge cases

**Why the Increase:**
- Added Phase 2.2 (3-4 hours): Build RuleTester infrastructure
- Revised Phase 2.3 (was 2.2): Now includes proper testing (+2 hours)
- Added Phase 2.4 (1-2 hours): Fix duplication in completed validators
- Shifted other phases down

## Implementation Order (REVISED)

### Week 1-2: Foundation & Testing (8-10 hours)
1. Phase 2.0: Infrastructure (2-3 hours) ✓ DONE
2. Phase 2.1: Ghost Rule Audit (1-2 hours) ✓ DONE
3. **Phase 2.2: Build RuleTester (3-4 hours)** ← CURRENT
4. Start Phase 2.3: High-priority validators (2 hours)

### Week 3: Conversion (8-10 hours)
5. Complete Phase 2.3: Migrate all remaining validators (6-8 hours)
6. Phase 2.4: Fix duplication in MCP/Claude.md (1-2 hours)
7. Start Phase 2.5: Rule discovery (1 hour)

### Week 4: Polish (4-5 hours)
8. Complete Phase 2.5: Rule discovery (2-3 hours)
9. Phase 2.6: Extract common patterns (2-3 hours)
10. Phase 2.7: Testing, validation, and documentation (2.5-3 hours)

## Post-Completion

### Follow-up Work

**Note:** Documentation tasks (rule docs, user migration guide, CHANGELOG.md) are now included in Phase 2.5 as discrete tasks.

1. Consider adding more rule options based on user feedback
2. Gather user feedback on new configurable rules
3. Monitor for performance issues in production

### Future Improvements

1. **Refactor base.ts into smaller modules** - The BaseValidator class is now 1,070 lines after Phase 2. Consider splitting into:
   - `base-validator.ts` - Core validator class
   - `validation-helpers.ts` - Tool/event name validation
   - `frontmatter-helpers.ts` - Frontmatter and body content abstractions
   - `file-helpers.ts` - File walking and directory operations
   - `rule-execution.ts` - Rule execution methods
2. Auto-generate rule documentation from metadata
3. Interactive config builder for common scenarios
4. Rule dependency system (rule A requires rule B)
5. Performance profiling for rule execution order

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
