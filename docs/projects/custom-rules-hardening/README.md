# Custom Rules Hardening

**Status:** IN PROGRESS
**Start Date:** 2026-02-16
**Priority:** CRITICAL

## Problem

The custom rules system has four critical issues:

1. **Silent execution failure** — Rules using the documented `category: 'Custom'` load successfully but never execute. No validator handles the 'Custom' category, so violations are silently swallowed.

2. **No value validation** — The loader accepts invalid values like `severity: 'warning'` and `category: 'Security'` without error. A stricter `isRule()` type guard already exists but isn't used.

3. **Broken documentation** — All inline examples use invalid patterns (`category: 'Custom'`, `severity: 'warning'`, wrong type names). No enforcement ensures examples are correct.

4. **No dogfooding** — The project has extensive validation scripts for built-in rules but doesn't use its own custom rules system.

## Solution

- Fix by requiring custom rules to use existing categories (`'CLAUDE.md'`, `'Skills'`, etc.)
- Replace the loader's weak validation with the existing `isRule()` + enum value checks
- Implement 4 real custom rules in `.claudelint/rules/` that validate this project
- Update docs to reference the dogfood rules as canonical examples

## Key Files

- `src/utils/rules/loader.ts` — CustomRuleLoader (validation fix)
- `src/types/rule.ts` — isRule() type guard, RuleCategory, RuleSeverity
- `website/development/custom-rules.md` — Primary docs (833 lines, multiple bugs)
- `tests/utils/custom-rule-loader.test.ts` — Loader tests
- `tests/integration/custom-rules.integration.test.ts` — Integration tests

## Tracking

See [tracker.md](./tracker.md) for the phase-by-phase task tracker.
