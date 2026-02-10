# Aggregated Roadmap

**Last Updated:** 2026-02-10
**Purpose:** Single sequenced tracker for all remaining work across all projects.

---

## How This Works

**This file is the single source of truth for active work.** Do not update individual project trackers.

- **Working:** Check off tasks here as you complete them.
- **Archiving:** When a milestone finishes all tasks for a source project, that milestone includes a cleanup task to mark the project tracker as "Complete" and move it to `archive/`.
- **status.md:** Update [status.md](./status.md) when projects move between active and archived.
- **Project trackers:** Historical record only. Don't update during day-to-day work.

### Project completion map

| Project | Done when these milestones complete | Current status |
|---------|-------------------------------------|----------------|
| github-automation | Already archived (Milestone 1 is its last task) | archived, Milestone 1 nearly done (2 web-UI tasks remain) |
| plugin-and-md-management | Milestones 2 + 4 | active |
| npm-release-setup | Milestones 3 + 5 | active |
| schema-accuracy-fixes | Standalone (7 issues, 5 phases) | **archived** |
| testing-fixture-infrastructure | Milestone 4a | **archived** |
| official-spec-alignment | Milestones 5a + 5b | **archived** |
| dogfood-and-improvements | Milestones 6 + 7 + 8 | active |

---

## Milestone 1: Create GitHub Repo

**Source:** github-automation (archived) Task 7
**Unblocks:** CI/CD, branch protection, labels, codecov, GitHub releases, plugin GitHub install
**Effort:** ~30 minutes

- [x] Create repo: `gh repo create pdugan20/claudelint --private --source=. --push`
- [x] Run label script: `bash scripts/util/setup-github-labels.sh` (46 labels)
- [x] Configure branch protection (via `gh api`, required checks: Build, Test, Complete Validation)
- [x] Enable GitHub Discussions
- [x] Set up Codecov integration (token added, uploads working)
- [x] Verify CI workflows run on push (all 15 jobs green)

**Cleanup:** github-automation's last pending task is done. Update archived tracker header to "Complete".

---

## Milestone 2: Constants Verification Wiring

**Source:** plugin-and-md-management Phase 2.5
**Status:** Skipped — not needed
**Reason:** `check:constants` scripts query the Claude CLI via LLM prompts, making them non-deterministic, slow, and token-costly. Not suitable for pre-commit or CI automation. Internal consistency is already enforced by TypeScript compilation (in pre-commit via `npm run build`). External drift detection is a manual pre-release task, already documented in CONTRIBUTING.md (lines 169-209, 644-691).

- [x] ~~Add `npm run check:constants` to `.husky/pre-commit` hook~~ — Not needed (tsc catches internal drift)
- [x] ~~Add constants verification step to `.github/workflows/ci.yml`~~ — Not needed (LLM-based, not CI-grade)
- [x] ~~Update README with constants verification docs~~ — Already in CONTRIBUTING.md

---

## Milestone 3: Release Documentation

**Source:** npm-release-setup Phase 6
**Depends on:** Milestone 1 (GitHub repo exists for release notes)
**Effort:** ~half day

- [x] Create RELEASING.md (beta process, stable process, hotfix process)
- [x] Add release section to CONTRIBUTING.md (already existed)
- [x] Add `prepublishOnly` script to package.json (already existed)
- [x] Add version validation script (already existed: `sync:versions:check`)
- [x] Verify release-it npm scripts work end-to-end (dry run passed, needs npm auth)
- [x] Update GitHub release for existing beta (created v0.2.0-beta.0 + v0.2.0-beta.1)

---

## Milestone 4: Manual Testing

**Source:** plugin-and-md-management Phase 5.2-5.3 + Task 3.8
**Depends on:** Milestone 1 (GitHub install testing needs repo)
**Effort:** ~1 day
**Strategy:** Smoke test now, full runbook before M5 (stable release). M5b changes all 9 skills, so full testing before M5b would need repeating.

### Smoke Test (2026-02-10)

- [x] Verify npm package contents: `npm pack --dry-run` includes `skills/`, `.claude-plugin/`, `bin/claudelint` (9 skills, 315KB)
- [x] Verify CLI executes: `bin/claudelint check-all` runs all validators successfully
- [x] Fix output styles validator false positives: `*/*.md` glob matched all docs as output styles
- [x] Fix cache invalidation bug: stale results served after code changes (added build fingerprint)
- [x] Dogfood: `check-all` reports **0 errors, 0 warnings** on our own project
- [ ] Test local plugin install: `/plugin install --source .` (interactive — deferred to full testing)
- [ ] Verify all 9 skills load: `/skills list` (interactive — deferred to full testing)
- [ ] Execute one skill: `/claudelint:validate-all` (interactive — deferred to full testing)
- [ ] Test one natural language trigger: "check my CLAUDE.md" (interactive — deferred to full testing)

### Full Testing (deferred to pre-M5, after M5b)

**Runbook:** `docs/testing/manual-testing-runbook.md` (v1.1.0)

#### Plugin Installation Testing

- [ ] Test GitHub plugin install: `/plugin install github:pdugan20/claudelint` (blocked until repo is public)
- [ ] Test dependency detection in external workspace (uninstall npm package, verify graceful error)

#### Skill Trigger Testing (9 skills, ~30 min each)

- [ ] validate-all: trigger phrases + non-triggers
- [ ] validate-cc-md: trigger phrases + non-triggers
- [ ] validate-skills: trigger phrases + non-triggers
- [ ] validate-plugin: trigger phrases + non-triggers
- [ ] validate-mcp: trigger phrases + non-triggers
- [ ] validate-settings: trigger phrases + non-triggers
- [ ] validate-hooks: trigger phrases + non-triggers
- [ ] format-cc: trigger phrases + non-triggers
- [ ] optimize-cc-md: trigger phrases + non-triggers

#### Functional & Quality Testing

- [ ] Test each skill with valid and invalid inputs
- [ ] Verify conversational quality (explanations, not just error dumps)
- [ ] Test optimize-cc-md interactive workflow (asks before editing, shows diffs)
- [ ] Document results in `docs/testing/`

**Cleanup:** Milestones 2 + 4 complete all plugin-and-md-management work.

- [ ] Update `plugin-and-md-management/tracker.md` header to "Complete"
- [ ] Move `plugin-and-md-management/` to `archive/plugin-and-md-management/`
- [ ] Update status.md: move from Active to Archived

---

## Milestone 5: Stable Release (0.2.0)

**Source:** npm-release-setup Phases 7-8
**Depends on:** Milestones 3 + 4 + 5b (docs + full manual testing + new rules done)
**Effort:** ~2 hours

- [ ] Fix any issues found in manual testing
- [ ] Update CHANGELOG.md
- [ ] Version bump to 0.2.0: `npm run release`
- [ ] Publish: `npm publish --access public`
- [ ] Verify `latest` tag applied
- [ ] Create GitHub release with highlights
- [ ] Remove beta warnings from docs

### Post-Release

- [ ] Define patch/minor/major release criteria
- [ ] Set up GitHub Actions for automated releases
- [ ] Document security patch process

**Cleanup:** Milestones 3 + 5 complete all npm-release-setup work.

- [ ] Update `npm-release-setup/tracker.md` header to "Complete"
- [ ] Move `npm-release-setup/` to `archive/npm-release-setup/`
- [ ] Update status.md: move from Active to Archived

---

## Schema Accuracy Fixes (Complete)

**Source:** schema-accuracy-fixes (archived)
**Reference:** [official-claude-code-specs.md](../references/official-claude-code-specs.md)

Fixed 7 schema issues found during Anthropic comparison audit: hooks.json format rewrite (array to object-keyed), MCP flat format support, attribution schema, missing hook events, output styles rename, sandbox schema, and missing settings fields. All 1205 tests pass.

---

## Milestone 4a: Testing Fixture Infrastructure (Complete)

**Source:** testing-fixture-infrastructure (archived)
**Tracker:** [tracker.md](./archive/testing-fixture-infrastructure/tracker.md)
**Depends on:** Schema Accuracy Fixes (complete)
**Unblocks:** Milestone 5b (5 new rules need fixtures), Milestone 6 (17 new rules need fixtures)

Hardened test infrastructure for forward-compatibility. All 9 config types have fluent builders (3 new: Agent, OutputStyle, LSP). SkillBuilder extended with 7 capabilities, PluginBuilder with 2. Static fixtures enhanced. Integration test rewritten with specific rule IDs and pinned counts (29 errors, 20 warnings). 63/70 tasks complete, 4 dropped, 3 follow-ups added to M5a/M5b.

- [x] Phase 1: Complete missing builders (Agent, OutputStyle, LSP)
- [x] Phase 2: Extend SkillBuilder (7 capabilities for future rules)
- [x] Phase 3: Extend PluginBuilder (2 capabilities for future rules)
- [x] Phase 4: Enhance static fixtures (valid-complete + invalid-all-categories)
- [x] Phase 5: Forward-compatible integration testing (pinned counts approach)
- [x] Phase 6: Documentation and validation

**Cleanup:**

- [x] Update `testing-fixture-infrastructure/tracker.md` header to "Complete"
- [x] Move `testing-fixture-infrastructure/` to `archive/testing-fixture-infrastructure/`
- [x] Update status.md: move from Active to Archived

---

## Milestone 5a: Spec Alignment Critical Fixes

**Source:** official-spec-alignment Phase A
**Tracker:** [tracker.md](./archive/official-spec-alignment/tracker.md)
**Standalone** — no dependencies on other milestones
**Effort:** ~half day
**Why before M6:** Fixes schema foundations that Milestone 6 rules build on. Implementing M6 rules against a wrong schema produces wrong rules.

- [x] A1: Update `KNOWN_KEYS` in `skill-frontmatter-unknown-keys.ts` (add 8 official fields)
- [x] A1-followup: Add `argument-hint`, `disable-model-invocation`, `$ARGUMENTS` to valid-complete example-skill SKILL.md
- [x] A2: Update `skill-description-max-length` default from 500 to 1024
- [x] A3: Review `thirdPerson()` refinement — no change needed (regex accepts guide-style patterns)
- [x] A4: Add `license`, `compatibility`, `metadata` to skill frontmatter schema
- [x] Run `npm run generate:types && npm test && npm run build` (1249 tests, 165 suites)

---

## Milestone 5b: Spec Alignment New Rules + Self-Fixes

**Source:** official-spec-alignment Phases B + C
**Tracker:** [tracker.md](./archive/official-spec-alignment/tracker.md)
**Depends on:** Milestone 5a (schema must be correct first), Milestone 4a (fixture builders + static fixtures for B5-B9 testing)
**Effort:** ~2-3 days

### New Rules

- [x] B5: `skill-description-missing-trigger` (warn) — description lacks trigger phrases
- [x] B6: `skill-arguments-without-hint` (warn) — uses $ARGUMENTS without argument-hint
- [x] B7: `skill-side-effects-without-disable-model` (warn) — Bash/Write tools without disable-model-invocation
- [x] B8: `plugin-hook-missing-plugin-root` (error) — plugin hooks missing ${CLAUDE_PLUGIN_ROOT}
- [x] B9: `plugin-missing-component-paths` (warn) — plugin.json paths invalid

### Self-Fixes (Our Own Plugin)

- [x] C10: Remove `tags` and `dependencies` from all 9 skill SKILL.md files
- [x] C11: Add `disable-model-invocation: true` to validation/format skills
- [x] C12: Move verbose "Common Issues" sections to `references/` in validate-all, validate-skills
- [x] C13: Scope `allowed-tools` to `Bash(claudelint:*)` in all skills
- [x] C14: Skip — low priority

### Fixture Updates

- [x] Updated valid-complete fixture skills (added trigger phrases, disable-model-invocation)
- [x] Updated integration test pinned counts: 29 errors, 25 warnings (was 20)
- [x] Updated fixture builder `withMinimalFields()` to include trigger phrase in description
- [x] Updated metadata tests to check for disable-model-invocation instead of tags/dependencies
- [x] Add hooks with `${CLAUDE_PLUGIN_ROOT}` to valid-complete `.claude-plugin/plugin.json` (B8 follow-up from M4a)
- [x] Add `${CLAUDE_PLUGIN_ROOT}/scripts/init.sh` hook script to valid-complete fixture
- [x] Verify valid-complete still reports 0 errors / 0 warnings after adding hooks

### Post-Implementation

- [x] Run `npm run generate:types && npm test && npm run build` — 110 rules, 1254 tests, 170 suites
- [x] Create rule doc files in `docs/rules/skills/` and `docs/rules/plugin/` (5 files)
- [x] Run `claudelint check-all` against our own project — **0 errors, 0 warnings**
- [x] Reconcile Milestone 6: remove M1 (done via B5), rethink M15/M16 per [overlap analysis](./archive/official-spec-alignment/milestone-6-overlap.md)

**Cleanup:** Milestones 5a + 5b complete all official-spec-alignment work.

- [x] Update `official-spec-alignment/tracker.md` header to "Complete"
- [x] Move `official-spec-alignment/` to `archive/official-spec-alignment/`
- [x] Update status.md: move from Active to Archived

---

## Milestone 6: Medium Skill Rules (9 rules)

**Source:** dogfood-and-improvements T3-14
**Specs:** [medium-rules.md](./archive/skills-quality-validation/medium-rules.md)
**Depends on:** Milestone 4a (fixture builders)
**Effort:** ~1 week

**Reconciled (round 2):** Original 17 rules reduced to 9 after removing duplicates, merging overlaps, and deferring subjective rules. See history below.

### Batch 1: High value (simple, concrete checks)

- [ ] M13: `skill-hardcoded-secrets` (error) — detect known API key prefixes (sk-ant-, ghp_, AKIA, sk_live_), generic password/token assignments, private keys
- [ ] M9: `skill-shell-script-no-error-handling` (warn) — shell scripts missing `set -e` or `set -euo pipefail`. Merges old M4 (skill-missing-error-handling)
- [ ] M10: `skill-shell-script-hardcoded-paths` (warn) — absolute paths (`/usr/`, `/home/`, `/Users/`) in shell scripts
- [ ] M6: `skill-body-missing-usage-section` (warn) — SKILL.md body lacks `## Usage` heading

### Batch 2: Medium value (need more logic)

- [ ] M2: `skill-description-quality` (warn) — description should start with action verb and include technology/domain context. Merges old M17 (skill-description-missing-context)
- [ ] M7: `skill-allowed-tools-not-used` (warn) — tools listed in allowed-tools but never referenced in skill body
- [ ] M11: `skill-mcp-tool-qualified-name` (warn) — MCP tools in allowed-tools should use qualified server::tool format

### Deferred (needs rethinking)

- [ ] M3: `skill-description-too-vague` — conflicts with B5 (skill-description-missing-trigger) which requires "Use this to..." patterns that M3 would flag as meta-language. Needs redesign to coexist.
- [ ] M8: `skill-context-too-broad` — subjective; hard to define "too broad" without false positives

### Removed

- [x] ~~M1: skill-description-missing-trigger-phrases~~ — Done via B5 (skill-description-missing-trigger)
- [x] ~~M4: skill-missing-error-handling~~ — Merged into M9 (skill-shell-script-no-error-handling)
- [x] ~~M5: skill-missing-examples~~ — Already exists as `skill-missing-examples` rule
- [x] ~~M12: skill-import-not-used~~ — Hard to define "used"; low value
- [x] ~~M14: skill-progressive-disclosure-violation~~ — Complex and subjective; deferred to M8 advanced analysis
- [x] ~~M15: skill-frontmatter-missing-tags~~ — Removed (tags not in official Anthropic spec)
- [x] ~~M16: skill-frontmatter-missing-version~~ — Already covered by existing skill-missing-version rule
- [x] ~~M17: skill-description-missing-context~~ — Merged into M2 (skill-description-quality)

After each batch: `npm run generate:types && npm test && npm run build`

---

## Milestone 7: Codebase Cross-Referencing

**Source:** dogfood-and-improvements T3-13
**Standalone**
**Effort:** ~1 week

- [ ] Verify `npm run <script>` references in CLAUDE.md match package.json
- [ ] Verify file paths in instructions point to real files
- [ ] Verify command names (`claudelint`, `prettier`, etc.) are available
- [ ] Flag stale instructions referencing renamed/removed resources

---

## Milestone 8: Advanced Analysis

**Source:** dogfood-and-improvements T3-15, T3-16, T3-17
**Standalone**
**Effort:** ~2-3 weeks total

- [ ] **T3-15: Red flags detection** — Stale commands, dead file refs, old TODOs, version mismatches (~3-5 days)
- [ ] **T3-16: Progressive disclosure validation** — Enforce 3-level content hierarchy (~3-5 days)
- [ ] **T3-17: Additive guidance engine** — Suggest missing sections, heuristics-based (~1+ week)

**Cleanup:** Milestones 6 + 7 + 8 complete all dogfood-and-improvements work.

- [ ] Update `dogfood-and-improvements/progress-tracker.md` header to "Complete"
- [ ] Move `dogfood-and-improvements/` to `archive/dogfood-and-improvements/`
- [ ] Update status.md: move from Active to Archived

---

## Milestone 9: Deferred / Low Priority

Work these when demand exists or as time permits.

### Dependency Migrations (from github-automation)

- [x] Zod 4 migration (completed 2026-02-09)
- [x] markdownlint 0.40 migration (completed 2026-02-09)
- [x] ora 9 migration (completed via Dependabot PR #6)

### Remaining Skill Rules

- [ ] Easy rules not yet implemented: 8 remaining from [easy-rules.md](./archive/skills-quality-validation/easy-rules.md)
- [ ] Hard rules (12): LLM-based evaluation, MCP registry — needs `--llm` flag ([hard-rules.md](./archive/skills-quality-validation/hard-rules.md))

### Other Deferred Items

- [ ] T4-22: Skill version drift detection
- [ ] T4-23: Rule usage analytics
- [ ] T4-24: Custom rule plugin API
- [ ] Manual testing fixture cleanup (12 tasks from infra-refactor Phases 7-8)
- [ ] VitePress documentation site (176 planned tasks, [tracker](./vitepress-docs/implementation-tracker.md))

---

## Source Project Reference

| Milestone | Source Project | Source Tracker |
|-----------|---------------|----------------|
| 1 | github-automation (archived) | [tracker.md](./archive/github-automation/tracker.md) Task 7 |
| 2 | plugin-and-md-management | [tracker.md](./plugin-and-md-management/tracker.md) Phase 2.5 |
| 3 | npm-release-setup | [tracker.md](./npm-release-setup/tracker.md) Phase 6 |
| 4 | plugin-and-md-management | [tracker.md](./plugin-and-md-management/tracker.md) Phase 5.2-5.3 |
| 5 | npm-release-setup | [tracker.md](./npm-release-setup/tracker.md) Phases 7-8 |
| -- | schema-accuracy-fixes (archived) | [README.md](./archive/schema-accuracy-fixes/README.md) |
| 4a | testing-fixture-infrastructure (archived) | [tracker.md](./archive/testing-fixture-infrastructure/tracker.md) |
| 5a | official-spec-alignment | [tracker.md](./archive/official-spec-alignment/tracker.md) Phase A |
| 5b | official-spec-alignment | [tracker.md](./archive/official-spec-alignment/tracker.md) Phases B + C |
| 6 | dogfood-and-improvements | [progress-tracker.md](./dogfood-and-improvements/progress-tracker.md) T3-14 |
| 7 | dogfood-and-improvements | [progress-tracker.md](./dogfood-and-improvements/progress-tracker.md) T3-13 |
| 8 | dogfood-and-improvements | [progress-tracker.md](./dogfood-and-improvements/progress-tracker.md) T3-15/16/17 |
| 9 | Various | See individual items |

---

**Last Updated:** 2026-02-10
