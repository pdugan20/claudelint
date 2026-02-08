# Manual Testing Infrastructure Refactor - Tracker

**Status:** Archived — MVP Complete (Phases 0-6). Phases 7-8 (cleanup/polish) deferred.
**Started:** 2026-02-04
**MVP Completed:** 2026-02-04
**Archived:** 2026-02-06

## Overview

Track progress on refactoring manual testing infrastructure to use realistic fixture projects and proper npm package installation.

**Current Phase:** Phase 7 - Fixtures Cleanup
**MVP Status:** ✓ Complete (Phases 0-5)
**Phase 6 Status:** ✓ Complete (Test infrastructure ready)
**Completion:** 28/42 tasks (67%)

## Quick Status

| Phase | Tasks | Complete | Status |
|-------|-------|----------|--------|
| Phase 0: Planning | 2 | 2 | ✓ Complete |
| Phase 1: Fixture Projects | 8 | 8 | ✓ Complete |
| Phase 2: Shared Utilities | 3 | 3 | ✓ Complete |
| Phase 3: Update Task 2 | 3 | 3 | ✓ Complete |
| Phase 4: Documentation | 4 | 4 | ✓ Complete |
| Phase 5: Testing & Validation | 5 | 5 | ✓ Complete |
| Phase 6: Remaining Tasks | 3 | 3 | ✓ Complete |
| Phase 7: Fixtures Cleanup | 6 | 0 | Not Started |
| Phase 8: Documentation Improvements | 6 | 0 | Not Started |
| **Total** | **42** | **28** | **67%** |

---

## Phase 0: Planning & Review ✓ COMPLETE

**Goal:** Review and approve approach before implementation

### Tasks

- [x] **0.1** Review implementation plan
  - Read implementation-plan.md
  - Verify approach is sound
  - Identify any gaps or concerns
  - **Acceptance:** Plan approved by project owner

- [x] **0.2** Review research findings
  - Read research-findings.md
  - Verify external sources support approach
  - Confirm best practices align with project goals
  - **Acceptance:** Research validated, approach confirmed

**Phase 0 Acceptance Criteria:**

- [x] All project documentation reviewed
- [x] Approach validated against best practices
- [x] Ready to begin implementation

---

## Phase 1: Create Fixture Projects ✓ COMPLETE

**Goal:** Create realistic test fixtures that manual tests will use

**Dependencies:** Phase 0 complete

### Tasks

#### 1.1 Primary Fixture Structure

- [x] **1.1.1** Create fixture directory structure
  - Create `tests/fixtures/projects/react-typescript-bloated/`
  - Create `tests/fixtures/projects/react-typescript-bloated/.expected/`
  - Create `tests/fixtures/projects/react-typescript-bloated/.expected/.claude/rules/`
  - **Acceptance:** Directory structure exists

- [x] **1.1.2** Create package.json
  - Add React and TypeScript dependencies
  - Include realistic scripts (dev, build, test, lint)
  - Mark as private fixture
  - **Acceptance:** Valid package.json, npm install works

- [x] **1.1.3** Create tsconfig.json
  - Configure for React + TypeScript
  - Use modern settings (ES2020, strict mode)
  - **Acceptance:** Valid TypeScript configuration

#### 1.2 Fixture Source Code

- [x] **1.2.1** Create src/App.tsx
  - Minimal but realistic React component
  - Uses TypeScript interfaces
  - Demonstrates basic patterns
  - **Acceptance:** File exists, TypeScript compiles

- [x] **1.2.2** Create src/index.tsx
  - React root render
  - Imports App component
  - **Acceptance:** File exists, TypeScript compiles

#### 1.3 Bloated CLAUDE.md

- [x] **1.3.1** Create bloated CLAUDE.md
  - Adapt from `tests/fixtures/manual/bloated-realistic.md`
  - Reference actual files (App.tsx, index.tsx)
  - Include generic React advice (~150 lines)
  - Include TypeScript style rules (~50 lines)
  - Include testing guidelines (~50 lines)
  - Target size: ~12KB (400+ lines)
  - **Acceptance:** File exists, size ~12KB, realistic bloat

#### 1.4 Expected Outputs

- [x] **1.4.1** Create .expected/CLAUDE.md
  - Optimized version (~3KB, ~150 lines)
  - Only project-specific content
  - References to @import files
  - **Acceptance:** File exists, size ~3KB, well-optimized

- [x] **1.4.2** Create .expected/.claude/rules/react-patterns.md
  - Generic React patterns extracted
  - 20-30 lines focused on component structure
  - **Acceptance:** File exists, content is generic React advice

- [x] **1.4.3** Create .expected/.claude/rules/typescript-style.md
  - TypeScript style guide extracted
  - 20-30 lines on TS conventions
  - **Acceptance:** File exists, content is TS style rules

- [x] **1.4.4** Create .expected/.claude/rules/testing.md
  - Testing guidelines extracted
  - 20-30 lines on test structure
  - **Acceptance:** File exists, content is testing advice

#### 1.5 Documentation

- [x] **1.5.1** Create fixture README.md
  - Document purpose of fixture
  - List issues present in CLAUDE.md
  - Document expected optimization results
  - Include testing instructions
  - **Acceptance:** README complete, clear, informative

**Phase 1 Acceptance Criteria:**

- [x] Fixture directory structure complete
- [x] TypeScript compiles without errors (`npx tsc --noEmit`)
- [x] npm install works in fixture directory
- [x] CLAUDE.md is ~12KB with realistic bloat
- [x] Expected outputs created (~3KB optimized + 3 @import files)
- [x] Fixture README documents everything clearly

---

## Phase 2: Create Shared Utilities ✓ COMPLETE

**Goal:** Build reusable scripts for setup/verification

**Dependencies:** Phase 1 complete (need fixture to test against)

### Tasks

- [x] **2.1** Create scripts/test/manual/lib/ directory
  - **Acceptance:** Directory exists

- [x] **2.2** Create lib/build-package.sh
  - Runs npm run clean
  - Runs npm run build
  - Runs npm pack
  - Exports PACKAGE_TGZ environment variable
  - Handles errors gracefully
  - **Acceptance:** Script runs, creates .tgz, sets env var

- [x] **2.3** Create lib/install-in-workspace.sh
  - Takes workspace path and package .tgz as arguments
  - Runs npm install for fixture dependencies
  - Installs claudelint from .tgz
  - Creates plugin.json
  - Validates all steps completed
  - **Acceptance:** Script runs, claudelint installed, plugin.json created

- [x] **2.4** Create lib/verify-structure.sh
  - Checks CLAUDE.md exists
  - Reports file size
  - Checks for .claude/rules/ directory
  - Counts @import files
  - Validates @import syntax in CLAUDE.md
  - **Acceptance:** Script runs, reports expected information

**Phase 2 Acceptance Criteria:**

- [x] All 3 shared utility scripts created
- [x] Scripts have proper error handling
- [x] Scripts tested manually and work correctly
- [x] Scripts are documented with usage comments

---

## Phase 3: Update Task 2 Scripts ✓ COMPLETE

**Goal:** Refactor Task 2 to use fixtures and npm pack

**Dependencies:** Phases 1 and 2 complete

### Tasks

- [x] **3.1** Update task-2-optimize-with-skill/setup.sh
  - Source build-package.sh to create .tgz
  - Remove old bloated-realistic.md copy
  - Copy react-typescript-bloated fixture instead
  - Use install-in-workspace.sh for installation
  - Update output messages
  - **Acceptance:** Script runs, creates realistic test workspace

- [x] **3.2** Update task-2-optimize-with-skill/verify.sh
  - Use verify-structure.sh for common checks
  - Add Task 2 specific checks
  - Compare against .expected/ outputs
  - Report size differences
  - **Acceptance:** Script runs, validates optimization results

- [x] **3.3** Test Task 2 end-to-end
  - Run setup.sh
  - Manually test in Claude session
  - Run verify.sh
  - Verify results match expectations
  - **Acceptance:** Full Task 2 workflow works correctly

**Phase 3 Acceptance Criteria:**

- [x] Task 2 setup creates realistic test workspace
- [x] Claudelint installed via npm pack (not symlink)
- [x] Manual testing produces meaningful results
- [x] Verification validates against expected outputs
- [x] Workflow is repeatable

---

## Phase 4: Update Documentation ✓ COMPLETE

**Goal:** Update all documentation to reflect new approach

**Dependencies:** Phase 3 complete (need working example)

### Tasks

- [x] **4.1** Update docs/testing/manual-testing-runbook.md
  - Add new section: "Understanding Fixture Projects"
  - Update Task 2 section with new workflow
  - Document npm pack installation
  - Update expected outcomes
  - Add troubleshooting for npm installation
  - **Acceptance:** Runbook accurately describes new Task 2 workflow

- [x] **4.2** Update scripts/test/manual/README.md
  - Document fixture projects approach
  - Document shared utilities in lib/
  - Explain npm pack workflow
  - Update directory structure diagram
  - **Acceptance:** README reflects current architecture

- [x] **4.3** Create tests/fixtures/projects/README.md
  - Explain purpose of fixture projects
  - Document structure expectations
  - List available fixtures
  - Link to best practices doc
  - **Acceptance:** README created, comprehensive

- [x] **4.4** Update main tracker (docs/tracker.md)
  - Mark old manual testing approach as deprecated
  - Link to this refactor project
  - Update Phase 5 tasks to reflect new approach
  - **Acceptance:** Main tracker updated

**Phase 4 Acceptance Criteria:**

- [x] Manual testing runbook updated for new approach
- [x] All README files reflect current state
- [x] Documentation is clear and complete
- [x] No outdated information remains

---

## Phase 5: Testing & Validation ✓ COMPLETE

**Goal:** Validate entire workflow works correctly

**Dependencies:** Phases 1-4 complete

### Tasks

- [x] **5.1** Test fixture project validity
  - Run `cd tests/fixtures/projects/react-typescript-bloated && npm install`
  - Run `npx tsc --noEmit`
  - Verify no errors
  - **Acceptance:** Fixture is a valid TypeScript project

- [x] **5.2** Test build-package.sh
  - Run script independently
  - Verify .tgz created
  - Verify PACKAGE_TGZ env var set
  - **Acceptance:** Script produces valid package

- [x] **5.3** Test install-in-workspace.sh
  - Create temp directory with fixture
  - Run install script
  - Verify claudelint installed
  - Verify plugin.json created
  - **Acceptance:** Installation works correctly

- [x] **5.4** Test full Task 2 workflow
  - Run setup.sh from scratch
  - Open Claude in test workspace
  - Trigger optimize-cc-md skill
  - Verify skill behavior
  - Run verify.sh
  - **Acceptance:** Complete workflow successful

- [x] **5.5** Test repeatability
  - Run cleanup.sh
  - Run setup.sh again
  - Verify identical results
  - **Acceptance:** Tests are repeatable

**Phase 5 Acceptance Criteria:**

- [x] All scripts execute without errors
- [x] Task 2 produces expected optimization results
- [x] Workflow is repeatable across runs
- [x] Manual testing provides meaningful validation
- [x] MVP (Task 2) complete and proven

---

## Phase 6: Expand to Remaining Tasks ✓ COMPLETE

**Goal:** Apply new approach to Tasks 1, 3-6

**Dependencies:** Phase 5 complete (MVP proven)

### Tasks

- [x] **6.1** Evaluate Task 1 (optimize-without-skill)
  - Determined Task 1 needs fixture project (same reason as Task 2)
  - Decided to reuse react-typescript-bloated (same scenario, different conditions)
  - Updated setup.sh to copy entire project + npm install
  - Updated verify.sh with baseline-focused messaging
  - Key difference from Task 2: NO plugin, NO skill (tests natural workflow)
  - **Acceptance:** Decision made and implemented ✓

- [x] **6.2** Plan Tasks 3-6 fixture needs
  - **Task 3 (Trigger Phrases)**: NO fixture needed - tests if skills trigger correctly
  - **Task 4 (Functional Testing)**: Uses EXISTING test fixtures (tests/fixtures/claude-md/) - NO new fixture needed
  - **Task 5 (Quality/UX)**: NO fixture needed - tests conversational quality, not project files
  - **Task 6 (Plugin Install)**: Can test in claudelint repo itself or use react-typescript-bloated - NO new fixture needed
  - **Conclusion**: react-typescript-bloated is sufficient for all tasks that need projects (Tasks 1-2)
  - Tasks 3-6 don't need realistic project fixtures
  - **Acceptance:** Plan created for Tasks 3-6 ✓

- [x] **6.3** Implement fixture-based testing for Tasks 3-6
  - **Task 3**: No changes needed (trigger testing, no fixtures required)
  - **Task 4**: Updated setup.sh to use react-typescript-bloated for optimize test
  - **Task 5**: No changes needed (quality testing, any context works)
  - **Task 6**: No changes needed (tests in repo itself)
  - Tested Task 4 setup script successfully
  - **Acceptance:** All applicable tasks use realistic fixtures ✓

**Phase 6 Acceptance Criteria:**

- [x] All 6 manual tasks reviewed
- [x] Fixture-based approach applied where appropriate
- [x] All tasks produce meaningful test results
- [x] Complete manual test suite is functional

---

## Phase 7: Fixtures Cleanup

**Goal:** Clean up deprecated and unused fixtures, improve documentation

**Dependencies:** Phase 6 complete (Task 1 must be updated first)

**Based on:** tests/fixtures/ASSESSMENT.md findings

### Tasks

- [ ] **7.1** Investigate and remove unused skills/ fixtures
  - Check if skills/ fixtures were supposed to be used
  - Search codebase for any references (found: 0)
  - If truly unused, remove the directory
  - Document decision in ASSESSMENT.md
  - **Acceptance:** skills/ fixtures either in use or removed

- [ ] **7.2** Add deprecation notice to manual/README.md
  - Add clear DEPRECATED header
  - Point to new location (tests/fixtures/projects/)
  - Link to migration guide
  - Explain why it's deprecated
  - **Acceptance:** Clear deprecation notice added

- [ ] **7.3** Create claude-md/README.md
  - Document what each fixture tests
  - Explain naming conventions
  - List which tests use which fixtures
  - Add usage examples
  - **Acceptance:** claude-md/ fixtures documented

- [ ] **7.4** Update Task 1 to use projects/ fixtures
  - Task 1 currently uses deprecated manual/ fixtures
  - Update setup.sh to use react-typescript-bloated
  - Update verify.sh to use new structure
  - Test Task 1 workflow with new approach
  - **Acceptance:** Task 1 uses projects/ fixtures successfully

- [ ] **7.5** Add top-level tests/fixtures/README.md
  - Overview of all fixture directories
  - Explain organization strategy
  - Link to individual fixture READMEs
  - Document best practices for adding fixtures
  - **Acceptance:** Top-level fixtures README created

- [ ] **7.6** Remove manual/ directory
  - Verify Task 1 no longer needs it
  - Remove tests/fixtures/manual/ completely
  - Update any remaining references in docs
  - **Acceptance:** manual/ directory removed, no broken references

**Phase 7 Acceptance Criteria:**

- [ ] All unused fixtures removed or documented
- [ ] All fixture directories have READMEs
- [ ] Deprecated fixtures clearly marked or removed
- [ ] Task 1 uses new fixture approach
- [ ] No confusion about fixture organization
- [ ] Fixtures directory follows industry best practices

---

## Phase 8: Documentation Improvements

**Goal:** Enhance documentation quality and consistency

**Dependencies:** Phase 7 complete

**Based on:** ASSESSMENT.md recommendations and lessons learned

### Tasks

- [ ] **8.1** Review fixture documentation for consistency
  - Check all fixture READMEs use same format
  - Ensure naming conventions are consistent
  - Verify all fixtures document their purpose clearly
  - Check links between documents work correctly
  - **Acceptance:** All fixture docs follow consistent format

- [ ] **8.2** Document fixture usage patterns
  - Add section to tests/fixtures/README.md on when to use which fixture
  - Document the difference between claude-md/, custom-rules/, and projects/
  - Explain fixture selection guidelines
  - Provide decision tree for choosing fixtures
  - **Acceptance:** Clear guidance on fixture usage

- [ ] **8.3** Add examples for creating new fixtures
  - Document process for creating new project fixtures
  - Provide template for fixture READMEs
  - Show example of hyper-targeted fixture
  - Document .expected/ directory conventions
  - **Acceptance:** Creating new fixtures is well-documented

- [ ] **8.4** Update best-practices.md with lessons learned
  - Add section on what worked well
  - Document issues encountered and solutions
  - Add tips for avoiding common pitfalls
  - Include examples from MVP implementation
  - **Acceptance:** Best practices updated with real experience

- [ ] **8.5** Consolidate and organize project documentation
  - Review all docs in docs/projects/manual-testing-infrastructure-refactor/
  - Remove redundancy between documents
  - Ensure clear navigation between docs
  - Update README.md with better structure
  - **Acceptance:** Project docs are well-organized and easy to navigate

- [ ] **8.6** Final documentation review
  - Spell check all documentation
  - Verify all code examples work
  - Check all links are valid
  - Ensure markdown formatting is correct
  - Run through complete workflow following docs
  - **Acceptance:** All documentation polished and accurate

**Phase 8 Acceptance Criteria:**

- [ ] All documentation follows consistent formatting
- [ ] No broken links or references
- [ ] New contributors can understand fixture organization
- [ ] Creating new fixtures is straightforward
- [ ] Lessons learned are documented
- [ ] Ready for long-term maintenance

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

- [ ] All 42 tasks completed
- [ ] All 6 manual tests use appropriate fixtures
- [ ] All documentation updated
- [ ] Old approach fully deprecated
- [ ] All unused fixtures removed or documented
- [ ] Can execute complete manual test suite
- [ ] Results are consistent and reliable

---

## Timeline

**MVP Complete:** Phase 0-5 (completed 2026-02-04)

**Remaining Phases:**

- Phase 6: TBD (expand to remaining manual tasks)
- Phase 7: TBD (fixtures cleanup - 6 tasks)
- Phase 8: TBD (documentation improvements - 6 tasks)

**Notes:**

- MVP took approximately 4-6 hours as estimated
- Phase 6-8 deferred until MVP proven successful
- Cleanup phases (7-8) can be done incrementally

---

## Next Actions

**MVP COMPLETE** - Phases 0-5 finished and committed.

**Current Status:**

- Task 2 (optimize-with-skill) now uses realistic fixture approach
- All MVP documentation complete
- All scripts tested and working

**Relationship to Parent Project:**

This project is a **sub-project** of `docs/projects/plugin-and-md-management/`, which broke out when we discovered the manual testing approach was fundamentally broken. The parent project has deferred manual testing tasks (Task 5.2-5.3) that depend on this infrastructure.

**Recommended Workflow (Interleaved):**

1. **Phase 6** (this project) - Expand infrastructure to Tasks 1, 3-6
   - Update Task 1 to use fixture projects
   - Evaluate Tasks 3-6 fixture needs
   - Get complete testing infrastructure ready

2. **Task 5.2-5.3** (parent project) - Execute all manual testing
   - Use infrastructure built in Phase 6
   - Test all 9 skills across 6 manual test scenarios
   - Document results

3. **Phase 7-8** (this project) - Cleanup informed by testing
   - Remove unused/deprecated fixtures
   - Improve documentation based on learnings
   - Final polish

4. **Task 5.4-5.5** (parent project) - Version bump and release

**Why This Order:**

- Phase 6 builds complete test infrastructure (prerequisite for parent Task 5.2)
- Parent Task 5.2-5.3 uses infrastructure and reveals what works/doesn't
- Phase 7-8 cleanup informed by actual usage (not speculation)
- Final release after everything validated

**Next Immediate Step:** Begin Phase 6.1 (evaluate Task 1 fixture needs)
