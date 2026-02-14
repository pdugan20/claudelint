# Preset System (Slim) -- Task Tracker

**Last Updated**: 2026-02-14
**Status**: Complete
**Progress**: 12/12 (100%)

---

## Phase 1: Preset Generation

**Progress**: 4/4 (100%)
**Depends on**: Nothing

- [x] **P1-1**: Create `scripts/generate/presets.ts`
  - Read rule registry, generate `presets/recommended.json` and `presets/all.json`
  - Recommended = rules where `meta.docs.recommended === true`
  - All = every registered rule at source severity

- [x] **P1-2**: Create `presets/` directory, add to `package.json` `files` field

- [x] **P1-3**: Wire into build pipeline
  - Add `generate:presets` script to package.json
  - Added `postbuild` hook to run after `tsc`

- [x] **P1-4**: Run generator, commit initial preset files
  - Verified: `presets/recommended.json` has 89 rules
  - Verified: `presets/all.json` has 116 rules

---

## Phase 2: Config Resolution

**Progress**: 2/2 (100%)
**Depends on**: Phase 1

- [x] **P2-1**: Add `claudelint:` prefix resolution to `src/utils/config/extends.ts`
  - Map `claudelint:recommended` and `claudelint:all` to bundled JSON paths
  - Throw clear error for unknown `claudelint:` presets

- [x] **P2-2**: Update init wizard (`src/cli/init-wizard.ts`)
  - Added preset selection prompt (Recommended / All / Manual)
  - Recommended/All generate `{ "extends": "claudelint:<preset>" }`
  - Manual generates inline rules (existing behavior)
  - `--yes` flag uses recommended preset

---

## Phase 3: Tests

**Progress**: 3/3 (100%)
**Depends on**: Phase 2

- [x] **P3-1**: Unit tests for preset resolution
  - File: `tests/config/extends.test.ts` (added to existing file)
  - 4 tests: resolves recommended, resolves all, throws for unknown, lists presets in error

- [x] **P3-2**: Unit tests for preset generation
  - File: `tests/presets/preset-generation.test.ts`
  - 8 tests: recommended correctness, severity matching, exclusion, all correctness, snapshots

- [x] **P3-3**: Integration test for preset loading
  - File: `tests/integration/presets.test.ts`
  - 8 tests: load preset, merge overrides, add extra rules, combined extends, ignorePatterns, output

---

## Phase 4: Documentation

**Progress**: 3/3 (100%)
**Depends on**: Phase 2

- [x] **P4-1**: Add "Built-in Presets" subsection to `website/guide/configuration.md`
  - Under Extends section: documented `claudelint:recommended`, `claudelint:all`
  - Added override pattern example and VitePress tip callout

- [x] **P4-2**: Update `website/guide/getting-started.md`
  - Added `claudelint:recommended` as quickstart option
  - Updated ConfigExample to show preset + overrides pattern

- [x] **P4-3**: Verify `npm run docs:build` passes
  - Build complete, no errors or dead links

---

## Summary

| Phase | Tasks | Depends On |
|-------|-------|------------|
| 1. Preset Generation | 4 | Nothing |
| 2. Config Resolution | 2 | Phase 1 |
| 3. Tests | 3 | Phase 2 |
| 4. Documentation | 3 | Phase 2 |
| **Total** | **12** | |

Phases 3 and 4 can run in parallel after Phase 2 completes.
