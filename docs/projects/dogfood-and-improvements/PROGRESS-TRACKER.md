# Dogfood and Improvements - Progress Tracker

**Last Updated**: 2026-02-06
**Status**: Phase 2 In Progress (Sprint 7 In Progress)
**Progress**: Phase 1 7/7 (100%), Phase 2 19/24 (79%)

---

## How to Use This Tracker

- Mark tasks with `[x]` when complete
- Update phase progress percentages after each task
- Update "Last Updated" date when you make changes
- Link to commits/PRs in the Notes column where applicable

---

## Phase 1: Linter Bug Fixes (COMPLETE)

**Progress**: 7/7 (100%)
**Commits**: `cf4d7d5`, `2ab4160`

- [x] **P1-1**: Fix `findSkillDirectories` multi-pattern discovery
  - Files: `src/utils/filesystem/files.ts`, `tests/validators/skills.test.ts`
  - Notes: Also fixed `findAgentDirectories` and `findOutputStyleDirectories`

- [x] **P1-2**: Fix dogfood script path
  - Files: `scripts/test/skills/validate-self.sh`
  - Notes: `.claude/skills` -> `skills`

- [x] **P1-3**: Fix `skill-body-too-long` threshold 400 -> 500
  - Files: `src/rules/skills/skill-body-too-long.ts`, `docs/rules/skills/skill-body-too-long.md`

- [x] **P1-4**: Fix `skill-referenced-file-not-found` regex
  - Files: `src/rules/skills/skill-referenced-file-not-found.ts`, doc, tests

- [x] **P1-5**: New rule `skill-reference-not-linked`
  - Files: New rule, test, and doc

- [x] **P1-6**: Fix all skill content issues
  - Files: All 9 `skills/*/SKILL.md`
  - Notes: Descriptions, broken links, code block formatting

- [x] **P1-7**: Fix `skill-unknown-string-substitution` false positives
  - Files: `src/rules/skills/skill-unknown-string-substitution.ts`, tests

---

## Phase 2: Improvements

### Sprint 1: Quick Wins

**Progress**: 3/3 (100%)
**Estimated Time**: 1-2 hours

- [x] **T1-1**: Fix broken `validators.md` links in docs/
  - Files to change:
    - `docs/debugging.md` line 299: `validators.md` -> `validation-reference.md`
    - `docs/getting-started.md` line 181: `validators.md` -> `validation-reference.md`
    - `docs/inline-disables.md` lines 113, 389: `validators.md` -> `validation-reference.md`
    - `docs/hooks.md` line 202: `validators.md` -> `validation-reference.md`
  - Notes: _`validation-reference.md` already exists, just broken references_

- [x] **T1-2**: Trim `optimize-cc-md` under 500 lines
  - File: `skills/optimize-cc-md/SKILL.md` (currently 535 lines)
  - Action: Move "Common Fixes" section (lines 152-214) to `references/common-fixes.md`
  - Action: Move "Troubleshooting" section (lines 394-507) to `references/troubleshooting.md`
  - Action: Replace sections with markdown links to new reference files
  - Target: Under 500 lines with same content accessible via references
  - Notes: _Follows Anthropic progressive disclosure pattern_

- [x] **T1-5**: Wire up new reference files and cross-links
  - File: `skills/optimize-cc-md/SKILL.md` Reference Files section
  - Action: Add links to `quality-criteria.md` and `templates.md` (created in Sprint 2)
  - Action: Update `skills/validate-skills/SKILL.md` See Also section
  - Notes: _Depends on Sprint 2 content, but wiring is trivial_

**Sprint 1 Verification:**

- [x] `./bin/claudelint validate-skills --path skills` shows 0 errors, 0 warnings
- [x] All links in modified docs files resolve correctly

---

### Sprint 2: Reference Content

**Progress**: 3/3 (100%)
**Estimated Time**: Half day

- [x] **T1-3**: Create `quality-criteria.md` reference file
  - File: `skills/optimize-cc-md/references/quality-criteria.md`
  - Content: Manual review checklist (see [CONTENT-SPECS.md](./CONTENT-SPECS.md#quality-criteriamd))
  - Notes: _Complements programmatic validation; covers aspects that can't be linted_

- [x] **T1-4**: Create `templates.md` reference file
  - File: `skills/optimize-cc-md/references/templates.md`
  - Content: Annotated CLAUDE.md examples (see [CONTENT-SPECS.md](./CONTENT-SPECS.md#templatesmd))
  - Notes: _Provides concrete examples users can model from_

- [x] **T4-18**: Create file type taxonomy documentation
  - File: `skills/optimize-cc-md/references/file-type-taxonomy.md`
  - Content: Complete Claude Code config ecosystem reference
  - Notes: _Documents all config file types and their relationships_

**Sprint 2 Verification:**

- [x] New reference files exist and are valid markdown
- [x] `./bin/claudelint validate-skills --path skills` still passes
- [x] Reference files are linked from SKILL.md

---

### Sprint 3: Skill Workflow Restructure

**Progress**: 1/1 (100%)
**Estimated Time**: 1-2 days

- [x] **T2-6**: Restructure `optimize-cc-md` into 3-phase workflow
  - File: `skills/optimize-cc-md/SKILL.md`
  - Phase A: Validate (run claudelint, present results)
  - Phase B: Assess (evaluate against quality criteria checklist)
  - Phase C: Improve (make targeted improvements with explanations)
  - See [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md#t2-6-restructure-optimize-cc-md) for details
  - Notes: _Must stay under 500 lines after restructure_

**Sprint 3 Verification:**

- [x] SKILL.md under 500 lines (309 lines)
- [x] All 3 phases clearly documented with step-by-step instructions
- [x] Reference files cover detailed content for each phase
- [x] `./bin/claudelint validate-skills --path skills` passes

---

### Sprint 4: New Rules

**Progress**: 6/6 (100%)
**Estimated Time**: 3-5 days

Priority rules from the [skills-quality-validation](../archive/skills-quality-validation/) project:

- [x] **E1**: `skill-readme-forbidden`
  - Files: `src/rules/skills/skill-readme-forbidden.ts`, test, doc
  - Logic: Error if `README.md` exists in a skill directory
  - Notes: _Explicit Anthropic requirement; 30 min_

- [x] **E6**: `skill-body-word-count`
  - Files: `src/rules/skills/skill-body-word-count.ts`, test, doc
  - Logic: Warn if SKILL.md body exceeds 5,000 words (guide uses words, not lines)
  - Notes: _Complements existing line-count rule; 1 hour_

- [x] **E3/E5**: `skill-xml-tags-anywhere`
  - Files: `src/rules/skills/skill-xml-tags-anywhere.ts`, test, doc
  - Logic: Error for XML tags in SKILL.md (security: prevent XML injection)
  - Notes: _Security rule; 1 hour_

- [x] **E8**: `skill-frontmatter-unknown-keys`
  - Files: `src/rules/skills/skill-frontmatter-unknown-keys.ts`, test, doc
  - Logic: Warn for unrecognized YAML frontmatter keys
  - Notes: _Catches typos in frontmatter; 45 min_

- [x] **E4**: `skill-description-max-length`
  - Files: `src/rules/skills/skill-description-max-length.ts`, test, doc
  - Logic: Warn if description exceeds 500 characters
  - Notes: _Aligns with guide recommendation; 30 min_

- [x] **T2-11**: Cross-skill reference validation
  - Files: `src/rules/skills/skill-cross-reference-invalid.ts`, test, doc
  - Logic: Validate See Also links point to existing skills
  - Notes: _Catches broken cross-references between skills; 3 hours_

**Sprint 4 Verification:**

- [x] `npm run build` compiles
- [x] `npm test` passes (157/157 suites, 1108 tests)
- [x] `npm run generate:types` registers new rules (99 -> 105 rules)
- [x] New rules have documentation in `docs/rules/skills/`
- [x] Dogfood: `./bin/claudelint validate-skills --path skills` passes with new rules

---

### Sprint 5: Developer Experience

**Progress**: 3/3 (100%)
**Estimated Time**: 3-5 days

- [x] **T2-9**: Pre-commit hook optimization (changed files only)
  - File: `.husky/pre-commit`
  - Logic: Detect staged file categories, only run relevant checks
  - Force all with `CLAUDELINT_PRECOMMIT_ALL=1`
  - Notes: _Shows "N of 10 enabled" to communicate which checks run_

- [x] **T2-10**: Validation caching for unchanged files
  - Already implemented! `src/utils/cache.ts`, `src/cli/commands/cache-clear.ts`
  - Wired into `check-all` with `--cache`/`--no-cache` flags
  - Notes: _No new work needed; discovered during Sprint 5 exploration_

- [x] **T2-12**: SARIF/JSON output for CI integration
  - New file: `src/utils/reporting/sarif.ts` (SARIF v2.1.0 formatter)
  - Updated: `OutputFormat` type, `Reporter`, `check-all` command
  - JSON/compact already existed; added SARIF for GitHub Code Scanning
  - Notes: _7 tests in `tests/utils/sarif.test.ts`_

**Sprint 5 Verification:**

- [x] Pre-commit hook detects staged file categories and skips irrelevant checks
- [x] `CLAUDELINT_PRECOMMIT_ALL=1` forces all checks
- [x] Cache already implemented and wired into `check-all`
- [x] `claudelint check-all --format sarif` produces valid SARIF v2.1.0 output
- [x] `claudelint check-all --format json` produces valid JSON output
- [x] 158/158 test suites pass (1115 tests)

---

### Sprint 6: Auto-fix

**Progress**: 1/1 (100%)
**Estimated Time**: 3-4 days

- [x] **T2-7**: Implement auto-fix for simple rules
  - Infrastructure (already existed):
    - [x] `--fix` flag already in `check-all` CLI command
    - [x] `Fixer` class already in `src/utils/rules/fixer.ts`
    - [x] `AutoFix` interface already in `src/validators/file-validator.ts`
    - [x] `--fix-dry-run` already works with diff preview
  - Rules made fixable:
    - [x] `skill-missing-shebang` - Prepend `#!/usr/bin/env bash`
    - [x] `skill-reference-not-linked` - Convert backtick to markdown link
    - [x] `skill-name-directory-mismatch` - Update frontmatter name to match dir
    - Deferred: `skill-name` (Zod-delegated, multiple error types)
    - Deferred: `claude-md-filename-case-sensitive` (requires filesystem rename, not content fix)
  - Tests: 7 tests in `tests/utils/fixer-integration.test.ts`

**Sprint 6 Verification:**

- [x] `claudelint check-all --fix` applies fixes without errors
- [x] Each fixable rule produces correct autoFix callback
- [x] `--fix-dry-run` shows preview without modifying files
- [x] 159/159 test suites pass (1122 tests)

---

### Sprint 7+: Advanced (Ongoing)

**Progress**: 0/7 (0%)

These items are lower priority and can be tackled as time permits.

- [ ] **T3-13**: Codebase cross-referencing
  - Verify `npm run` scripts, file paths, and command names in CLAUDE.md
  - Notes: _High value but complex; 1+ week_

- [ ] **T3-14**: Skills-quality-validation Medium rules (17 rules)
  - Follow specs from [skills-quality-validation](../archive/skills-quality-validation/) Phase 2
  - Priority: M1 (trigger phrases), M13 (hardcoded secrets), M11 (MCP tool names)
  - Notes: _1-2 weeks; use existing project specs_

- [ ] **T3-15**: Red flags detection
  - Stale commands, dead file refs, old TODOs, version mismatches
  - Notes: _3-5 days_

- [ ] **T3-16**: Progressive disclosure validation
  - Enforce 3-level content hierarchy (frontmatter / body / references)
  - Notes: _3-5 days_

- [ ] **T3-17**: Additive guidance engine
  - Suggest missing sections and improvements, not just flag errors
  - Notes: _Heuristics-based, not LLM; 1+ week_

- [x] **T4-19**: CI/CD integration guide
  - File: `docs/ci-integration.md`
  - Content: GitHub Actions (basic, SARIF upload, selective, caching), GitLab CI, pre-commit
  - Notes: _Includes SARIF upload for inline PR annotations_

- [x] **T4-20**: Watch mode (`claudelint watch`)
  - File: `src/cli/commands/watch.ts`
  - Logic: `fs.watch` with debouncing, triggers relevant validators per changed file
  - Options: `--debounce <ms>`, `--verbose`, `--config`
  - Notes: _No external dependencies; uses Node.js built-in fs.watch_

---

## Deferred (Implement When Demand Exists)

These items are tracked but intentionally deferred until there's user demand or a larger install base.

- [ ] **T4-21**: Skills-quality-validation Hard rules (12 rules)
  - LLM-based evaluation, MCP registry validation
  - Deferred: Requires runtime LLM dependency; keep opt-in behind `--llm` flag

- [ ] **T4-22**: Skill version drift detection
  - Deferred: Minimal value until release cadence is established

- [ ] **T4-23**: Rule usage analytics
  - Deferred: Needs meaningful user base for data to be useful

- [ ] **T4-24**: Custom rule plugin API
  - Deferred: Significant API surface; wait for user demand

---

## Overall Progress

```text
Phase 1 (Bug Fixes):    [##########] 100%  (7/7)
Sprint 1 (Quick Wins):  [##########] 100%  (3/3)
Sprint 2 (Content):     [##########] 100%  (3/3)
Sprint 3 (Workflow):    [##########] 100%  (1/1)
Sprint 4 (New Rules):   [##########] 100%  (6/6)
Sprint 5 (DevEx):       [##########] 100%  (3/3)
Sprint 6 (Auto-fix):    [##########] 100%  (1/1)
Sprint 7+ (Advanced):   [###       ]  29%  (2/7)
Deferred:               [          ]   0%  (0/4)

Phase 2 Total:          [########  ]  79%  (19/24 active + 4 deferred)
```

---

## Dependencies

```text
T1-5 (wire references) → depends on T1-3, T1-4 (create content)
T2-6 (workflow restructure) → depends on T1-2 (trim), T1-3 (quality criteria)
T2-11 (cross-ref validation) → standalone
Sprint 4 rules → standalone (can run generate:types after each)
T2-12 (SARIF) → benefits from logging-architecture DiagnosticCollector
T2-7 (auto-fix) → standalone (AutoFix type already exists)
T3-14 (medium rules) → follow skills-quality-validation project specs
```

---

## Notes & Decisions

### 2026-02-06

- Phase 1 completed with 7/7 tasks (commits `cf4d7d5`, `2ab4160`)
- Dogfood result: 0 errors, 1 warning (`skill-body-too-long` on optimize-cc-md at 535 lines)
- Cataloged 24 active improvements + 4 deferred items
- Stack-ranked by usefulness/difficulty priority score
- Decided against LLM-based evaluation as default (keep opt-in)
- Decided against custom rule API (wait for user demand)
- Quality criteria will be manual checklist, not scoring rubric
- Sprint 4 completed: 6 new rules (105 total), 29 new tests, 6 rule docs
- Fixed test fixture `withMinimalFields()` which used invalid `usage` frontmatter key
- Also fixed `withAllFields()` to use only recognized keys (`tags`, `allowed-tools`)
- Sprint 5 completed: pre-commit optimization, SARIF output, caching already existed
- ValidationCache and --fix/--fix-dry-run were already implemented in check-all
- JSON and compact formats already existed; only SARIF was truly new
- Sprint 6 completed: auto-fix for 3 rules (shebang, ref-not-linked, name-dir-mismatch)
- All fix infrastructure (--fix, --fix-dry-run, Fixer class) already existed
- Deferred skill-name (Zod-delegated) and filename-case-sensitive (filesystem op)
- Sprint 7 in progress: T4-19 CI/CD guide + T4-20 watch mode completed
- Watch mode uses Node.js fs.watch (recursive), no external dependencies
- CI guide covers GitHub Actions + SARIF upload + GitLab CI + pre-commit
