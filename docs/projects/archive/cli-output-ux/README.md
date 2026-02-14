# CLI Output UX Improvements

**Status**: Phases 1-3 Complete
**Last Updated**: 2026-02-13
**Progress**: 13/14 items (93%)

---

## Background

After dogfooding claudelint on a monorepo (npm package + Claude plugin + website), several UX gaps became apparent in the CLI output:

1. **No coverage visibility**: Running `claudelint check-all` shows per-validator pass/fail but no indication of *how many files* were scanned or *which components* were covered. In a monorepo, this makes it impossible to tell if all workspaces were actually checked.

2. **Verbose default output**: Even on a clean run, every validator gets its own line with "All checks passed!" — noisy for a tool that runs frequently.

3. **Missing industry-standard features**: Tools like ESLint, Biome, and Prettier have established conventions (quiet mode, GitHub annotations format, stderr/stdout separation) that users expect from modern linters.

4. **No skip transparency**: When a validator finds no applicable files (e.g., no `.claude/skills/` directory), the output says "All checks passed!" — identical to "scanned 5 skills, all clean." This hides misconfiguration.

## Research

External research was conducted across:

- **ESLint** (v10, 2026): formatters, exit codes, monorepo config, caching UX
- **Biome**: Rich diagnostics, file counts, timing display, output formats
- **oxlint**: Rust-inspired diagnostics, GitHub/GitLab formatters
- **Prettier**: Check mode output, success messaging
- **stylelint**: Quiet mode, verbose formatter, stderr output
- **markdownlint-cli2**: Exit codes, custom formatters
- **Rust clippy/cargo**: Code context, inline suggestions, progress indicators
- **clig.dev**: General CLI UX guidelines, stderr/stdout conventions

Key finding: claudelint already implements many advanced features (SARIF, JSON/compact/stylish formatters, `--max-warnings`, `--fix`, workspace support). The primary gaps are in **default output UX** and **CI convenience formats**.

## Scope

11 discrete improvements organized into 4 phases:

| Phase | Focus | Items | Effort |
|-------|-------|-------|--------|
| 1 | Core Output UX + docs | 5 (4 code + 1 docs) | Small-Medium |
| 2 | CI/Automation + docs | 4 (3 code + 1 docs) | Small-Medium |
| 3 | Polish + docs | 4 (3 code + 1 docs) | Tiny-Small |
| 4 | Rich Diagnostics + docs | 1 (5 sub-phases incl. docs) | Large (see feasibility study) |

## Documents

- [Progress Tracker](progress-tracker.md) — Task-level checklist with phases
- [Feasibility Study: Rich Diagnostics](feasibility-rich-diagnostics.md) — Codebase assessment for item #11

## Key Files

Output pipeline:

- `src/cli/commands/check-all.ts` — CLI command orchestration
- `src/utils/reporting/reporting.ts` — Reporter class (runValidator, reportParallelResults)
- `src/api/formatters/stylish.ts` — Default human-readable formatter
- `src/api/formatters/compact.ts` — One-line-per-issue formatter
- `src/api/formatters/json.ts` — JSON formatter
- `src/utils/reporting/sarif.ts` — SARIF formatter
- `src/api/formatter.ts` — Formatter registry and loader
- `src/api/types.ts` — LintResult, LintMessage types

Validator infrastructure:

- `src/validators/file-validator.ts` — Base class, ValidationResult type
- `src/utils/validators/factory.ts` — ValidatorRegistry, ValidatorMetadata
- `src/validators/*.ts` — Individual validator implementations

## Design Principles

Drawn from research across all surveyed tools:

1. **Quiet by default, verbose on demand** — One-liner on success, details only on failure
2. **Confirm what was checked** — File counts and component names so users trust coverage
3. **Distinguish "clean" from "skipped"** — Don't say "passed" when nothing was checked
4. **stdout for data, stderr for status** — Enable piping JSON output cleanly
5. **Match industry conventions** — Exit codes, summary format, color handling should match ESLint/Biome expectations
6. **Incremental adoption** — Each item is independently shippable
