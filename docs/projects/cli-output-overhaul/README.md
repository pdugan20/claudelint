# CLI Output Overhaul

**Status**: In Progress
**Created**: 2026-02-13
**Last Updated**: 2026-02-13
**Predecessor**: [cli-output-ux](../cli-output-ux/) (Phases 1-3 complete)

---

## Problem

After completing the CLI Output UX feature work (summary lines, quiet success, verbose discovery, GitHub formatter), the output is functionally correct but visually rough:

1. **No column alignment** -- string concatenation produces ragged columns
2. **Per-line Fix: labels** -- no major linter does this; creates visual noise
3. **Messages too verbose** -- 44% of rule messages embed fix instructions, rationale, examples, or data dumps inline
4. **Casing inconsistency** -- "Fix:" capitalized, "error"/"warning" lowercase
5. **Long lines wrap** -- messages listing 20+ valid keys push rule IDs off-screen
6. **No explain mode content** -- `--explain` is a no-op because rules don't populate explanation/howToFix fields

## Research

Surveyed ESLint, stylelint, Rust/Clippy, TypeScript, Prettier, golangci-lint, markdownlint-cli. Key findings:

- ESLint uses `text-table` npm package for column alignment (right-aligned line numbers, aligned rule IDs)
- No major linter shows per-line fix labels; fixability goes in summary only
- All use lowercase severity words, no mixed casing
- Messages are terse problem statements (ESLint avg: 40-50 chars, our worst: 250 chars)
- stylelint is the only tool that wraps messages to terminal width

Full audit: 170 messages across 116 rules. 96 good, 54 need shortening, 20 need rewrite.

## Documents

- [Progress Tracker](progress-tracker.md) -- Phase/task checklist
- [Formatting Spec](formatting-spec.md) -- Column layout, before/after examples
- [Explain Mode Spec](explain-mode-spec.md) -- Three-tier progressive disclosure design
- [Message Audit](message-audit.md) -- Every message evaluated with proposed rewrites

## Design Principles

1. **Message = problem statement only** -- no fix instructions, no rationale, no examples
2. **Three-tier progressive disclosure** -- Default (table) → `--explain` (Why + Fix per issue) → `explain <id>` (full docs)
3. **`docs.rationale` for terminal** -- terse ~120 char "why" field, distinct from web-oriented `docs.details`
4. **Tabular alignment** -- use `text-table` like ESLint, not string concatenation
5. **80-char message target** -- messages should fit in the table without wrapping
6. **Enforce at authoring time** -- pre-commit checks prevent verbose messages and missing docs fields

## Phases

| Phase | Focus | Tasks | Status |
|-------|-------|-------|--------|
| 1 | Reporter formatting | 7 | Complete |
| 2 | Message content cleanup | 5 | Complete |
| 3 | Three-tier explain mode | 9 | In progress (2/9) |
| 4 | Enforcement and regression guards | 5 | Not started |
| 5 | Website documentation | 4 | Not started |

## Key Files

Reporter and explain:

- `src/utils/reporting/reporting.ts` -- Reporter class, `reportStylish()`, Tier 2 rendering
- `src/cli/commands/explain.ts` -- Tier 3 `explain <rule-id>` subcommand (new)
- `src/cli/commands/check-all.ts` -- Summary line, verbose discovery

Types:

- `src/types/rule-metadata.ts` -- `RuleDocumentation` interface (add `rationale` field)
- `src/types/rule.ts` -- `RuleIssue`, `RuleContext` interfaces
- `src/validators/file-validator.ts` -- Auto-populate explain fields in `executeRule()`

Rules (all 116 need `docs.rationale`):

- `src/rules/skills/*.ts` -- ~30 rules
- `src/rules/claude-md/*.ts` -- ~6 rules
- `src/rules/mcp/*.ts` -- ~4 rules
- `src/rules/settings/*.ts` -- ~4 rules
- `src/rules/lsp/*.ts` -- ~5 rules
- `src/rules/plugin/*.ts` -- ~4 rules
- `src/rules/agents/*.ts` -- ~2 rules
- `src/rules/hooks/*.ts` -- ~3 rules
- `src/rules/output-styles/*.ts` -- ~2 rules
- `src/rules/commands/*.ts` -- ~2 rules

Enforcement:

- `scripts/check/` -- Message lint + rule docs validation scripts
- `.husky/pre-commit` -- Hook integration
- `src/CLAUDE.md` -- Message authoring guidelines

Tests:

- `tests/utils/reporting.test.ts` -- Reporter unit tests (Tier 2)
- `tests/cli/explain.test.ts` -- Explain subcommand tests (Tier 3, new)
- `tests/validators/base-validator.test.ts` -- Auto-populate tests
- `tests/integration/fixture-projects.test.ts` -- Pinned counts
- `tests/rules/*.test.ts` -- ~50 rule test files with message assertions

## Verification

After each phase:

```bash
npm run build              # Type check
npx jest --no-coverage     # All tests pass
npm run check:self         # claudelint passes on itself
```
