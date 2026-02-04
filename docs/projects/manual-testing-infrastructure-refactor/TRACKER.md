# Manual Testing Infrastructure Refactor - Tracker

**Status:** Planning
**Started:** 2026-02-04
**Target Completion:** TBD

## Overview

Track progress on refactoring manual testing infrastructure to use realistic fixture projects and proper npm package installation.

**Current Phase:** Phase 0 - Planning
**Completion:** 0/30 tasks (0%)

## Quick Status

| Phase | Tasks | Complete | Status |
|-------|-------|----------|--------|
| Phase 0: Planning | 2 | 0 | Not Started |
| Phase 1: Fixture Projects | 8 | 0 | Not Started |
| Phase 2: Shared Utilities | 3 | 0 | Not Started |
| Phase 3: Update Task 2 | 3 | 0 | Not Started |
| Phase 4: Documentation | 4 | 0 | Not Started |
| Phase 5: Testing & Validation | 5 | 0 | Not Started |
| Phase 6: Remaining Tasks | 3 | 0 | Not Started |
| Phase 7: Cleanup | 2 | 0 | Not Started |
| **Total** | **30** | **0** | **0%** |

---

## Phase 0: Planning & Review

**Goal:** Review and approve approach before implementation

### Tasks

- [ ] **0.1** Review implementation plan
  - Read implementation-plan.md
  - Verify approach is sound
  - Identify any gaps or concerns
  - **Acceptance:** Plan approved by project owner

- [ ] **0.2** Review research findings
  - Read research-findings.md
  - Verify external sources support approach
  - Confirm best practices align with project goals
  - **Acceptance:** Research validated, approach confirmed

**Phase 0 Acceptance Criteria:**

- [ ] All project documentation reviewed
- [ ] Approach validated against best practices
- [ ] Ready to begin implementation

---

## Phase 1: Create Fixture Projects

**Goal:** Create realistic test fixtures that manual tests will use

**Dependencies:** Phase 0 complete

### Tasks

#### 1.1 Primary Fixture Structure

- [ ] **1.1.1** Create fixture directory structure
  - Create `tests/fixtures/projects/react-typescript-bloated/`
  - Create `tests/fixtures/projects/react-typescript-bloated/.expected/`
  - Create `tests/fixtures/projects/react-typescript-bloated/.expected/.claude/rules/`
  - **Acceptance:** Directory structure exists

- [ ] **1.1.2** Create package.json
  - Add React and TypeScript dependencies
  - Include realistic scripts (dev, build, test, lint)
  - Mark as private fixture
  - **Acceptance:** Valid package.json, npm install works

- [ ] **1.1.3** Create tsconfig.json
  - Configure for React + TypeScript
  - Use modern settings (ES2020, strict mode)
  - **Acceptance:** Valid TypeScript configuration

#### 1.2 Fixture Source Code

- [ ] **1.2.1** Create src/App.tsx
  - Minimal but realistic React component
  - Uses TypeScript interfaces
  - Demonstrates basic patterns
  - **Acceptance:** File exists, TypeScript compiles

- [ ] **1.2.2** Create src/index.tsx
  - React root render
  - Imports App component
  - **Acceptance:** File exists, TypeScript compiles

#### 1.3 Bloated CLAUDE.md

- [ ] **1.3.1** Create bloated CLAUDE.md
  - Adapt from `tests/fixtures/manual/bloated-realistic.md`
  - Reference actual files (App.tsx, index.tsx)
  - Include generic React advice (~150 lines)
  - Include TypeScript style rules (~50 lines)
  - Include testing guidelines (~50 lines)
  - Target size: ~12KB (400+ lines)
  - **Acceptance:** File exists, size ~12KB, realistic bloat

#### 1.4 Expected Outputs

- [ ] **1.4.1** Create .expected/CLAUDE.md
  - Optimized version (~3KB, ~150 lines)
  - Only project-specific content
  - References to @import files
  - **Acceptance:** File exists, size ~3KB, well-optimized

- [ ] **1.4.2** Create .expected/.claude/rules/react-patterns.md
  - Generic React patterns extracted
  - 20-30 lines focused on component structure
  - **Acceptance:** File exists, content is generic React advice

- [ ] **1.4.3** Create .expected/.claude/rules/typescript-style.md
  - TypeScript style guide extracted
  - 20-30 lines on TS conventions
  - **Acceptance:** File exists, content is TS style rules

- [ ] **1.4.4** Create .expected/.claude/rules/testing.md
  - Testing guidelines extracted
  - 20-30 lines on test structure
  - **Acceptance:** File exists, content is testing advice

#### 1.5 Documentation

- [ ] **1.5.1** Create fixture README.md
  - Document purpose of fixture
  - List issues present in CLAUDE.md
  - Document expected optimization results
  - Include testing instructions
  - **Acceptance:** README complete, clear, informative

**Phase 1 Acceptance Criteria:**

- [ ] Fixture directory structure complete
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] npm install works in fixture directory
- [ ] CLAUDE.md is ~12KB with realistic bloat
- [ ] Expected outputs created (~3KB optimized + 3 @import files)
- [ ] Fixture README documents everything clearly

---

## Phase 2: Create Shared Utilities

**Goal:** Build reusable scripts for setup/verification

**Dependencies:** Phase 1 complete (need fixture to test against)

### Tasks

- [ ] **2.1** Create scripts/test/manual/lib/ directory
  - **Acceptance:** Directory exists

- [ ] **2.2** Create lib/build-package.sh
  - Runs npm run clean
  - Runs npm run build
  - Runs npm pack
  - Exports PACKAGE_TGZ environment variable
  - Handles errors gracefully
  - **Acceptance:** Script runs, creates .tgz, sets env var

- [ ] **2.3** Create lib/install-in-workspace.sh
  - Takes workspace path and package .tgz as arguments
  - Runs npm install for fixture dependencies
  - Installs claudelint from .tgz
  - Creates plugin.json
  - Validates all steps completed
  - **Acceptance:** Script runs, claudelint installed, plugin.json created

- [ ] **2.4** Create lib/verify-structure.sh
  - Checks CLAUDE.md exists
  - Reports file size
  - Checks for .claude/rules/ directory
  - Counts @import files
  - Validates @import syntax in CLAUDE.md
  - **Acceptance:** Script runs, reports expected information

**Phase 2 Acceptance Criteria:**

- [ ] All 3 shared utility scripts created
- [ ] Scripts have proper error handling
- [ ] Scripts tested manually and work correctly
- [ ] Scripts are documented with usage comments

---

## Phase 3: Update Task 2 Scripts

**Goal:** Refactor Task 2 to use fixtures and npm pack

**Dependencies:** Phases 1 and 2 complete

### Tasks

- [ ] **3.1** Update task-2-optimize-with-skill/setup.sh
  - Source build-package.sh to create .tgz
  - Remove old bloated-realistic.md copy
  - Copy react-typescript-bloated fixture instead
  - Use install-in-workspace.sh for installation
  - Update output messages
  - **Acceptance:** Script runs, creates realistic test workspace

- [ ] **3.2** Update task-2-optimize-with-skill/verify.sh
  - Use verify-structure.sh for common checks
  - Add Task 2 specific checks
  - Compare against .expected/ outputs
  - Report size differences
  - **Acceptance:** Script runs, validates optimization results

- [ ] **3.3** Test Task 2 end-to-end
  - Run setup.sh
  - Manually test in Claude session
  - Run verify.sh
  - Verify results match expectations
  - **Acceptance:** Full Task 2 workflow works correctly

**Phase 3 Acceptance Criteria:**

- [ ] Task 2 setup creates realistic test workspace
- [ ] Claudelint installed via npm pack (not symlink)
- [ ] Manual testing produces meaningful results
- [ ] Verification validates against expected outputs
- [ ] Workflow is repeatable

---

## Phase 4: Update Documentation

**Goal:** Update all documentation to reflect new approach

**Dependencies:** Phase 3 complete (need working example)

### Tasks

- [ ] **4.1** Update docs/testing/manual-testing-runbook.md
  - Add new section: "Understanding Fixture Projects"
  - Update Task 2 section with new workflow
  - Document npm pack installation
  - Update expected outcomes
  - Add troubleshooting for npm installation
  - **Acceptance:** Runbook accurately describes new Task 2 workflow

- [ ] **4.2** Update scripts/test/manual/README.md
  - Document fixture projects approach
  - Document shared utilities in lib/
  - Explain npm pack workflow
  - Update directory structure diagram
  - **Acceptance:** README reflects current architecture

- [ ] **4.3** Create tests/fixtures/projects/README.md
  - Explain purpose of fixture projects
  - Document structure expectations
  - List available fixtures
  - Link to best practices doc
  - **Acceptance:** README created, comprehensive

- [ ] **4.4** Update main tracker (docs/tracker.md)
  - Mark old manual testing approach as deprecated
  - Link to this refactor project
  - Update Phase 5 tasks to reflect new approach
  - **Acceptance:** Main tracker updated

**Phase 4 Acceptance Criteria:**

- [ ] Manual testing runbook updated for new approach
- [ ] All README files reflect current state
- [ ] Documentation is clear and complete
- [ ] No outdated information remains

---

## Phase 5: Testing & Validation

**Goal:** Validate entire workflow works correctly

**Dependencies:** Phases 1-4 complete

### Tasks

- [ ] **5.1** Test fixture project validity
  - Run `cd tests/fixtures/projects/react-typescript-bloated && npm install`
  - Run `npx tsc --noEmit`
  - Verify no errors
  - **Acceptance:** Fixture is a valid TypeScript project

- [ ] **5.2** Test build-package.sh
  - Run script independently
  - Verify .tgz created
  - Verify PACKAGE_TGZ env var set
  - **Acceptance:** Script produces valid package

- [ ] **5.3** Test install-in-workspace.sh
  - Create temp directory with fixture
  - Run install script
  - Verify claudelint installed
  - Verify plugin.json created
  - **Acceptance:** Installation works correctly

- [ ] **5.4** Test full Task 2 workflow
  - Run setup.sh from scratch
  - Open Claude in test workspace
  - Trigger optimize-cc-md skill
  - Verify skill behavior
  - Run verify.sh
  - **Acceptance:** Complete workflow successful

- [ ] **5.5** Test repeatability
  - Run cleanup.sh
  - Run setup.sh again
  - Verify identical results
  - **Acceptance:** Tests are repeatable

**Phase 5 Acceptance Criteria:**

- [ ] All scripts execute without errors
- [ ] Task 2 produces expected optimization results
- [ ] Workflow is repeatable across runs
- [ ] Manual testing provides meaningful validation
- [ ] MVP (Task 2) complete and proven

---

## Phase 6: Expand to Remaining Tasks

**Goal:** Apply new approach to Tasks 1, 3-6

**Dependencies:** Phase 5 complete (MVP proven)

### Tasks

- [ ] **6.1** Evaluate Task 1 (optimize-without-skill)
  - Determine if Task 1 needs fixture project
  - If yes, create minimal fixture or reuse react-typescript-bloated
  - Update Task 1 scripts if needed
  - **Acceptance:** Decision made and implemented

- [ ] **6.2** Plan Tasks 3-6 fixture needs
  - Review each task's requirements
  - Determine which need fixtures
  - Identify if react-typescript-bloated is sufficient
  - Document any new fixtures needed
  - **Acceptance:** Plan created for Tasks 3-6

- [ ] **6.3** Implement fixture-based testing for Tasks 3-6
  - Update setup scripts to use fixtures (if applicable)
  - Update verification scripts
  - Test each task manually
  - **Acceptance:** All applicable tasks use realistic fixtures

**Phase 6 Acceptance Criteria:**

- [ ] All 6 manual tasks reviewed
- [ ] Fixture-based approach applied where appropriate
- [ ] All tasks produce meaningful test results
- [ ] Complete manual test suite is functional

---

## Phase 7: Cleanup & Finalization

**Goal:** Remove old approach, finalize documentation

**Dependencies:** Phase 6 complete

### Tasks

- [ ] **7.1** Deprecate old fixtures
  - Mark `tests/fixtures/manual/` as deprecated
  - Add README pointing to new location
  - Consider moving or archiving old files
  - **Acceptance:** Old fixtures clearly deprecated

- [ ] **7.2** Final documentation review
  - Review all docs for consistency
  - Ensure no references to old approach
  - Update any missed documentation
  - **Acceptance:** All docs accurate and consistent

**Phase 7 Acceptance Criteria:**

- [ ] Old approach fully replaced
- [ ] Documentation complete and accurate
- [ ] No confusion about which approach to use
- [ ] Ready for production manual testing

---

## Changes to Existing Files

### Files to Create

- `tests/fixtures/projects/README.md`
- `tests/fixtures/projects/react-typescript-bloated/README.md`
- `tests/fixtures/projects/react-typescript-bloated/package.json`
- `tests/fixtures/projects/react-typescript-bloated/tsconfig.json`
- `tests/fixtures/projects/react-typescript-bloated/src/App.tsx`
- `tests/fixtures/projects/react-typescript-bloated/src/index.tsx`
- `tests/fixtures/projects/react-typescript-bloated/CLAUDE.md`
- `tests/fixtures/projects/react-typescript-bloated/.expected/CLAUDE.md`
- `tests/fixtures/projects/react-typescript-bloated/.expected/.claude/rules/react-patterns.md`
- `tests/fixtures/projects/react-typescript-bloated/.expected/.claude/rules/typescript-style.md`
- `tests/fixtures/projects/react-typescript-bloated/.expected/.claude/rules/testing.md`
- `scripts/test/manual/lib/build-package.sh`
- `scripts/test/manual/lib/install-in-workspace.sh`
- `scripts/test/manual/lib/verify-structure.sh`

### Files to Modify

- `scripts/test/manual/task-2-optimize-with-skill/setup.sh` - Rewrite to use fixtures and npm pack
- `scripts/test/manual/task-2-optimize-with-skill/verify.sh` - Update to check against .expected/
- `scripts/test/manual/README.md` - Document new approach
- `docs/testing/manual-testing-runbook.md` - Update Task 2 section, add fixture explanation
- `docs/tracker.md` - Link to this project, update Phase 5 tasks

### Files to Deprecate

- `tests/fixtures/manual/bloated-realistic.md` - Add deprecation notice
- `tests/fixtures/manual/bloated-realistic-expected.md` - Add deprecation notice
- `tests/fixtures/manual/README.md` - Add deprecation notice pointing to new location

---

## Blockers & Risks

### Current Blockers

None (Planning phase)

### Identified Risks

1. **TypeScript Compilation**
   - Risk: Fixture project may have TypeScript errors
   - Mitigation: Test compilation early in Phase 1

2. **npm pack Size**
   - Risk: .tgz file may be large or include unnecessary files
   - Mitigation: Review package.json `files` property

3. **Plugin Loading**
   - Risk: Plugin may not load correctly from npm install
   - Mitigation: Test early in Phase 3.3

4. **Time Estimation**
   - Risk: Implementation may take longer than estimated
   - Mitigation: MVP approach (Task 2 only first)

---

## Notes

### Decision Log

**2026-02-04:** Decided to use MVP approach

- Start with Task 2 only
- Prove concept before expanding
- Reduces risk of over-engineering

### Questions

1. Should Task 1 (without-skill) use a fixture project?
   - Defer decision until Phase 6.1
   - Test Task 1 as-is first

2. Do we need multiple fixture projects or can one serve multiple tests?
   - Start with one (react-typescript-bloated)
   - Add more if needed

### Future Enhancements

- Create node-express-api fixture (different project type)
- Create python-project fixture (non-npm ecosystem)
- Create already-optimized fixture (edge case)
- Create existing-imports fixture (edge case)
- Automate comparison against .expected/ outputs
- Add snapshot testing for regression detection

---

## Success Criteria Summary

**MVP (Task 2) Success:**

- [x] Task 2 setup creates realistic test workspace with real code
- [x] Claudelint installed via npm pack (not npm link)
- [x] Test workspace includes React + TypeScript project
- [x] Manual testing produces meaningful, realistic results
- [x] Verification validates against expected outputs
- [x] Workflow is repeatable

**Full Project Success:**

- [ ] All 30 tasks completed
- [ ] All 6 manual tests use appropriate fixtures
- [ ] All documentation updated
- [ ] Old approach fully deprecated
- [ ] Can execute complete manual test suite
- [ ] Results are consistent and reliable

---

## Timeline

**Estimated:** 5-7 hours total

- Phase 0: 0.5 hours (review)
- Phase 1: 2-3 hours (create fixtures)
- Phase 2: 0.5 hours (shared utilities)
- Phase 3: 0.5 hours (update Task 2)
- Phase 4: 1 hour (documentation)
- Phase 5: 1 hour (testing/validation)
- Phase 6: Defer (Tasks 3-6 expansion)
- Phase 7: Defer (cleanup)

**MVP Target:** Phase 0-5 complete (4-6 hours)

---

## Next Actions

1. Review this tracker with project owner
2. Get approval to proceed
3. Begin Phase 0.1: Review implementation plan
4. Begin Phase 1.1.1: Create fixture directory structure
