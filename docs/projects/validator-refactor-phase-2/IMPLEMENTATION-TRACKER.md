# Phase 2 Implementation Tracker

**Last Updated:** 2026-01-29
**Status:** Not Started

## Overall Progress

- [ ] Phase 2.0: Infrastructure (0/6 tasks)
- [ ] Phase 2.1: Ghost Rule Audit (0/4 tasks)
- [ ] Phase 2.2: Convert Ghost Rules (0/7 tasks)
- [ ] Phase 2.3: Implement Rule Discovery (0/8 tasks)
- [ ] Phase 2.4: Extract Common Patterns (0/5 tasks)
- [ ] Phase 2.5: Testing & Validation (0/6 tasks)

**Total:** 0/36 tasks complete (0%)

---

## Phase 2.0: Infrastructure Setup

**Goal:** Create patterns and utilities for migration
**Estimated Time:** 2-3 hours
**Status:** Not Started

### Tasks

- [ ] **Task 2.0.1:** Enhance RuleRegistry with category-based discovery
  - **File:** `src/utils/rule-registry.ts`
  - **Action:** Add `getRulesByCategory(category: RuleCategory): Rule[]` method
  - **Action:** Add `getRulesForValidator(validatorId: string): Rule[]` method
  - **Action:** Add rule caching to improve performance
  - **Estimated Time:** 30 minutes
  - **Dependencies:** None
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.0.2:** Create executeRulesForCategory() in BaseValidator
  - **File:** `src/validators/base.ts`
  - **Action:** Add `protected async executeRulesForCategory(category, filePath, content)` method
  - **Action:** Method should query RuleRegistry and execute all matching rules
  - **Action:** Handle config checks automatically
  - **Estimated Time:** 45 minutes
  - **Dependencies:** Task 2.0.1
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.0.3:** Add frontmatter validation abstraction
  - **File:** `src/validators/base.ts`
  - **Action:** Add `protected async validateFrontmatterWithNameCheck<T>()` method
  - **Action:** Consolidates agent/skill/output-style frontmatter patterns
  - **Action:** Handles name matching, schema validation, result merging
  - **Estimated Time:** 45 minutes
  - **Dependencies:** None
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.0.4:** Add body content validation abstraction
  - **File:** `src/validators/base.ts`
  - **Action:** Add `protected validateBodyContentStructure()` method
  - **Action:** Configurable min length and required sections
  - **Action:** Replace duplicate patterns in agents/skills/output-styles
  - **Estimated Time:** 30 minutes
  - **Dependencies:** None
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.0.5:** Add file walking abstraction
  - **File:** `src/validators/base.ts`
  - **Action:** Add `protected async validateFilesInDirectory()` method
  - **Action:** Generic pattern for directory traversal + validation
  - **Action:** Handles optional vs required gracefully
  - **Estimated Time:** 30 minutes
  - **Dependencies:** None
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.0.6:** Document migration patterns
  - **File:** `docs/projects/validator-refactor-phase-2/MIGRATION-GUIDE.md`
  - **Action:** Write guide for converting ghost rules to real rules
  - **Action:** Include code examples and decision tree
  - **Action:** Document edge cases and exceptions
  - **Estimated Time:** 30 minutes
  - **Dependencies:** None
  - **Assigned To:** TBD
  - **Completion Date:** TBD

---

## Phase 2.1: Ghost Rule Audit

**Goal:** Identify and categorize all ghost rules
**Estimated Time:** 1-2 hours
**Status:** Not Started

### Tasks

- [ ] **Task 2.1.1:** Audit MCP validator for ghost rules
  - **File:** `src/validators/mcp.ts`
  - **Action:** Find all `reportError`/`reportWarning` calls without ruleId
  - **Action:** Categorize by type (schema, transport, env vars, etc.)
  - **Action:** Document in GHOST-RULES-AUDIT.md
  - **Estimated Time:** 20 minutes
  - **Dependencies:** None
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.1.2:** Audit all other validators for ghost rules
  - **Files:** `src/validators/{claude-md,skills,agents,plugin,hooks,settings,commands,output-styles,lsp}.ts`
  - **Action:** Find all ghost rules in remaining validators
  - **Action:** Categorize by validation type
  - **Action:** Rate migration difficulty (easy/medium/hard)
  - **Estimated Time:** 1 hour
  - **Dependencies:** None
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.1.3:** Audit utility functions for ghost validations
  - **File:** `src/utils/validation-helpers.ts`
  - **Action:** Check if utility functions return issues without ruleIds
  - **Action:** Identify which need to be converted to rules
  - **Action:** Document in GHOST-RULES-AUDIT.md
  - **Estimated Time:** 15 minutes
  - **Dependencies:** None
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.1.4:** Identify edge cases and exceptions
  - **Files:** Various
  - **Action:** Document validations that might not fit rule pattern
  - **Action:** Propose alternatives for each exception
  - **Action:** Get approval for exception handling approach
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Tasks 2.1.1, 2.1.2, 2.1.3
  - **Assigned To:** TBD
  - **Completion Date:** TBD

---

## Phase 2.2: Convert Ghost Rules to Real Rules

**Goal:** Create rule files for all ghost validations
**Estimated Time:** 4-6 hours
**Status:** Not Started

### Tasks

- [ ] **Task 2.2.1:** Create MCP ghost rules (~10 rules)
  - **Files:** `src/rules/mcp/*.ts`
  - **Action:** Convert stdio transport validation to rule
  - **Action:** Convert SSE transport validation to rule
  - **Action:** Convert HTTP transport validation to rule
  - **Action:** Convert WebSocket transport validation to rule
  - **Action:** Convert env var naming to rule (from utility function)
  - **Action:** Convert env var empty value to rule (from utility function)
  - **Action:** Convert env var secret detection to rule (from utility function)
  - **Action:** Convert simple var expansion warning to rule
  - **Action:** Update rule-ids.ts with new IDs
  - **Estimated Time:** 1.5 hours
  - **Dependencies:** Task 2.1.1
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.2.2:** Create Claude.md ghost rules (~8 rules)
  - **Files:** `src/rules/claude-md/*.ts`
  - **Action:** Convert file not found to rule
  - **Action:** Convert import validation to rules
  - **Action:** Convert circular import checks to rule
  - **Action:** Convert case-sensitive filename collision to rule
  - **Action:** Update rule-ids.ts with new IDs
  - **Estimated Time:** 1 hour
  - **Dependencies:** Task 2.1.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.2.3:** Create Skills ghost rules (~12 rules)
  - **Files:** `src/rules/skills/*.ts`
  - **Action:** Convert "no skills found" warning to rule
  - **Action:** Convert SKILL.md not found to rule
  - **Action:** Convert name mismatch to rule
  - **Action:** Convert body content checks to rules
  - **Action:** Convert documentation checks to rules
  - **Action:** Update rule-ids.ts with new IDs
  - **Estimated Time:** 1.5 hours
  - **Dependencies:** Task 2.1.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.2.4:** Create Agents ghost rules (~6 rules)
  - **Files:** `src/rules/agents/*.ts`
  - **Action:** Convert "no agents found" warning to rule
  - **Action:** Convert AGENT.md not found to rule
  - **Action:** Convert name mismatch to rule
  - **Action:** Convert body content checks to rules
  - **Action:** Update rule-ids.ts with new IDs
  - **Estimated Time:** 45 minutes
  - **Dependencies:** Task 2.1.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.2.5:** Create remaining validator ghost rules (~8 rules)
  - **Files:** `src/rules/{plugin,hooks,settings,output-styles,lsp}/*.ts`
  - **Action:** Convert plugin ghost rules
  - **Action:** Convert hooks ghost rules
  - **Action:** Convert settings ghost rules
  - **Action:** Convert output-styles ghost rules
  - **Action:** Convert LSP ghost rules
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

## Phase 2.3: Implement Rule Discovery

**Goal:** Remove manual rule imports
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

**Goal:** Ensure nothing broke
**Estimated Time:** 1-2 hours
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

---

## Completion Checklist

### Code Quality
- [ ] Zero `reportError`/`reportWarning` calls without ruleIds
- [ ] Zero manual rule imports in validators
- [ ] No code duplication in validation patterns
- [ ] All validators use consistent error handling

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
_None yet_

### Questions/Issues
_None yet_
