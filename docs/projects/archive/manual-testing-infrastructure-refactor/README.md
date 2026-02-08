# Manual Testing Infrastructure Refactor

## Project Overview

**Status:** MVP Complete (Phases 0-5), Phases 6-8 Remaining
**Created:** 2026-02-04
**MVP Completed:** 2026-02-04
**Priority:** High - Blocks Phase 5 manual testing completion

**Parent Project:** `docs/projects/plugin-and-md-management/`

This is a **sub-project** that broke out when we discovered the manual testing approach was fundamentally broken. The parent project has deferred manual testing tasks (Task 5.2-5.3) that depend on this infrastructure being complete.

## Problem Statement

The current manual testing infrastructure has fundamental flaws that make it unsuitable for realistic testing:

### Critical Issues

1. **No Actual Projects** - Test workspaces contain only CLAUDE.md files with no actual code
2. **Missing Context** - Claude cannot optimize CLAUDE.md without seeing the project it references
3. **Unrealistic Installation** - No proper plugin installation/loading mechanism
4. **Invalid Approach** - Testing optimization of a CLAUDE.md that references "React + TypeScript" when no React code exists

### Impact

- Manual testing cannot proceed accurately
- Cannot validate if skills work in realistic scenarios
- Cannot verify actual user installation experience
- Test results would be meaningless

## Solution Overview

Implement industry best practices from ESLint, TypeScript-ESLint, and other linting tools:

1. **Fixture Projects** - Create minimal but realistic projects in `tests/fixtures/projects/`
2. **npm pack Installation** - Test actual package installation using `.tgz` files
3. **Realistic Testing** - Projects with real code that CLAUDE.md references
4. **Repeatable Workflow** - Automated setup, manual testing, automated verification

## Key Documents

- **[research-findings.md](./research-findings.md)** - External research and sources
- **[best-practices.md](./best-practices.md)** - Industry patterns and recommendations
- **[implementation-plan.md](./implementation-plan.md)** - Detailed technical implementation
- **[tracker.md](./tracker.md)** - Phase-based task tracker with acceptance criteria
- **[migration-guide.md](./migration-guide.md)** - How to update existing infrastructure

## Timeline

**MVP Complete:** Phases 0-5 (4-6 hours as estimated)

- Phase 0: Planning (complete)
- Phase 1: Fixture Projects (complete)
- Phase 2: Shared Utilities (complete)
- Phase 3: Update Task 2 (complete)
- Phase 4: Documentation (complete)
- Phase 5: Testing & Validation (complete)

**Remaining Work:**

- Phase 6: Expand to Tasks 1, 3-6 (TBD)
- Phase 7: Fixtures Cleanup (TBD - after parent Task 5.2-5.3)
- Phase 8: Documentation Improvements (TBD - after parent Task 5.2-5.3)

## Success Criteria

**MVP (Complete):**

- [x] Task 2 realistic fixture project created (react-typescript-bloated)
- [x] Setup scripts use `npm pack` for installation
- [x] Test workspace includes real code and proper plugin installation
- [x] Manual testing runbook updated with new workflow
- [x] Task 2 can be executed realistically
- [x] Results are repeatable across test runs

**Full Project (In Progress):**

- [ ] All 6 manual tests have appropriate fixtures
- [ ] Deprecated fixtures cleaned up
- [ ] Documentation improved based on testing learnings

## Related Work

- **Original Manual Testing Runbook:** `docs/testing/manual-testing-runbook.md`
- **Current Test Scripts:** `scripts/test/manual/`
- **Existing Fixtures:** `tests/fixtures/manual/` (will be deprecated)
- **Plugin Configuration:** `plugin.json`

## Next Steps

**Recommended Workflow (Interleaved with Parent Project):**

1. **Phase 6** (this project) - Expand infrastructure to Tasks 1, 3-6
2. **Task 5.2-5.3** (parent project) - Execute all manual testing using infrastructure
3. **Phase 7-8** (this project) - Cleanup informed by testing learnings
4. **Task 5.4-5.5** (parent project) - Version bump and release

**Immediate Next Action:** Begin Phase 6.1 (evaluate Task 1 fixture needs)

**For Details:** See tracker.md "Next Actions" section
