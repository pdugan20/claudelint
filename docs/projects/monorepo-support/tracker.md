# Monorepo Support - Progress Tracker

Project to add monorepo support with config inheritance and workspace detection.

**Status:** Not Started
**Start Date:** 2026-02-01
**Target Completion:** TBD

## Overview

### Phase Summary

| Phase | Status | Duration | LOC | Completion |
|-------|--------|----------|-----|------------|
| Phase 1: Config Inheritance | **COMPLETE** | 2 days | ~500 | 21/21 tasks (100%) |
| Phase 2: Workspace Detection | **COMPLETE** | 1.5 days | ~400 | 15/15 tasks (100%) |
| Phase 3: Testing & Docs | Not Started | 1 day | ~800 | 0/12 tasks |
| **Total** | **In Progress** | **4.5 days** | **~1700** | **36/48 tasks (75%)** |

---

## Phase 1: Config Inheritance

**Goal:** Implement `extends` field for config reuse across packages

**Timeline:** 2 days
**Lines of Code:** ~500
**Dependencies:** None

### 1.1 Schema Changes

- [x] Update `ClaudeLintConfig` interface to add `extends` field
  - [x] Add `extends?: string | string[]` to interface
  - [x] Document field in JSDoc comments
  - [x] Update type exports in `src/utils/config/types.ts`
- [x] Update config validation to handle `extends`
  - [x] Validate `extends` is string or string array
  - [x] Validate no empty strings in array
  - [x] Add warning for deprecated extends syntax (if needed)
- [x] Add `extends` to config schema examples
  - [x] Update `.claudelintrc.json` example
  - [x] Add example with multiple extends
  - [x] Add example with node_modules package

**Task 1.1 Completion Criteria:**

- [x] TypeScript types updated and building
- [x] Schema validation handles `extends` field
- [x] Examples documented

**Estimated Time:** 0.5 day (4 hours) - COMPLETE

---

### 1.2 Config Resolution Logic

- [x] Create `resolveConfigPath()` utility function
  - [x] Handle relative paths (`./base.json`, `../../root.json`)
  - [x] Handle node_modules packages (`@acme/claudelint-config`)
  - [x] Handle scoped packages (`@acme/claudelint-config/strict`)
  - [x] Use `require.resolve()` for node_modules lookup
  - [x] Return resolved absolute path
- [x] Create `loadConfigWithExtends()` recursive loader
  - [x] Accept config path and visited set
  - [x] Load base config with existing `loadConfig()`
  - [x] Return early if no `extends` field
  - [x] Detect circular dependencies with visited set
  - [x] Resolve each extended config path
  - [x] Recursively load extended configs
  - [x] Merge configs in correct order (base → ext1 → ext2 → current)
- [x] Update config merge logic
  - [x] Deep merge for `rules` object
  - [x] Array concatenation for `overrides`
  - [x] Last-wins for `ignorePatterns` (flatten arrays)
  - [x] Last-wins for `output` object
  - [x] Last-wins for scalar values
- [x] Add circular dependency detection
  - [x] Create `Set<string>` to track visited paths
  - [x] Check before loading each config
  - [x] Throw `ConfigError` with helpful message
  - [x] Include dependency chain in error
- [x] Update `loadAndValidateConfig()` to use new loader
  - [x] Replace `loadConfig()` with `loadConfigWithExtends()`
  - [x] Validate extended configs upfront
  - [x] Handle errors gracefully
  - [x] Log extended config paths in debug mode

**Task 1.2 Completion Criteria:**

- [x] Config resolution logic implemented
- [x] Circular dependencies detected
- [x] Merge order correct (verified with tests)
- [x] Integration with existing code complete

**Estimated Time:** 1 day (8 hours) - COMPLETE

---

### 1.3 Testing

- [x] Unit tests for `resolveConfigPath()`
  - [x] Test relative path resolution
  - [x] Test node_modules package resolution
  - [x] Test scoped package resolution
  - [x] Test nonexistent package error
  - [x] Test malformed path error
- [x] Unit tests for `loadConfigWithExtends()`
  - [x] Test single extends
  - [x] Test multiple extends (array)
  - [x] Test recursive extends (A → B → C)
  - [x] Test circular dependency detection (A → B → A)
  - [x] Test merge order (last wins)
  - [x] Test with missing extended config
- [x] Integration tests
  - [x] Create fixture monorepo with extended configs
  - [x] Test validation with inherited config
  - [x] Test override of inherited rules
  - [x] Test multiple levels of inheritance
  - [x] Test extends from node_modules (mock package)
- [x] Error handling tests
  - [x] Test helpful error messages
  - [x] Test malformed extends field
  - [x] Test dependency chain in error output

**Task 1.3 Completion Criteria:**

- [x] All unit tests passing (22/22 tests pass)
- [x] Integration tests passing
- [x] Edge cases covered
- [x] Code coverage > 90% for new code

**Estimated Time:** 0.5 day (4 hours) - COMPLETE

---

**Phase 1 Completion Criteria:**

- [x] All 21 tasks complete
- [x] `extends` field functional
- [x] Tests passing (22/22 tests)
- [x] Backward compatible (no breaking changes)
- [x] Ready to ship (Phase 1 can ship independently)

---

## PHASE 1 COMPLETE

Config inheritance is fully implemented and tested. The `extends` field works with:
- Relative paths (./base.json, ../../root.json)
- Node modules packages (@acme/claudelint-config)
- Multiple extends (array format)
- Recursive extends (A → B → C)
- Circular dependency detection
- Proper merge order (child overrides parent)

All 22 unit tests passing. Ready to ship!

---

## Phase 2: Workspace Detection

**Goal:** Detect monorepo workspaces and add CLI flags for scoped validation

**Timeline:** 1.5 days
**Lines of Code:** ~400
**Dependencies:** Phase 1 complete (extends should work first)

### 2.1 Workspace Detection Implementation

- [x] Create `src/utils/workspace/detector.ts`
  - [x] Define `WorkspaceInfo` interface
  - [x] Export `detectWorkspace()` function
  - [x] Add proper TypeScript types
- [x] Implement `detectWorkspace()` function
  - [x] Accept `cwd` parameter
  - [x] Return `WorkspaceInfo | null`
  - [x] Check for workspace root indicators
- [x] Add pnpm-workspace.yaml detection
  - [x] Check if `pnpm-workspace.yaml` exists
  - [x] Parse YAML with `js-yaml`
  - [x] Extract `packages` array
  - [x] Handle malformed YAML gracefully
  - [x] Set `packageManager: 'pnpm'`
- [x] Add npm/Yarn workspaces detection
  - [x] Check if `package.json` exists
  - [x] Parse JSON
  - [x] Extract `workspaces` field (array or object format)
  - [x] Handle both formats: `["packages/*"]` and `{ packages: [...] }`
  - [x] Detect package manager (pnpm-lock.yaml, yarn.lock, or npm)
- [x] Implement glob expansion for workspace patterns
  - [x] Create `expandWorkspaceGlobs()` helper
  - [x] Use existing `glob` library
  - [x] Expand patterns to package directories
  - [x] Filter for directories only
  - [x] Deduplicate results
  - [x] Return absolute paths
- [x] Add package manager detection
  - [x] Create `detectPackageManager()` helper
  - [x] Check for pnpm-lock.yaml
  - [x] Check for yarn.lock
  - [x] Default to npm
  - [x] Return `'pnpm' | 'yarn' | 'npm'`

**Task 2.1 Completion Criteria:**

- [x] Workspace detection implemented
- [x] Supports pnpm, npm, Yarn
- [x] Glob patterns expanded correctly
- [x] Package manager detected

**Estimated Time:** 1 day (8 hours) - COMPLETE

---

### 2.2 CLI Integration

- [x] Add CLI flags to `check-all` command
  - [x] Add `--workspace <name>` option
  - [x] Add `--workspaces` boolean flag
  - [x] Document flags in help text
- [x] Implement `--workspace <name>` logic
  - [x] Detect workspace with `detectWorkspace()`
  - [x] Error if no workspace found
  - [x] Find package by name
  - [x] Error if package not found
  - [x] Run validation with package as `cwd`
  - [x] Display package name in output
- [x] Implement `--workspaces` logic
  - [x] Detect workspace
  - [x] Error if no workspace found
  - [x] Iterate over all packages
  - [x] Run validation for each package independently
  - [x] Display results per package
  - [x] Aggregate exit codes (fail if any package fails)
- [x] Update CLI help and documentation
  - [x] Add examples to `--help` output
  - [x] Update README.md with workspace examples
  - [x] Add troubleshooting section

**Task 2.2 Completion Criteria:**

- [x] CLI flags working
- [x] Error messages helpful
- [x] Help documentation updated
- [x] Examples provided

**Estimated Time:** 0.5 day (4 hours) - COMPLETE

---

**Phase 2 Completion Criteria:**

- [x] All 15 tasks complete
- [x] Workspace detection functional
- [x] CLI flags working
- [x] Supports pnpm, npm, Yarn
- [x] Error handling robust

---

## PHASE 2 COMPLETE

Workspace detection is fully implemented and tested. The CLI now supports:
- Detecting pnpm, npm, and Yarn workspaces automatically
- --workspace <name> flag to validate a specific package
- --workspaces flag to validate all packages in the workspace
- Helpful error messages when workspace is not found
- Package manager detection from lock files
- Glob pattern expansion for workspace patterns

All 17 unit tests passing for workspace detector. Ready for Phase 3!

---

## Phase 3: Testing & Documentation

**Goal:** Comprehensive testing and user-facing documentation

**Timeline:** 1 day
**Lines of Code:** ~800 (mostly tests)
**Dependencies:** Phases 1 & 2 complete

### 3.1 Workspace Testing

- [ ] Unit tests for `detectWorkspace()`
  - [ ] Test pnpm-workspace.yaml detection
  - [ ] Test npm workspaces detection
  - [ ] Test Yarn workspaces detection
  - [ ] Test glob pattern expansion
  - [ ] Test package manager detection
  - [ ] Test no workspace returns null
  - [ ] Test malformed YAML handling
  - [ ] Test malformed JSON handling
- [ ] Create test fixtures
  - [ ] Create pnpm monorepo fixture
  - [ ] Create npm monorepo fixture
  - [ ] Create Yarn monorepo fixture
  - [ ] Create nested workspace fixture
  - [ ] Create malformed config fixtures
- [ ] Integration tests for CLI flags
  - [ ] Test `--workspace <name>` validation
  - [ ] Test `--workspaces` validation
  - [ ] Test error when no workspace found
  - [ ] Test error when package not found
  - [ ] Test exit codes aggregate correctly

**Task 3.1 Completion Criteria:**

- [ ] All workspace tests passing
- [ ] Fixtures comprehensive
- [ ] Edge cases covered
- [ ] Code coverage > 90%

**Estimated Time:** 0.5 day (4 hours)

---

### 3.2 Documentation

- [ ] Create user guide
  - [ ] Write `docs/monorepo.md`
  - [ ] Quick start section
  - [ ] Config inheritance examples
  - [ ] Workspace CLI examples
  - [ ] Troubleshooting section
  - [ ] FAQ section
- [ ] Update existing documentation
  - [ ] Update README.md with monorepo section
  - [ ] Update configuration.md with `extends` field
  - [ ] Add monorepo example to examples/
  - [ ] Update CLI help text
- [ ] Create example monorepo
  - [ ] Create `examples/monorepo/` directory
  - [ ] Add pnpm-workspace.yaml
  - [ ] Add root .claudelintrc.json
  - [ ] Add 2-3 package subdirectories
  - [ ] Each package extends root config
  - [ ] Add README explaining structure
  - [ ] Add package.json with scripts
- [ ] Write migration guide
  - [ ] Document upgrading to use `extends`
  - [ ] Show before/after config examples
  - [ ] Explain backward compatibility
  - [ ] List breaking changes (none expected)

**Task 3.2 Completion Criteria:**

- [ ] User guide complete
- [ ] Examples working
- [ ] Migration guide clear
- [ ] README updated

**Estimated Time:** 0.5 day (4 hours)

---

**Phase 3 Completion Criteria:**

- [ ] All 12 tasks complete
- [ ] Tests comprehensive and passing
- [ ] Documentation complete
- [ ] Examples functional
- [ ] Ready to ship

---

## Overall Completion Criteria

### Functional Requirements

- [ ] Config inheritance with `extends` field working
- [ ] Relative path extends working
- [ ] Node modules extends working
- [ ] Multiple extends (array) working
- [ ] Circular dependency detection working
- [ ] Workspace detection for pnpm/npm/Yarn
- [ ] `--workspace <name>` CLI flag working
- [ ] `--workspaces` CLI flag working
- [ ] Package manager detection working
- [ ] Glob expansion working

### Quality Requirements

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Code coverage > 90% for new code
- [ ] No regression in existing tests
- [ ] TypeScript builds without errors
- [ ] Linting passing
- [ ] All documentation complete

### User Experience

- [ ] Backward compatible (no breaking changes)
- [ ] Error messages helpful and actionable
- [ ] CLI help text updated
- [ ] Examples provided and working
- [ ] Migration guide clear
- [ ] FAQ addresses common questions

### Performance

- [ ] Config loading not significantly slower
- [ ] Workspace detection fast (<100ms)
- [ ] No performance regression for single repos
- [ ] Caching works with extended configs

---

## Progress Summary

**Total Tasks:** 48
**Completed:** 36
**In Progress:** 0
**Remaining:** 12
**Overall Progress:** 75% (36/48)

### By Phase

- **Phase 1:** 21/21 tasks (100%) - COMPLETE
- **Phase 2:** 15/15 tasks (100%) - COMPLETE
- **Phase 3:** 0/12 tasks (0%)

---

## Risk Register

### High Priority Risks

| Risk | Impact | Likelihood | Mitigation | Status |
|------|--------|------------|------------|--------|
| Circular dependency infinite loop | High | Medium | Visited set + comprehensive tests | Not Started |
| Config merge order bugs | High | Medium | Follow ESLint pattern + tests | Not Started |
| Breaking changes to API | High | Low | Make all features opt-in | Not Started |
| Performance regression | Medium | Low | Benchmark + caching | Not Started |

### Medium Priority Risks

| Risk | Impact | Likelihood | Mitigation | Status |
|------|--------|------------|------------|--------|
| Workspace detection edge cases | Medium | Medium | Test real-world monorepos | Not Started |
| Malformed YAML crashes | Medium | Low | Try-catch + graceful errors | Not Started |
| Windows path issues | Medium | Low | Path normalization + tests | Not Started |
| Node modules resolution fails | Medium | Low | Use require.resolve() | Not Started |

### Low Priority Risks

| Risk | Impact | Likelihood | Mitigation | Status |
|------|--------|------------|------------|--------|
| Documentation unclear | Low | Medium | Examples + migration guide | Not Started |
| Users confused by new features | Low | Low | Opt-in + clear docs | Not Started |

---

## Blockers

**Current Blockers:** None

**Resolved Blockers:** N/A

---

## Milestones

- [x] **M1:** Phase 1 Complete - Config inheritance working
  - Target: End of Day 2
  - Status: **COMPLETE**
  - Completion Date: 2026-02-01
  - Notes: All 21 tasks done, 22/22 tests passing
- [x] **M2:** Phase 2 Complete - Workspace detection working
  - Target: End of Day 3.5
  - Status: **COMPLETE**
  - Completion Date: 2026-02-01
  - Notes: All 15 tasks done, 17/17 tests passing
- [ ] **M3:** Phase 3 Complete - Testing and docs done
  - Target: End of Day 4.5
  - Status: Not Started
- [ ] **M4:** Ship Phase 1 (optional: can ship before Phase 2)
  - Target: TBD
  - Status: Ready (can ship now!)

---

## Notes

- Phase 1 can ship independently (provides immediate value)
- Phase 2 is optional enhancement (gather feedback first)
- No new dependencies needed (js-yaml and glob already installed)
- Zero breaking changes - all features opt-in
- Following ESLint patterns for familiarity

---

## Next Steps

1. [ ] Begin Phase 1, Task 1.1: Schema Changes
2. [ ] Update tracker as tasks complete
3. [ ] Review and update risk register
4. [ ] Consider shipping Phase 1 before starting Phase 2

---

**Last Updated:** 2026-02-01
