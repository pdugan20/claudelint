# Monorepo Support - Progress Tracker

Project to add monorepo support with config inheritance and workspace detection.

**Status:** Not Started
**Start Date:** 2026-02-01
**Target Completion:** TBD

## Overview

### Phase Summary

| Phase | Status | Duration | LOC | Completion |
|-------|--------|----------|-----|------------|
| Phase 1: Config Inheritance | Not Started | 2 days | ~500 | 0/21 tasks |
| Phase 2: Workspace Detection | Not Started | 1.5 days | ~400 | 0/15 tasks |
| Phase 3: Testing & Docs | Not Started | 1 day | ~800 | 0/12 tasks |
| **Total** | **Planning** | **4.5 days** | **~1700** | **0/48 tasks (0%)** |

---

## Phase 1: Config Inheritance

**Goal:** Implement `extends` field for config reuse across packages

**Timeline:** 2 days
**Lines of Code:** ~500
**Dependencies:** None

### 1.1 Schema Changes

- [ ] Update `ClaudeLintConfig` interface to add `extends` field
  - [ ] Add `extends?: string | string[]` to interface
  - [ ] Document field in JSDoc comments
  - [ ] Update type exports in `src/utils/config/types.ts`
- [ ] Update config validation to handle `extends`
  - [ ] Validate `extends` is string or string array
  - [ ] Validate no empty strings in array
  - [ ] Add warning for deprecated extends syntax (if needed)
- [ ] Add `extends` to config schema examples
  - [ ] Update `.claudelintrc.json` example
  - [ ] Add example with multiple extends
  - [ ] Add example with node_modules package

**Task 1.1 Completion Criteria:**

- [ ] TypeScript types updated and building
- [ ] Schema validation handles `extends` field
- [ ] Examples documented

**Estimated Time:** 0.5 day (4 hours)

---

### 1.2 Config Resolution Logic

- [ ] Create `resolveConfigPath()` utility function
  - [ ] Handle relative paths (`./base.json`, `../../root.json`)
  - [ ] Handle node_modules packages (`@acme/claudelint-config`)
  - [ ] Handle scoped packages (`@acme/claudelint-config/strict`)
  - [ ] Use `require.resolve()` for node_modules lookup
  - [ ] Return resolved absolute path
- [ ] Create `loadConfigWithExtends()` recursive loader
  - [ ] Accept config path and visited set
  - [ ] Load base config with existing `loadConfig()`
  - [ ] Return early if no `extends` field
  - [ ] Detect circular dependencies with visited set
  - [ ] Resolve each extended config path
  - [ ] Recursively load extended configs
  - [ ] Merge configs in correct order (base → ext1 → ext2 → current)
- [ ] Update config merge logic
  - [ ] Deep merge for `rules` object
  - [ ] Array concatenation for `overrides`
  - [ ] Last-wins for `ignorePatterns` (flatten arrays)
  - [ ] Last-wins for `output` object
  - [ ] Last-wins for scalar values
- [ ] Add circular dependency detection
  - [ ] Create `Set<string>` to track visited paths
  - [ ] Check before loading each config
  - [ ] Throw `ConfigError` with helpful message
  - [ ] Include dependency chain in error
- [ ] Update `loadAndValidateConfig()` to use new loader
  - [ ] Replace `loadConfig()` with `loadConfigWithExtends()`
  - [ ] Validate extended configs upfront
  - [ ] Handle errors gracefully
  - [ ] Log extended config paths in debug mode

**Task 1.2 Completion Criteria:**

- [ ] Config resolution logic implemented
- [ ] Circular dependencies detected
- [ ] Merge order correct (verified with tests)
- [ ] Integration with existing code complete

**Estimated Time:** 1 day (8 hours)

---

### 1.3 Testing

- [ ] Unit tests for `resolveConfigPath()`
  - [ ] Test relative path resolution
  - [ ] Test node_modules package resolution
  - [ ] Test scoped package resolution
  - [ ] Test nonexistent package error
  - [ ] Test malformed path error
- [ ] Unit tests for `loadConfigWithExtends()`
  - [ ] Test single extends
  - [ ] Test multiple extends (array)
  - [ ] Test recursive extends (A → B → C)
  - [ ] Test circular dependency detection (A → B → A)
  - [ ] Test merge order (last wins)
  - [ ] Test with missing extended config
- [ ] Integration tests
  - [ ] Create fixture monorepo with extended configs
  - [ ] Test validation with inherited config
  - [ ] Test override of inherited rules
  - [ ] Test multiple levels of inheritance
  - [ ] Test extends from node_modules (mock package)
- [ ] Error handling tests
  - [ ] Test helpful error messages
  - [ ] Test malformed extends field
  - [ ] Test dependency chain in error output

**Task 1.3 Completion Criteria:**

- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Edge cases covered
- [ ] Code coverage > 90% for new code

**Estimated Time:** 0.5 day (4 hours)

---

**Phase 1 Completion Criteria:**

- [ ] All 21 tasks complete
- [ ] `extends` field functional
- [ ] Tests passing
- [ ] Backward compatible (no breaking changes)
- [ ] Ready to ship (Phase 1 can ship independently)

---

## Phase 2: Workspace Detection

**Goal:** Detect monorepo workspaces and add CLI flags for scoped validation

**Timeline:** 1.5 days
**Lines of Code:** ~400
**Dependencies:** Phase 1 complete (extends should work first)

### 2.1 Workspace Detection Implementation

- [ ] Create `src/utils/workspace/detector.ts`
  - [ ] Define `WorkspaceInfo` interface
  - [ ] Export `detectWorkspace()` function
  - [ ] Add proper TypeScript types
- [ ] Implement `detectWorkspace()` function
  - [ ] Accept `cwd` parameter
  - [ ] Return `WorkspaceInfo | null`
  - [ ] Check for workspace root indicators
- [ ] Add pnpm-workspace.yaml detection
  - [ ] Check if `pnpm-workspace.yaml` exists
  - [ ] Parse YAML with `js-yaml`
  - [ ] Extract `packages` array
  - [ ] Handle malformed YAML gracefully
  - [ ] Set `packageManager: 'pnpm'`
- [ ] Add npm/Yarn workspaces detection
  - [ ] Check if `package.json` exists
  - [ ] Parse JSON
  - [ ] Extract `workspaces` field (array or object format)
  - [ ] Handle both formats: `["packages/*"]` and `{ packages: [...] }`
  - [ ] Detect package manager (pnpm-lock.yaml, yarn.lock, or npm)
- [ ] Implement glob expansion for workspace patterns
  - [ ] Create `expandWorkspaceGlobs()` helper
  - [ ] Use existing `glob` library
  - [ ] Expand patterns to package directories
  - [ ] Filter for directories only
  - [ ] Deduplicate results
  - [ ] Return absolute paths
- [ ] Add package manager detection
  - [ ] Create `detectPackageManager()` helper
  - [ ] Check for pnpm-lock.yaml
  - [ ] Check for yarn.lock
  - [ ] Default to npm
  - [ ] Return `'pnpm' | 'yarn' | 'npm'`

**Task 2.1 Completion Criteria:**

- [ ] Workspace detection implemented
- [ ] Supports pnpm, npm, Yarn
- [ ] Glob patterns expanded correctly
- [ ] Package manager detected

**Estimated Time:** 1 day (8 hours)

---

### 2.2 CLI Integration

- [ ] Add CLI flags to `check-all` command
  - [ ] Add `--workspace <name>` option
  - [ ] Add `--workspaces` boolean flag
  - [ ] Document flags in help text
- [ ] Implement `--workspace <name>` logic
  - [ ] Detect workspace with `detectWorkspace()`
  - [ ] Error if no workspace found
  - [ ] Find package by name
  - [ ] Error if package not found
  - [ ] Run validation with package as `cwd`
  - [ ] Display package name in output
- [ ] Implement `--workspaces` logic
  - [ ] Detect workspace
  - [ ] Error if no workspace found
  - [ ] Iterate over all packages
  - [ ] Run validation for each package independently
  - [ ] Display results per package
  - [ ] Aggregate exit codes (fail if any package fails)
- [ ] Update CLI help and documentation
  - [ ] Add examples to `--help` output
  - [ ] Update README.md with workspace examples
  - [ ] Add troubleshooting section

**Task 2.2 Completion Criteria:**

- [ ] CLI flags working
- [ ] Error messages helpful
- [ ] Help documentation updated
- [ ] Examples provided

**Estimated Time:** 0.5 day (4 hours)

---

**Phase 2 Completion Criteria:**

- [ ] All 15 tasks complete
- [ ] Workspace detection functional
- [ ] CLI flags working
- [ ] Supports pnpm, npm, Yarn
- [ ] Error handling robust

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
**Completed:** 0
**In Progress:** 0
**Remaining:** 48
**Overall Progress:** 0%

### By Phase

- **Phase 1:** 0/21 tasks (0%)
- **Phase 2:** 0/15 tasks (0%)
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

- [ ] **M1:** Phase 1 Complete - Config inheritance working
  - Target: End of Day 2
  - Status: Not Started
- [ ] **M2:** Phase 2 Complete - Workspace detection working
  - Target: End of Day 3.5
  - Status: Not Started
- [ ] **M3:** Phase 3 Complete - Testing and docs done
  - Target: End of Day 4.5
  - Status: Not Started
- [ ] **M4:** Ship Phase 1 (optional: can ship before Phase 2)
  - Target: TBD
  - Status: Not Started

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
