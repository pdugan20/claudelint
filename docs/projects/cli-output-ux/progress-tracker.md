# CLI Output UX — Progress Tracker

**Last Updated**: 2026-02-13
**Status**: In Progress
**Progress**: Phase 1 5/5 complete, Phase 2 4/4 complete, Phase 3 4/4 complete, Phase 4 0/1

---

## How to Use This Tracker

- Mark tasks with `[x]` when complete
- Update phase progress after each task
- Update "Last Updated" date when changes are made
- Link to commits/PRs in the Notes column where applicable

---

## Phase 1: Core Output UX

**Progress**: 5/5 (100%)
**Priority**: Highest — directly addresses the monorepo coverage visibility problem

**Execution order**: P2-3 (stderr/stdout plumbing) → P1-3 (scanMetadata infrastructure) → P1-1 (summary line) → P1-2 (quiet success) → P1-4 (--quiet) → P1-5 (docs). P2-3 is pulled forward so all new output code is built on correct stream routing from the start. P1-3 must precede P1-1/P1-2 because they depend on scanMetadata for file counts and component names. P2-2 (problem matcher) should be done after P1 changes settle since its regex must match the final stylish output format.

### P1-1: Summary line with file counts and component names

**Status**: Complete

Replace the current per-validator "Overall Summary" block with a single summary line:

```text
# Success (normal mode)
Checked 12 files across 3 components (claude-md, settings, hooks) in 45ms. No problems found.

# Violations (normal mode)
src/skills/deploy/SKILL.md
  12:1  warning  Missing usage section  skill-body-missing-usage-section

Checked 12 files across 3 components in 45ms.
1 problem (0 errors, 1 warning)
```

**Requires**:

- New `scanMetadata` infrastructure (see P1-3 prerequisite)
- Aggregate file counts from `validatedFiles` across all validator results
- Collect active component names from validators that found files
- Update `check-all.ts` summary section (lines 478-491)
- ESLint-style summary: `N problems (X errors, Y warnings)`
- Include fixable count hint when applicable: `N potentially fixable with --fix`

**Files to modify**:

- `src/cli/commands/check-all.ts`
- `src/utils/reporting/reporting.ts`

**Tests**:

- `tests/utils/reporting.test.ts` — Test summary line formatting: 0 errors, mixed errors/warnings, fixable hint, component name aggregation, file count aggregation
- `tests/integration/cli.test.ts` — Snapshot test: clean project produces expected one-liner; project with violations shows summary with counts

---

### P1-2: Quiet success output

**Status**: Complete

On a clean run (0 errors, 0 warnings), output should be a single summary line — not per-validator output. Violations still get full detail.

**Current behavior** (too verbose):

```text
✓ CLAUDE.md Validator (12ms)
✓ All checks passed!

✓ Skills Validator (8ms)
✓ All checks passed!

✓ Settings Validator (3ms)
✓ All checks passed!

--- Overall Summary ---
Total errors: 0
Total warnings: 0
```

**Target behavior**:

```text
Checked 12 files across 3 components (claude-md, settings, hooks) in 45ms. No problems found.
```

**Requires**:

- Buffer per-validator output instead of printing immediately
- Only print per-validator detail when there are violations
- Always print the summary line
- `--verbose` flag still shows per-validator breakdown

**Files to modify**:

- `src/utils/reporting/reporting.ts` — `reportParallelResults()` behavior
- `src/cli/commands/check-all.ts` — Summary output logic

**Tests**:

- `tests/utils/reporting.test.ts` — Test that clean run produces single summary line (no per-validator output); test that violations still show per-validator detail; test that `--verbose` still shows per-validator breakdown even on clean run
- `tests/integration/cli.test.ts` — End-to-end: clean project output is exactly one line (plus newline)

---

### P1-3: Verbose mode — skipped validators with reason

**Status**: Complete

When `--verbose` is used, show which validators were active and which were skipped (with reason):

```text
claude-md (3 files)
  CLAUDE.md
  src/CLAUDE.md
  website/CLAUDE.md

settings (1 file)
  .claude/settings.json

hooks (1 file)
  .claude/settings.json

skills — skipped (no .claude/skills/ directory)
agents — skipped (no .claude/agents/ directory)
mcp — skipped (no MCP servers configured)
plugins — skipped (no plugin.json found)
output-styles — skipped (no .claude/output-styles/ directory)
lsp — skipped (no LSP servers configured)
commands — skipped (no .claude/commands/ directory)

Checked 4 files across 3 components (claude-md, settings, hooks) in 45ms. No problems found.
```

**Requires new infrastructure** — `scanMetadata` on ValidationResult:

```typescript
interface ScanMetadata {
  filesScanned: number;
  filesFound: string[];      // Actual file paths
  skipped: boolean;
  skipReason?: string;       // e.g., "no .claude/skills/ directory"
}

interface ValidationResult {
  // ...existing fields
  scanMetadata?: ScanMetadata;
}
```

**Each validator must populate scanMetadata**:

- Check if the target directory/config exists before searching for files
- If directory missing: `{ skipped: true, skipReason: "no .claude/skills/ directory" }`
- If directory exists but empty: `{ skipped: true, skipReason: ".claude/skills/ exists but contains no valid skills" }`
- If files found: `{ skipped: false, filesScanned: N, filesFound: [...paths] }`

**Files to modify**:

- `src/validators/file-validator.ts` — Add `ScanMetadata` to `ValidationResult`
- `src/validators/claude-md.ts` — Populate scanMetadata
- `src/validators/skills.ts` — Populate scanMetadata
- `src/validators/agents.ts` — Populate scanMetadata
- `src/validators/output-styles.ts` — Populate scanMetadata
- `src/validators/schema-validator.ts` — Populate scanMetadata (hooks, settings, mcp, plugin, lsp)
- `src/utils/reporting/reporting.ts` — Render skipped validators in verbose mode
- `src/cli/commands/check-all.ts` — Pass metadata through

**Tests**:

- `tests/validators/*.test.ts` — Each validator test suite: verify `scanMetadata` is populated correctly when files found, when directory missing, and when directory exists but empty
- `tests/utils/reporting.test.ts` — Test verbose output renders skipped validators with reasons; test non-verbose output omits skipped validators
- `tests/integration/cli.test.ts` — End-to-end: `--verbose` on a minimal project shows skipped validators with correct reasons

---

### P1-4: `--quiet` flag

**Status**: Complete

Suppress warnings, show only errors. Matches ESLint/stylelint `--quiet` behavior.

```bash
claudelint check-all --quiet    # Only show errors
```

**Behavior**:

- Warnings are still collected (for `--max-warnings` counting) but not displayed
- Summary line still shows warning count (so users know they exist)
- Exit code ignores warnings unless `--warnings-as-errors` is also set
- ESLint v9+ optimization: skip executing warn-level rules entirely for performance (stretch goal)

**Files to modify**:

- `src/cli/commands/check-all.ts` — Add `--quiet` option
- `src/utils/reporting/reporting.ts` — Filter warnings from display when quiet
- `src/api/formatters/stylish.ts` — Respect quiet option
- `src/api/formatters/compact.ts` — Respect quiet option

**Tests**:

- `tests/api/formatters/stylish.test.ts` — Test quiet mode suppresses warnings but keeps errors; test summary still shows warning count
- `tests/api/formatters/compact.test.ts` — Same quiet mode tests
- `tests/integration/cli.test.ts` — End-to-end: `--quiet` with warnings-only project produces no violation output but exit code 0; `--quiet` with errors still shows them

---

### P1-5: Website docs — Phase 1 updates

**Status**: Complete

Update website documentation to reflect new output behavior.

**Pages to update**:

- `website/guide/cli-reference.md`
  - Update check-all output examples to show new summary line format
  - Add `--quiet` to the options table
  - Update `--verbose` description to mention skipped validator visibility
  - Add example output for verbose mode showing skipped validators
- `website/guide/getting-started.md`
  - Update any "expected output" examples to match new quiet success format
- `website/integrations/monorepos.md`
  - Document how summary line confirms component coverage across workspaces

---

## Phase 2: CI/Automation

**Progress**: 4/4 (100%)
**Priority**: High — enables GitHub Actions inline annotations with no custom setup

### P2-1: `--format github` formatter

**Status**: Complete

Output in GitHub Actions annotation format for inline PR comments:

```text
::error file=CLAUDE.md,line=12,col=1,title=skill-body-missing-usage-section::Missing usage section
::warning file=.claude/settings.json,line=5,title=settings-invalid-permission::Invalid permission pattern
```

**Implementation**:

- New file: `src/api/formatters/github.ts`
- Register in `src/api/formatter.ts` BUILTIN_FORMATTERS
- Update type in `check-all.ts` options
- Format: `::severity file=PATH,line=N,col=N,title=RULE_ID::MESSAGE`
- When no line number: omit `,line=N,col=N`

**Files to modify**:

- `src/api/formatters/github.ts` — New file
- `src/api/formatter.ts` — Register formatter
- `src/cli/commands/check-all.ts` — Add to format type union

**Tests**:

- `tests/api/formatters/github.test.ts` — New test file: verify `::error` and `::warning` annotation format; test with/without line numbers; test file path formatting; test special characters in messages are escaped; test empty results produce no output
- `tests/api/formatter.test.ts` — Verify `github` is in `BUILTIN_FORMATTERS` and loadable

---

### P2-2: Ship problem matcher JSON

**Status**: Complete

Ship a problem matcher file that users reference in their GitHub Actions workflow to get annotations from the default stylish output:

```yaml
# In user's workflow
- run: echo "::add-matcher::.github/claudelint-problem-matcher.json"
- run: npx claudelint check-all
```

**File to create**: `.github/claudelint-problem-matcher.json`

```json
{
  "problemMatcher": [
    {
      "owner": "claudelint-stylish",
      "pattern": [
        {
          "regexp": "^([^\\s].*)",
          "file": 1
        },
        {
          "regexp": "^\\s+(\\d+):(\\d+)\\s+(error|warning)\\s+(.+?)\\s{2,}(\\S+)$",
          "line": 1,
          "column": 2,
          "severity": 3,
          "message": 4,
          "code": 5,
          "loop": true
        }
      ]
    }
  ]
}
```

Also document usage in `website/integrations/ci.md`.

**Tests**:

- Verify the regex patterns in the matcher actually match the stylish formatter output (can be a unit test that runs the regex against sample stylish output strings)

---

### P2-3: stderr/stdout separation

**Status**: Complete

**What already works**:

- `logger.error()` uses `console.error()` → stderr
- `logger.warn()` uses `console.warn()` → stderr

**What's broken**:

- `logger.info()` and `logger.success()` use `console.log()` → stdout, which pollutes `--format json` output when piping
- Status messages like "Using config file: ..." go to stdout via `logger.info()`
- Need to audit all `logger.info()` / `logger.success()` / `logger.log()` calls in `check-all.ts` to determine which should route to stderr instead

Route output correctly for piping:

- **stdout**: Lint results (the data — what formatters produce)
- **stderr**: Status messages, progress, timing, "Using config file: ..."

This enables: `claudelint check-all --format json | jq '.errors'`

**Caution**: This is a behavioral change that could affect users who parse stdout. Consider a `--output-stream` flag or document the change clearly.

**Files to modify**:

- `src/cli/utils/logger.ts` — Route `info()`, `success()`, `log()`, `detail()`, `section()`, `newline()` to stderr
- `src/utils/reporting/reporting.ts` — Ensure formatter output goes to stdout
- `src/cli/commands/check-all.ts` — Audit all logger calls; formatter JSON/SARIF output must go to stdout

**Tests**:

- `tests/integration/cli.test.ts` — Test that `--format json` output on stdout is valid JSON (no status messages mixed in); test that status/progress messages go to stderr
- `tests/utils/reporting.test.ts` — Unit test that formatter output is written to stdout stream, status messages to stderr

---

### P2-4: Website docs — Phase 2 updates

**Status**: Complete

Update website documentation for CI/automation features.

**Pages to update**:

- `website/api/formatters.md`
  - Add new `github` formatter section with format description and output example
  - Note about when to use `github` vs `sarif` (lightweight annotations vs full Code Scanning)
- `website/integrations/ci.md`
  - Add "GitHub Actions Annotations" section showing `--format github` workflow
  - Add "Problem Matcher" section showing how to use the shipped `.json` matcher with stylish format
  - Add note about annotation limits (50 per run) and when to prefer SARIF
- `website/guide/cli-reference.md`
  - Add `github` to the `--format` options list
  - Document stderr/stdout behavior for piping (`claudelint --format json | jq`)

---

## Phase 3: Polish

**Progress**: 4/4 (100%)
**Priority**: Medium — small quality-of-life improvements

### P3-1: `--allow-empty-input` flag

**Status**: Complete

Prevent exit code 1 when no lintable files are found. Useful with lint-staged where not every commit touches files that claudelint checks.

```bash
claudelint check-all --allow-empty-input  # Exit 0 even if nothing to check
```

**Files to modify**:

- `src/cli/commands/check-all.ts` — Add option, check if all validators skipped

**Tests**:

- `tests/integration/cli.test.ts` — Test that empty project (no claude files at all) with `--allow-empty-input` exits 0; test that same project without the flag exits with appropriate code

---

### P3-2: `--timing` flag

**Status**: Complete

Show per-validator timing breakdown without requiring full `--verbose`:

```text
Checked 12 files across 3 components in 45ms. No problems found.

Timing:
  claude-md     12ms
  settings       3ms
  hooks          2ms
```

The data already exists in the `timings` object (check-all.ts line 366) and display logic exists at lines 482-490, currently gated behind `--verbose`. Just need to add a `--timing` flag and check for it alongside `--verbose`.

**Files to modify**:

- `src/cli/commands/check-all.ts` — Add `--timing` option, update display condition from `if (options.verbose)` to `if (options.verbose || options.timing)`

**Tests**:

- `tests/integration/cli.test.ts` — Test that `--timing` output includes per-validator timing lines with `ms` suffix; test that timing is not shown without the flag (in non-verbose mode)

---

### P3-3: `NO_COLOR` environment variable support

**Status**: Complete (already implemented)

`NO_COLOR` is already supported via two mechanisms:

1. `src/utils/reporting/reporting.ts:73` — `this.options.color = process.stdout.isTTY && !process.env.NO_COLOR`
2. Chalk v5 (`chalk@^5.3.0`) natively respects `NO_COLOR` per the `no-color.org` standard

**Remaining** (documentation only):

- [ ] Document `NO_COLOR` support in `website/guide/cli-reference.md` (Environment Variables section)
- [ ] Verify `TERM=dumb` is also handled (likely via Chalk, needs confirmation test)

---

### P3-4: Website docs — Phase 3 updates

**Status**: Complete

Update website documentation for polish features.

**Pages to update**:

- `website/guide/cli-reference.md`
  - Add `--allow-empty-input` to options table
  - Add `--timing` to options table with output example
  - Add "Environment Variables" section documenting `NO_COLOR` support
- `website/integrations/pre-commit.md`
  - Document `--allow-empty-input` usage with lint-staged

---

## Phase 4: Rich Diagnostics

**Progress**: 0/1 (0%)
**Priority**: Lower — high impact but high effort (see [feasibility study](feasibility-rich-diagnostics.md))

### P4-1: Code context with caret highlighting

**Status**: Feasibility assessed, not started

Show offending source code with inline highlighting, like Biome/clippy:

```text
warning: Missing usage section
 --> .claude/skills/deploy/SKILL.md:12:1
   |
12 | ## Description
   | ^^^^^^^^^^^^^^ expected a "## Usage" section
   |
   = help: Add a "## Usage" section documenting how to invoke this skill
```

See [feasibility study](feasibility-rich-diagnostics.md) for full codebase assessment. Summary:

- API types already support column/span (`LintMessage` has `column`, `endLine`, `endColumn`)
- Source content already available (`LintResult.source`)
- Validator layer lacks column/span fields (need type extension)
- Only ~10% of rules currently provide line numbers
- Incremental rollout possible: rules without positional info degrade gracefully

**Sub-phases** (if approved):

- [ ] P4-1a: Extend `ValidationError`/`RuleIssue` with column/span fields
  - Tests: Verify existing tests still pass (non-breaking addition); verify new fields flow through message builder to `LintMessage`
- [ ] P4-1b: Create "codeframe" formatter with syntax highlighting
  - Tests: `tests/api/formatters/codeframe.test.ts` — New test file covering: full span (line+column+end), line-only, no positional info (graceful fallback), multi-line spans, color vs no-color output, context line count
- [ ] P4-1c: Add column helpers and update 10-20 high-value rules
  - Tests: Update existing rule tests to verify column/span info in reported issues; test column helper utilities with edge cases (empty lines, multi-byte characters, tabs)
- [ ] P4-1d: Gradual rollout to remaining rules
  - Tests: Update rule tests as each rule is migrated
- [ ] P4-1e: Website docs — add `codeframe` formatter to `api/formatters.md` with before/after examples

---

## Verification

After each phase, run:

```bash
npm test                    # All tests pass
npm run check:self          # claudelint passes on itself
npm run build               # Clean build
```
