# Validator Refactor Phase 2 Project

**Status:** In Progress - Phase 2.3B (Complex Validation Rules)
**Created:** 2026-01-29
**Estimated Effort:** 30-35 hours (revised from 20-25)
**Progress:** 30/59 tasks complete (51%)

## Quick Links

- [PLAN] [Master Plan](./MASTER-PLAN.md) - Overview, goals, phases, timeline
- [TRACKER] [Implementation Tracker](./IMPLEMENTATION-TRACKER.md) - Task-by-task progress (30/59 complete)
- [GHOST] [Ghost Rules Audit](./GHOST-RULES-AUDIT.md) - Complete inventory of 66 ghost rules
- [GUIDE] [Migration Guide](./MIGRATION-GUIDE.md) - How to convert ghost rules to real rules
- [PATTERNS] [Architectural Patterns](./PATTERNS.md) - New patterns and abstractions
- [WRAPPER] [Thin Wrapper Pattern](./THIN-WRAPPER-PATTERN.md) - Schema-delegating rules approach

## What is This Project?

Phase 2 completes the ESLint-style rule architecture by:
1. **Eliminating "ghost rules"** - ALL validation logic moves to configurable rules
2. **Building test infrastructure** - RuleTester for unit testing individual rules
3. **Implementing rule discovery** - Auto-discover rules via RuleRegistry (no manual imports)
4. **Implementing field-level rules** - 21 simple schema-delegating rules (Phase 2.3) ✓
5. **Implementing complex rules** - 35 validation rules requiring context/filesystem (Phase 2.3B) ← **CURRENT**
6. **Removing validator validation** - Validators only orchestrate, rules validate
7. **Full user control** - ALL ~56 rules configurable via `.claudelintrc.json`

## Why This Matters

**Current State (INCOMPLETE):**
- DONE: 21 field-level rules implemented (Phase 2.3 complete)
- DONE: Rule discovery working (no manual imports)
- INCOMPLETE: **40 validation checks still non-configurable** (in validators, not rules)
- INCOMPLETE: Users frustrated: "Why can't I disable 'server name too short' warning?"
- INCOMPLETE: Doesn't match ESLint model

**After Phase 2.3B (COMPLETE):**
- DONE: ALL ~56 validation checks are configurable rules
- DONE: Users control everything via `.claudelintrc.json`
- DONE: Matches ESLint architecture: validators orchestrate, rules validate
- DONE: Zero non-configurable validation (except operational messages)
- DONE: Full user control matching industry standards

## Critical Realizations (2026-01-29)

### Discovery 1: Stub Rules and Testing (Early)
After completing MCP and Claude.md validators, we discovered:
- **25 Stub Rules** - Empty validate() functions relying on Zod schemas
- **No Unit Tests** - Integration tests don't verify individual rules
- **Solution:** Built RuleTester infrastructure (Phase 2.2) ✓

### Discovery 2: Incomplete Migration (Later)
After Phase 2.3 (21 simple field rules), we stopped with **40 validation checks still in validators:**
- "LSP server name too short" - hardcoded in validator, users can't disable
- "Agent body too short" - hardcoded in validator, users can't disable
- "Skill name doesn't match directory" - hardcoded in validator, users can't disable
- ...37 more non-configurable checks

**Why we stopped:** The remaining 40 checks were harder (context, filesystem, iteration)

**Why that was wrong:** ESLint doesn't have non-configurable validation. Neither should we.

### Impact on Plan
- ✓ Added Phase 2.2: Build Testing Infrastructure (3-4 hours) - COMPLETE
- ✓ Added Phase 2.3: Simple field-level rules (7 hours) - COMPLETE
- ✓ Added Phase 2.4: Schema/Rule Consistency Audit (1.5 hours) - COMPLETE
- ✓ Added Phase 2.5: Rule Discovery (2 hours) - COMPLETE
- **→ Added Phase 2.3B: Complex validation rules (10-12 hours) - CURRENT**
- **New total estimate: 30-35 hours** (was 16-20)

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
- [X] 6/6 tasks complete (100%)
- Enhance RuleRegistry, create base abstractions, add utilities

### Phase 2.1: Ghost Rule Audit [COMPLETE ✓]
- [X] 4/4 tasks complete (100%)
- Identified and categorized all ghost rules across validators

### Phase 2.2: Build Testing Infrastructure [COMPLETE ✓]
- [X] 3/3 tasks complete (100%)
- Created ClaudeLintRuleTester (ESLint-style)
- Added unit tests for all 27 MCP/Claude.md rules
- All tests passing

### Phase 2.3: Simple Field-Level Rules [COMPLETE ✓]
- [X] 5/5 tasks complete (100%)
- Implemented 21 schema-delegating rules (thin wrapper pattern)
- Skills: 10 rules, Agents: 8 rules, Output-styles: 3 rules
- All unit tests passing

### Phase 2.4: Schema/Rule Consistency Audit [COMPLETE ✓]
- [X] 3/3 tasks complete (100%)
- Audited MCP and Claude.md rules
- Documented when to use thin wrapper vs standalone validation
- Updated architecture.md with pattern guidance

### Phase 2.5: Rule Discovery [COMPLETE ✓]
- [X] 9/10 tasks complete (90%) - Task 2.5.10 blocked by Phase 2.3B
- Removed 29 manual rule imports across 8 validators
- All validators now use executeRulesForCategory() pattern
- All 207 validator unit tests passing

### Phase 2.3B: Complex Validation Rules [IN PROGRESS ← **CURRENT**]
- [ ] 0/8 tasks complete (0%)
- **Goal:** Convert 40 remaining validation checks to configurable rules
- **Need:** ~35 new rules for LSP, plugin, body content, file references, etc.
- **Time:** 10-12 hours estimated
- **Why:** Complete ESLint model - all validation must be user-configurable

### Phase 2.6: Extract Common Patterns [NOT STARTED]
- [ ] 0/5 tasks complete (0%)
- Remove code duplication through abstraction

### Phase 2.7: Testing & Validation [NOT STARTED]
- [ ] 0/12 tasks complete (0%)
- Final testing, documentation, remove reportError/reportWarning methods

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
