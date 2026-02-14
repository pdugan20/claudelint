# CLI Output Overhaul -- Progress Tracker

**Last Updated**: 2026-02-13
**Status**: In Progress
**Progress**: 14/28 tasks

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

**Progress**: 2/9
**Priority**: Medium -- makes `--explain` useful now that messages are terse
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

### P3-3: Update Tier 2 rendering in reporter

- [ ] Change "Why this matters:" label to "Why:" in `reportStylish()` explain block
- [ ] Change "How to fix:" label to "Fix:"
- [ ] Show Why: line (from `issue.explanation`, which auto-populates from `docs.rationale || docs.summary`)
- [ ] Show Fix: line with priority: `issue.fix` > `issue.howToFix` (auto-populates from `docs.howToFix`)
- [ ] Omit Why:/Fix: lines when no data available
- [ ] No Why:/Fix: for collapsed issues ("... and N more")
- [ ] Add footer hint: `Run 'claudelint explain <rule-id>' for detailed rule documentation.`
- [ ] Indentation: 8 spaces (aligned with message column)

**Files**: `src/utils/reporting/reporting.ts`

### P3-4: Write `docs.rationale` for all 116 rules

- [ ] Write rationale for Skills rules (~30 rules)
- [ ] Write rationale for CLAUDE.md rules (~6 rules)
- [ ] Write rationale for MCP rules (~4 rules)
- [ ] Write rationale for Settings rules (~4 rules)
- [ ] Write rationale for LSP rules (~5 rules)
- [ ] Write rationale for Plugin rules (~4 rules)
- [ ] Write rationale for Hooks rules (~3 rules)
- [ ] Write rationale for Agents rules (~2 rules)
- [ ] Write rationale for Output Styles rules (~2 rules)
- [ ] Write rationale for Commands rules (~2 rules)
- [ ] Each rationale: 1-2 sentences, ~120 chars, answers "why does this matter?"

**Files**: All `src/rules/**/*.ts` files

### P3-5: Build `claudelint explain <rule-id>` subcommand (Tier 3)

- [ ] Create `src/cli/commands/explain.ts` as a commander.js subcommand
- [ ] Look up rule from `RuleRegistry` by ID
- [ ] Render: title, summary, details, howToFix, examples, metadata table, related rules
- [ ] Word-wrap text to `process.stdout.columns || 80`
- [ ] Generate docs URL from `meta.category` + `meta.id` (replace hardcoded map in reporter)
- [ ] Exit code 0 on success, 1 if rule not found (with helpful error + suggestion)
- [ ] Register command in CLI entry point

**Files**: `src/cli/commands/explain.ts`, `src/cli/index.ts`

### P3-6: Add tests for Tier 2 rendering

- [ ] Test: issue with `explanation` (from rationale) shows "Why:" line in explain mode
- [ ] Test: issue without rationale falls back to `docs.summary` for Why: line
- [ ] Test: issue with `fix` shows "Fix:" line (overrides `howToFix`)
- [ ] Test: issue with `howToFix` (from docs) shows "Fix:" line
- [ ] Test: issue without fix or howToFix omits "Fix:" line
- [ ] Test: Why:/Fix: content not shown in default mode (only `--explain`)
- [ ] Test: footer hint appears once at end of explain output

**Files**: `tests/utils/reporting.test.ts`

### P3-7: Add tests for Tier 3 explain subcommand

- [ ] Test: valid rule ID prints full documentation
- [ ] Test: invalid rule ID exits with code 1 and shows error
- [ ] Test: output includes summary, details, howToFix, examples, metadata
- [ ] Test: output word-wraps to specified width

**Files**: `tests/cli/explain.test.ts`

### P3-8: Verify end-to-end

- [ ] Run `claudelint check-all --explain --no-cache` -- Why: + Fix: lines shown per issue
- [ ] Verify Why: lines use rationale (not docs.details prose)
- [ ] Run `claudelint explain <rule-id>` for 3+ rules, verify complete output
- [ ] Run `npm run check:self` -- passes
- [ ] All tests pass

---

## Phase 4: Enforcement and Regression Guards

**Progress**: 0/5
**Priority**: High -- prevents regressions after the cleanup

### P4-1: Add message length check script

- [ ] Create `scripts/check/message-length.ts`
- [ ] Scan all rule files for `context.report({ message:` patterns
- [ ] Extract message templates and calculate approximate max length
- [ ] Fail if any message exceeds 100 characters (with allowance for interpolated values)
- [ ] Add to `package.json` scripts: `"check:message-length": "ts-node scripts/check/message-length.ts"`

**Files**: `scripts/check/message-length.ts`, `package.json`

### P4-2: Add message content lint script

- [ ] Create `scripts/check/message-content.ts`
- [ ] Check for anti-patterns in messages:
  - Fix instructions: starts with "Add ", "Use ", "Create ", "Remove ", "Consider "
  - Rationale: contains "so that", "to ensure", "which means", "to prevent"
  - Examples: contains "e.g.,", "for example", "such as", "like:"
  - Excessive length: message template > 100 chars
- [ ] Report violations with rule file path and line number
- [ ] Add to `package.json` scripts: `"check:message-content": "ts-node scripts/check/message-content.ts"`

**Files**: `scripts/check/message-content.ts`, `package.json`

### P4-3: Add checks to pre-commit hook

- [ ] Add `check:message-length` to the pre-commit check sequence in `.husky/pre-commit`
- [ ] Add `check:message-content` to the pre-commit check sequence
- [ ] Verify both run and pass on current codebase after Phase 2 cleanup

**Files**: `.husky/pre-commit`

### P4-4: Add reporter output snapshot test

- [ ] Create a snapshot test that runs the reporter against a fixed set of issues
- [ ] Captures exact column alignment, spacing, and formatting
- [ ] Any formatting regression causes the snapshot to fail
- [ ] Use `jest.spyOn(console, 'log')` to capture output lines

**Files**: `tests/utils/reporting-snapshot.test.ts`

### P4-5: Document message authoring guidelines

- [ ] Add "Rule Message Guidelines" section to `src/CLAUDE.md`
- [ ] Include: max length, what belongs in message vs fix vs docs, anti-patterns to avoid
- [ ] Reference the enforcement scripts that will catch violations

**Files**: `src/CLAUDE.md`

---

## Phase 5: Website Documentation

**Progress**: 0/4
**Priority**: Medium -- update docs to reflect new output format

### P5-1: Update CLI reference page

- [ ] Update output examples in `website/guide/cli-reference.md` to show new table-aligned format
- [ ] Update `--explain` description to describe the Why/How/Fix blocks
- [ ] Remove any references to per-line Fix: labels in normal mode

**Files**: `website/guide/cli-reference.md`

### P5-2: Update getting started page

- [ ] Update example output in `website/guide/getting-started.md` to match new format
- [ ] Ensure the "what you'll see" section shows realistic, aligned output

**Files**: `website/guide/getting-started.md`

### P5-3: Update terminal demo component

- [ ] Update `website/.vitepress/theme/components/TerminalDemo.vue` if it shows sample output
- [ ] Ensure demo output matches the new format (no Fix: labels, aligned columns)

**Files**: `website/.vitepress/theme/components/TerminalDemo.vue`

### P5-4: Update contributing rules guide

- [ ] Update `website/guide/contributing-rules.md` (or equivalent) with message authoring guidelines
- [ ] Link to the enforcement scripts
- [ ] Include before/after examples of good vs bad messages

**Files**: `website/guide/contributing-rules.md` or `website/guide/rule-development.md`

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
