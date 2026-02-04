# Logging Architecture Project

**Status**: Phase 1 Complete, Phase 2 In Progress (40% complete)

**Approach**: Architecture-First with DiagnosticCollector Pattern

**Goal**: Implement unified diagnostic collection system to make library code properly testable and follow industry standards.

**Current Progress**: DiagnosticCollector core implemented, ConfigResolver and WorkspaceDetector refactored

## Problem

Library code (`src/utils/`, `src/api/`) directly calls `console.warn/error` in 10 places, which:

- Makes the library untestable (console spam in tests)
- Prevents programmatic usage (consumers can't suppress output)
- Violates industry standards (ESLint, TypeScript, Prettier are silent libraries)
- No unified pattern - each file handles diagnostics differently

## Root Cause

**No unified diagnostic collection system**. This is a system architecture problem, not simple refactoring.

## Solution

Implement **DiagnosticCollector pattern** (ESLint/TypeScript/Webpack approach):

- Create centralized `DiagnosticCollector` class
- Thread through entire validation pipeline
- Consistent pattern: `diagnostics?.warn('msg', 'Source', 'CODE')`
- Automatic collection in `ValidationResult.warnings`
- Structured diagnostics with source tracking and codes

## Scope

### Core Architecture

- **1 new system**: DiagnosticCollector class
- **4 files to create**: collector, tests, docs
- **12 files to modify**: validators, utils, enforcement, verification scripts

### Console Calls to Remove

- **10 calls** across 4 files:
  - `src/api/claudelint.ts` (2 calls)
  - `src/utils/cache.ts` (3 calls)
  - `src/utils/config/resolver.ts` (1 call)
  - `src/utils/workspace/detector.ts` (4 calls)

### Testing & Enforcement

- **~10 tests** to update
- **2 test files** to add
- **2 enforcement scripts** to extend
- **2 verification scripts** to fix

## Estimated Effort

Total: ~5 hours

| Phase | Duration |
|-------|----------|
| Phase 1: Foundation (DiagnosticCollector) | 30 min |
| Phase 2: Integration (Thread through) | 2 hours |
| Phase 3: Testing & Verification | 1 hour |
| Phase 4: Enforcement & Documentation | 1 hour |
| Phase 5: Final Verification & Commit | 30 min |

## Documentation

- **[architecture-analysis.md](./architecture-analysis.md)** - Complete analysis of console usage, design rationale, industry research
- **[tracker-v2.md](./tracker-v2.md)** - Implementation plan with detailed tasks and acceptance criteria
- ~~[tracker.md](./tracker.md)~~ - Original ad-hoc approach (SUPERSEDED)

## Breaking Changes

**For Library Consumers Only** (not CLI users):

Library code will no longer print warnings directly to console. Consumers must check `ValidationResult.warnings` array. CLI behavior unchanged.

## Benefits

- Clean test output (no console spam)
- Library is properly testable
- Programmatic consumers can control output
- Follows industry standards (ESLint, TypeScript, Prettier pattern)
- Clear separation of concerns
- Better API design

## Related Files

- [tracker.md](./tracker.md) - Complete implementation plan with 6 phases
- Will create: `docs/architecture/logging-policy.md` - Logging policy documentation
- Will update: `CONTRIBUTING.md` - Add logging guidelines

## Context

This project was created after discovering:

1. Pre-commit checks only validated `scripts/` and `src/cli/`, not `src/utils/`
2. Library code has 11 direct console calls
3. Verification scripts we just wrote violate our own spacing rules
4. Industry research confirmed zero-console is standard for libraries
