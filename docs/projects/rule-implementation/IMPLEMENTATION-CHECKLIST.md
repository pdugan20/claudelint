# Rule Implementation Checklist

**Last Updated**: 2026-01-28
**Status**: 22/219 rules complete (10%)
**Current Focus**: Configuration Integration (BLOCKER)

This is the single source of truth for outstanding rule implementation work.

## Current Status Summary

- **Complete**: 22 rules (10%)
- **Partial (Ghost Rules)**: 19 of 20 fixed (1 needs implementation)
- **Not Started**: 177 rules (81%)
- **Config Integration**: 0% (blocking all further work)

---

## Immediate Priorities (BLOCKERS)

### 0. Configuration Integration (3-4 days) IN PROGRESS

**CRITICAL BLOCKER**: Rules don't respect .claudelintrc.json configuration. Users cannot disable rules, override severity, or configure options. This must be fixed before continuing with rule implementation.

**Status**: Planning complete, ready to implement
**Design**: See `docs/projects/config-integration-proposal.md` for full architecture
**Tracker**: See task #4 in Short-Term Work section below

### 1. Fix Broken Documentation Files (40-60 min) COMPLETE

All documentation files were already fixed (work done earlier in project):

- [x] **size-error.md** - Previously fixed
- [x] **skill-deep-nesting.md** - Previously fixed
- [x] **skill-eval-usage.md** - Previously fixed
- [x] **skill-missing-examples.md** - Fixed in this session (4-backtick fences for nesting)
- [x] **skill-missing-shebang.md** - Previously fixed
- [x] **size-warning.md** - Previously fixed

**Validation status**: 0 violations, 15 warnings (expected - missing docs)

### 2. Fix Validation Script (5-10 min) COMPLETE

Updated `scripts/check-rule-docs.ts` to handle nested code blocks:

- [x] Updated fence detection to track fence lengths (4-backtick for nesting)
- [x] Script now correctly ignores 3-backtick fences inside 4-backtick blocks
- [x] Validation passing with 0 violations

### 3. Fix Ghost Rules (2-4 hours) 19/20 COMPLETE

These rules have validation logic but don't pass rule IDs to reportError/reportWarning.

**Status**: 19 of 20 fixed! Only `frontmatter-invalid-paths` needs implementation (not just rule ID).

#### Skills Validator (6 ghost rules) COMPLETE

- [x] **skill-dangerous-command** - Add rule ID to line 565-572
- [x] **skill-eval-usage** - Add rule ID to line 576-592
- [x] **skill-path-traversal** - Add rule ID to line 595-601
- [x] **skill-too-many-files** - Add rule ID to line 234
- [x] **skill-deep-nesting** - Add rule ID to line 244
- [x] **skill-missing-examples** - Add rule ID to line 331

#### Settings Validator (3 ghost rules) COMPLETE

- [x] **settings-invalid-schema** - Schema validation has rule IDs (handled by parent class)
- [x] **settings-invalid-permission** - Added rule IDs at lines 111-114, 121
- [x] **settings-invalid-env-var** - Logic has rule IDs (handled by validation helper)

#### Hooks Validator (3 ghost rules) COMPLETE

- [x] **hooks-invalid-event** - Handled by validation helper (has rule IDs)
- [x] **hooks-missing-script** - Added rule ID at line 97
- [x] **hooks-invalid-config** - Schema validation has rule IDs (handled by parent class)

#### MCP Validator (3 ghost rules) COMPLETE

- [x] **mcp-invalid-server** - Added rule ID at line 64
- [x] **mcp-invalid-transport** - Added rule ID at lines 91-93
- [x] **mcp-invalid-env-var** - Added rule ID at line 255, env vars also handled by validation helper

#### Plugin Validator (2 ghost rules) COMPLETE

- [x] **plugin-invalid-manifest** - Added rule ID at line 330
- [x] **plugin-invalid-version** - Added rule ID at lines 92-95

#### Agents Validator (1 ghost rule) COMPLETE

- [x] **agent-skills-not-found** - Added rule ID at lines 167-169

#### CLAUDE.md Validator (1 ghost rule) NOT IMPLEMENTED

- [ ] **frontmatter-invalid-paths** - Defined but validation logic not implemented (needs implementation, not just rule ID)

#### Other Tasks COMPLETE

- [x] **commands-in-plugin-deprecated** - Already has rule ID at PluginValidator line 66

**After fixing each validator:**

```bash
npm test -- validators/{validator}.test.ts
npm run check:rule-ids
```

---

## Short-Term Work (1-2 weeks)

### 4. Configuration Integration (CRITICAL BLOCKER - 3-4 days)

**Problem**: Rules don't respect .claudelintrc.json - users can't disable rules, override severity, or configure options.

**Design**: See `CONFIG-INTEGRATION-PROPOSAL.md` for full architecture.

#### Phase 1: Core Infrastructure (Day 1-2, ~5-6 hours)

**Goal**: Build config resolution and validator integration layer

- [x] Create `src/utils/rule-context.ts`
  - [x] Define `RuleContext` interface
  - [x] Define `ResolvedRuleConfig` interface
  - [x] Add JSDoc comments

- [x] Create `src/utils/config-resolver.ts`
  - [x] Implement `ConfigResolver` class
  - [x] Add `resolveForFile()` method (apply overrides)
  - [x] Add `isRuleEnabled()` method
  - [x] Add `getRuleOptions()` method
  - [x] Add `normalizeRuleConfig()` private method
  - [x] Add config caching for performance
  - [x] Install `minimatch` dependency for glob matching

- [x] Enhance `src/utils/rule-registry.ts`
  - [x] Add `schema?: z.ZodType<any>` to RuleMetadata
  - [x] Add `defaultOptions?: Record<string, unknown>` to RuleMetadata
  - [x] Update JSDoc comments

- [x] Enhance `src/validators/base.ts`
  - [x] Add `protected configResolver?: ConfigResolver` field
  - [x] Add `protected currentFile?: string` field
  - [x] Initialize configResolver in constructor if config provided
  - [x] Add `protected isRuleEnabledInConfig(ruleId: RuleId): boolean` method
  - [x] Add `protected getRuleOptions<T>(ruleId: RuleId): T | undefined` method
  - [x] Add `protected setCurrentFile(filePath: string): void` method
  - [x] Update `reportError()` to check `isRuleEnabledInConfig()`
  - [x] Update `reportWarning()` to check `isRuleEnabledInConfig()`

- [x] Unit Tests for ConfigResolver
  - [x] Test base rule resolution
  - [x] Test file-specific overrides
  - [x] Test override priority (base → overrides)
  - [x] Test glob pattern matching
  - [x] Test option parsing
  - [x] Test schema validation (with valid/invalid options)
  - [x] Test config caching

- [x] Unit Tests for BaseValidator
  - [x] Test `isRuleEnabled()` with no config (returns true)
  - [x] Test `isRuleEnabled()` with "off" rule (returns false)
  - [x] Test `isRuleEnabled()` with enabled rule (returns true)
  - [x] Test `getRuleOptions()` with no config (returns defaults)
  - [x] Test `getRuleOptions()` with custom options
  - [x] Test `reportError()` skips disabled rules
  - [x] Test `reportWarning()` skips disabled rules

**Validation Checkpoint:**
- [x] All new unit tests pass
- [x] All existing tests still pass
- [x] ESLint clean
- [x] TypeScript compiles with no errors

#### Phase 2: Proof of Concept Rules (Day 2-3, ~4-5 hours)

**Goal**: Demonstrate config integration works with real rules

- [ ] Add options support to `size-error` rule
  - [ ] Define `SizeErrorOptions` interface
  - [ ] Create Zod schema for options
  - [ ] Register schema in RuleRegistry
  - [ ] Update validator to use `getRuleOptions()`
  - [ ] Update validator to call `setCurrentFile()`
  - [ ] Add integration test with custom maxSize
  - [ ] Add integration test with rule disabled

- [ ] Add options support to `size-warning` rule
  - [ ] Define `SizeWarningOptions` interface
  - [ ] Create Zod schema for options
  - [ ] Register schema in RuleRegistry
  - [ ] Update validator to use `getRuleOptions()`
  - [ ] Add integration test with custom maxSize

- [ ] Add options support to `import-circular` rule
  - [ ] Define `ImportCircularOptions` interface
  - [ ] Create Zod schema (maxDepth, allowSelfReference, ignorePatterns)
  - [ ] Register schema in RuleRegistry
  - [ ] Update validator to use `getRuleOptions()`
  - [ ] Add integration tests for each option

- [ ] Integration Tests (End-to-End)
  - [ ] Test rule disabled via config ("off")
  - [ ] Test severity override (error → warn)
  - [ ] Test severity override (warn → error)
  - [ ] Test file-specific override
  - [ ] Test custom options applied correctly
  - [ ] Test invalid options rejected (schema validation)
  - [ ] Test config-less operation (backward compatibility)

**Validation Checkpoint:**
- [ ] Can disable any rule via config
- [ ] Can override severity levels
- [ ] Can configure rule options
- [ ] File overrides work correctly
- [ ] All tests pass
- [ ] No breaking changes to existing behavior

#### Phase 3: Documentation (Day 3-4, ~2-3 hours)

- [ ] Update `docs/configuration.md`
  - [ ] Add "Rule Options" section with examples
  - [ ] Document each configurable rule
  - [ ] Add troubleshooting section
  - [ ] Add "Common Configurations" examples

- [ ] Update `docs/rules/TEMPLATE.md`
  - [ ] Add "Options" section template
  - [ ] Add example configuration in Options section
  - [ ] Add JSDoc format for option types

- [ ] Update rule documentation for configured rules
  - [ ] Update `docs/rules/claude-md/size-error.md` with Options section
  - [ ] Update `docs/rules/claude-md/size-warning.md` with Options section
  - [ ] Update `docs/rules/claude-md/import-circular.md` with Options section

- [ ] Create `docs/rule-options-guide.md`
  - [ ] Explain how to add options to rules
  - [ ] Show Zod schema examples
  - [ ] Document best practices
  - [ ] Show testing patterns

- [ ] Update examples
  - [ ] Add options to `examples/strict/.claudelintrc.json`
  - [ ] Add options to `examples/basic/.claudelintrc.json`
  - [ ] Create `examples/custom-options/.claudelintrc.json`

**Validation Checkpoint:**
- [ ] All docs accurate and complete
- [ ] Examples work as documented
- [ ] `npm run check:rule-docs` passes

#### Phase 4: Testing & Polish (Day 4, ~3-4 hours)

- [ ] Performance Testing
  - [ ] Benchmark config resolution overhead
  - [ ] Verify caching works
  - [ ] Test with 100+ files
  - [ ] Ensure <10% performance degradation

- [ ] Error Handling
  - [ ] Test invalid config files
  - [ ] Test unknown rule IDs in config
  - [ ] Test invalid option values
  - [ ] Improve error messages for config issues

- [ ] CLI Integration
  - [ ] Test `claudelint check-all` respects config
  - [ ] Test `claudelint check-all --config path` works
  - [ ] Test `print-config` shows resolved options
  - [ ] Test `validate-config` catches option errors

- [ ] Edge Cases
  - [ ] Test rule with no schema (options pass through)
  - [ ] Test rule with complex schema (nested objects)
  - [ ] Test multiple overrides for same file
  - [ ] Test config inheritance (nested directories)

- [ ] Final Validation
  - [ ] Run full test suite: `npm test`
  - [ ] Run linters: `npm run lint`
  - [ ] Test all examples: `npm run test:examples`
  - [ ] Verify no breaking changes

**Completion Criteria:**
- [ ] Rules respect "off" setting (can disable any rule)
- [ ] Severity overrides work (can change error  warn)
- [ ] File-specific overrides apply correctly
- [ ] At least 3 rules support configurable options
- [ ] All existing tests pass (zero breaking changes)
- [ ] New tests have 90%+ coverage
- [ ] Documentation complete and accurate
- [ ] Performance impact <10%

**After Completion:**
- [ ] Commit config integration work
- [ ] Update STATUS-REPORT.md with new capabilities
- [ ] Update README.md feature list
- [ ] Continue with rule documentation (task 6)

---

### 5. Review Git Changes (AFTER Config Integration)

Uncommitted changes in 6 validators need review:

- [ ] Review `src/validators/base.ts` changes
- [ ] Review `src/validators/claude-md.ts` changes
- [ ] Review `src/validators/lsp.ts` changes
- [ ] Review `src/validators/mcp.ts` changes
- [ ] Review `src/validators/plugin.ts` changes
- [ ] Review `src/validators/settings.ts` changes
- [ ] Decide: commit, revert, or finish incomplete work

### 6. Document Implemented Rules (AFTER Config Integration)

69 rules are implemented but lack documentation:

#### LSP Rules (18 missing docs)

- [ ] lsp-invalid-root-field
- [ ] lsp-missing-command
- [ ] lsp-missing-extension-to-language
- [ ] lsp-command-not-string
- [ ] lsp-extension-to-language-not-object
- [ ] lsp-extension-invalid-format
- [ ] lsp-language-not-string
- [ ] lsp-args-not-array
- [ ] lsp-transport-invalid
- [ ] lsp-env-not-object
- [ ] lsp-initialization-options-not-object
- [ ] lsp-settings-not-object
- [ ] lsp-workspace-folder-not-string
- [ ] lsp-startup-timeout-invalid
- [ ] lsp-shutdown-timeout-invalid
- [ ] lsp-restart-on-crash-not-boolean
- [ ] lsp-max-restarts-invalid
- [ ] lsp-binary-not-in-path

#### Output Style Rules (10 missing docs)

- [ ] output-style-missing-frontmatter
- [ ] output-style-name-invalid-type
- [ ] output-style-description-invalid-type
- [ ] output-style-keep-coding-invalid-type
- [ ] output-style-missing-body
- [ ] output-style-empty-body
- [ ] output-style-name-too-long
- [ ] output-style-description-empty
- [ ] output-style-invalid-file-extension
- [ ] output-style-invalid-location

#### Skills Rules (13 missing docs)

- [ ] skill-frontmatter-name-max-length
- [ ] skill-frontmatter-name-invalid-chars
- [ ] skill-frontmatter-name-reserved-words
- [ ] skill-frontmatter-name-xml-tags
- [ ] skill-frontmatter-description-empty
- [ ] skill-frontmatter-description-max-length
- [ ] skill-frontmatter-description-xml-tags
- [ ] skill-frontmatter-description-first-person
- [ ] skill-frontmatter-context-invalid-value
- [ ] skill-frontmatter-allowed-tools-invalid
- [ ] skill-frontmatter-model-invalid
- [ ] skill-dangerous-command (after fixing ghost rule)
- [ ] skill-eval-usage (after fixing ghost rule)

#### Agents Rules (16 missing docs)

- [ ] agent-missing-frontmatter
- [ ] agent-missing-name
- [ ] agent-missing-description
- [ ] agent-name-invalid-format
- [ ] agent-name-too-long
- [ ] agent-description-empty
- [ ] agent-tools-invalid-type
- [ ] agent-tools-invalid-tool
- [ ] agent-disallowed-tools-invalid-type
- [ ] agent-disallowed-tools-invalid-tool
- [ ] agent-tools-conflict
- [ ] agent-model-invalid
- [ ] agent-skills-invalid-type
- [ ] agent-missing-body
- [ ] agent-empty-body
- [ ] agent-events-invalid-type

#### Other Rules (12 missing docs)

- [ ] import-invalid-home-path (CLAUDE.md)
- [ ] frontmatter-unknown-field (CLAUDE.md)
- [ ] settings-invalid-schema (Settings)
- [ ] settings-invalid-permission (Settings)
- [ ] settings-invalid-env-var (Settings)
- [ ] hooks-invalid-event (Hooks)
- [ ] hooks-missing-script (Hooks)
- [ ] hooks-invalid-config (Hooks)
- [ ] mcp-invalid-server (MCP)
- [ ] mcp-invalid-transport (MCP)
- [ ] mcp-invalid-env-var (MCP)
- [ ] plugin-invalid-manifest (Plugin)

**Template**: Use `docs/rules/TEMPLATE.md`

**Process**:

1. Copy template to `docs/rules/{validator}/{rule-id}.md`
2. Fill in all sections
3. Add 2+ incorrect and 2+ correct examples
4. Run `npm run check:rule-docs` after each file

---

## Long-Term Work (4-8 weeks)

### 6. Implement Remaining Rules by Category

#### CLAUDE.md Rules (2 remaining)

- [ ] import-invalid-home-path (Refinement - path validation)
- [ ] frontmatter-unknown-field (Schema - .strict())

#### Skills Rules (7 remaining)

- [ ] skill-frontmatter-agent-invalid (Refinement - cross-field validation)
- [ ] skill-invalid-substitution (Refinement - variable syntax)
- [ ] skill-reference-too-deep (Logic - nesting depth check)
- [ ] skill-windows-paths (Refinement - forward slash check)
- [ ] skill-mcp-unqualified-tool (Refinement - pattern matching)
- [ ] skill-naming-not-gerund (Refinement - info-level suggestion)
- [ ] skill-path-traversal (Refinement - after fixing ghost rule)

#### Settings Rules (32 remaining)

- [ ] settings-invalid-root-field (Schema - .strict())
- [ ] settings-invalid-field-type (Schema - type checking)
- [ ] settings-permission-invalid-mode (Schema - z.enum())
- [ ] settings-permission-invalid-tool (Logic - tool registry check)
- [ ] settings-permission-legacy-syntax (Refinement - :_ vs _ check)
- [ ] settings-attribution-invalid-field (Schema - .strict())
- [ ] settings-sandbox-invalid-field (Schema - .strict())
- [ ] settings-sandbox-invalid-network (Schema - object schema)
- [ ] settings-sandbox-invalid-path (Refinement - absolutePath())
- [ ] settings-sandbox-invalid-port (Schema - z.number().min(1).max(65535))
- [ ] settings-statusline-invalid-type (Schema - z.literal('command'))
- [ ] settings-statusline-missing-command (Schema - required field)
- [ ] settings-filesuggestion-invalid-type (Schema - z.literal('command'))
- [ ] settings-filesuggestion-missing-command (Schema - required field)
- [ ] settings-hooks-invalid-event (Schema - event enum)
- [ ] settings-hooks-invalid-tool (Logic - tool registry)
- [ ] settings-mcp-server-invalid-name (Schema - string validation)
- [ ] settings-marketplace-invalid-source (Refinement - discriminated union)
- [ ] settings-marketplace-missing-required (Schema - required fields)
- [ ] settings-marketplace-invalid-url (Refinement - validURL())
- [ ] settings-marketplace-invalid-path (Refinement - absolutePath())
- [ ] settings-plugin-invalid-format (Refinement - name@marketplace parsing)
- [ ] settings-uuid-invalid-format (Refinement - validUUID())
- [ ] settings-number-out-of-range (Schema - z.number().min().max())
- [ ] settings-enum-invalid-value (Schema - z.enum())
- [ ] settings-path-not-relative (Refinement - relativePath())
- [ ] settings-deprecated-field (Refinement - warning message)
- [ ] settings-env-var-invalid-name (Refinement - envVarName())
- [ ] settings-env-var-unknown (Refinement - check against list)
- [ ] settings-scope-invalid (Schema - z.enum())
- [ ] settings-managed-only-field (Logic - context-aware check)

#### Hooks Rules (26 remaining)

- [ ] hooks-invalid-event-name (Schema - z.enum([...12 events]))
- [ ] hooks-invalid-hook-type (Schema - z.enum(['command', 'prompt', 'agent']))
- [ ] hooks-missing-command (Schema - conditional required)
- [ ] hooks-missing-prompt (Schema - conditional required)
- [ ] hooks-both-command-and-prompt (Refinement - mutual exclusivity)
- [ ] hooks-prompt-type-deprecated-events (Refinement - warning)
- [ ] hooks-invalid-timeout (Schema - z.number().positive())
- [ ] hooks-matcher-on-non-tool-event (Refinement - event-specific check)
- [ ] hooks-missing-matcher-array (Schema - array validation)
- [ ] hooks-invalid-matcher-type (Schema - z.string())
- [ ] hooks-invalid-hooks-array (Schema - z.array())
- [ ] hooks-once-not-in-skill (Logic - context check)
- [ ] hooks-mcp-tool-pattern (Refinement - info suggestion)
- [ ] hooks-json-output-schema (Logic - event-specific schemas)
- [ ] hooks-exit-code-2-with-json (Refinement - warning)
- [ ] hooks-deprecated-decision-fields (Refinement - field name check)
- [ ] hooks-invalid-permission-decision (Schema - z.enum())
- [ ] hooks-invalid-permission-behavior (Schema - z.enum())
- [ ] hooks-block-without-reason (Refinement - conditional required)
- [ ] hooks-continue-false-without-reason (Refinement - conditional required)
- [ ] hooks-invalid-tool-name-in-matcher (Logic - tool registry check)
- [ ] hooks-description-outside-plugin (Logic - context check)
- [ ] hooks-env-var-undefined (Refinement - env var check)
- [ ] hooks-command-not-quoted (Refinement - quote detection)
- [ ] hooks-path-traversal-risk (Refinement - noPathTraversal())
- [ ] hooks-sensitive-file-access (Refinement - pattern matching)

#### MCP Rules (28 remaining)

- [ ] mcp-invalid-root-field (Schema - .strict())
- [ ] mcp-invalid-server-name (Schema - string validation)
- [ ] mcp-missing-type (Schema - required field)
- [ ] mcp-invalid-type (Schema - z.enum())
- [ ] mcp-sse-deprecated (Refinement - warning)
- [ ] mcp-stdio-missing-command (Schema - conditional required)
- [ ] mcp-http-missing-url (Schema - conditional required)
- [ ] mcp-sse-missing-url (Schema - conditional required)
- [ ] mcp-invalid-command-type (Schema - z.string())
- [ ] mcp-invalid-args-type (Schema - z.array(z.string()))
- [ ] mcp-invalid-env-type (Schema - z.record(z.string()))
- [ ] mcp-invalid-env-expansion (Refinement - ${VAR} syntax)
- [ ] mcp-env-var-undefined (Refinement - check env vars)
- [ ] mcp-invalid-url-format (Refinement - validURL())
- [ ] mcp-invalid-headers-type (Schema - z.record(z.string()))
- [ ] mcp-windows-npx-without-cmd (Refinement - platform check)
- [ ] mcp-plugin-root-undefined (Logic - context check)
- [ ] mcp-managed-invalid-restriction (Refinement - exactly one field)
- [ ] mcp-managed-multiple-restriction-types (Refinement - mutual exclusivity)
- [ ] mcp-managed-invalid-command-array (Schema - array validation)
- [ ] mcp-managed-invalid-url-pattern (Refinement - URL wildcard)
- [ ] mcp-managed-empty-allowlist (Refinement - warning)
- [ ] mcp-scope-invalid (Schema - z.enum())
- [ ] mcp-both-managed-and-user (Logic - file check)
- [ ] mcp-invalid-timeout (Schema - z.number().positive())
- [ ] mcp-invalid-max-output (Schema - z.number().positive())
- [ ] mcp-tool-search-invalid-value (Logic - special enum parsing)
- [ ] mcp-tool-search-invalid-threshold (Logic - parse "auto:N")

#### Plugin Rules (33 remaining)

- [ ] plugin-missing-manifest (Logic - file check)
- [ ] plugin-manifest-not-in-subdir (Logic - path check)
- [ ] plugin-invalid-root-field (Schema - .strict())
- [ ] plugin-missing-name (Schema - required field)
- [ ] plugin-missing-description (Schema - required field)
- [ ] plugin-missing-version (Schema - required field)
- [ ] plugin-name-invalid-format (Refinement - lowercaseHyphens())
- [ ] plugin-name-too-long (Schema - z.string().max(64))
- [ ] plugin-version-invalid-semver (Refinement - semver())
- [ ] plugin-description-empty (Schema - z.string().min(1))
- [ ] plugin-author-invalid-type (Schema - object schema)
- [ ] plugin-author-missing-name (Schema - required field)
- [ ] plugin-homepage-invalid-url (Refinement - validURL())
- [ ] plugin-repository-invalid-format (Refinement - string or object)
- [ ] plugin-license-invalid (Refinement - SPDX check)
- [ ] plugin-components-at-root (Logic - directory check)
- [ ] plugin-invalid-skills-path (Schema - array validation)
- [ ] plugin-invalid-agents-path (Schema - array validation)
- [ ] plugin-invalid-commands-path (Schema - array validation)
- [ ] plugin-invalid-hooks-path (Schema - string validation)
- [ ] plugin-invalid-mcp-servers (Logic - MCP schema reuse)
- [ ] plugin-mcp-servers-in-wrong-location (Logic - file location)
- [ ] plugin-lsp-servers-in-wrong-location (Logic - file location)
- [ ] plugin-missing-readme (Logic - file check)
- [ ] plugin-skill-missing-namespace (Refinement - name format)
- [ ] plugin-command-missing-namespace (Refinement - name format)
- [ ] plugin-agent-missing-namespace (Refinement - name format)
- [ ] plugin-marketplace-invalid-schema (Schema - marketplace schema)
- [ ] plugin-marketplace-missing-plugins (Schema - required array)
- [ ] plugin-marketplace-invalid-source (Refinement - discriminated union)
- [ ] plugin-marketplace-missing-version (Schema - required field)
- [ ] plugin-dependency-not-found (Logic - dependency resolution)

#### Agents Rules (7 remaining)

- [ ] agent-invalid-frontmatter-field (Schema - .strict())
- [ ] agent-permission-mode-invalid (Schema - z.enum())
- [ ] agent-hooks-invalid-event (Refinement - event subset)
- [ ] agent-hooks-stop-converted (Refinement - info message)
- [ ] agent-no-tools-specified (Refinement - info message)
- [ ] agent-bypass-permissions-warning (Refinement - warning)
- [ ] agent-skills-not-inherited (Refinement - info message)
- [ ] agent-cannot-spawn-subagents (Refinement - info message)
- [ ] agent-cli-json-invalid (Logic - CLI integration)

#### LSP Rules (4 remaining)

- [ ] lsp-plugin-location-wrong (Logic - file location)
- [ ] lsp-inline-conflicts-with-file (Refinement - mutual exclusivity)
- [ ] lsp-unknown-language-id (Refinement - info suggestion)
- [ ] lsp-socket-transport-deprecated (Refinement - warning)

#### Output Style Rules (2 remaining)

- [ ] output-style-invalid-frontmatter-field (Schema - .strict())
- [ ] output-style-plugin-location-wrong (Logic - plugin directory)

### 7. Enforcement Automation (3-5 hours)

- [ ] Implement `scripts/check-examples.ts` (2 hours)
  - Extract code blocks from rule docs
  - Validate JSON/YAML syntax
  - Count incorrect/correct examples
  - Report docs with insufficient examples

- [ ] Implement `scripts/check-coverage.ts` (1.5 hours)
  - List rules without docs
  - List rules without tests
  - Calculate coverage percentages
  - Generate quality scores

- [ ] Configure pre-commit hooks (30 min)
  - Add check:file-naming
  - Add check:rule-ids
  - Add check:rule-docs
  - Add check:consistency
  - Test hooks work

- [ ] Configure CI checks (1 hour)
  - Add validation checks to GitHub Actions
  - Add test suite
  - Add coverage reporting
  - Test CI pipeline

---

## Implementation Strategy

### Batch by Validator

Work on one validator at a time to maintain context:

1. Complete all rules for one validator
2. Write/update all tests
3. Document all rules
4. Move to next validator

### Prioritize by Type

Within each validator:

1. **Schema rules first** (easiest, fastest)
2. **Refinement rules second** (moderate complexity)
3. **Logic rules last** (most complex)

### Document as You Go

Don't let documentation lag behind:

- Create rule doc immediately after implementing
- Easier to write examples while implementation is fresh
- Prevents documentation debt

### Test Coverage

Maintain high test coverage:

- Write tests before or during implementation
- Use builder patterns for fixtures
- Test both valid and invalid cases

---

## Progress Tracking

Update this checklist as you complete tasks:

- Replace `- [ ]` with `- [x]` when done
- Update status percentages weekly
- Celebrate milestones (25%, 50%, 75%, 100%)

**Current Milestone**: Fix immediate blockers (ghost rules + broken docs)
**Next Milestone**: 25% complete (55/219 rules)
**Target**: 100% complete for v1.0.0 release
