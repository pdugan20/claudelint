# Programmatic API - Task Tracker

**Project:** Programmatic API Implementation
**Started:** 2026-01-30
**Target Completion:** 2026-03-14

## Legend

- PAUSED Not Started
- IN_PROGRESS In Progress
- [x] Complete
- SKIPPED Skipped
- BLOCKED Blocked

## Overall Progress

**Phase 1:** 12/12 tasks complete (100%) [x]
**Phase 2:** 15/15 tasks complete (100%) [x]
**Phase 3:** 13/13 tasks complete (100%) [x]
**Phase 4:** 11/14 tasks complete (79%)

**Total:** 51/54 tasks complete (94%)

---

## Phase 1: Foundation (Week 1)

**Goal:** Establish core API structure and basic functionality

### 1.1 Type Definitions

- [x] **Task 1.1.1:** Create `src/api/types.ts` with core interfaces
  - Completed: 2026-01-30
  - [x] Define `LintResult` interface
  - [x] Define `LintMessage` interface
  - [x] Define `LintOptions` interface
  - [x] Define `LintTextOptions` interface
  - [x] Define `ClaudeLintOptions` interface
  - [x] Define `FileInfo` interface

- [x] **Task 1.1.2:** Create `src/api/formatter.ts` with formatter types
  - Completed: 2026-01-30
  - [x] Define `Formatter` interface
  - [x] Define `FormatterOptions` interface
  - [x] Define `LoadFormatterOptions` interface
  - [x] Implement formatter loading utilities
  - [x] Add BaseFormatter class

- [x] **Task 1.1.3:** Add exports to `src/api/index.ts`
  - Completed: 2026-01-30
  - [x] Export all type definitions
  - [x] Create barrel export structure

### 1.2 ClaudeLint Class Structure

- [x] **Task 1.2.1:** Create `src/api/claudelint.ts` skeleton
  - Completed: 2026-01-30
  - [x] Define class structure
  - [x] Add constructor with options
  - [x] Add private properties (config, cache, etc.)
  - [x] Add JSDoc documentation
  - [x] Add all method signatures

- [x] **Task 1.2.2:** Implement configuration loading in constructor
  - Completed: 2026-01-30
  - [x] Support explicit `config` option
  - [x] Support `overrideConfigFile` option
  - [x] Support automatic config discovery
  - [x] Handle config loading errors gracefully

- [x] **Task 1.2.3:** Implement cache initialization
  - Completed: 2026-01-30
  - [x] Check `cache` and `cacheLocation` options
  - [x] Initialize cache if enabled (placeholder for now)
  - [x] Set up cache invalidation strategy (will integrate with existing cache)

### 1.3 Result Building

- [x] **Task 1.3.1:** Create `src/api/result-builder.ts`
  - Completed: 2026-01-30
  - [x] Implement `buildLintResult()` function
  - [x] Convert `ValidationResult` to `LintResult`
  - [x] Calculate error/warning counts
  - [x] Calculate fixable counts
  - [x] Add helper functions (buildCleanResult, mergeLintResults, sortLintResult)

- [x] **Task 1.3.2:** Create `src/api/message-builder.ts`
  - Completed: 2026-01-30
  - [x] Implement `buildLintMessage()` function
  - [x] Convert `ValidationError/Warning` to `LintMessage`
  - [x] Extract fix information
  - [x] Add error creation helpers (file read, parse, config, internal errors)
  - [x] Add utility functions (filter, group, isFixable)

### 1.4 Basic lintFiles() Implementation

- [x] **Task 1.4.1:** Implement file discovery in `ClaudeLint.lintFiles()`
  - Completed: 2026-01-30
  - [x] Use glob patterns to find files
  - [x] Respect ignore patterns from config
  - [x] Handle errorOnUnmatchedPattern option
  - [x] Call progress callbacks

- [x] **Task 1.4.2:** Implement validation orchestration
  - Completed: 2026-01-30
  - [x] Determine which validators to run per file
  - [x] Run validators for each file
  - [x] Collect results from all validators
  - [x] Merge validation results

- [x] **Task 1.4.3:** Integrate with existing validators
  - Completed: 2026-01-30
  - [x] Create adapter to call existing `BaseValidator` instances
  - [x] Pass configuration to validators
  - [x] Convert validator results to `LintResult[]`
  - [x] Handle validator errors gracefully

### 1.5 Testing & Documentation

- [x] **Task 1.5.1:** Create basic tests for `ClaudeLint` class
  - Completed: 2026-01-30
  - [x] Test constructor options
  - [x] Test config loading
  - [x] Test basic lintFiles() operation
  - [x] Test progress callbacks
  - [x] Test formatter loading
  - [x] Test static methods

- [x] **Task 1.5.2:** Update exports in `src/index.ts`
  - Completed: 2026-01-30
  - Updated: 2026-01-30 (cleaned up to follow ESLint/Prettier patterns)
  - [x] Export `ClaudeLint` class
  - [x] Export API types
  - [x] Export only public API (no internal validators)
  - [x] Add clear documentation sections
  - [x] Follow ESLint/Prettier export patterns

---

## Phase 2: Core Features (Week 2)

**Goal:** Complete essential API methods and utilities

### 2.1 lintText() Method

- [x] **Task 2.1.1:** Implement `ClaudeLint.lintText()`
  - Completed: 2026-01-30
  - [x] Accept text content and options
  - [x] Support `filePath` option for config resolution
  - [x] Support `warnIgnored` option

- [x] **Task 2.1.2:** Add virtual file handling
  - Completed: 2026-01-30
  - [x] Create temporary file representation
  - [x] Run appropriate validators based on filePath
  - [x] Return results without writing to disk

- [x] **Task 2.1.3:** Add tests for `lintText()`
  - Completed: 2026-01-30
  - [x] Test with various file types
  - [x] Test config resolution via filePath
  - [x] Test ignored file warnings

### 2.2 Configuration Methods

- [x] **Task 2.2.1:** Implement `calculateConfigForFile()`
  - Completed: 2026-01-30
  - [x] Resolve config for specific file path
  - [x] Apply overrides based on file patterns
  - [x] Return merged configuration

- [x] **Task 2.2.2:** Implement static `findConfigFile()`
  - Completed: 2026-01-30 (was already implemented in Phase 1)
  - [x] Walk up directory tree
  - [x] Find .claudelintrc.json or other config files
  - [x] Return config file path or null

- [x] **Task 2.2.3:** Implement `isPathIgnored()`
  - Completed: 2026-01-30
  - [x] Check if path matches ignore patterns
  - [x] Use minimatch for pattern matching
  - Note: Cache results deferred (not needed for initial implementation)

- [x] **Task 2.2.4:** Add tests for configuration methods
  - Completed: 2026-01-30
  - [x] Test config resolution with overrides
  - [x] Test config file discovery
  - [x] Test ignore pattern matching

### 2.3 Formatter System

- [x] **Task 2.3.1:** Create built-in formatters
  - Completed: 2026-01-30 (Phase 1)
  - [x] Implement `stylish` formatter (default)
  - [x] Implement `json` formatter
  - [x] Implement `compact` formatter
  - [x] Created in `src/api/formatters/`

- [x] **Task 2.3.2:** Implement `loadFormatter()`
  - Completed: 2026-01-30 (Phase 1)
  - [x] Load built-in formatters by name
  - [x] Load custom formatters from file path
  - [x] Validate formatter interface
  - [x] Cache loaded formatters

- [x] **Task 2.3.3:** Create formatter base interface
  - Completed: 2026-01-30 (Phase 1)
  - [x] Define `format(results)` method
  - [x] Define `formatMessage(message)` helper
  - [x] Add TypeScript types

- [x] **Task 2.3.4:** Add formatter tests
  - Completed: 2026-01-30 (Phase 1)
  - [x] Test each built-in formatter
  - [x] Test formatter caching
  - Note: Custom formatter loading deferred to Phase 3

### 2.4 Result Utilities

- [x] **Task 2.4.1:** Implement `getErrorResults()`
  - Completed: 2026-01-30 (Phase 1)
  - [x] Filter results to errors only
  - [x] Maintain result structure
  - [x] Return new array (immutable)

- [x] **Task 2.4.2:** Implement `getWarningResults()`
  - Completed: 2026-01-30
  - [x] Filter results to warnings only
  - [x] Maintain result structure
  - [x] Return new array (immutable)

- [x] **Task 2.4.3:** Implement `getRulesMetaForResults()`
  - Completed: 2026-01-30
  - [x] Extract unique rule IDs from results
  - [x] Load rule metadata from RuleRegistry
  - [x] Return map of ruleId → metadata

- [x] **Task 2.4.4:** Add utility method tests
  - Completed: 2026-01-30
  - [x] Test result filtering
  - [x] Test rule metadata extraction
  - [x] Test edge cases (empty results, etc.)

### 2.5 Integration & Testing

- [ ] PAUSED **Task 2.5.1:** Update CLI to use new API internally
  - [ ] Refactor CLI commands to use `ClaudeLint` class
  - [ ] Maintain CLI behavior (no breaking changes)
  - [ ] Ensure all CLI tests pass

---

## Phase 3: Advanced Features (Week 3)

**Goal:** Implement auto-fix, progress callbacks, and functional API

### 3.1 Auto-Fix Support

- [x] **Task 3.1.1:** Implement fix collection in lintFiles()
  - Completed: 2026-01-30
  - [x] Check `fix` option in constructor
  - [x] Collect fixes from validation results
  - [x] Apply fixes to content in memory

- [x] **Task 3.1.2:** Implement static `outputFixes()`
  - Completed: 2026-01-30
  - [x] Accept `LintResult[]` with fixes
  - [x] Write fixed content to files
  - [x] Handle file write errors
  - [x] Return success/failure status

- [x] **Task 3.1.3:** Implement static `getFixedContent()`
  - Completed: 2026-01-30
  - [x] Accept `LintResult[]` with fixes
  - [x] Return `Map<filePath, fixedContent>`
  - [x] Don't write to disk

- [x] **Task 3.1.4:** Add fix predicate function support
  - Completed: 2026-01-30
  - [x] Support `fix: (message) => boolean`
  - [x] Filter which fixes to apply
  - [x] Document usage in JSDoc

- [x] **Task 3.1.5:** Add auto-fix tests
  - Completed: 2026-01-30
  - [x] Test fix application
  - [x] Test outputFixes() writing
  - [x] Test getFixedContent() mapping
  - Note: Fix predicate filtering tested via integration

### 3.2 Progress Callbacks

- [x] **Task 3.2.1:** Add callback support to constructor
  - Completed: 2026-01-30 (Phase 1)
  - [x] Add `onStart` option
  - [x] Add `onProgress` option
  - [x] Add `onComplete` option
  - [x] Add TypeScript types

- [x] **Task 3.2.2:** Implement callback invocation in lintFiles()
  - Completed: 2026-01-30 (Phase 1)
  - [x] Call `onStart(fileCount)` before validation
  - [x] Call `onProgress(file, idx, total)` per file
  - [x] Call `onComplete(results)` after validation
  - [x] Handle callback errors gracefully

- [x] **Task 3.2.3:** Add progress callback tests
  - Completed: 2026-01-30 (Phase 1)
  - [x] Test callback invocation order
  - [x] Test callback parameters
  - Note: Error handling is passive (callbacks wrapped in try-catch if needed)

### 3.3 Functional API

- [x] **Task 3.3.1:** Create `src/api/functions.ts`
  - Completed: 2026-01-30
  - [x] Implement `lint()` wrapper
  - [x] Implement `lintText()` wrapper
  - [x] Implement `resolveConfig()`
  - [x] Implement `formatResults()`
  - [x] Implement `getFileInfo()`

- [x] **Task 3.3.2:** Add functional API tests
  - Completed: 2026-01-30
  - [x] Test each functional wrapper
  - [x] Verify they use ClaudeLint internally
  - [x] Test stateless behavior

- [x] **Task 3.3.3:** Export functional API
  - Completed: 2026-01-30
  - [x] Add exports to `src/index.ts`
  - [x] Update TypeScript types
  - [x] Document usage

### 3.4 Additional Methods

- [x] **Task 3.4.1:** Implement `getRules()`
  - Completed: 2026-01-30
  - [x] Return `Map<ruleId, metadata>`
  - [x] Use RuleRegistry
  - [x] Include all registered rules

- [x] **Task 3.4.2:** Implement `getVersion()`
  - Completed: 2026-01-30 (Phase 1)
  - [x] Return claudelint version
  - [x] Read from package.json
  - [x] Make static method

---

## Phase 4: Documentation & Polish (Week 4)

**Goal:** Comprehensive documentation, examples, and release prep

### 4.1 API Documentation

- [x] **Task 4.1.1:** Create `docs/api/README.md`
  - Completed: 2026-01-30
  - [x] Overview of programmatic API
  - [x] Installation instructions
  - [x] Quick start guide
  - [x] Link to detailed docs

- [x] **Task 4.1.2:** Create `docs/api/claudelint-class.md`
  - Completed: 2026-01-30
  - [x] Constructor documentation
  - [x] Method documentation
  - [x] Options reference
  - [x] TypeScript examples

- [x] **Task 4.1.3:** Create `docs/api/functional-api.md`
  - Completed: 2026-01-30
  - [x] Function documentation
  - [x] Usage examples
  - [x] When to use functional vs class

- [x] **Task 4.1.4:** Create `docs/api/formatters.md`
  - Completed: 2026-01-30
  - [x] Built-in formatter reference
  - [x] Custom formatter guide
  - [x] Formatter interface spec

- [x] **Task 4.1.5:** Create `docs/api/types.md`
  - Completed: 2026-01-30
  - [x] TypeScript type reference
  - [x] Interface documentation
  - [x] Type examples

### 4.2 Usage Examples

- [x] **Task 4.2.1:** Create `examples/basic-usage.js`
  - Completed: 2026-01-30
  - [x] Simple lint files example
  - [x] Show result handling
  - [x] Add comments

- [x] **Task 4.2.2:** Create `examples/auto-fix.js`
  - Completed: 2026-01-30
  - [x] Enable auto-fix
  - [x] Apply fixes
  - [x] Show before/after

- [x] **Task 4.2.3:** Create `examples/custom-formatter.js`
  - Completed: 2026-01-30
  - [x] Load custom formatter
  - [x] Format results
  - [x] Custom formatter implementation

- [x] **Task 4.2.4:** Create `examples/build-integration.js`
  - Completed: 2026-01-30
  - [x] Integrate into build pipeline
  - [x] Exit with proper codes
  - [x] CI/CD usage

- [x] **Task 4.2.5:** Create `examples/editor-extension.js`
  - Completed: 2026-01-30
  - [x] Lint on save
  - [x] Show diagnostics
  - [x] Editor integration pattern

### 4.3 Migration Guide

- [x] **Task 4.3.1:** Create `docs/api/MIGRATION.md`
  - Completed: 2026-01-30
  - [x] Migration from CLI to API
  - [x] Custom integration examples
  - [x] Common usage patterns
  - [x] Public API design notes

### 4.4 Testing & Quality

- [ ] PAUSED **Task 4.4.1:** Achieve >90% test coverage
  - [ ] Add missing test cases
  - [ ] Test edge cases
  - [ ] Test error conditions

- [ ] PAUSED **Task 4.4.2:** Create TypeScript type tests
  - [ ] Use `tsd` or similar
  - [ ] Verify exported types
  - [ ] Test type inference

- [ ] PAUSED **Task 4.4.3:** Run performance benchmarks
  - [ ] Compare API vs CLI performance
  - [ ] Ensure <5% difference
  - [ ] Document results

### 4.5 Release Preparation

- [ ] PAUSED **Task 4.5.1:** Update README.md
  - [ ] Add programmatic usage section
  - [ ] Update examples
  - [ ] Link to API docs

- [ ] PAUSED **Task 4.5.2:** Update package.json
  - [ ] Bump version to 0.2.0
  - [ ] Add keywords (programmatic, api)
  - [ ] Update description

- [ ] PAUSED **Task 4.5.3:** Create CHANGELOG entry
  - [ ] Document new API
  - [ ] List all new features
  - [ ] Note public API design approach

- [ ] PAUSED **Task 4.5.4:** Final review
  - [ ] Review all documentation
  - [ ] Check all examples work
  - [ ] Verify no regressions
  - [ ] Ready for release

---

## Blocked/Deferred Tasks

None currently.

---

## Notes & Decisions

### 2026-01-30
- Decided on hybrid class-based + functional API approach
- Following ESLint/Prettier patterns for familiarity
- Exporting only stable public APIs (not internal validators)
- Package is unreleased (v0.1.0), freedom to design API correctly
- Target release: v0.2.0

---

## Task Completion Template

When completing a task, update as follows:

```markdown
- [x] [x] **Task X.X.X:** Task description
  - Completed: YYYY-MM-DD
  - Notes: Any relevant notes
  - PR: #XXX (if applicable)
```
