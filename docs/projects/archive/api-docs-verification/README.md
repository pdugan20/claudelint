# API Documentation Verification Project

Verify, fix, and enforce that the claudelint programmatic API documentation matches the actual implementation. Establish CI-enforced guardrails to prevent future drift.

## Project Goals

1. **Fix known discrepancies** between API docs and code (3 critical, 5 moderate, 6 minor)
2. **Add automated verification** so new drift is caught in CI
3. **Track API surface changes** so PRs that change public API are visible and reviewed
4. **Prevent stale code samples** by making examples executable and testable

## Current Status

**Phase:** Phase 4 Complete (Phase 5 scoped, not started)
**Start Date:** 2026-02-16
**Last Updated:** 2026-02-17

## Documentation

- **[tracker.md](./tracker.md)** - Central progress tracker with checklists for all phases
- **[audit-findings.md](./audit-findings.md)** - Complete audit of docs vs code discrepancies
- **[tooling-research.md](./tooling-research.md)** - Research on modern approaches and tool recommendations

## Phases

| Phase | Description | Effort | Status |
|-------|-------------|--------|--------|
| 1 | Fix known docs/code discrepancies | ~3 hours | Complete |
| 2 | Export snapshot test + TSDoc lint enforcement | ~1 hour | Complete |
| 3 | API Extractor report tracking | ~3 hours | Complete |
| 4 | Executable code samples | ~1 day | Complete |
| 5 | Range-based auto-fix system | ~4-5 hours | Not Started |

## Key Files

API documentation pages:

- `website/api/overview.md`
- `website/api/claudelint-class.md`
- `website/api/functional-api.md`
- `website/api/types.md`
- `website/api/formatters.md`
- `website/api/recipes.md`

API source code:

- `src/index.ts` (public exports)
- `src/api/claudelint.ts` (ClaudeLint class)
- `src/api/functions.ts` (functional API)
- `src/api/types.ts` (public type definitions)
- `src/api/formatter.ts` (formatter loading)
- `src/api/formatters/` (built-in formatter implementations)
- `src/types/rule.ts` (internal RuleMetadata -- diverges from public type)
