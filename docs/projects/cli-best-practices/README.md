# CLI Best Practices Overhaul

**Status**: Not Started
**Created**: 2026-02-14
**Last Updated**: 2026-02-14
**Target Release**: 0.3.0

---

## Problem

After extensive feature development, the claudelint CLI has strong core functionality but is missing standard features that users expect from a modern CLI tool. An audit against ESLint, Biome, Prettier, and published CLI guidelines (clig.dev, nodejs-cli-apps-best-practices) revealed gaps in UX, package configuration, and developer ergonomics.

## Research Summary

Surveyed ESLint 9, Biome 2, Prettier, oxlint, and CLI guidelines from clig.dev, BetterCLI.org, and Liran Tal's Node.js CLI best practices. Key findings:

- **Default command**: Every major linter defaults to its primary action (ESLint lints, Prettier formats). Running `claudelint` with no args currently dumps help and exits 1.
- **package.json `exports`**: Modern Node.js packages use `exports` to control public API surface. We only have `main`/`types`.
- **FORCE_COLOR**: Standard env var for forcing color in CI. We respect `NO_COLOR` but not `FORCE_COLOR`.
- **stdin support**: ESLint and Prettier accept `--stdin` / `--stdin-filename` for editor and pipe integration.
- **Update notifications**: Major CLIs (npm, yarn, gh) notify users of new versions via `update-notifier`.
- **Help text**: Best practice is grouped options, usage examples, and doc links. Ours is a flat list.
- **postinstall**: Our `postinstall` script runs on consumer install (supply chain risk). Should be `prepare`.

## Documents

- [Progress Tracker](progress-tracker.md) -- Phase/task checklist (central tracker)
- [Research Notes](research-notes.md) -- Full best practices research by category
- [Init Wizard Spec](init-wizard-spec.md) -- Init wizard modernization design
- [Flag Architecture Spec](flag-architecture-spec.md) -- Flag system refactoring design (A+B+C+D)

## Phases

| Phase | Focus | Tasks | Status |
|-------|-------|-------|--------|
| 1 | Quick wins (package + CLI defaults) | 9 | Not started |
| 2 | Flag architecture refactoring (shared types, option builders, reporter builder) | 7 | Not started |
| 3 | Missing CLI flags (--output-file, --rule, --changed, etc.) | 10 | Not started |
| 4 | Help text and version improvements | 7 | Not started |
| 5 | Init wizard modernization | 6 | Not started |
| 6 | stdin support | 5 | Not started |
| 7 | Update notifications and signals | 5 | Not started |
| 8 | Tests and enforcement | 6 | Not started |
| 9 | Website documentation | 5 | Not started |

## Key Files

CLI entry and commands:

- `src/cli.ts` -- Main entry, Commander program setup
- `src/cli/commands/check-all.ts` -- Primary command (should become default)
- `src/cli/init-wizard.ts` -- Interactive setup wizard
- `src/cli/commands/install-plugin.ts` -- Plugin install instructions
- `src/utils/reporting/reporting.ts` -- Reporter (color detection)
- `src/cli/types.ts` -- Shared CLI option interfaces (Phase 2)
- `src/cli/utils/option-builders.ts` -- Option group builder functions (Phase 2)
- `src/cli/utils/reporter-options.ts` -- Reporter options builder utility (Phase 2)

Package configuration:

- `package.json` -- exports, engines, postinstall, dependencies
- `bin/claudelint` -- Binary entry point

Tests:

- `tests/cli/` -- CLI command tests
- `tests/integration/` -- End-to-end CLI tests

Website:

- `website/guide/cli-reference.md` -- CLI reference page
- `website/guide/getting-started.md` -- Getting started guide
- `website/guide/troubleshooting.md` -- Troubleshooting page

## Verification

After each phase:

```bash
npm run build              # Type check
npx jest --no-coverage     # All tests pass
npm run check:self         # claudelint passes on itself
npm pack --dry-run         # Verify package contents
```

## Design Principles

1. **Match user expectations** -- Follow conventions from ESLint/Biome, not novel patterns
2. **Minimal disruption** -- Existing flags and behavior unchanged; additions only
3. **Test everything** -- Every new feature gets unit and integration tests
4. **Document as we go** -- Website docs updated in every phase, not deferred
