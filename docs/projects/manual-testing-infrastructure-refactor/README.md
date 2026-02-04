# Manual Testing Infrastructure Refactor

## Project Overview

**Status:** Planning
**Created:** 2026-02-04
**Priority:** High - Blocks Phase 5 manual testing completion

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
- **[TRACKER.md](./TRACKER.md)** - Phase-based task tracker with acceptance criteria
- **[migration-guide.md](./migration-guide.md)** - How to update existing infrastructure

## Timeline

**Estimated:** 4-6 hours total

- Phase 1: Fixture Projects (2-3 hours)
- Phase 2: Setup Scripts (1 hour)
- Phase 3: Verification Scripts (0.5 hours)
- Phase 4: Documentation (1 hour)
- Phase 5: Testing (1 hour)

## Success Criteria

- [ ] At least 2 realistic fixture projects created
- [ ] Setup scripts use `npm pack` for installation
- [ ] Test workspaces include real code and proper plugin installation
- [ ] Manual testing runbook updated with new workflow
- [ ] All 6 manual tests can be executed realistically
- [ ] Results are repeatable across test runs

## Related Work

- **Original Manual Testing Runbook:** `docs/testing/manual-testing-runbook.md`
- **Current Test Scripts:** `scripts/test/manual/`
- **Existing Fixtures:** `tests/fixtures/manual/` (will be deprecated)
- **Plugin Configuration:** `plugin.json`

## Next Steps

1. Review TRACKER.md for detailed task breakdown
2. Review research-findings.md for supporting evidence
3. Begin Phase 1: Create fixture projects
