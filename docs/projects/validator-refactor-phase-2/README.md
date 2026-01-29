# Validator Refactor Phase 2 Project

**Status:** In Progress - Building Testing Infrastructure
**Created:** 2026-01-29
**Estimated Effort:** 20-25 hours (revised from 16-20)

## Quick Links

- [PLAN] [Master Plan](./MASTER-PLAN.md) - Overview, goals, phases, timeline
- [YES] [Implementation Tracker](./IMPLEMENTATION-TRACKER.md) - Task-by-task progress (13/46 complete)
- [GHOST] [Ghost Rules Audit](./GHOST-RULES-AUDIT.md) - Complete inventory of 66 ghost rules
- [GUIDE] [Migration Guide](./MIGRATION-GUIDE.md) - How to convert ghost rules to real rules
- [PATTERNS] [Architectural Patterns](./PATTERNS.md) - New patterns and abstractions
- [WRAPPER] [Thin Wrapper Pattern](./THIN-WRAPPER-PATTERN.md) - Schema-delegating rules approach

## What is This Project?

Phase 2 completes the Phase 5 migration by:
1. **Eliminating "ghost rules"** - 66 validations that bypass the config system
2. **Building test infrastructure** - RuleTester for unit testing rules
3. **Implementing rule discovery** - Auto-discover rules via RuleRegistry
4. **Implementing schema-delegating rules** - Thin wrapper pattern (delegate to Zod schemas)
5. **Extracting common patterns** - Remove ~200 lines of duplicated code
6. **Standardizing architecture** - All validations become configurable rules

## Why This Matters

**Current Problems:**
- Users cannot disable 66+ validations
- 25 rules have no actual implementation (stub validate() functions)
- Zod schemas AND rules both validate same things (duplication)
- No unit tests - integration tests don't verify rules execute
- Adding new rules requires editing validator files
- Inconsistent patterns across validators

**After Phase 2:**
- ALL validations are configurable via `.claudelintrc.json`
- ALL rules have real implementations with unit tests
- Schema-delegating rules use thin wrapper pattern (single source of truth)
- Adding rules is automatic (no validator changes)
- Consistent patterns across all validators

## Critical Discovery (2026-01-29)

After completing MCP and Claude.md validators, we discovered critical issues:

### Problems Found
1. **25 Stub Rules** - Empty validate() functions relying on Zod schemas
2. **Duplicate Validation** - Schemas AND rules validate same things
3. **No Unit Tests** - Integration tests don't verify individual rules
4. **Tests Masked Issues** - Zod errors made tests pass with empty rules

### Impact on Plan
- Added Phase 2.2: Build Testing Infrastructure (3-4 hours)
- Revised Phase 2.3: Migrate validators with proper testing (6-8 hours)
- Added Phase 2.4: Fix duplication in completed validators (1-2 hours)
- Shifted remaining phases down
- **New total estimate: 20-25 hours** (was 16-20)

## Project Structure

```
docs/projects/validator-refactor-phase-2/
├── README.md                    # This file - Project overview
├── MASTER-PLAN.md              # Detailed plan with phases and timeline
├── IMPLEMENTATION-TRACKER.md   # Task-by-task checklist (49 tasks)
├── GHOST-RULES-AUDIT.md        # Complete inventory of ghost rules
├── MIGRATION-GUIDE.md          # Step-by-step conversion guide
├── PATTERNS.md                 # New architectural patterns
└── THIN-WRAPPER-PATTERN.md     # Schema-delegating rules pattern
```

## Getting Started

### For Contributors

1. **Read the Master Plan** - Understand goals and revised approach
2. **Review the Critical Discovery** - Understand what went wrong and why
3. **Check Implementation Tracker** - See current progress and next tasks
4. **Read the Migration Guide** - Learn the conversion process
5. **Follow the Patterns** - Use established abstractions

### For Reviewers

1. **Master Plan** - Review revised approach addressing discovered issues
2. **Implementation Tracker** - Check that lessons learned are incorporated
3. **Migration Guide** - Verify conversion examples include testing
4. **Patterns** - Ensure patterns prevent discovered issues

## Current Status

### Phase 2.0: Infrastructure [COMPLETE ✓]
- [X] 6/6 tasks complete
- Enhance RuleRegistry, create base abstractions

### Phase 2.1: Ghost Rule Audit [COMPLETE ✓]
- [X] 4/4 tasks complete
- Identify and categorize all ghost rules

### Phase 2.2: Build Testing Infrastructure [COMPLETE ✓]
- [X] 3/3 tasks complete
- Created RuleTester, added unit tests for MCP/Claude.md rules (27 test files)

### Phase 2.3: Implement Schema-Delegating Rules [NOT STARTED]
- [ ] 0/5 tasks complete
- Implement stub rules using thin wrapper pattern (delegate to Zod schemas)
- **CURRENT PHASE**

### Phase 2.4: Audit Schema/Rule Consistency [NOT STARTED]
- [ ] 0/3 tasks complete
- Ensure MCP/Claude.md categories follow consistent patterns

### Phase 2.5: Implement Rule Discovery [NOT STARTED]
- [ ] 0/10 tasks complete
- Remove manual imports, use category-based discovery

### Phase 2.6: Extract Common Patterns [NOT STARTED]
- [ ] 0/5 tasks complete
- Remove ~200 lines of duplication

### Phase 2.7: Testing & Validation [NOT STARTED]
- [ ] 0/10 tasks complete
- Final testing, documentation, remove reportError/reportWarning

**Overall Progress:** 13/46 tasks (28%)

## Key Metrics

### Code Quality
- **Ghost Rules:** 66 → 0 target
- **Stub Rules:** 25 → 0 target (NEW)
- **Manual Imports:** 38 → 0 target
- **Duplicated Lines:** ~200 → ~50 target
- **Configurable Rules:** 66 → 91+ target (revised)

### Testing
- **Integration Tests:** 688+ (existing)
- **Rule Unit Tests:** 0 → 91+ target (NEW)
- **Test Infrastructure:** ClaudeLintRuleTester (NEW)

### Estimated Impact
- **Lines Removed:** ~318 lines of duplication
- **Lines Added:** ~200 lines (RuleTester + unit tests)
- **Validator Complexity:** -20% to -30% per file
- **Maintainability Score:** 4/10 → 8/10

## Revised Timeline

### Week 1-2: Foundation & Testing (8-10 hours)
- Phase 2.0: Infrastructure setup ✓
- Phase 2.1: Complete ghost rule audit ✓
- Phase 2.2: Build RuleTester and test existing rules
- Start Phase 2.3: High-priority validators

### Week 3: Conversion (8-10 hours)
- Complete Phase 2.3: Migrate all remaining validators
- Phase 2.4: Fix duplication in MCP/Claude.md
- Start Phase 2.5: Rule discovery

### Week 4: Polish (4-5 hours)
- Complete Phase 2.5: Rule discovery
- Phase 2.6: Extract common patterns
- Phase 2.7: Testing, validation, documentation

## Quick Start Commands

```bash
# Run all tests
npm test

# Run specific validator tests
npm test -- tests/validators/mcp.test.ts

# Run rule unit tests (after Phase 2.2)
npm test -- tests/rules/

# Lint all files
npm run lint

# Generate rule types (after adding new rules)
npm run generate:types

# Check for stub rules
npx ts-node scripts/verify-rule-implementations.ts

# Check for ghost rules
grep -rn "reportError\|reportWarning" src/validators/*.ts | grep -v "ruleId" | wc -l
```

## Common Tasks

### Add a New Rule

1. Create rule file: `src/rules/{category}/{rule-id}.ts`
2. Add rule ID to `src/rules/rule-ids.ts`
3. Run `npm run generate:types`
4. **NEW:** Create unit test: `tests/rules/{category}/{rule-id}.test.ts`
5. Create documentation: `docs/rules/{category}/{rule-id}.md`
6. Test the rule

### Convert a Ghost Rule (Revised Process)

1. Find ghost in `GHOST-RULES-AUDIT.md`
2. Follow steps in `MIGRATION-GUIDE.md`
3. **NEW:** Create unit test with RuleTester
4. **NEW:** If validating schema field, use thin wrapper pattern (see `THIN-WRAPPER-PATTERN.md`)
5. Update `IMPLEMENTATION-TRACKER.md`
6. Test conversion

### Verify Rule Implementation

```bash
# Check for stub rules (should find 0 after Phase 2.3)
npx ts-node scripts/verify-rule-implementations.ts

# Check specific rule has tests
ls tests/rules/{category}/{rule-id}.test.ts
```

## Questions?

- **Project goals:** See [MASTER-PLAN.md](./MASTER-PLAN.md)
- **Task assignments:** See [IMPLEMENTATION-TRACKER.md](./IMPLEMENTATION-TRACKER.md)
- **How to convert:** See [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)
- **What patterns:** See [PATTERNS.md](./PATTERNS.md)
- **Schema-delegating rules:** See [THIN-WRAPPER-PATTERN.md](./THIN-WRAPPER-PATTERN.md)
- **What's a ghost rule:** See [GHOST-RULES-AUDIT.md](./GHOST-RULES-AUDIT.md)
- **Why the revision:** See "Critical Discovery" section above

## Related Documentation

- [../../architecture.md](../../architecture.md) - Overall system architecture
- [../rule-implementation/](../rule-implementation/) - Phase 5 rule system
- [../../README.md](../../README.md) - General project documentation

## Test Architecture After Phase 2

Phase 2 introduces a **two-level testing strategy**:

### Rule Tests (Unit Tests)
- **Location:** `tests/rules/{category}/{rule-id}.test.ts`
- **Purpose:** Test validation logic in isolation
- **Tool:** ClaudeLintRuleTester (like ESLint's RuleTester)
- **Count:** 3-5 tests per rule (~91 rules = ~300 unit tests)

### Validator Tests (Integration Tests)
- **Location:** `tests/validators/{validator}.test.ts`
- **Purpose:** Test orchestration only (file discovery, parsing, rule execution)
- **Count:** 7-10 tests per validator (reduced from 20-40)
- **Focus:** Does NOT test validation logic (that's in rule tests)

### Size Impact

**Before Phase 2:**
- Validator tests: 688 tests, test BOTH orchestration AND validation
- Rule tests: 0

**After Phase 2:**
- Validator tests: ~100 tests (~60% reduction), test orchestration only
- Rule tests: ~300 tests (NEW), test validation logic
- **Total tests: ~400** (better coverage at correct level)

### What This Means

- Validator tests become SIMPLER (just orchestration)
- Rule tests are MORE FOCUSED (one rule at a time)
- Test failures are CLEARER (rule test = validation bug, validator test = orchestration bug)
- Better coverage with tests at the right level of abstraction

See IMPLEMENTATION-TRACKER.md for detailed examples of before/after test structure.

## Lessons Learned (2026-01-29)

**What We Discovered:**
1. Integration tests alone aren't enough - need unit tests
2. Zod schema validation can mask missing rule implementations
3. Can't assume rules work just because tests pass
4. Need verification scripts to catch stub implementations
5. Need to test at the right level of abstraction

**How We're Addressing It:**
1. Building RuleTester infrastructure (like ESLint)
2. Unit testing every rule with declarative test cases
3. Using thin wrapper pattern - rules delegate to Zod schemas (no duplication)
4. Verification script runs as part of test suite
5. Two-level testing: rules (unit) + validators (integration)

## Approval and Sign-off

**Plan Status:** Revised - In Progress
**Approved By:** TBD
**Start Date:** 2026-01-29
**Revised Timeline:** +4-5 hours for testing infrastructure
**Expected Completion:** TBD

---

**Last Updated:** 2026-01-29
