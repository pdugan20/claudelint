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

**Phase 1:** 0/12 tasks complete (0%)
**Phase 2:** 0/15 tasks complete (0%)
**Phase 3:** 0/13 tasks complete (0%)
**Phase 4:** 0/14 tasks complete (0%)

**Total:** 0/54 tasks complete (0%)

---

## Phase 1: Foundation (Week 1)

**Goal:** Establish core API structure and basic functionality

### 1.1 Type Definitions

- [ ] PAUSED **Task 1.1.1:** Create `src/api/types.ts` with core interfaces
  - [ ] Define `LintResult` interface
  - [ ] Define `LintMessage` interface
  - [ ] Define `LintOptions` interface
  - [ ] Define `LintTextOptions` interface
  - [ ] Define `ClaudeLintOptions` interface
  - [ ] Define `FileInfo` interface

- [ ] PAUSED **Task 1.1.2:** Create `src/api/formatter.ts` with formatter types
  - [ ] Define `Formatter` interface
  - [ ] Define `FormatterOptions` interface
  - [ ] Define `LoadFormatterOptions` interface

- [ ] PAUSED **Task 1.1.3:** Add exports to `src/api/index.ts`
  - [ ] Export all type definitions
  - [ ] Create barrel export structure

### 1.2 ClaudeLint Class Structure

- [ ] PAUSED **Task 1.2.1:** Create `src/api/claudelint.ts` skeleton
  - [ ] Define class structure
  - [ ] Add constructor with options
  - [ ] Add private properties (config, cache, etc.)
  - [ ] Add JSDoc documentation

- [ ] PAUSED **Task 1.2.2:** Implement configuration loading in constructor
  - [ ] Support explicit `config` option
  - [ ] Support `overrideConfigFile` option
  - [ ] Support automatic config discovery
  - [ ] Handle config loading errors gracefully

- [ ] PAUSED **Task 1.2.3:** Implement cache initialization
  - [ ] Check `cache` and `cacheLocation` options
  - [ ] Initialize cache if enabled
  - [ ] Set up cache invalidation strategy

### 1.3 Result Building

- [ ] PAUSED **Task 1.3.1:** Create `src/api/result-builder.ts`
  - [ ] Implement `buildLintResult()` function
  - [ ] Convert `ValidationResult` to `LintResult`
  - [ ] Calculate error/warning counts
  - [ ] Calculate fixable counts

- [ ] PAUSED **Task 1.3.2:** Create `src/api/message-builder.ts`
  - [ ] Implement `buildLintMessage()` function
  - [ ] Convert `ValidationError/Warning` to `LintMessage`
  - [ ] Extract fix information
  - [ ] Extract suggestions

### 1.4 Basic lintFiles() Implementation

- [ ] PAUSED **Task 1.4.1:** Implement file discovery in `ClaudeLint.lintFiles()`
  - [ ] Use glob patterns to find files
  - [ ] Respect ignore patterns from config
  - [ ] Handle errorOnUnmatchedPattern option

- [ ] PAUSED **Task 1.4.2:** Implement validation orchestration
  - [ ] Determine which validators to run per file
  - [ ] Run validators in parallel
  - [ ] Collect results from all validators

- [ ] PAUSED **Task 1.4.3:** Integrate with existing validators
  - [ ] Create adapter to call existing `BaseValidator` instances
  - [ ] Pass configuration to validators
  - [ ] Convert validator results to `LintResult[]`

### 1.5 Testing & Documentation

- [ ] PAUSED **Task 1.5.1:** Create basic tests for `ClaudeLint` class
  - [ ] Test constructor options
  - [ ] Test config loading
  - [ ] Test basic lintFiles() operation

- [ ] PAUSED **Task 1.5.2:** Update exports in `src/index.ts`
  - [ ] Export `ClaudeLint` class
  - [ ] Export API types
  - [ ] Maintain backward compatibility

---

## Phase 2: Core Features (Week 2)

**Goal:** Complete essential API methods and utilities

### 2.1 lintText() Method

- [ ] PAUSED **Task 2.1.1:** Implement `ClaudeLint.lintText()`
  - [ ] Accept text content and options
  - [ ] Support `filePath` option for config resolution
  - [ ] Support `warnIgnored` option

- [ ] PAUSED **Task 2.1.2:** Add virtual file handling
  - [ ] Create temporary file representation
  - [ ] Run appropriate validators based on filePath
  - [ ] Return results without writing to disk

- [ ] PAUSED **Task 2.1.3:** Add tests for `lintText()`
  - [ ] Test with various file types
  - [ ] Test config resolution via filePath
  - [ ] Test ignored file warnings

### 2.2 Configuration Methods

- [ ] PAUSED **Task 2.2.1:** Implement `calculateConfigForFile()`
  - [ ] Resolve config for specific file path
  - [ ] Apply overrides based on file patterns
  - [ ] Return merged configuration

- [ ] PAUSED **Task 2.2.2:** Implement static `findConfigFile()`
  - [ ] Walk up directory tree
  - [ ] Find .claudelintrc.json or other config files
  - [ ] Return config file path or null

- [ ] PAUSED **Task 2.2.3:** Implement `isPathIgnored()`
  - [ ] Check if path matches ignore patterns
  - [ ] Use minimatch for pattern matching
  - [ ] Cache results for performance

- [ ] PAUSED **Task 2.2.4:** Add tests for configuration methods
  - [ ] Test config resolution with overrides
  - [ ] Test config file discovery
  - [ ] Test ignore pattern matching

### 2.3 Formatter System

- [ ] PAUSED **Task 2.3.1:** Create built-in formatters
  - [ ] Implement `stylish` formatter (default)
  - [ ] Implement `json` formatter
  - [ ] Implement `compact` formatter
  - [ ] Move existing CLI formatters to `src/api/formatters/`

- [ ] PAUSED **Task 2.3.2:** Implement `loadFormatter()`
  - [ ] Load built-in formatters by name
  - [ ] Load custom formatters from file path
  - [ ] Validate formatter interface
  - [ ] Cache loaded formatters

- [ ] PAUSED **Task 2.3.3:** Create formatter base interface
  - [ ] Define `format(results)` method
  - [ ] Define `formatMessage(message)` helper
  - [ ] Add TypeScript types

- [ ] PAUSED **Task 2.3.4:** Add formatter tests
  - [ ] Test each built-in formatter
  - [ ] Test custom formatter loading
  - [ ] Test formatter validation

### 2.4 Result Utilities

- [ ] PAUSED **Task 2.4.1:** Implement `getErrorResults()`
  - [ ] Filter results to errors only
  - [ ] Maintain result structure
  - [ ] Return new array (immutable)

- [ ] PAUSED **Task 2.4.2:** Implement `getWarningResults()`
  - [ ] Filter results to warnings only
  - [ ] Maintain result structure
  - [ ] Return new array (immutable)

- [ ] PAUSED **Task 2.4.3:** Implement `getRulesMetaForResults()`
  - [ ] Extract unique rule IDs from results
  - [ ] Load rule metadata from RuleRegistry
  - [ ] Return map of ruleId → metadata

- [ ] PAUSED **Task 2.4.4:** Add utility method tests
  - [ ] Test result filtering
  - [ ] Test rule metadata extraction
  - [ ] Test edge cases (empty results, etc.)

### 2.5 Integration & Testing

- [ ] PAUSED **Task 2.5.1:** Update CLI to use new API internally
  - [ ] Refactor CLI commands to use `ClaudeLint` class
  - [ ] Maintain CLI behavior (no breaking changes)
  - [ ] Ensure all CLI tests pass

---

## Phase 3: Advanced Features (Week 3)

**Goal:** Implement auto-fix, progress callbacks, and functional API

### 3.1 Auto-Fix Support

- [ ] PAUSED **Task 3.1.1:** Implement fix collection in lintFiles()
  - [ ] Check `fix` option in constructor
  - [ ] Collect fixes from validation results
  - [ ] Apply fixes to content in memory

- [ ] PAUSED **Task 3.1.2:** Implement static `outputFixes()`
  - [ ] Accept `LintResult[]` with fixes
  - [ ] Write fixed content to files
  - [ ] Handle file write errors
  - [ ] Return success/failure status

- [ ] PAUSED **Task 3.1.3:** Implement static `getFixedContent()`
  - [ ] Accept `LintResult[]` with fixes
  - [ ] Return `Map<filePath, fixedContent>`
  - [ ] Don't write to disk

- [ ] PAUSED **Task 3.1.4:** Add fix predicate function support
  - [ ] Support `fix: (message) => boolean`
  - [ ] Filter which fixes to apply
  - [ ] Document usage in JSDoc

- [ ] PAUSED **Task 3.1.5:** Add auto-fix tests
  - [ ] Test fix application
  - [ ] Test outputFixes() writing
  - [ ] Test getFixedContent() mapping
  - [ ] Test fix predicate filtering

### 3.2 Progress Callbacks

- [ ] PAUSED **Task 3.2.1:** Add callback support to constructor
  - [ ] Add `onStart` option
  - [ ] Add `onProgress` option
  - [ ] Add `onComplete` option
  - [ ] Add TypeScript types

- [ ] PAUSED **Task 3.2.2:** Implement callback invocation in lintFiles()
  - [ ] Call `onStart(fileCount)` before validation
  - [ ] Call `onProgress(file, idx, total)` per file
  - [ ] Call `onComplete(results)` after validation
  - [ ] Handle callback errors gracefully

- [ ] PAUSED **Task 3.2.3:** Add progress callback tests
  - [ ] Test callback invocation order
  - [ ] Test callback parameters
  - [ ] Test error handling

### 3.3 Functional API

- [ ] PAUSED **Task 3.3.1:** Create `src/api/functions.ts`
  - [ ] Implement `lint()` wrapper
  - [ ] Implement `lintText()` wrapper
  - [ ] Implement `resolveConfig()`
  - [ ] Implement `formatResults()`
  - [ ] Implement `getFileInfo()`

- [ ] PAUSED **Task 3.3.2:** Add functional API tests
  - [ ] Test each functional wrapper
  - [ ] Verify they use ClaudeLint internally
  - [ ] Test stateless behavior

- [ ] PAUSED **Task 3.3.3:** Export functional API
  - [ ] Add exports to `src/index.ts`
  - [ ] Update TypeScript types
  - [ ] Document usage

### 3.4 Additional Methods

- [ ] PAUSED **Task 3.4.1:** Implement `getRules()`
  - [ ] Return `Map<ruleId, metadata>`
  - [ ] Use RuleRegistry
  - [ ] Include all registered rules

- [ ] PAUSED **Task 3.4.2:** Implement `getVersion()`
  - [ ] Return claudelint version
  - [ ] Read from package.json
  - [ ] Make static method

---

## Phase 4: Documentation & Polish (Week 4)

**Goal:** Comprehensive documentation, examples, and release prep

### 4.1 API Documentation

- [ ] PAUSED **Task 4.1.1:** Create `docs/api/README.md`
  - [ ] Overview of programmatic API
  - [ ] Installation instructions
  - [ ] Quick start guide
  - [ ] Link to detailed docs

- [ ] PAUSED **Task 4.1.2:** Create `docs/api/claudelint-class.md`
  - [ ] Constructor documentation
  - [ ] Method documentation
  - [ ] Options reference
  - [ ] TypeScript examples

- [ ] PAUSED **Task 4.1.3:** Create `docs/api/functional-api.md`
  - [ ] Function documentation
  - [ ] Usage examples
  - [ ] When to use functional vs class

- [ ] PAUSED **Task 4.1.4:** Create `docs/api/formatters.md`
  - [ ] Built-in formatter reference
  - [ ] Custom formatter guide
  - [ ] Formatter interface spec

- [ ] PAUSED **Task 4.1.5:** Create `docs/api/types.md`
  - [ ] TypeScript type reference
  - [ ] Interface documentation
  - [ ] Type examples

### 4.2 Usage Examples

- [ ] PAUSED **Task 4.2.1:** Create `examples/basic-usage.js`
  - [ ] Simple lint files example
  - [ ] Show result handling
  - [ ] Add comments

- [ ] PAUSED **Task 4.2.2:** Create `examples/auto-fix.js`
  - [ ] Enable auto-fix
  - [ ] Apply fixes
  - [ ] Show before/after

- [ ] PAUSED **Task 4.2.3:** Create `examples/custom-formatter.js`
  - [ ] Load custom formatter
  - [ ] Format results
  - [ ] Custom formatter implementation

- [ ] PAUSED **Task 4.2.4:** Create `examples/build-integration.js`
  - [ ] Integrate into build pipeline
  - [ ] Exit with proper codes
  - [ ] CI/CD usage

- [ ] PAUSED **Task 4.2.5:** Create `examples/editor-extension.js`
  - [ ] Lint on save
  - [ ] Show diagnostics
  - [ ] Editor integration pattern

### 4.3 Migration Guide

- [ ] PAUSED **Task 4.3.1:** Create `docs/api/MIGRATION.md`
  - [ ] Migration from CLI to API
  - [ ] Migration from direct validator imports
  - [ ] Breaking changes (if any)
  - [ ] Backward compatibility notes

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
  - [ ] Note backward compatibility

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
- Following ESLint patterns for familiarity
- Maintaining 100% backward compatibility
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
