# claudelint Refactoring Plan

Comprehensive plan for improving codebase scalability, reducing duplication, and enhancing maintainability.

## Progress Tracker

**Overall Progress**: 1/18 tasks complete (6%)

### Phase Completion

- [ ] **Phase 1: Quick Wins** (1/7 tasks) - 2-3 hours
- [ ] **Phase 2: Architecture** (0/4 tasks) - 4-6 hours
- [ ] **Phase 3: Composition Framework** (0/3 tasks) - 2-3 days
- [ ] **Phase 4: Testing Infrastructure** (0/4 tasks) - 1-2 days

**Estimated Total Time**: 4-5 days

> **Note**: Update these counts as you complete tasks. Mark phases complete when all tasks in that phase are done.

## Overview

This refactoring addresses:

- **200+ lines** of code duplication
- Scattered rule registration across 6 files
- Missing composition patterns for validators
- Weak type safety for rule IDs
- Insufficient testing infrastructure

## Execution Strategy

Use the task tracker to manage progress:

```bash
# View all tasks
/tasks

# Check current phase
/tasks | grep pending | grep -v blocked

# Start a task
# Update task status as you work
```text
## Phase Structure

### Phase 1: Quick Wins (Tasks #1-5, #10, #17)

**Goal**: Eliminate immediate code duplication with low-risk refactoring

**Effort**: 2-3 hours | **Impact**: ~200 lines of duplication removed

**Tasks** (can run in parallel):

- [x] **Task #1**: Extract environment variable validation utility (~60 LOC saved)
  - Files: `src/validators/settings.ts:148-178`, `src/validators/mcp.ts:175-185`
  - Create: `src/utils/validation-helpers.ts`

- [ ] **Task #2**: Extract hook validation utility (~70 LOC saved)
  - Files: `src/validators/hooks.ts:68-107`, `src/validators/settings.ts:116-134`
  - Create: `src/utils/validation-helpers.ts`

- [ ] **Task #3**: Centralize magic numbers to constants (~10 LOC saved)
  - Files: `src/validators/skills.ts`, `src/validators/claude-md.ts`
  - Update: `src/validators/constants.ts`

- [ ] **Task #4**: Create formatError utility function (~40 LOC saved)
  - Pattern: `error instanceof Error ? error.message : String(error)` (20+ uses)
  - Create: `src/utils/validation-helpers.ts`

- [ ] **Task #5**: Extract regex patterns to constants (~30 LOC saved)
  - Files: `src/validators/skills.ts`, `src/validators/mcp.ts`
  - Update: `src/validators/constants.ts`

- [ ] **Task #10**: Document and fix silent error suppression
  - Files: `src/validators/skills.ts:633-635`, `src/validators/skills.ts:543-544`
  - Action: Add proper error handling or documentation

- [ ] **Task #17**: Create file path validation utility
  - Files: Multiple validators with duplicate async `fileExists()` calls
  - Create: `src/utils/validation-helpers.ts`

**Success Criteria**:

- [ ] All Phase 1 tests pass
- [ ] No behavior changes
- [ ] Reduced LOC in validators
- [ ] New utilities have unit tests

### Phase 2: Architecture (Tasks #6-9)

**Goal**: Improve scalability and enable programmatic validator management

**Effort**: 4-6 hours | **Depends on**: Phase 1 complete | **Impact**: Enables future scaling

**Tasks**:

- [ ] **Task #6**: Create ValidatorFactory for programmatic discovery
  - Files: `src/cli.ts` (manual instantiation)
  - Create: `src/utils/validator-factory.ts`
  - Blocked by: Tasks #1, #2, #3, #4, #5, #17

- [ ] **Task #7**: Centralize rule registration in rules/index.ts
  - Files: 6 validators with scattered `RuleRegistry.register()` calls
  - Create: `src/rules/index.ts`
  - Blocked by: Tasks #1, #2, #3, #4, #5, #17

- [ ] **Task #8**: Add TypeScript type safety for rule IDs
  - Files: All validators, `src/validators/base.ts`
  - Create: `type RuleId = 'size-error' | 'skill-missing-shebang' | ...`
  - Blocked by: Task #7

- [ ] **Task #9**: Strengthen validator options types
  - Files: All validator constructors
  - Create: `BaseValidatorOptions`, specific validator option types
  - Blocked by: Tasks #1, #2, #3, #4, #5, #17

**Success Criteria**:

- [ ] Validators instantiated through factory
- [ ] Single source of truth for all rules
- [ ] Strong typing for rule IDs (compile-time safety)
- [ ] Unified validator options interfaces

### Phase 3: Composition Framework (Tasks #11-13)

**Goal**: Enable composable validation and plugin extensibility

**Effort**: 2-3 days | **Depends on**: Phase 2 complete | **Impact**: Massive scalability for new validators

**Tasks**:

- [ ] **Task #11**: Design validation composition framework
  - Create: `docs/composition-framework.md`
  - Implement: Core composable validators (fileExists, jsonSchema, regex, array)
  - Design: Composition operators (compose, optional, conditional)
  - Blocked by: Tasks #6, #7, #8, #9, #10

- [ ] **Task #12**: Refactor JSONConfigValidator to use composition (~150 LOC saved)
  - Files: `src/validators/json-config-validator.ts`, all JSON validator subclasses
  - Action: Refactor to use composable validation patterns
  - Blocked by: Task #11

- [ ] **Task #13**: Create validator plugin system
  - Create: `src/utils/plugin-loader.ts`
  - Design: Plugin API and discovery mechanism
  - Implement: Example plugin package
  - Document: `docs/plugin-development.md`
  - Blocked by: Tasks #6, #7, #12

**Success Criteria**:

- [ ] Composable validation pattern documented and implemented
- [ ] JSON validators refactored with composition
- [ ] Plugin system supports third-party validators
- [ ] Example plugin working

### Phase 4: Testing Infrastructure (Tasks #14-16, #18)

**Goal**: Improve test quality and reduce test duplication

**Effort**: 1-2 days | **Depends on**: Phase 1 for #14-15, Phase 2 for #16 | **Impact**: Faster test writing, better coverage

**Tasks**:

- [ ] **Task #14**: Create shared test fixture builders
  - Files: `tests/validators/skills.test.ts:9-34`, `tests/validators/claude-md.test.ts:50-65`
  - Create: `tests/helpers/fixtures.ts`
  - Implement: Builders for SKILL.md, settings.json, hooks.json, mcp.json, plugin.json, CLAUDE.md
  - Blocked by: Tasks #1, #2, #3, #4, #5, #17

- [ ] **Task #15**: Build validator test helpers and matchers
  - Create: `tests/helpers/matchers.ts`
  - Implement: `toHaveError()`, `toHaveWarning()`, `toHaveErrorCount()`, `toPassValidation()`
  - Create: Helper functions for common test patterns
  - Blocked by: Task #14

- [ ] **Task #16**: Add end-to-end CLI integration tests
  - Create: `tests/integration/cli.test.ts`
  - Test: Valid project, projects with errors, --fix flag, --config flag, ignore patterns, verbose output
  - Blocked by: Tasks #6, #7, #8, #9

- [ ] **Task #18**: Document coding standards for validators
  - Create: `docs/validator-development-guide.md`
  - Content: Architecture, error handling, testing, type safety, performance guidelines
  - Link from: `CONTRIBUTING.md`
  - Blocked by: Tasks #6, #7, #8, #9, #10, #11, #12, #13

**Success Criteria**:

- [ ] Reusable fixture builders for all config types
- [ ] Custom Jest matchers for validation assertions
- [ ] E2E CLI tests cover main workflows
- [ ] Comprehensive validator development guide published

## Task Dependencies

```text
Phase 1 (parallel):
  #1, #2, #3, #4, #5, #10, #17

Phase 2:
  #6 ← [#1, #2, #3, #4, #5, #17]
  #7 ← [#1, #2, #3, #4, #5, #17]
  #8 ← [#7]
  #9 ← [#1, #2, #3, #4, #5, #17]

Phase 3:
  #11 ← [#6, #7, #8, #9, #10]
  #12 ← [#11]
  #13 ← [#6, #7, #12]

Phase 4:
  #14 ← [#1, #2, #3, #4, #5, #17]
  #15 ← [#14]
  #16 ← [#6, #7, #8, #9]
  #18 ← [#6, #7, #8, #9, #10, #11, #12, #13]
```text
## Impact Summary

| Metric                 | Before    | After         | Improvement           |
| ---------------------- | --------- | ------------- | --------------------- |
| Code Duplication       | ~200+ LOC | ~0 LOC        | 100% reduction        |
| Validator Registration | 6 files   | 1 file        | Centralized           |
| Rule ID Safety         | Strings   | Typed         | Compile-time checking |
| Test Duplication       | High      | Low           | Reusable builders     |
| Validator Discovery    | Manual    | Automatic     | Factory pattern       |
| Extensibility          | Limited   | Plugin system | Third-party support   |

## Risk Assessment

### Low Risk (Phase 1)

- Extracting utilities
- Moving constants
- No behavior changes
- Fully test-covered

### Medium Risk (Phase 2)

- Architectural changes
- Requires careful migration
- High test coverage needed
- Incremental rollout possible

### High Risk (Phase 3)

- Major refactoring
- New patterns introduced
- Requires thorough testing
- Should be feature-flagged initially

## Rollback Strategy

Each phase can be reverted independently:

- Phase 1: Revert individual commits per task
- Phase 2: Factory pattern is opt-in initially
- Phase 3: Composition framework parallel to existing code
- Phase 4: Test infrastructure additive only

## Success Metrics

### Code Quality

- [ ] <200 lines of duplication (SonarQube)
- [ ] > 80% test coverage maintained
- [ ] All ESLint/TypeScript strict mode passing
- [ ] Zero silent error suppressions without documentation

### Performance

- [ ] No regression in validation speed
- [ ] CLI startup time <500ms
- [ ] Large projects (<100 files) validate in <2s

### Developer Experience

- [ ] New validator can be added in <1 hour
- [ ] Validator development guide complete
- [ ] Plugin example documented
- [ ] Contribution guide updated

## Timeline

| Phase     | Duration     | Completion Criteria              |
| --------- | ------------ | -------------------------------- |
| Phase 1   | 2-3 hours    | All quick wins merged            |
| Phase 2   | 4-6 hours    | Architecture improvements merged |
| Phase 3   | 2-3 days     | Composition framework complete   |
| Phase 4   | 1-2 days     | Testing infrastructure complete  |
| **Total** | **4-5 days** | All phases complete              |

## Getting Started

### How to Track Progress

This document uses checkboxes to track completion. Update them as you work:

1. **When starting a task**: Mark task as in-progress in the tracker

   ```bash
   # Example: Starting task #1
   # The task tracker will show it as in-progress
   ```text
2. **When completing a task**:
   - Mark the checkbox in this document: `- [ ]` → `- [x]`
   - Mark task as completed in the tracker
   - Update the Progress Tracker percentages at the top

3. **When a phase completes**: Mark the phase checkbox complete

### Implementation Steps

1. **Review this plan** and the detailed task list:

   ```bash
   /tasks
   ```text
2. **Start with Phase 1 tasks** (no dependencies, can run in parallel):
   - Task #1: Extract env var validation utility (~60 LOC saved)
   - Task #2: Extract hook validation utility (~70 LOC saved)
   - Task #3: Centralize magic numbers (~10 LOC saved)
   - Task #4: Create formatError utility (~40 LOC saved)
   - Task #5: Extract regex patterns (~30 LOC saved)
   - Task #10: Fix silent error suppression
   - Task #17: Create file path validation utility

   **Tip**: Start with #2 (hooks) or #1 (env vars) for highest impact

3. **Run tests frequently**:

   ```bash
   npm test
   ```text
4. **Commit after each task**: Use clear commit messages referencing task IDs

   ```bash
   git commit -m "refactor: extract env var validation utility (Task #1)"
   ```text
5. **Update this document**: Check off completed tasks and update progress percentages

## Quick Reference: Task Status Grid

| Phase | Task                         | Status | LOC Impact    | Files Affected |
| ----- | ---------------------------- | ------ | ------------- | -------------- |
| 1     | #1 Env var validation        |       | ~60           | 2-3            |
| 1     | #2 Hook validation           | ☐      | ~70           | 2              |
| 1     | #3 Magic numbers             | ☐      | ~10           | 2              |
| 1     | #4 formatError utility       | ☐      | ~40           | 5+             |
| 1     | #5 Regex patterns            | ☐      | ~30           | 2-3            |
| 1     | #10 Silent errors            | ☐      | Quality       | 2              |
| 1     | #17 File path validation     | ☐      | Reusable      | 5+             |
| 2     | #6 ValidatorFactory          | ☐      | Structural    | 1              |
| 2     | #7 Rule registration         | ☐      | Structural    | 7              |
| 2     | #8 Type-safe rule IDs        | ☐      | Type safety   | 7              |
| 2     | #9 Options types             | ☐      | Type safety   | 6              |
| 3     | #11 Composition design       | ☐      | Framework     | New            |
| 3     | #12 Refactor JSON validators | ☐      | ~150          | 5              |
| 3     | #13 Plugin system            | ☐      | Extensibility | New            |
| 4     | #14 Fixture builders         | ☐      | Test quality  | Tests          |
| 4     | #15 Test helpers             | ☐      | Test quality  | Tests          |
| 4     | #16 E2E tests                | ☐      | Coverage      | Tests          |
| 4     | #18 Documentation            | ☐      | DX            | Docs           |

**Legend**: ☐ = Pending | ⧗ = In Progress |  = Complete

> **Update this grid** as you complete tasks by replacing ☐ with 

## Questions?

See detailed task descriptions in the task tracker or refer to:

- `docs/architecture.md` - Current architecture
- `docs/validators.md` - Validator documentation
- `CONTRIBUTING.md` - Contribution guidelines

### Task Tracker Commands

```bash
# View all tasks
/tasks

# Get task details
# Use task IDs from the grid above

# View only unblocked tasks
/tasks | grep pending | grep -v blocked
```text
## Completion Log

Track completed tasks here with dates and notes:

### Phase 1: Quick Wins

- **2026-01-27** - Task #1: Extract environment variable validation utility
  - Created `src/utils/validation-helpers.ts` with shared `validateEnvironmentVariables()` function
  - Updated SettingsValidator and MCPValidator to use shared utility
  - Created comprehensive test suite with 11 test cases
  - Saved ~60 LOC (30 LOC from each validator)
  - All 213 tests passing

### Phase 2: Architecture

<!-- Log Phase 2 completions here -->

### Phase 3: Composition Framework

<!-- Log Phase 3 completions here -->

### Phase 4: Testing Infrastructure

<!-- Log Phase 4 completions here -->
