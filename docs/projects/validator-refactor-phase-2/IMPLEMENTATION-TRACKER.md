# Phase 2 Implementation Tracker

**Last Updated:** 2026-01-29
**Status:** In Progress - Phase 2.2

## Overall Progress

- [X] Phase 2.0: Infrastructure (6/6 tasks) COMPLETE
- [X] Phase 2.1: Ghost Rule Audit (4/4 tasks) COMPLETE
- [ ] Phase 2.2: Build Testing Infrastructure (0/3 tasks)
- [ ] Phase 2.3: Migrate Remaining Validators (0/9 tasks)
- [ ] Phase 2.4: Fix Early Validators (0/2 tasks)
- [ ] Phase 2.5: Implement Rule Discovery (0/10 tasks)
- [ ] Phase 2.6: Extract Common Patterns (0/5 tasks)
- [ ] Phase 2.7: Testing & Validation (0/11 tasks)

**Total:** 10/50 tasks complete (20%)

**Current Focus:** Building RuleTester infrastructure to verify rule implementations

---

## CRITICAL DISCOVERY (2026-01-29)

### Problems Identified

After completing MCP and Claude.md validators, we discovered:

1. **25 Stub Rules** - Rules with empty validate() functions:
   - 10 agents rules (agent-name, agent-description, etc.)
   - 11 skills rules (skill-name, skill-description, etc.)
   - 3 output-styles rules
   - These rely on Zod schema validation instead of rule logic

2. **Duplicate Validation** - Both Zod schemas AND rules validate the same things:
   - claude-md-paths: Schema validates "must be array", rule also validates it
   - MCP rules: Some validation duplicated between schema and rules
   - This creates confusion about source of truth

3. **No Unit Tests for Rules** - Tests don't verify individual rules:
   - Integration tests only check validator output
   - Tests pass even with empty validate() functions
   - Zod schema errors mask missing rule implementations
   - No way to verify rules actually execute

4. **Two Validation Patterns Coexist**:
   - MCP/Claude.md: Pure orchestration (correct, but has duplication)
   - Agents/Skills/Output-styles: Schema validation via mergeSchemaValidationResult() (old pattern)

### Impact

- Cannot safely continue without rule unit tests
- Need to remove validation from Zod schemas (structure only)
- Need to implement 25 stub rules properly with tests
- Need to fix duplication in completed validators

### Solution

**Revised Approach:**
1. Build RuleTester infrastructure (like ESLint's RuleTester)
2. Add unit tests for existing MCP/Claude.md rules
3. For remaining validators: Remove schema validation, implement stubs with tests, migrate
4. Go back and fix duplication in MCP/Claude.md
5. Then continue with discovery and cleanup

---

## Phase 2.0: Infrastructure Setup

**Goal:** Create patterns and utilities for migration
**Estimated Time:** 2-3 hours
**Status:** COMPLETE ✓

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
  - **Assigned To:** Claude
  - **Completion Date:** 2026-01-29

---

## Phase 2.1: Ghost Rule Audit

**Goal:** Identify and categorize all ghost rules
**Estimated Time:** 1-2 hours
**Status:** COMPLETE ✓

### Tasks

- [X] **Task 2.1.1:** Audit MCP validator for ghost rules
  - **File:** `src/validators/mcp.ts`
  - **Action:** Find all `reportError`/`reportWarning` calls without ruleId
  - **Action:** Categorize by type (schema, transport, env vars, etc.)
  - **Action:** Document in GHOST-RULES-AUDIT.md
  - **Estimated Time:** 20 minutes
  - **Dependencies:** None
  - **Assigned To:** Claude
  - **Completion Date:** 2026-01-29

- [X] **Task 2.1.2:** Audit all other validators for ghost rules
  - **Files:** `src/validators/{claude-md,skills,agents,plugin,hooks,settings,commands,output-styles,lsp}.ts`
  - **Action:** Find all ghost rules in remaining validators
  - **Action:** Categorize by validation type
  - **Action:** Rate migration difficulty (easy/medium/hard)
  - **Estimated Time:** 1 hour
  - **Dependencies:** None
  - **Assigned To:** Claude
  - **Completion Date:** 2026-01-29

- [X] **Task 2.1.3:** Audit utility functions for ghost validations
  - **File:** `src/utils/validation-helpers.ts`
  - **Action:** Check if utility functions return issues without ruleIds
  - **Action:** Identify which need to be converted to rules
  - **Action:** Document in GHOST-RULES-AUDIT.md
  - **Estimated Time:** 15 minutes
  - **Dependencies:** None
  - **Assigned To:** Claude
  - **Completion Date:** 2026-01-29

- [X] **Task 2.1.4:** Identify edge cases and exceptions
  - **Files:** Various
  - **Action:** Document validations that might not fit rule pattern
  - **Action:** Propose alternatives for each exception
  - **Action:** Get approval for exception handling approach
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Tasks 2.1.1, 2.1.2, 2.1.3
  - **Assigned To:** Claude
  - **Completion Date:** 2026-01-29

---

## Phase 2.2: Build Testing Infrastructure

**Goal:** Create RuleTester utility and verify existing rules work
**Estimated Time:** 3-4 hours
**Status:** Not Started
**CRITICAL:** Must verify rules actually execute before continuing

### Tasks

- [ ] **Task 2.2.1:** Create ClaudeLintRuleTester utility
  - **File:** `tests/helpers/rule-tester.ts`
  - **Action:** Create RuleTester class inspired by ESLint's RuleTester
  - **Action:** Support `valid` and `invalid` test case arrays
  - **Action:** Automatically verify rules execute and report expected errors
  - **Action:** Support different file types (JSON, Markdown, YAML)
  - **Action:** Throw errors when expectations don't match reality
  - **Estimated Time:** 2 hours
  - **Dependencies:** None
  - **Assigned To:** TBD
  - **Completion Date:** TBD
  - **Notes:** Based on ESLint pattern: `ruleTester.run(name, rule, { valid: [...], invalid: [...] })`

- [ ] **Task 2.2.2:** Add unit tests for MCP rules
  - **Files:** `tests/rules/mcp/*.test.ts`
  - **Action:** Create test file for each of 8 MCP rules
  - **Action:** Use ClaudeLintRuleTester for declarative test cases
  - **Action:** Cover valid and invalid cases for each rule
  - **Action:** Verify all 8 rules actually execute and report errors
  - **Estimated Time:** 1 hour
  - **Dependencies:** Task 2.2.1
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.2.3:** Add unit tests for Claude.md rules
  - **Files:** `tests/rules/claude-md/*.test.ts`
  - **Action:** Create test file for each of 13 Claude.md rules
  - **Action:** Use ClaudeLintRuleTester for declarative test cases
  - **Action:** Cover valid and invalid cases for each rule
  - **Action:** Verify all 13 rules actually execute (including the 2 fixed stubs)
  - **Estimated Time:** 1 hour
  - **Dependencies:** Task 2.2.1
  - **Assigned To:** TBD
  - **Completion Date:** TBD

---

## Phase 2.3: Migrate Remaining Validators (The RIGHT Way)

**Goal:** For each validator: remove schema validation, implement stubs with tests, convert to pure orchestration
**Estimated Time:** 6-8 hours
**Status:** Not Started
**CRITICAL:** Each validator must be fully complete with tests before moving to next

### Tasks

- [ ] **Task 2.3.1:** Migrate Skills validator
  - **Files:** `src/schemas/skill-frontmatter.schema.ts`, `src/rules/skills/*.ts`, `src/validators/skills.ts`, `tests/rules/skills/*.test.ts`
  - **Action:** Remove ALL validation from SkillFrontmatterSchema (keep structure only)
  - **Action:** Implement 11 stub rules with FULL validation logic
  - **Action:** Create unit tests for each rule using RuleTester
  - **Action:** Convert validator to pure orchestration (executeRulesForCategory only)
  - **Action:** Verify all integration tests still pass
  - **Action:** Verify stub rules now have real implementations
  - **Estimated Time:** 2 hours
  - **Dependencies:** Phase 2.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD
  - **Notes:** Stub rules: skill-name, skill-description, skill-version, skill-tags, skill-agent, skill-model, skill-context, skill-dependencies, skill-allowed-tools, skill-disallowed-tools

- [ ] **Task 2.3.2:** Migrate Agents validator
  - **Files:** `src/schemas/agent-frontmatter.schema.ts`, `src/rules/agents/*.ts`, `src/validators/agents.ts`, `tests/rules/agents/*.test.ts`
  - **Action:** Remove ALL validation from AgentFrontmatterSchema (keep structure only)
  - **Action:** Implement 10 stub rules with FULL validation logic
  - **Action:** Create unit tests for each rule using RuleTester
  - **Action:** Convert validator to pure orchestration
  - **Action:** Remove validateReferencedSkills, validateHooks, validateBodyContent methods
  - **Action:** Verify all integration tests still pass
  - **Estimated Time:** 2 hours
  - **Dependencies:** Phase 2.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD
  - **Notes:** Stub rules: agent-name, agent-description, agent-model, agent-tools, agent-disallowed-tools, agent-events, agent-skills, agent-hooks, agent-skills-not-found, agent-hooks-invalid-schema

- [ ] **Task 2.3.3:** Migrate Output-styles validator
  - **Files:** `src/schemas/output-style-frontmatter.schema.ts`, `src/rules/output-styles/*.ts`, `src/validators/output-styles.ts`, `tests/rules/output-styles/*.test.ts`
  - **Action:** Remove ALL validation from OutputStyleFrontmatterSchema
  - **Action:** Implement 3 stub rules with FULL validation logic
  - **Action:** Create unit tests for each rule using RuleTester
  - **Action:** Convert validator to pure orchestration
  - **Action:** Verify all integration tests still pass
  - **Estimated Time:** 1 hour
  - **Dependencies:** Phase 2.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD
  - **Notes:** Stub rules: output-style-name, output-style-description, output-style-examples

- [ ] **Task 2.3.4:** Remove mergeSchemaValidationResult() pattern
  - **Files:** All validators
  - **Action:** Remove all calls to mergeSchemaValidationResult()
  - **Action:** Schemas should ONLY be used for parsing/typing, not validation
  - **Action:** All validation must go through rules
  - **Action:** Verify no schema errors bypass rule system
  - **Estimated Time:** 30 minutes
  - **Dependencies:** Tasks 2.3.1-2.3.3
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.3.5:** Verify all stub rules implemented
  - **Action:** Run verification script: `npx ts-node scripts/verify-rule-implementations.ts`
  - **Action:** Should find ZERO stub rules
  - **Action:** All rules must have validate() logic and context.report() calls
  - **Estimated Time:** 10 minutes
  - **Dependencies:** Tasks 2.3.1-2.3.4
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.3.6:** Create Plugin ghost rules
  - **Files:** `src/rules/plugin/*.ts`, `src/validators/plugin.ts`, `tests/rules/plugin/*.test.ts`
  - **Action:** Convert remaining plugin validator ghost rules
  - **Action:** Create unit tests with RuleTester
  - **Action:** Convert validator to pure orchestration
  - **Estimated Time:** 30 minutes
  - **Dependencies:** Phase 2.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.3.7:** Create Hooks ghost rules
  - **Files:** `src/rules/hooks/*.ts`, `src/validators/hooks.ts`, `tests/rules/hooks/*.test.ts`
  - **Action:** Convert remaining hooks validator ghost rules
  - **Action:** Create unit tests with RuleTester
  - **Action:** Convert validator to pure orchestration
  - **Estimated Time:** 30 minutes
  - **Dependencies:** Phase 2.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.3.8:** Create Settings ghost rules
  - **Files:** `src/rules/settings/*.ts`, `src/validators/settings.ts`, `tests/rules/settings/*.test.ts`
  - **Action:** Convert remaining settings validator ghost rules
  - **Action:** Create unit tests with RuleTester
  - **Action:** Convert validator to pure orchestration
  - **Estimated Time:** 30 minutes
  - **Dependencies:** Phase 2.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.3.9:** Update rule-ids.ts and regenerate types
  - **File:** `src/rules/rule-ids.ts`
  - **Action:** Add all new rule IDs from Phase 2.3
  - **Action:** Run `npm run generate:types` to regenerate
  - **Action:** Verify all new IDs are in the union type
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Tasks 2.3.1-2.3.8
  - **Assigned To:** TBD
  - **Completion Date:** TBD

---

## Phase 2.4: Fix Early Validators

**Goal:** Remove duplicate validation from MCP and Claude.md schemas
**Estimated Time:** 1-2 hours
**Status:** Not Started

### Tasks

- [ ] **Task 2.4.1:** Remove duplicate validation from MCP schema
  - **File:** `src/schemas/mcp-config.schema.ts` (in validators/schemas.ts)
  - **Action:** Remove validation logic (min/max/refine) from MCPConfigSchema
  - **Action:** Keep ONLY structure (z.string(), z.array(), z.object())
  - **Action:** Verify MCP rule unit tests still pass
  - **Action:** Verify integration tests still pass
  - **Estimated Time:** 30 minutes
  - **Dependencies:** Phase 2.2, Phase 2.3
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.4.2:** Remove duplicate validation from Claude.md schema
  - **File:** `src/schemas/claude-md-frontmatter.schema.ts`
  - **Action:** Remove validation from ClaudeMdFrontmatterSchema (lines 12-15)
  - **Action:** Change to: `paths: z.array(z.string()).optional()`
  - **Action:** Remove .min() and string .min() validators
  - **Action:** Verify claude-md-paths rule unit tests still pass
  - **Action:** Verify integration tests still pass
  - **Estimated Time:** 30 minutes
  - **Dependencies:** Phase 2.2, Phase 2.3
  - **Assigned To:** TBD
  - **Completion Date:** TBD

---

## Phase 2.5: Implement Rule Discovery

**Goal:** Remove manual rule imports, use category-based auto-discovery
**Estimated Time:** 2-3 hours
**Status:** Not Started

### Tasks

- [ ] **Task 2.5.1:** Refactor claude-md.ts to use discovery
  - **File:** `src/validators/claude-md.ts`
  - **Action:** Remove 6 manual rule imports (if any remain)
  - **Action:** Ensure all rules execute via executeRulesForCategory('CLAUDE.md')
  - **Action:** Test all validations still work
  - **Estimated Time:** 20 minutes
  - **Dependencies:** Tasks 2.0.2, Phase 2.3
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.2:** Refactor skills.ts to use discovery
  - **File:** `src/validators/skills.ts`
  - **Action:** Remove manual rule imports
  - **Action:** Replace with executeRulesForCategory('Skills')
  - **Action:** Test all validations still work
  - **Estimated Time:** 25 minutes
  - **Dependencies:** Tasks 2.0.2, 2.3.1
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.3:** Refactor agents.ts to use discovery
  - **File:** `src/validators/agents.ts`
  - **Action:** Remove manual rule imports
  - **Action:** Replace with executeRulesForCategory('Agents')
  - **Action:** Test all validations still work
  - **Estimated Time:** 25 minutes
  - **Dependencies:** Tasks 2.0.2, 2.3.2
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.4:** Refactor plugin.ts to use discovery
  - **File:** `src/validators/plugin.ts`
  - **Action:** Remove manual rule imports
  - **Action:** Replace with executeRulesForCategory('Plugin')
  - **Action:** Test all validations still work
  - **Estimated Time:** 20 minutes
  - **Dependencies:** Tasks 2.0.2, 2.3.6
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.5:** Refactor mcp.ts to use discovery
  - **File:** `src/validators/mcp.ts`
  - **Action:** Already uses executeRulesForCategory - verify no manual imports remain
  - **Action:** Test all validations still work
  - **Estimated Time:** 10 minutes
  - **Dependencies:** Tasks 2.0.2, Phase 2.3
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.6:** Refactor hooks.ts to use discovery
  - **File:** `src/validators/hooks.ts`
  - **Action:** Remove manual rule imports
  - **Action:** Replace with executeRulesForCategory('Hooks')
  - **Action:** Test all validations still work
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Tasks 2.0.2, 2.3.7
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.7:** Refactor settings.ts to use discovery
  - **File:** `src/validators/settings.ts`
  - **Action:** Remove manual rule imports
  - **Action:** Replace with executeRulesForCategory('Settings')
  - **Action:** Test all validations still work
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Tasks 2.0.2, 2.3.8
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.8:** Refactor remaining validators
  - **Files:** `src/validators/{commands,output-styles,lsp}.ts`
  - **Action:** Remove manual rule imports from all remaining validators
  - **Action:** Replace with executeRulesForCategory pattern
  - **Action:** Test all validations still work
  - **Estimated Time:** 30 minutes
  - **Dependencies:** Tasks 2.0.2, Phase 2.3
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.9:** Verify zero manual imports remain
  - **Files:** All validator files
  - **Action:** Run `grep -r "from '../rules/" src/validators/` - should return 0 results
  - **Action:** Verify all validators use executeRulesForCategory pattern
  - **Action:** Document the new pattern in architecture.md
  - **Estimated Time:** 10 minutes
  - **Dependencies:** Tasks 2.5.1-2.5.8
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.5.10:** Verify zero reportError/reportWarning calls and deprecate
  - **Files:** All validator files, `src/validators/base.ts`
  - **Action:** Run `grep -r "reportError\|reportWarning" src/validators/` (excluding base.ts)
  - **Action:** Should return 0 results (all validation in rules)
  - **Action:** Mark reportError/reportWarning as @deprecated in base.ts
  - **Action:** Add deprecation message: "Use rules with context.report() instead"
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Tasks 2.5.1-2.5.9
  - **Assigned To:** TBD
  - **Completion Date:** TBD

---

## Phase 2.6: Extract Common Patterns

**Goal:** Remove code duplication through abstraction
**Estimated Time:** 2-3 hours
**Status:** Not Started

### Tasks

- [ ] **Task 2.6.1:** Refactor agents.ts to use abstractions
  - **File:** `src/validators/agents.ts`
  - **Action:** Use base class abstractions for common patterns
  - **Action:** Verify all tests pass
  - **Estimated Time:** 45 minutes
  - **Dependencies:** Tasks 2.0.3, 2.0.4, 2.0.5
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.6.2:** Refactor skills.ts to use abstractions
  - **File:** `src/validators/skills.ts`
  - **Action:** Use base class abstractions for common patterns
  - **Action:** Verify all tests pass
  - **Estimated Time:** 1 hour
  - **Dependencies:** Tasks 2.0.3, 2.0.5
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.6.3:** Refactor output-styles.ts to use abstractions
  - **File:** `src/validators/output-styles.ts`
  - **Action:** Use base class abstractions for common patterns
  - **Action:** Verify all tests pass
  - **Estimated Time:** 30 minutes
  - **Dependencies:** Tasks 2.0.3, 2.0.4, 2.0.5
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.6.4:** Unify error handling across validators
  - **Files:** All validators
  - **Action:** Ensure consistent error handling patterns
  - **Estimated Time:** 45 minutes
  - **Dependencies:** Task 2.0.5
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.6.5:** Remove dead code and clean up comments
  - **Files:** All validators
  - **Action:** Remove migration comments
  - **Action:** Clean up imports
  - **Estimated Time:** 30 minutes
  - **Dependencies:** Tasks 2.6.1-2.6.4
  - **Assigned To:** TBD
  - **Completion Date:** TBD

---

## Phase 2.7: Testing & Validation

**Goal:** Refactor validator tests, ensure nothing broke, documentation complete
**Estimated Time:** 3.5-4 hours (revised from 2.5-3 hours)
**Status:** Not Started

### Tasks

- [ ] **Task 2.7.1:** Refactor validator tests to remove validation logic
  - **Files:** All files in `tests/validators/*.test.ts`
  - **Action:** Remove tests that check validation logic (now covered by rule unit tests)
  - **Action:** Keep only orchestration tests (file discovery, parsing, rule execution, aggregation)
  - **Action:** Expected reduction: ~60% of test lines, ~70% of test count per validator
  - **Action:** Verify each validator test file focuses on:
    - ✓ File discovery works (glob patterns, directory traversal)
    - ✓ Parsing doesn't crash (valid/invalid JSON/YAML/Markdown)
    - ✓ Rule execution happens (executeRulesForCategory called)
    - ✓ Results aggregated correctly (multiple files, multiple rules)
    - ✓ Missing file handling ("No X found" warnings)
    - ✓ Config integration (file-specific overrides)
    - ✗ Validation logic (moved to rule tests)
  - **Example refactor:** Remove "should error for empty command" test from mcp.test.ts (covered by tests/rules/mcp/mcp-stdio-command.test.ts)
  - **Estimated Time:** 1.5 hours
  - **Dependencies:** Phase 2.2 (rule tests must exist first), Phase 2.3 (all validators migrated)
  - **Assigned To:** TBD
  - **Completion Date:** TBD
  - **Notes:** See "Test Architecture After Phase 2" section for detailed before/after examples

- [ ] **Task 2.7.2:** Run full test suite
  - **Command:** `npm test`
  - **Action:** Verify all tests pass (integration + unit)
  - **Action:** Expected: ~100 validator tests + ~300 rule tests = ~400 total
  - **Action:** Fix any failing tests
  - **Estimated Time:** 30 minutes
  - **Dependencies:** Task 2.7.1, all previous phases
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.7.3:** Test config disable for new rules
  - **Action:** Create test `.claudelintrc.json` with new rules disabled
  - **Action:** Verify validations are actually skipped
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Phase 2.3
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.7.4:** Test config severity override
  - **Action:** Create test config with severity overrides
  - **Action:** Verify warnings become errors and vice versa
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Phase 2.3
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.7.5:** Test rule options
  - **Action:** Test custom rule configuration
  - **Action:** Verify schema validation rejects invalid options
  - **Estimated Time:** 15 minutes
  - **Dependencies:** Phase 2.3
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.7.6:** Manual validation of each validator
  - **Action:** Run each validator against real test fixtures
  - **Action:** Verify all expected issues are reported
  - **Estimated Time:** 20 minutes
  - **Dependencies:** All previous phases
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.7.7:** Performance testing
  - **Action:** Benchmark rule execution time
  - **Action:** Verify no significant performance regression
  - **Estimated Time:** 15 minutes
  - **Dependencies:** All previous phases
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.7.8:** Remove reportError/reportWarning methods entirely
  - **File:** `src/validators/base.ts`
  - **Action:** REMOVE reportError() method from base.ts
  - **Action:** REMOVE reportWarning() method from base.ts
  - **Action:** Verify all tests still pass
  - **Estimated Time:** 20 minutes
  - **Dependencies:** Task 2.5.10, Tasks 2.7.1-2.7.7
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.7.9:** Create rule documentation for new rules
  - **Files:** `docs/rules/{category}/{rule-id}.md`
  - **Action:** Create documentation for all new rules
  - **Action:** Follow existing documentation template
  - **Estimated Time:** 2 hours
  - **Dependencies:** Phase 2.3
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.7.10:** Update CHANGELOG.md
  - **File:** `CHANGELOG.md`
  - **Action:** Document all new rules added (40+)
  - **Action:** List behavior changes
  - **Action:** Note removal of reportError/reportWarning
  - **Estimated Time:** 20 minutes
  - **Dependencies:** All previous phases
  - **Assigned To:** TBD
  - **Completion Date:** TBD

- [ ] **Task 2.7.11:** Update contributing guide
  - **File:** `docs/plugin-development.md`
  - **Action:** Document RuleRegistry.getRulesByCategory() pattern
  - **Action:** Document executeRulesForCategory() usage
  - **Action:** Document two-level testing strategy (rule tests + validator tests)
  - **Estimated Time:** 20 minutes
  - **Dependencies:** All previous phases
  - **Assigned To:** TBD
  - **Completion Date:** TBD

---

## Completion Checklist

### Code Quality
- [ ] Zero `reportError`/`reportWarning` calls in validators
- [ ] reportError/reportWarning methods deleted from base.ts
- [ ] Zero validation logic in validators (all logic in rules)
- [ ] Zero manual rule imports in validators
- [ ] Zero stub rules (all have real implementations)
- [ ] No validation in Zod schemas (structure only)
- [ ] All validators use consistent error handling
- [ ] Validators are pure orchestrators

### Testing
- [ ] All 688+ integration tests passing
- [ ] All rule unit tests passing
- [ ] ClaudeLintRuleTester utility created
- [ ] Every rule has unit tests
- [ ] Config system works for all rules

### Documentation
- [ ] All new rules documented
- [ ] MIGRATION-GUIDE.md updated
- [ ] PATTERNS.md updated
- [ ] Architecture.md updated
- [ ] CHANGELOG.md updated

### User Experience
- [ ] ALL validations configurable via `.claudelintrc.json`
- [ ] Error messages unchanged (or improved)
- [ ] Performance same or better

---

## Notes

### Critical Discoveries (2026-01-29)

**Issue:** After "completing" MCP and Claude.md validators, discovered:
1. 25 stub rules with empty validate() functions
2. Duplicate validation in both Zod schemas and rules
3. No unit tests - integration tests didn't catch empty rules
4. Tests passed because Zod schema errors masked missing rule logic

**Root Cause:**
- Agents/Skills/Output-styles use `mergeSchemaValidationResult()` pattern
- Zod schemas contain validation logic (.min, .max, .refine)
- Rule stubs exist but are no-ops with comments like "Schema handles this"
- Integration tests only verify validator output, not that rules execute

**Solution:**
- Build RuleTester infrastructure first (Phase 2.2)
- Remove ALL validation from Zod schemas (Phase 2.3)
- Implement all 25 stubs with unit tests (Phase 2.3)
- Fix duplication in MCP/Claude.md (Phase 2.4)
- Only then continue with discovery and cleanup

**Lessons Learned:**
- Can't rely on integration tests alone
- Need unit tests for individual rules
- Schemas should be for structure, not validation
- Must verify assumptions with concrete tests

### Test Architecture After Phase 2

**Two-Level Testing Strategy:**

1. **Rule Tests (Unit Tests)** - Test validation logic in isolation
   - Location: `tests/rules/{category}/{rule-id}.test.ts`
   - Tool: ClaudeLintRuleTester
   - Tests: 3-5 per rule (valid/invalid cases)
   - Example: `tests/rules/mcp/mcp-stdio-command.test.ts`
   - Coverage: All validation logic, edge cases, options

2. **Validator Tests (Integration Tests)** - Test orchestration only
   - Location: `tests/validators/{validator}.test.ts`
   - Tests: 7-10 per validator (reduced from 20-40)
   - Focus: File discovery, parsing, rule execution, aggregation
   - Example: "should find and process all mcp.json files"
   - Does NOT test validation logic (that's in rule tests)

**Size Impact:**

Current validator tests (example: mcp.test.ts):
- 33 tests, ~450 lines
- Tests BOTH orchestration AND validation logic

After Phase 2:
- `tests/validators/mcp.test.ts`: ~8 tests, ~150-200 lines (orchestration only)
- `tests/rules/mcp/*.test.ts`: 8 files, ~3-5 tests each, ~400 lines (validation)
- **Total tests INCREASES** (better coverage at right level)
- **Validator test complexity DECREASES** (~60% reduction in lines)

**What Validator Tests Will Test:**

✓ File discovery (glob patterns, directory traversal)
✓ File parsing (JSON/YAML/Markdown + frontmatter)
✓ Rule orchestration (executeRulesForCategory calls rules)
✓ Result aggregation (multiple files, multiple rules)
✓ Missing file handling ("No X found" warnings)
✓ Config integration (file-specific overrides work)
✗ Validation logic (empty fields, invalid formats, etc.) ← MOVES TO RULE TESTS

**What Rule Tests Will Test:**

✓ Validation logic (is empty string caught?)
✓ Error messages (correct message for each case)
✓ Edge cases (null, undefined, boundary values)
✓ Rule options (configurable behavior works)
✓ Context (file path, line numbers reported correctly)
✗ File discovery ← STAYS IN VALIDATOR TESTS
✗ Parsing ← STAYS IN VALIDATOR TESTS

**Example Refactor:**

Before (validator test):
```typescript
it('should error for empty command', async () => {
  const filePath = join(testDir, 'mcp.json');
  await writeFile(filePath, JSON.stringify({
    mcpServers: { server1: { transport: { type: 'stdio', command: '' }}}
  }));
  const validator = new MCPValidator({ path: filePath });
  const result = await validator.validate();
  expect(result.errors.some(e => e.message.includes('empty'))).toBe(true);
});
```

After Phase 2:

Rule test (unit):
```typescript
ruleTester.run('mcp-stdio-command', rule, {
  invalid: [{
    content: JSON.stringify({ mcpServers: { s1: { transport: { type: 'stdio', command: '' }}}}),
    errors: [{ message: 'stdio command cannot be empty' }]
  }]
});
```

Validator test (integration):
```typescript
it('should execute MCP rules for all servers', async () => {
  const filePath = join(testDir, 'mcp.json');
  await writeFile(filePath, JSON.stringify({
    mcpServers: { server1: { /* valid */ }, server2: { /* valid */ }}
  }));
  const validator = new MCPValidator({ path: filePath });
  const result = await validator.validate();
  expect(result.valid).toBe(true); // Orchestration works
});
```

**Key Insight:** Validator tests become SIMPLER and CLEARER because they only test orchestration, not validation logic. Rule tests are MORE FOCUSED because they test one rule at a time.

### Questions/Issues

**Q:** Should we remove mergeSchemaValidationResult() entirely?
**A:** Yes - in Phase 2.3.4, after migrating validators. Validation must go through rules.

**Q:** What about parsing errors (invalid JSON, YAML)?
**A:** Parsing errors can stay in validators - they're not "validation" of content

**Q:** Performance impact of more rules?
**A:** RuleRegistry caching should minimize impact. Will benchmark in Phase 2.7.

---

**Last Updated:** 2026-01-29
