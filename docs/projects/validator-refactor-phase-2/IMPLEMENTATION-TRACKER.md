# Phase 2 Implementation Tracker

**Last Updated:** 2026-01-29
**Status:** Not Started

## Overall Progress

- [X] Phase 2.0: Infrastructure (6/6 tasks) COMPLETE
- [X] Phase 2.1: Ghost Rule Audit (4/4 tasks) COMPLETE
- [X] Phase 2.2: Convert Ghost Rules (2/7 tasks - MCP & Claude.md COMPLETE)
- [ ] Phase 2.3: Implement Rule Discovery (0/10 tasks)
- [ ] Phase 2.4: Extract Common Patterns (0/5 tasks)
- [ ] Phase 2.5: Testing & Validation (0/10 tasks)

**Total:** 12/44 tasks complete (27%)

**Phase 2.2 Progress:**
- [DONE] MCP Validator: 13 rules created, 162 lines removed, 23 tests passing
- [DONE] Claude.md Validator: 6 rules fixed, 247 lines removed, 18 tests passing
- [TODO] Skills, Agents, Plugin, Hooks, Settings, Output-styles validators remaining

---

## Phase 2.0: Infrastructure Setup

**Goal:** Create patterns and utilities for migration
**Estimated Time:** 2-3 hours
**Status:** Not Started

### Tasks

- [X] **Task 2.0.1:** Enhance RuleRegistry with category-based discovery
  - **File:** `src/utils/rule-registry.ts`
  - **Action:** Add `getRulesByCategory(category: RuleCategory): Rule[]` method
  - **Action:** Add `getRulesForValidator(validatorId: string): Rule[]` method
  - **Action:** Add rule caching to improve performance
  - **Estimated Time:** 30 minutes
  - **Dependencies:** None
  - **Assigned To:** Claude
  - **Completion Date:** 2026-01-29

- [X] **Task 2.0.2:** Create executeRulesForCategory() in BaseValidator
  - **File:** `src/validators/base.ts`
  - **Action:** Add `protected async executeRulesForCategory(category, filePath, content)` method
  - **Action:** Method should query RuleRegistry and execute all matching rules
  - **Action:** Handle config checks automatically
  - **Estimated Time:** 45 minutes
  - **Dependencies:** Task 2.0.1
  - **Assigned To:** Claude
  - **Completion Date:** 2026-01-29

- [X] **Task 2.0.3:** Add frontmatter validation abstraction
  - **File:** `src/validators/base.ts`
  - **Action:** Add `protected async validateFrontmatterWithNameCheck<T>()` method
  - **Action:** Consolidates agent/skill/output-style frontmatter patterns
  - **Action:** Handles name matching, schema validation, result merging
  - **Estimated Time:** 45 minutes
  - **Dependencies:** None
  - **Assigned To:** Claude
  - **Completion Date:** 2026-01-29

- [X] **Task 2.0.4:** Add body content validation abstraction
  - **File:** `src/validators/base.ts`
  - **Action:** Add `protected validateBodyContentStructure()` method
  - **Action:** Configurable min length and required sections
  - **Action:** Replace duplicate patterns in agents/skills/output-styles
  - **Estimated Time:** 30 minutes
  - **Dependencies:** None
  - **Assigned To:** Claude
  - **Completion Date:** 2026-01-29

- [X] **Task 2.0.5:** Add file walking abstraction
  - **File:** `src/validators/base.ts`
  - **Action:** Add `protected async validateFilesInDirectory()` method
  - **Action:** Generic pattern for directory traversal + validation
  - **Action:** Handles optional vs required gracefully
  - **Estimated Time:** 30 minutes
  - **Dependencies:** None
  - **Assigned To:** Claude
  - **Completion Date:** 2026-01-29

- [X] **Task 2.0.6:** Document migration patterns
  - **File:** `docs/projects/validator-refactor-phase-2/MIGRATION-GUIDE.md`
  - **Action:** Write guide for converting ghost rules to real rules
  - **Action:** Include code examples and decision tree
  - **Action:** Document edge cases and exceptions
  - **Estimated Time:** 30 minutes
  - **Dependencies:** None
  - **Assigned To:** Claude (completed in planning phase)
  - **Completion Date:** 2026-01-29

---

## Phase 2.1: Ghost Rule Audit

**Goal:** Identify and categorize all ghost rules
**Estimated Time:** 1-2 hours
**Status:** Not Started

### Tasks

- [X] **Task 2.1.1:** Audit MCP validator for ghost rules
  - **File:** `src/validators/mcp.ts`
  - **Action:** Find all `reportError`/`reportWarning` calls without ruleId
  - **Action:** Categorize by type (schema, transport, env vars, etc.)
  - **Action:** Document in GHOST-RULES-AUDIT.md
  - **Estimated Time:** 20 minutes
  - **Dependencies:** None
  - **Assigned To:** Claude (completed in planning phase)
  - **Completion Date:** 2026-01-29

- [X] **Task 2.1.2:** Audit all other validators for ghost rules
  - **Files:** `src/validators/{claude-md,skills,agents,plugin,hooks,settings,commands,output-styles,lsp}.ts`
  - **Action:** Find all ghost rules in remaining validators
  - **Action:** Categorize by validation type
  - **Action:** Rate migration difficulty (easy/medium/hard)
  - **Estimated Time:** 1 hour
  - **Dependencies:** None
  - **Assigned To:** Claude (completed in planning phase)
  - **Completion Date:** 2026-01-29

- [X] **Task 2.1.3:** Audit utility functions for ghost validations
  - **File:** `src/utils/validation-helpers.ts`
  - **Action:** Check if utility functions return issues without ruleIds
  - **Action:** Identify which need to be converted to rules
  - **Action:** Document in GHOST-RULES-AUDIT.md
  - **Estimated Time:** 15 minutes
  - **Dependencies:** None
  - **Assigned To:** Claude (completed in planning phase)
  - **Completion Date:** 2026-01-29

- [X] **Task 2.1.4:** Identify edge cases and exceptions
  - **Files:** Various
  - **Action:** Document validations that might not fit rule pattern
  - **Action:** Propose alternatives for each exception
  - **Action:** Get approval for exception handling approach
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Tasks 2.1.1, 2.1.2, 2.1.3
  - **Assigned To:** Claude (completed in planning phase, documented in MIGRATION-GUIDE.md)
  - **Completion Date:** 2026-01-29

---

## Phase 2.2: Convert Ghost Rules to Real Rules

**Goal:** Create rule files with ALL validation logic, remove ALL validation logic from validators
**Estimated Time:** 4-6 hours
**Status:** In Progress
**CRITICAL:** Validation logic MUST be in rule files, NOT in validators. Validators should ONLY orchestrate.

### Tasks

- [X] **Task 2.2.1:** Create MCP ghost rules (~10 rules) AND remove validation from validator
  - **Files:** `src/rules/mcp/*.ts`, `src/validators/mcp.ts`
  - **Action:** Convert stdio transport validation to rule WITH full validation logic ✓
  - **Action:** Convert SSE transport validation to rule WITH full validation logic ✓
  - **Action:** Convert HTTP transport validation to rule WITH full validation logic ✓
  - **Action:** Convert WebSocket transport validation to rule WITH full validation logic ✓
  - **Action:** Convert env var naming to rule (from utility function) ✓
  - **Action:** Convert env var empty value to rule (from utility function) ✓
  - **Action:** Convert env var secret detection to rule (from utility function) ✓
  - **Action:** Convert simple var expansion warning to rule ✓
  - **Action:** REMOVE ALL validation logic from src/validators/mcp.ts ✓
  - **Action:** REMOVE ALL reportError/reportWarning calls from src/validators/mcp.ts ✓
  - **Action:** DELETE validation methods from mcp.ts (validateStdioTransport, etc.) ✓
  - **Action:** Update rule-ids.ts with new IDs ✓
  - **Estimated Time:** 1.5 hours
  - **Dependencies:** Task 2.1.1
  - **Assigned To:** Claude
  - **Completion Date:** 2026-01-29 COMPLETE
  - **Notes:** Created 13 MCP rules with full validation logic. Removed 162 lines from validator (218→56 lines). Zero reportError/reportWarning calls. Pure orchestration pattern. All 23 tests passing.

- [X] **Task 2.2.2:** Create Claude.md ghost rules (~8 rules) AND remove validation from validator
  - **Files:** `src/rules/claude-md/*.ts`, `src/validators/claude-md.ts`
  - **Action:** Convert file not found to rule WITH full validation logic ✓
  - **Action:** Convert import validation to rules WITH full validation logic ✓
  - **Action:** Convert circular import checks to rule WITH full validation logic ✓
  - **Action:** Convert case-sensitive filename collision to rule WITH full validation logic ✓
  - **Action:** Convert import read failures to rule WITH full validation logic ✓
  - **Action:** Convert import depth checking to rule WITH full validation logic ✓
  - **Action:** REMOVE ALL validation logic from src/validators/claude-md.ts ✓
  - **Action:** REMOVE ALL reportError/reportWarning calls from src/validators/claude-md.ts ✓
  - **Action:** DELETE validation methods (checkImports, checkCaseSensitivity, checkSymlinkCycle) ✓
  - **Action:** Update rule-ids.ts with new IDs ✓
  - **Estimated Time:** 1 hour
  - **Dependencies:** Task 2.1.2
  - **Assigned To:** Claude
  - **Completion Date:** 2026-01-29 COMPLETE
  - **Notes:** Fixed 6 Claude.md rules with full cross-file validation logic (import-missing, import-circular, import-depth-exceeded, import-read-failed, filename-case-sensitive, file-not-found). Removed 247 lines from validator (362→115 lines). Zero reportError/reportWarning calls. Pure orchestration pattern. All 18 tests passing.

- [ ] **Task 2.2.3:** Create Skills ghost rules (~12 rules) AND remove validation from validator
  - **Files:** `src/rules/skills/*.ts`, `src/validators/skills.ts`
  - **Action:** Convert "no skills found" warning to rule WITH full validation logic
  - **Action:** Convert SKILL.md not found to rule WITH full validation logic
  - **Action:** Convert name mismatch to rule WITH full validation logic
  - **Action:** Convert body content checks to rules WITH full validation logic
  - **Action:** Convert documentation checks to rules WITH full validation logic
  - **Action:** REMOVE ALL validation logic from src/validators/skills.ts
  - **Action:** REMOVE ALL reportError/reportWarning calls from src/validators/skills.ts
  - **Action:** DELETE validation methods that only contained validation logic
  - **Action:** Update rule-ids.ts with new IDs
  - **Estimated Time:** 1.5 hours
  - **Dependencies:** Task 2.1.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.2.4:** Create Agents ghost rules (~6 rules) AND remove validation from validator
  - **Files:** `src/rules/agents/*.ts`, `src/validators/agents.ts`
  - **Action:** Convert "no agents found" warning to rule WITH full validation logic
  - **Action:** Convert AGENT.md not found to rule WITH full validation logic
  - **Action:** Convert name mismatch to rule WITH full validation logic
  - **Action:** Convert body content checks to rules WITH full validation logic
  - **Action:** REMOVE ALL validation logic from src/validators/agents.ts
  - **Action:** REMOVE ALL reportError/reportWarning calls from src/validators/agents.ts
  - **Action:** DELETE validation methods that only contained validation logic
  - **Action:** Update rule-ids.ts with new IDs
  - **Estimated Time:** 45 minutes
  - **Dependencies:** Task 2.1.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.2.5:** Create remaining validator ghost rules (~8 rules) AND remove validation from validators
  - **Files:** `src/rules/{plugin,hooks,settings,output-styles,lsp}/*.ts`, `src/validators/{plugin,hooks,settings,output-styles,lsp}.ts`
  - **Action:** Convert plugin ghost rules WITH full validation logic
  - **Action:** Convert hooks ghost rules WITH full validation logic
  - **Action:** Convert settings ghost rules WITH full validation logic
  - **Action:** Convert output-styles ghost rules WITH full validation logic
  - **Action:** Convert LSP ghost rules WITH full validation logic
  - **Action:** REMOVE ALL validation logic from ALL affected validators
  - **Action:** REMOVE ALL reportError/reportWarning calls from ALL affected validators
  - **Action:** DELETE validation methods that only contained validation logic
  - **Action:** Update rule-ids.ts with new IDs
  - **Estimated Time:** 1 hour
  - **Dependencies:** Task 2.1.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.2.6:** Update rule-ids.ts and regenerate types
  - **File:** `src/rules/rule-ids.ts`
  - **Action:** Add all new rule IDs from tasks 2.2.1-2.2.5
  - **Action:** Run `npm run generate:types` to regenerate
  - **Action:** Verify all new IDs are in the union type
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Tasks 2.2.1-2.2.5
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.2.7:** Create rule documentation for new rules
  - **Files:** `docs/rules/{category}/{rule-id}.md`
  - **Action:** Create documentation for each new rule
  - **Action:** Follow existing documentation template
  - **Action:** Include examples for each rule
  - **Estimated Time:** 2 hours
  - **Dependencies:** Tasks 2.2.1-2.2.5
  - **Assigned To:** TBD
  - **Completion Date:** TBD

---

## Phase 2.3: Implement Rule Discovery & Deprecate Ghost Methods

**Goal:** Remove manual rule imports, verify zero validation logic in validators, deprecate reportError/reportWarning
**Estimated Time:** 2-3 hours
**Status:** Not Started

### Tasks

- [ ] **Task 2.3.1:** Refactor claude-md.ts to use discovery
  - **File:** `src/validators/claude-md.ts`
  - **Action:** Remove 6 manual rule imports (lines 28-33)
  - **Action:** Replace executeRule calls with executeRulesForCategory('CLAUDE.md')
  - **Action:** Remove import comments about "pilot migration"
  - **Action:** Test all validations still work
  - **Estimated Time:** 20 minutes
  - **Dependencies:** Tasks 2.0.2, 2.2.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.3.2:** Refactor skills.ts to use discovery
  - **File:** `src/validators/skills.ts`
  - **Action:** Remove 14 manual rule imports (lines 31-44)
  - **Action:** Replace executeRule calls with executeRulesForCategory('Skills')
  - **Action:** Test all validations still work
  - **Estimated Time:** 25 minutes
  - **Dependencies:** Tasks 2.0.2, 2.2.3
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.3.3:** Refactor plugin.ts to use discovery
  - **File:** `src/validators/plugin.ts`
  - **Action:** Remove 6 manual rule imports (lines 13-18)
  - **Action:** Replace executeRule calls with executeRulesForCategory('Plugin')
  - **Action:** Test all validations still work
  - **Estimated Time:** 20 minutes
  - **Dependencies:** Tasks 2.0.2, 2.2.5
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.3.4:** Refactor mcp.ts to use discovery
  - **File:** `src/validators/mcp.ts`
  - **Action:** Remove 3 manual rule imports (lines 18-20)
  - **Action:** Remove validateEnvironmentVariables method (replaced by rule)
  - **Action:** Replace executeRule calls with executeRulesForCategory('MCP')
  - **Action:** Test all validations still work
  - **Estimated Time:** 25 minutes
  - **Dependencies:** Tasks 2.0.2, 2.2.1
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.3.5:** Refactor hooks.ts to use discovery
  - **File:** `src/validators/hooks.ts`
  - **Action:** Remove 3 manual rule imports (lines 12-14)
  - **Action:** Replace executeRule calls with executeRulesForCategory('Hooks')
  - **Action:** Test all validations still work
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Tasks 2.0.2, 2.2.5
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.3.6:** Refactor settings.ts to use discovery
  - **File:** `src/validators/settings.ts`
  - **Action:** Remove 4 manual rule imports (lines 15-18)
  - **Action:** Replace executeRule calls with executeRulesForCategory('Settings')
  - **Action:** Test all validations still work
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Tasks 2.0.2, 2.2.5
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.3.7:** Refactor commands.ts to use discovery
  - **File:** `src/validators/commands.ts`
  - **Action:** Remove 2 manual rule imports (lines 8-9)
  - **Action:** Replace executeRule calls with executeRulesForCategory('Commands')
  - **Action:** Test all validations still work
  - **Estimated Time:** 10 minutes
  - **Dependencies:** Tasks 2.0.2, 2.2.5
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.3.8:** Verify zero manual imports remain
  - **Files:** All validator files
  - **Action:** Run `grep -r "from '../rules/" src/validators/` - should return 0 results
  - **Action:** Verify all validators use executeRulesForCategory pattern
  - **Action:** Document the new pattern in architecture.md
  - **Estimated Time:** 10 minutes
  - **Dependencies:** Tasks 2.3.1-2.3.7
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.3.9:** Verify zero reportError/reportWarning calls in validators
  - **Files:** All validator files
  - **Action:** Run `grep -r "reportError\|reportWarning" src/validators/` (excluding base.ts)
  - **Action:** Should return 0 results (all validation in rules)
  - **Action:** Verify validators only call executeRulesForCategory()
  - **Action:** Document findings - any remaining calls need to be converted to rules
  - **Estimated Time:** 10 minutes
  - **Dependencies:** Tasks 2.2.3-2.2.5, 2.3.1-2.3.7
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.3.10:** Mark reportError/reportWarning as @deprecated in base.ts
  - **File:** `src/validators/base.ts`
  - **Action:** Add @deprecated JSDoc tags to reportError() method
  - **Action:** Add @deprecated JSDoc tags to reportWarning() method
  - **Action:** Add deprecation message: "Use rules with context.report() instead. This method will be removed in next major version."
  - **Action:** Document that these methods are for backward compatibility only
  - **Estimated Time:** 10 minutes
  - **Dependencies:** Task 2.3.9
  - **Assigned To:** TBD
  - **Completion Date:** TBD

---

## Phase 2.4: Extract Common Patterns

**Goal:** Remove code duplication through abstraction
**Estimated Time:** 2-3 hours
**Status:** Not Started

### Tasks

- [ ] **Task 2.4.1:** Refactor agents.ts to use abstractions
  - **File:** `src/validators/agents.ts`
  - **Action:** Replace validateFrontmatter with base class method
  - **Action:** Replace validateBodyContent with base class method
  - **Action:** Replace findAgentDirs filtering with base class method
  - **Action:** Verify all tests pass
  - **Estimated Time:** 45 minutes
  - **Dependencies:** Tasks 2.0.3, 2.0.4, 2.0.5
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.4.2:** Refactor skills.ts to use abstractions
  - **File:** `src/validators/skills.ts`
  - **Action:** Replace validateFrontmatter with base class method
  - **Action:** Replace file walking patterns with validateFilesInDirectory
  - **Action:** Replace findSkillDirs filtering with base class method
  - **Action:** Verify all tests pass
  - **Estimated Time:** 1 hour
  - **Dependencies:** Tasks 2.0.3, 2.0.5
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.4.3:** Refactor output-styles.ts to use abstractions
  - **File:** `src/validators/output-styles.ts`
  - **Action:** Replace validateFrontmatter with base class method
  - **Action:** Replace validateBodyContent with base class method
  - **Action:** Replace directory filtering with base class method
  - **Action:** Verify all tests pass
  - **Estimated Time:** 30 minutes
  - **Dependencies:** Tasks 2.0.3, 2.0.4, 2.0.5
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.4.4:** Unify error handling across validators
  - **Files:** All validators
  - **Action:** Replace try/catch with optional check patterns using tryReadDirectory
  - **Action:** Remove duplicate error handling code
  - **Action:** Ensure consistent user-facing error messages
  - **Estimated Time:** 45 minutes
  - **Dependencies:** Task 2.0.5
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.4.5:** Remove dead code and clean up comments
  - **Files:** All validators
  - **Action:** Remove "NEW:" and "OLD:" migration comments
  - **Action:** Remove deprecated isRuleDisabled() method from base.ts
  - **Action:** Remove await Promise.resolve() anti-patterns
  - **Action:** Clean up imports
  - **Estimated Time:** 30 minutes
  - **Dependencies:** Tasks 2.4.1-2.4.4
  - **Assigned To:** TBD
  - **Completion Date:** TBD

---

## Phase 2.5: Testing & Validation

**Goal:** Ensure nothing broke and documentation is complete
**Estimated Time:** 2.5-3 hours
**Status:** Not Started

### Tasks

- [ ] **Task 2.5.1:** Run full test suite
  - **Command:** `npm test`
  - **Action:** Verify all 688+ tests pass
  - **Action:** Fix any failing tests
  - **Action:** Document any expected test changes
  - **Estimated Time:** 30 minutes
  - **Dependencies:** All previous phases
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.2:** Test config disable for new rules
  - **Action:** Create test `.claudelintrc.json` with new rules disabled
  - **Action:** Verify validations are actually skipped
  - **Action:** Test with multiple validators
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Phase 2.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.3:** Test config severity override
  - **Action:** Create test config with severity overrides for new rules
  - **Action:** Verify warnings become errors and vice versa
  - **Action:** Test with multiple validators
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Phase 2.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.4:** Test rule options
  - **Action:** For rules with options, test custom configuration
  - **Action:** Verify schema validation rejects invalid options
  - **Action:** Verify default options work correctly
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Phase 2.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.5:** Manual validation of each validator
  - **Action:** Run each validator against real test fixtures
  - **Action:** Verify all expected issues are reported
  - **Action:** Verify no false positives
  - **Estimated Time:** 20 minutes
  - **Dependencies:** All previous phases
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.6:** Performance testing
  - **Action:** Benchmark rule execution time before/after
  - **Action:** Verify no significant performance regression
  - **Action:** Document any performance improvements
  - **Estimated Time:** 15 minutes
  - **Dependencies:** All previous phases
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.6.5:** Verify zero reportError/reportWarning usage and remove methods
  - **File:** `src/validators/base.ts`
  - **Action:** Run `grep -r "reportError\|reportWarning" src/validators/` one final time
  - **Action:** Verify ZERO results (except method definitions in base.ts)
  - **Action:** REMOVE reportError() method entirely from base.ts
  - **Action:** REMOVE reportWarning() method entirely from base.ts
  - **Action:** Update any tests that referenced these methods
  - **Action:** Verify all 688+ tests still pass after removal
  - **Estimated Time:** 20 minutes
  - **Dependencies:** Tasks 2.5.1-2.5.5, 2.3.9, 2.3.10
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.7:** Write user migration guide
  - **File:** `docs/USER-MIGRATION-GUIDE.md` (new)
  - **Action:** Document which validations are now configurable
  - **Action:** Show how to disable new rules in `.claudelintrc.json`
  - **Action:** Explain severity changes and how to override
  - **Action:** List all 44+ new rule IDs for reference
  - **Estimated Time:** 30 minutes
  - **Dependencies:** All previous phases
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.8:** Update CHANGELOG.md with breaking changes
  - **File:** `CHANGELOG.md`
  - **Action:** Document all new rules added (44+)
  - **Action:** List any behavior changes from ghost rule conversion
  - **Action:** Add migration instructions reference
  - **Action:** Note removal of deprecated methods if applicable
  - **Estimated Time:** 20 minutes
  - **Dependencies:** Task 2.5.7
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.9:** Update contributing guide with new patterns
  - **File:** `docs/CONTRIBUTING.md` or `docs/plugin-development.md`
  - **Action:** Document RuleRegistry.getRulesByCategory() pattern
  - **Action:** Document executeRulesForCategory() usage
  - **Action:** Add examples of proper rule discovery
  - **Action:** Update "Adding a New Rule" section if needed
  - **Estimated Time:** 20 minutes
  - **Dependencies:** All previous phases
  - **Assigned To:** TBD
  - **Completion Date:** TBD

---

## Completion Checklist

### Code Quality
- [ ] Zero `reportError`/`reportWarning` calls in validators (methods removed entirely)
- [ ] Zero validation logic in validators (all logic in rules)
- [ ] Zero manual rule imports in validators
- [ ] No code duplication in validation patterns
- [ ] All validators use consistent error handling
- [ ] Validators are pure orchestrators (find files, execute rules, return results)

### Functionality
- [ ] All 688+ tests passing
- [ ] All validations still work correctly
- [ ] Config system works for all rules
- [ ] No breaking changes to user-facing APIs

### Documentation
- [ ] All new rules documented in docs/rules/
- [ ] MIGRATION-GUIDE.md completed
- [ ] PATTERNS.md completed
- [ ] Architecture.md updated
- [ ] CHANGELOG.md updated

### User Experience
- [ ] All rules configurable via `.claudelintrc.json`
- [ ] Error messages unchanged (or improved)
- [ ] Performance same or better
- [ ] No unexpected behavior changes

---

## Notes

### Completed Tasks
_None yet_

### Blockers
_None yet_

### Decisions Made

**2026-01-29: Architectural Correction - All Validation Logic Must Be In Rules**

Initial implementation (Tasks 2.2.1 and 2.2.2) incorrectly:
- Added ruleIds to reportError/reportWarning calls in validators
- Kept validation logic in validators
- Created stub rules with empty validate() functions

This was architecturally wrong because:
- Users still couldn't disable validations (logic in validators, not rules)
- Validators still contained validation logic (not pure orchestrators)
- reportError/reportWarning still being called from validators

**Correct approach:**
1. ALL validation logic goes in rule files' validate() functions
2. Validators ONLY orchestrate (find files, executeRulesForCategory, return results)
3. ZERO reportError/reportWarning calls in validators
4. reportError/reportWarning methods will be deprecated then removed entirely
5. This matches ESLint-style rule architecture

**Impact:**
- Tasks 2.2.1 and 2.2.2 need rework
- All remaining Phase 2.2 tasks must follow correct pattern
- Documentation updated to reflect correct architecture (MASTER-PLAN.md, MIGRATION-GUIDE.md, PATTERNS.md, IMPLEMENTATION-TRACKER.md)

### Questions/Issues
_None yet_
