# Validator Refactor Phase 2 Project

**Status:** Planning Phase
**Created:** 2026-01-29
**Estimated Effort:** 16-20 hours

## Quick Links

- [PLAN] [Master Plan](./MASTER-PLAN.md) - Overview, goals, phases, timeline
- [YES] [Implementation Tracker](./IMPLEMENTATION-TRACKER.md) - Task-by-task progress (0/39 complete)
- [GHOST] [Ghost Rules Audit](./GHOST-RULES-AUDIT.md) - Complete inventory of 66 ghost rules
- [GUIDE] [Migration Guide](./MIGRATION-GUIDE.md) - How to convert ghost rules to real rules
- [PATTERNS] [Architectural Patterns](./PATTERNS.md) - New patterns and abstractions

## What is This Project?

Phase 2 completes the Phase 5 migration by:
1. **Eliminating "ghost rules"** - 66 validations that bypass the config system
2. **Implementing rule discovery** - Auto-discover rules via RuleRegistry instead of manual imports
3. **Extracting common patterns** - Remove ~200 lines of duplicated validation code
4. **Standardizing architecture** - All validations become configurable rules

## Why This Matters

**Current Problems:**
- Users cannot disable 66+ validations
- Adding new rules requires editing validator files
- Same bugs must be fixed in 4+ places
- Inconsistent error handling across validators

**After Phase 2:**
- ALL validations are configurable via `.claudelintrc.json`
- Adding rules is automatic (no validator changes)
- Bugs fixed once, propagate everywhere
- Consistent patterns across all validators

## Project Structure

```
docs/projects/validator-refactor-phase-2/
├── README.md                    # This file - Project overview
├── MASTER-PLAN.md              # Detailed plan with phases and timeline
├── IMPLEMENTATION-TRACKER.md   # Task-by-task checklist (36 tasks)
├── GHOST-RULES-AUDIT.md        # Complete inventory of ghost rules
├── MIGRATION-GUIDE.md          # Step-by-step conversion guide
└── PATTERNS.md                 # New architectural patterns
```

## Getting Started

### For Contributors

1. **Read the Master Plan** - Understand goals and approach
2. **Review the Ghost Rules Audit** - See what needs to be converted
3. **Read the Migration Guide** - Learn the conversion process
4. **Check Implementation Tracker** - Find unclaimed tasks
5. **Follow the Patterns** - Use established abstractions

### For Reviewers

1. **Master Plan** - Review overall approach and timeline
2. **Ghost Rules Audit** - Verify inventory is complete and accurate
3. **Migration Guide** - Check conversion examples are correct
4. **Patterns** - Ensure patterns are sensible and reusable

## Current Status

### Phase 2.0: Infrastructure [NOT STARTED] Not Started
- [ ] 0/6 tasks complete
- Enhance RuleRegistry, create base abstractions

### Phase 2.1: Ghost Rule Audit [NOT STARTED] Not Started
- [ ] 0/4 tasks complete
- Identify and categorize all ghost rules

### Phase 2.2: Convert Ghost Rules [NOT STARTED] Not Started
- [ ] 0/7 tasks complete
- Create ~44 new rule files

### Phase 2.3: Implement Rule Discovery [NOT STARTED] Not Started
- [ ] 0/8 tasks complete
- Remove 38 manual rule imports

### Phase 2.4: Extract Common Patterns [NOT STARTED] Not Started
- [ ] 0/5 tasks complete
- Remove ~200 lines of duplication

### Phase 2.5: Testing & Validation [NOT STARTED] Not Started
- [ ] 0/9 tasks complete
- Ensure nothing broke and documentation is complete

**Overall Progress:** 0/39 tasks (0%)

## Key Metrics

### Code Quality
- **Ghost Rules:** 66 → 0 target
- **Manual Imports:** 38 → 0 target
- **Duplicated Lines:** ~200 → ~50 target
- **Configurable Rules:** 66 → 110+ target

### Estimated Impact
- **Lines Removed:** ~318 lines of duplication
- **Validator Complexity:** -20% to -30% per file
- **Maintainability Score:** 4/10 → 8/10

## Timeline

### Week 1: Foundation (5-7 hours)
- Phase 2.0: Infrastructure setup
- Phase 2.1: Complete ghost rule audit
- Start Phase 2.2: High-priority validators

### Week 2: Conversion (6-8 hours)
- Complete Phase 2.2: Convert all ghost rules
- Phase 2.3: Implement discovery pattern

### Week 3: Polish (4-5 hours)
- Phase 2.4: Extract common patterns
- Phase 2.5: Testing and validation
- Documentation and cleanup

## Quick Start Commands

```bash
# Run all tests
npm test

# Run specific validator tests
npm test -- tests/validators/mcp.test.ts

# Lint all files
npm run lint

# Generate rule types (after adding new rules)
npm run generate:types

# Check for ghost rules
grep -rn "reportError\|reportWarning" src/validators/*.ts | grep -v "ruleId" | wc -l
```

## Common Tasks

### Add a New Rule

1. Create rule file: `src/rules/{category}/{rule-id}.ts`
2. Add rule ID to `src/rules/rule-ids.ts`
3. Run `npm run generate:types`
4. Create documentation: `docs/rules/{category}/{rule-id}.md`
5. Test the rule

### Convert a Ghost Rule

1. Find ghost in `GHOST-RULES-AUDIT.md`
2. Follow steps in `MIGRATION-GUIDE.md`
3. Update `IMPLEMENTATION-TRACKER.md`
4. Test conversion

### Extract a Pattern

1. Identify duplication across validators
2. Design abstraction in `PATTERNS.md`
3. Implement in `src/validators/base.ts`
4. Refactor validators to use abstraction
5. Test all affected validators

## Questions?

- **Project goals:** See [MASTER-PLAN.md](./MASTER-PLAN.md)
- **Task assignments:** See [IMPLEMENTATION-TRACKER.md](./IMPLEMENTATION-TRACKER.md)
- **How to convert:** See [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)
- **What patterns:** See [PATTERNS.md](./PATTERNS.md)
- **What's a ghost rule:** See [GHOST-RULES-AUDIT.md](./GHOST-RULES-AUDIT.md)

## Related Documentation

- [../../architecture.md](../../architecture.md) - Overall system architecture
- [../rule-implementation/](../rule-implementation/) - Phase 5 rule system
- [../../README.md](../../README.md) - General project documentation

## Approval and Sign-off

**Plan Status:** Awaiting Review
**Approved By:** TBD
**Start Date:** TBD
**Completion Date:** TBD

---

**Last Updated:** 2026-01-29
