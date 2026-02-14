# CLI Output Overhaul -- Progress Tracker

**Last Updated**: 2026-02-13
**Status**: Complete
**Progress**: 28/28 tasks

---

## How to Use This Tracker

- Mark tasks `[x]` when complete, update date
- Update phase progress counts after each task
- Each task lists files to modify and test expectations
- Run verification after each phase (see README.md)

---

## Phase 1: Reporter Formatting Overhaul

**Progress**: 7/7
**Priority**: Highest -- fixes the visual alignment issues visible in every run
**Completed**: 2026-02-13

### P1-1: Add `text-table` dependency

- [x] `npm install text-table` (already in dependencies)
- [x] `npm install --save-dev @types/text-table` (already in devDependencies)
- [x] Verify it's in dependencies (not devDependencies -- used at runtime)

### P1-2: Rewrite `reportStylish()` to use text-table

- [x] Build issue table with columns: `[indent, lineNum, severity, message, ruleId]`
- [x] Use `align: ['l', 'r', 'l', 'l', 'l']` for right-aligned line numbers
- [x] Plain strings for table building, colors applied post-hoc (no strip-ansi needed)
- [x] Post-process to apply chalk colors after table generation
- [x] Message truncation at 80 chars with "..." ellipsis

**Files**: `src/utils/reporting/reporting.ts`

### P1-3: Remove per-line Fix: labels from default output

- [x] Removed `showFix` block from default output in `reportStylish()`
- [x] Fix: rendering preserved in `--explain` mode only
- [x] Fixable count shown in check-all summary line (already done: "N potentially fixable with --fix")

**Files**: `src/utils/reporting/reporting.ts`

### P1-4: Format collapse lines as table rows

- [x] Collapse lines ("... and N more rule-id") go through the same table builder
- [x] Use empty strings for line number and severity columns so they align with the message column

**Files**: `src/utils/reporting/reporting.ts`

### P1-5: Handle issues without line numbers cleanly

- [x] Issues without line numbers get empty string in line column (text-table handles alignment)
- [x] No special-case padding logic needed -- text-table aligns all rows automatically

**Files**: `src/utils/reporting/reporting.ts`

### P1-6: Update reporter tests

- [x] All 25 existing tests pass with new table-formatted output
- [x] Added 8 new tests for text-table formatting behavior
- [x] Test for column alignment with mixed line numbers
- [x] Test for mixed line-number/no-line-number issues in same file
- [x] Test for message truncation (over and under 80 chars)
- [x] Test for collapse lines alignment
- [x] Test for deduplication
- [x] Test for Fix: label suppression in default mode and presence in explain mode

**Files**: `tests/utils/reporting.test.ts`

### P1-7: Update fixture integration test counts

- [x] Ran `tests/integration/fixture-projects.test.ts` -- all 24 pass, no count changes needed
- [x] All rule ID assertions still pass

**Files**: `tests/integration/fixture-projects.test.ts`

---

## Phase 2: Message Content Cleanup

**Progress**: 5/5
**Priority**: High -- fixes the "wall of text" problem in issue messages
**Reference**: [Message Audit](message-audit.md) for full list of every message
**Completed**: 2026-02-13

### P2-1: Rewrite the 20 worst messages

- [x] Update the 20 messages categorized as NEEDS REWRITE in the audit
- [x] Each message should state the problem only, under ~80 characters
- [x] Move fix instructions to the `fix` field (create if missing)
- [x] Move rationale to `meta.docs.details` (already exists on most rules)
- [x] Move examples to `meta.docs.examples` (already exists)

**Rules (see audit for exact before/after):**

- `commands-migrate-to-skills`, `commands-deprecated-directory`
- `claude-md-content-too-many-sections`, `claude-md-import-in-code-block`
- `skill-description-missing-trigger`, `skill-body-too-long`, `skill-too-many-files`
- `skill-time-sensitive-content`, `skill-xml-tags-anywhere`, `skill-overly-generic-name` (x2)
- `skill-multi-script-missing-readme`, `skill-description-quality` (brief variant)
- `skill-mcp-tool-qualified-name`
- `lsp-server-name-too-short`
- `settings-invalid-permission`
- `plugin-commands-deprecated`
- `skill-naming-inconsistent`, `skill-missing-comments`

**Files**: ~20 files in `src/rules/`

### P2-2: Shorten the 54 NEEDS SHORTENING messages

- [x] Remove inline fix instructions ("Add...", "Use...", "Consider...")
- [x] Remove inline rationale ("so that...", "to ensure...", "which means...")
- [x] Remove inline examples ("e.g., ...", "for example", "like...")
- [x] Remove data dumps (valid keys lists, valid tools lists, valid events lists)
- [x] Keep the `fix` field populated with the removed fix text where appropriate

**Rules by category (see audit for details):**

- Skills: ~26 messages
- Claude-MD: ~4 messages
- MCP: ~4 messages
- Settings: ~4 messages
- LSP: ~4 messages
- Plugin: ~3 messages
- Hooks: ~3 messages
- Output-Styles: ~2 messages
- Agents: ~2 messages
- Schemas/refinements: ~2 messages

**Files**: ~50 files in `src/rules/` and `src/schemas/refinements.ts`

### P2-3: Update rule tests for shortened messages

- [x] Update message assertions in ~50 test files under `tests/rules/`
- [x] Grep for old message strings and replace with new ones
- [x] Verify all 1382 tests pass after changes

**Files**: `tests/rules/**/*.test.ts`

### P2-4: Update fixture project pinned counts

- [x] Run fixture integration tests after message changes
- [x] All 24 fixture tests pass, no count changes needed

**Files**: `tests/integration/fixture-projects.test.ts`

### P2-5: Regenerate website rule docs

- [x] Run `npm run docs:generate` to regenerate rule pages from updated `meta.docs` fields
- [x] Verified generated pages reflect new message content
- [x] Spot-checked 5 rule pages -- all well-formed with populated howToFix, examples, and details

**Files**: `website/rules/**/*.md` (auto-generated)

---

## Phase 3: Three-Tier Explain Mode

**Progress**: 9/9
**Priority**: Medium -- makes `--explain` useful now that messages are terse
**Completed**: 2026-02-13
**Prerequisite**: Phase 2 (messages shortened, docs fields populated)
**Design Reference**: [Explain Mode Spec](explain-mode-spec.md)

Three-tier progressive disclosure: Default (table) → `--explain` (Why + Fix per issue) → `explain <rule-id>` (full docs).
New field: `docs.rationale` (~120 chars, consequence-focused "why") on all 116 rules.

### P3-1: Add `docs.rationale` field and auto-populate wiring [DONE]

- [x] Added `rationale?: string` to `RuleDocumentation` in `src/types/rule-metadata.ts`
- [x] Auto-populate wired in `file-validator.ts` `executeRule()` method
- [x] `explanation` falls back to `docs.rationale || docs.summary`
- [x] `howToFix` falls back to `docs.howToFix`
- [x] Data dump rules have `howToFix` populated (verified 8/8 rules)

**Completed**: 2026-02-13

**Files**: `src/types/rule-metadata.ts`, `src/validators/file-validator.ts`

### P3-2: Verify existing explain output works end-to-end [DONE]

- [x] Ran `claudelint check-all --explain --no-cache` -- every issue shows explain blocks
- [x] Verified `--verbose` does not show explain content (only `--explain`)

**Completed**: 2026-02-13

### P3-3: Update Tier 2 rendering in reporter [DONE]

- [x] Changed "Why this matters:" label to "Why:" in `reportStylish()` explain block
- [x] Changed "How to fix:" label to "Fix:" — merged `howToFix` and `fix` into single Fix: line
- [x] Show Why: line (from `issue.explanation`, which auto-populates from `docs.rationale || docs.summary`)
- [x] Show Fix: line with priority: `issue.fix` > `issue.howToFix` (auto-populates from `docs.howToFix`)
- [x] Omit Why:/Fix: lines when no data available
- [x] No Why:/Fix: for collapsed issues ("... and N more") — collapse rows have `kind: 'collapse'`, skipped
- [x] Added `getExplainFooter()` method on Reporter; wired in `check-all.ts` after summary line
- [x] Indentation: 8 spaces (aligned with message column)
- [x] Added 4 new tests: howToFix fallback, Why: omission, Fix: omission, getExplainFooter
- [x] All 1387 tests pass

**Completed**: 2026-02-13

**Files**: `src/utils/reporting/reporting.ts`, `src/cli/commands/check-all.ts`, `tests/utils/reporting.test.ts`

### P3-4: Write `docs.rationale` for all 116 rules [DONE]

- [x] Write rationale for Skills rules (46 rules)
- [x] Write rationale for CLAUDE.md rules (16 rules)
- [x] Write rationale for MCP rules (11 rules)
- [x] Write rationale for Settings rules (5 rules)
- [x] Write rationale for LSP rules (6 rules)
- [x] Write rationale for Plugin rules (12 rules)
- [x] Write rationale for Hooks rules (3 rules)
- [x] Write rationale for Agents rules (12 rules)
- [x] Write rationale for Output Styles rules (3 rules)
- [x] Write rationale for Commands rules (2 rules)
- [x] Each rationale: 1-2 sentences, ~120 chars, answers "why does this matter?"
- [x] Verified: 116 rationale fields across 116 rule files
- [x] All 1387 tests pass across 183 suites

**Completed**: 2026-02-13

**Files**: All `src/rules/**/*.ts` files

### P3-5: Build `claudelint explain <rule-id>` subcommand (Tier 3) [DONE]

- [x] Created `src/cli/commands/explain.ts` as a commander.js subcommand
- [x] Looks up rule from `RuleRegistry` by ID
- [x] Renders: title, summary, details, howToFix, examples, metadata table, whenNotToUse, related rules
- [x] Word-wraps text to `process.stdout.columns || 80`
- [x] Generates docs URL from `meta.category` + `meta.id` via `getCategorySlug()`
- [x] Exit code 0 on success, 1 if rule not found (shows category summary + suggestion)
- [x] Registered command in `src/cli.ts`
- [x] All 1387 tests pass

**Completed**: 2026-02-13

**Files**: `src/cli/commands/explain.ts`, `src/cli.ts`

### P3-6: Add tests for Tier 2 rendering [DONE]

- [x] Test: issue with `explanation` (from rationale) shows "Why:" line in explain mode
- [x] Test: issue without rationale falls back to `docs.summary` for Why: line
- [x] Test: issue with `fix` shows "Fix:" line (overrides `howToFix`)
- [x] Test: issue with `howToFix` (from docs) shows "Fix:" line
- [x] Test: issue without fix or howToFix omits "Fix:" line
- [x] Test: Why:/Fix: content not shown in default mode (only `--explain`)
- [x] Test: footer hint appears once at end of explain output

**Completed**: 2026-02-13

**Files**: `tests/utils/reporting.test.ts`

### P3-7: Add tests for Tier 3 explain subcommand [DONE]

- [x] Test: valid rule ID prints full documentation
- [x] Test: invalid rule ID exits with code 1 and shows error
- [x] Test: output includes summary, details, howToFix, examples, metadata
- [x] Test: output word-wraps to specified width
- [x] Test: whenNotToUse section rendering
- [x] Test: correct docs URLs for different categories

**Completed**: 2026-02-13

**Files**: `tests/cli/explain.test.ts`

### P3-8: Verify end-to-end [DONE]

- [x] Run `claudelint check-all --explain --no-cache` -- Why: + Fix: lines shown per issue
- [x] Verify Why: lines use rationale (not docs.details prose)
- [x] Run `claudelint explain <rule-id>` for 3+ rules, verify complete output
- [x] Run `npm run check:self` -- passes
- [x] All 1393 tests pass across 184 suites

**Completed**: 2026-02-13

---

## Phase 4: Enforcement and Regression Guards

**Progress**: 5/5
**Priority**: High -- prevents regressions after the cleanup
**Completed**: 2026-02-13

### P4-1: Add message length check script [DONE]

- [x] Create `scripts/check/message-length.ts`
- [x] Scan all rule files for `context.report({ message:` patterns
- [x] Extract message templates and calculate approximate max length
- [x] Fail if any message exceeds 100 characters (with allowance for interpolated values)
- [x] Add to `package.json` scripts: `"check:message-length": "ts-node scripts/check/message-length.ts"`

**Completed**: 2026-02-13

**Files**: `scripts/check/message-length.ts`, `package.json`

### P4-2: Add message content lint script [DONE]

- [x] Create `scripts/check/message-content.ts`
- [x] Check for anti-patterns in messages:
  - Fix instructions: starts with "Add ", "Use ", "Create ", "Remove ", "Consider "
  - Rationale: contains "so that", "to ensure", "which means", "to prevent"
  - Examples: contains "e.g.,", "for example", "such as", "like:"
  - Excessive length: message template > 100 chars
- [x] Report violations with rule file path and line number
- [x] Add to `package.json` scripts: `"check:message-content": "ts-node scripts/check/message-content.ts"`

**Completed**: 2026-02-13

**Files**: `scripts/check/message-content.ts`, `package.json`

### P4-3: Add checks to pre-commit hook [DONE]

- [x] Add `check:message-length` to the pre-commit check sequence in `.husky/pre-commit`
- [x] Add `check:message-content` to the pre-commit check sequence
- [x] Verify both run and pass on current codebase after Phase 2 cleanup

**Completed**: 2026-02-13

**Files**: `.husky/pre-commit`

### P4-4: Add reporter output snapshot test [DONE]

- [x] Create a snapshot test that runs the reporter against a fixed set of issues
- [x] Captures exact column alignment, spacing, and formatting
- [x] Any formatting regression causes the snapshot to fail
- [x] Use `jest.spyOn(console, 'log')` to capture output lines
- [x] 6 snapshot tests: stylish mixed, mixed line numbers, explain mode, collapse rows, compact, truncation

**Completed**: 2026-02-13

**Files**: `tests/utils/reporting-snapshot.test.ts`

### P4-5: Document message authoring guidelines [DONE]

- [x] Add "Rule Message Guidelines" section to `src/CLAUDE.md`
- [x] Include: max length, what belongs in message vs fix vs docs, anti-patterns to avoid
- [x] Reference the enforcement scripts that will catch violations

**Completed**: 2026-02-13

**Files**: `src/CLAUDE.md`

---

## Phase 5: Website Documentation

**Progress**: 4/4
**Priority**: Medium -- update docs to reflect new output format
**Completed**: 2026-02-13

### P5-1: Update CLI reference page [DONE]

- [x] Added `explain` command to TOC and full documentation section
- [x] Updated `--explain` description to describe the Why/Fix blocks (Tier 2 progressive disclosure)
- [x] Added progressive disclosure model table to explain command docs
- [x] No per-line Fix: labels to remove (page didn't have output examples)

**Completed**: 2026-02-13

**Files**: `website/guide/cli-reference.md`

### P5-2: Update getting started page [DONE]

- [x] Reviewed `website/guide/getting-started.md` -- no output examples to update
- [x] Page uses `<CodeTabs>` and `<ConfigExample>` components, no raw CLI output

**Completed**: 2026-02-13

**Files**: `website/guide/getting-started.md`

### P5-3: Update terminal demo component [DONE]

- [x] Rewrote `TerminalDemo.vue` output to match new ESLint-style table format
- [x] Replaced per-validator output with file-grouped table rows
- [x] Removed per-line Fix: labels
- [x] Added underline CSS class for file path headers
- [x] Shows realistic table-aligned output with line numbers, severity, message, rule ID

**Completed**: 2026-02-13

**Files**: `website/.vitepress/theme/components/TerminalDemo.vue`

### P5-4: Update contributing rules guide [DONE]

- [x] Added "Understanding Output" section to `website/guide/rules-overview.md`
- [x] Documents three-tier progressive disclosure model with table
- [x] Explains what each tier shows and where content belongs
- [x] Message authoring guidelines added to `src/CLAUDE.md` (P4-5)

**Completed**: 2026-02-13

**Files**: `website/guide/rules-overview.md`

---

## Completed Work (Pre-project)

These changes were made before this project was formalized and are already committed:

- [x] Merged `checkBestPractices()`/`checkSecurityAndSafety()` into `checkScriptFiles()` -- eliminated duplicate rule firings on shell scripts
- [x] Added deduplication by `file:line:ruleId:message` key
- [x] Added collapse for 3+ same-ruleId issues per file
- [x] Removed brackets from rule IDs
- [x] Removed per-validator sub-summary
- [x] Changed `isExplainMode` to `explain` only (not `verbose`)
- [x] Added dynamic line number padding
- [x] Truncated verbose file lists (test files summarized)
- [x] Used relative paths in import-missing messages
