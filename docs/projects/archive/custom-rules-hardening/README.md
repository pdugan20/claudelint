# Custom Rules Hardening

**Status:** COMPLETE (Archived)
**Start Date:** 2026-02-16
**Completed:** 2026-02-16

## Problem

The custom rules system had four critical issues:

1. **Silent execution failure** — Rules using the documented `category: 'Custom'` loaded but never executed. No validator handles 'Custom'.
2. **No value validation** — The loader accepted invalid values like `severity: 'warning'` without error.
3. **Broken documentation** — All inline examples used invalid patterns (`category: 'Custom'`, wrong type names).
4. **No dogfooding** — The project didn't use its own custom rules system.

## What Was Done

- Replaced `isValidRule()` with `isRule()` + `validateRuleValues()` for strict enum validation
- Created 4 dogfood custom rules in `.claudelint/rules/` (3 CLAUDE.md, 1 Skills category)
- Fixed config loading order so custom rule IDs register before config validation
- Rewrote docs to replace hypothetical examples with real dogfood rule references
- Split troubleshooting into its own page with nested sidebar nav
- Added comprehensive test coverage (validation, execution, dogfood, CLI integration)

## Key Files

- `src/utils/rules/loader.ts` — Validation fix, sync loading
- `src/cli/utils/config-loader.ts` — Config loading order fix
- `.claudelint/rules/` — 4 dogfood rules
- `website/development/custom-rules.md` — Rewritten docs
- `website/development/custom-rules-troubleshooting.md` — Split troubleshooting
- `tests/integration/dogfood-rules.test.ts` — Dogfood rule tests
- `tests/fixtures/projects/custom-rules-violation/` — CLI integration fixture

## Tracking

See [tracker.md](./tracker.md) for the phase-by-phase task tracker.
