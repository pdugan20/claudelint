# Monorepo Support Project

Project to add monorepo support to claudelint, enabling config inheritance and workspace-aware validation for pnpm, npm, and Yarn workspaces.

## Project Goals

1. **Config inheritance**: Enable `extends` field to share configs across packages
2. **Workspace detection**: Auto-detect pnpm/npm/Yarn monorepo workspaces
3. **Scoped validation**: Allow validation of specific packages or all packages
4. **Maintain simplicity**: Keep single-repo usage unchanged and simple

## Current Status

**Phase:** Phase 4 - Critical Improvements
**Start Date:** 2026-02-01
**Phases 1-3 Completed:** 2026-02-01
**Target Completion:** TBD (Phase 4: estimated 2 days)

## Why This Matters

### Problem

Users in monorepos currently face:

- **Config duplication**: Each package must duplicate the same `.claudelintrc.json`
- **No inheritance**: Can't extend a root config like ESLint/Prettier
- **All-or-nothing validation**: Either validate all packages or manually specify paths
- **Manual workspace management**: No awareness of package boundaries

### Solution

After this project, monorepo users can:

```bash
# Root config
# .claudelintrc.json
{
  "rules": {
    "skill-missing-changelog": "warn"
  }
}

# Package config
# packages/app-1/.claudelintrc.json
{
  "extends": "../../.claudelintrc.json",
  "rules": {
    "size-warning": "off"  // Override for this package
  }
}

# Validate specific package
claudelint check-all --workspace app-1

# Validate all packages independently
claudelint check-all --workspaces
```

## Documentation

- **[tracker.md](./tracker.md)** - Central progress tracker with phase checklists (START HERE)
- **[config-inheritance.md](./config-inheritance.md)** - Technical design for `extends` field
- **[workspace-detection.md](./workspace-detection.md)** - Workspace detection implementation
- **[testing-strategy.md](./testing-strategy.md)** - Comprehensive test plan
- **[user-guide.md](./user-guide.md)** - End-user documentation for monorepo usage

## Quick Start

### Phase 1: Config Inheritance (Core)

```typescript
// 1. Add extends to config schema
export interface ClaudeLintConfig {
  extends?: string | string[];  // NEW
  // ... existing fields
}

// 2. Implement resolution
function loadConfigWithExtends(configPath: string): ClaudeLintConfig {
  const config = loadConfig(configPath);
  if (!config.extends) return config;

  const extended = resolveExtends(config.extends);
  return mergeConfig(extended, config);
}
```

### Phase 2: Workspace Detection (Enhancement)

```typescript
// Detect workspace
const workspace = await detectWorkspace(cwd);
// Returns: { root, packages, packageManager }

// CLI usage
claudelint check-all --workspace my-package
claudelint check-all --workspaces
```

## Project Structure

```
docs/projects/archive/monorepo-support/
├── README.md                      # This file
├── tracker.md                     # Progress tracker
├── config-inheritance.md          # extends implementation
├── workspace-detection.md         # Workspace detection
├── testing-strategy.md            # Test plan
├── user-guide.md                  # User documentation
└── future-enhancements.md         # Future improvement ideas
```

## Implementation Phases

### Phase 1: Config Inheritance [Not Started]

**Difficulty:** Moderate
**Timeline:** 2 days
**Lines of Code:** ~400-500

Implement `extends` field for config reuse:

- Parse and resolve `extends` (relative paths and node_modules)
- Load extended configs recursively
- Merge configs in correct order
- Handle circular dependencies
- Validate extended configs

**Documents:** [tracker.md](./tracker.md#phase-1-config-inheritance), [config-inheritance.md](./config-inheritance.md)

### Phase 2: Workspace Detection [Not Started]

**Difficulty:** Low-Moderate
**Timeline:** 1.5-2 days
**Lines of Code:** ~300-400

Detect and parse monorepo workspaces:

- Detect `pnpm-workspace.yaml`
- Detect `package.json` workspaces
- Expand glob patterns to package directories
- Add CLI flags (`--workspace`, `--workspaces`)
- Implement package-scoped validation

**Documents:** [tracker.md](./tracker.md#phase-2-workspace-detection), [workspace-detection.md](./workspace-detection.md)

### Phase 3: Testing & Documentation [COMPLETE]

**Difficulty:** Moderate
**Timeline:** 1 day
**Lines of Code:** ~800+ (mostly tests)

Comprehensive testing and documentation:

- Unit tests for config inheritance
- Integration tests for workspace detection
- Fixture monorepos for testing
- User guide and examples
- Migration guide for existing users

**Documents:** [tracker.md](./tracker.md#phase-3-testing-documentation), [testing-strategy.md](./testing-strategy.md)

### Phase 4: Critical Improvements [COMPLETE]

**Difficulty:** Moderate
**Timeline:** 2 days
**Lines of Code:** ~500

Fix critical gaps and add high-impact improvements:

- **DONE** CLI integration tests (19/19 tests passing)
- **DONE** Config caching with extends (verified working correctly)
- **DONE** Parallel workspace validation (3-10x performance improvement)
- **DONE** Workspace root auto-detection (works from any directory)

**Documents:** [tracker.md](./tracker.md#phase-4-critical-improvements), [future-enhancements.md](./future-enhancements.md)

## Key Decisions

### Why sequential phases?

**Phase 1 is sufficient for most users** - config inheritance solves 80% of monorepo pain points. Phase 2 is a convenience enhancement.

**Benefits:**
- Ship Phase 1 quickly for immediate value
- Gather user feedback before Phase 2
- Can skip Phase 2 if users don't need it
- Lower risk - validate design before adding complexity

### Why follow ESLint patterns?

**User familiarity** - developers already understand ESLint's `extends`:

```json
{
  "extends": ["eslint:recommended", "./base-config.json"]
}
```

**Proven design** - ESLint solved config inheritance years ago. We can reuse their approach.

### What about Nx/Turborepo integration?

**Out of scope** for this project. Those tools have their own config systems. We focus on standard npm/pnpm/yarn workspaces.

**Future enhancement** - can add after Phase 2 if users request it.

## Success Criteria

**Phase 1 (Config Inheritance):**

- [ ] `extends` field works with relative paths
- [ ] `extends` field works with node_modules packages
- [ ] Multiple extends merged correctly (base → ext1 → ext2 → user)
- [ ] Circular dependencies detected and prevented
- [ ] Extended configs validated upfront
- [ ] Backward compatible (single-repo usage unchanged)

**Phase 2 (Workspace Detection):**

- [x] pnpm-workspace.yaml detected and parsed
- [x] npm/Yarn workspaces in package.json detected
- [x] Glob patterns expanded to package directories
- [x] `--workspace <name>` validates specific package
- [x] `--workspaces` validates all packages independently
- [x] Works with all package managers (pnpm, npm, Yarn)

**Phase 4 (Critical Improvements):**

- [ ] CLI integration tests for workspace flags
- [ ] Config caching tracks extended config dependencies
- [ ] Parallel workspace validation (3-10x faster)
- [ ] Workspace root auto-detection from any directory
- [ ] No performance regression with extends

**Overall:**

- [x] All tests passing (unit + integration) - Phase 4 pending
- [x] Documentation complete
- [x] Example monorepo in `examples/monorepo/`
- [x] Migration guide for existing users
- [x] No breaking changes to API

## Timeline

### Phase 1: Config Inheritance

- **Task 1.1**: Schema changes (0.5 day)
- **Task 1.2**: Config resolution logic (1 day)
- **Task 1.3**: Testing (0.5 day)

**Subtotal:** 2 days

### Phase 2: Workspace Detection

- **Task 2.1**: Workspace detection (1 day)
- **Task 2.2**: CLI integration (0.5 day)

**Subtotal:** 1.5 days

### Phase 3: Testing & Docs

- **Task 3.1**: Integration tests (0.5 day)
- **Task 3.2**: Documentation (0.5 day)

**Subtotal:** 1 day

### Phase 4: Critical Improvements

- **Task 4.1**: CLI integration tests (0.25 day)
- **Task 4.2**: Config caching with extends (1 day)
- **Task 4.3**: Parallel workspace validation (0.5 day)
- **Task 4.4**: Workspace root auto-detection (0.25 day)

**Subtotal:** 2 days

**Total:** 6.5 days (Phases 1-3: 4.5 days, Phase 4: 2 days)

## Risks and Mitigations

### Risk 1: Config resolution complexity

**Risk:** Circular dependencies, infinite loops, confusing merge order

**Mitigation:**
- Use visited set to detect cycles
- Follow ESLint's merge order (proven)
- Comprehensive error messages
- Unit tests for edge cases

### Risk 2: Workspace detection edge cases

**Risk:** Unusual workspace configurations, nested workspaces, malformed YAML

**Mitigation:**
- Graceful error handling
- Clear error messages
- Test with real-world monorepos
- Document supported configurations

### Risk 3: Breaking changes

**Risk:** Existing users' configs break

**Mitigation:**
- `extends` is optional (backward compatible)
- Existing behavior unchanged without `extends`
- Migration guide for power users
- Beta testing period

### Risk 4: Performance degradation

**Risk:** Config loading slower with inheritance

**Mitigation:**
- Cache loaded configs
- Only resolve extends once per file
- Benchmark before/after
- Document performance characteristics

## Resources

### Monorepo Tools Documentation

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)

### Prior Art (Linters with Monorepo Support)

- [ESLint in a Monorepo](https://gregory-gerard.dev/articles/eslint-in-a-monorepo)
- [Turborepo ESLint](https://turbo.build/repo/docs/handbook/linting/eslint)
- [Prettier Monorepo Setup](https://prettier.io/docs/en/configuration.html#sharing-configurations)

### Technical References

- [Minimatch](https://github.com/isaacs/minimatch) - Already a dependency (glob patterns)
- [js-yaml](https://github.com/nodeca/js-yaml) - Already a dependency (YAML parsing)

## Next Steps

1. Review [tracker.md](./tracker.md) for detailed task breakdown
2. Start with Phase 1: Config Inheritance (core functionality)
3. Mark tasks complete in tracker as you progress
4. Ship Phase 1 before starting Phase 2 (get feedback first)
5. Refer to technical docs for implementation details

## Questions?

- Review technical documentation in this folder
- Check [tracker.md](./tracker.md) for specific tasks
- See [config-inheritance.md](./config-inheritance.md) for implementation details
- Consult [testing-strategy.md](./testing-strategy.md) for test coverage

## Notes

- Phases 1-3 complete and shipped (2026-02-01)
- Phase 1 standalone provides 80% of value
- Phase 2 is optional enhancement (can defer if needed)
- Phase 4 fixes critical gaps identified after implementation
- Following ESLint patterns ensures familiarity
- Zero breaking changes - all new features opt-in
- js-yaml and glob already in dependencies (no new deps needed)
