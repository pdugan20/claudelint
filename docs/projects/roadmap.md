# Aggregated Roadmap

**Last Updated:** 2026-02-08
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
| official-spec-alignment | Milestones 5a + 5b | active |
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
**Effort:** ~1 hour

- [ ] Add `npm run check:constants` to `.husky/pre-commit` hook
- [ ] Add constants verification step to `.github/workflows/ci.yml`
- [ ] Update README with constants verification docs

---

## Milestone 3: Release Documentation

**Source:** npm-release-setup Phase 6
**Depends on:** Milestone 1 (GitHub repo exists for release notes)
**Effort:** ~half day

- [ ] Create RELEASING.md (beta process, stable process, hotfix process)
- [ ] Add release section to CONTRIBUTING.md
- [ ] Add `prepublishOnly` script to package.json
- [ ] Add version validation script
- [ ] Verify release-it npm scripts work end-to-end
- [ ] Update GitHub release for existing beta (was blocked by no repo)

---

## Milestone 4: Manual Testing

**Source:** plugin-and-md-management Phase 5.2-5.3 + Task 3.8
**Depends on:** Milestone 1 (GitHub install testing needs repo)
**Effort:** ~1 day

### Plugin Installation Testing

- [ ] Test local plugin install: `/plugin install --source .`
- [ ] Verify all 9 skills load: `/skills list`
- [ ] Test GitHub plugin install: `/plugin install github:pdugan20/claudelint`
- [ ] Test dependency detection (uninstall npm package, verify graceful error)
- [ ] Verify npm package contents: `npm pack --dry-run` includes `.claude/`

### Skill Trigger Testing (9 skills, ~30 min each)

- [ ] validate-all: trigger phrases + non-triggers
- [ ] validate-cc-md: trigger phrases + non-triggers
- [ ] validate-skills: trigger phrases + non-triggers
- [ ] validate-plugin: trigger phrases + non-triggers
- [ ] validate-mcp: trigger phrases + non-triggers
- [ ] validate-settings: trigger phrases + non-triggers
- [ ] validate-hooks: trigger phrases + non-triggers
- [ ] format-cc: trigger phrases + non-triggers
- [ ] optimize-cc-md: trigger phrases + non-triggers

### Functional & Quality Testing

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
**Depends on:** Milestones 3 + 4 (docs + testing done)
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

## Milestone 5a: Spec Alignment Critical Fixes

**Source:** official-spec-alignment Phase A
**Tracker:** [tracker.md](./official-spec-alignment/tracker.md)
**Standalone** — no dependencies on other milestones
**Effort:** ~half day
**Why before M6:** Fixes schema foundations that Milestone 6 rules build on. Implementing M6 rules against a wrong schema produces wrong rules.

- [ ] A1: Update `KNOWN_KEYS` in `skill-frontmatter-unknown-keys.ts` (add 8 official fields)
- [ ] A2: Update `skill-description-max-length` default from 500 to 1024
- [ ] A3: Review `thirdPerson()` refinement against Anthropic guide examples
- [ ] A4: Add `license`, `compatibility`, `metadata` to skill frontmatter schema
- [ ] Run `npm run generate:types && npm test && npm run build`

---

## Milestone 5b: Spec Alignment New Rules + Self-Fixes

**Source:** official-spec-alignment Phases B + C
**Tracker:** [tracker.md](./official-spec-alignment/tracker.md)
**Depends on:** Milestone 5a (schema must be correct first)
**Effort:** ~2-3 days

### New Rules

- [ ] B5: `skill-description-missing-trigger` (warn) — description lacks trigger phrases
- [ ] B6: `skill-arguments-without-hint` (warn) — uses $ARGUMENTS without argument-hint
- [ ] B7: `skill-side-effects-without-disable-model` (warn) — Bash/Write tools without disable-model-invocation
- [ ] B8: `plugin-hook-missing-plugin-root` (error) — plugin hooks missing ${CLAUDE_PLUGIN_ROOT}
- [ ] B9: `plugin-missing-component-paths` (warn) — plugin.json paths invalid

### Self-Fixes (Our Own Plugin)

- [ ] C10: Remove `tags` and `dependencies` from all 9 skill SKILL.md files
- [ ] C11: Add `disable-model-invocation: true` to validation/format skills
- [ ] C12: Move verbose "Common Issues" sections to `references/` in validate-all, validate-skills
- [ ] C13: Scope `allowed-tools` to `Bash(claudelint:*)` in all skills
- [ ] C14: Consider `skill-description-negative-trigger` hint rule (low priority)

### Post-Implementation

- [ ] Run `npm run generate:types && npm test && npm run build`
- [ ] Create rule doc files in `docs/rules/skills/` and `docs/rules/plugin/`
- [ ] Run `claudelint check-all` against our own project to verify self-fixes
- [ ] Reconcile Milestone 6: remove M1 (done via B5), rethink M15/M16 per [overlap analysis](./official-spec-alignment/milestone-6-overlap.md)

**Cleanup:** Milestones 5a + 5b complete all official-spec-alignment work.

- [ ] Update `official-spec-alignment/tracker.md` header to "Complete"
- [ ] Move `official-spec-alignment/` to `archive/official-spec-alignment/`
- [ ] Update status.md: move from Active to Archived

---

## Milestone 6: Medium Skill Rules (17 rules)

**Source:** dogfood-and-improvements T3-14
**Specs:** [medium-rules.md](./archive/skills-quality-validation/medium-rules.md)
**Standalone** — no dependencies on other milestones
**Effort:** ~1-2 weeks

**Note:** Reconcile per [milestone-6-overlap.md](./official-spec-alignment/milestone-6-overlap.md) — M1 done via B5, M15/M16 may be removed (non-official fields), M17 depends on A4.

Priority order from specs:

- [ ] M1: skill-description-missing-trigger-phrases
- [ ] M2: skill-description-missing-capabilities
- [ ] M3: skill-description-too-vague
- [ ] M13: skill-hardcoded-secrets
- [ ] M11: skill-mcp-tool-qualified-name
- [ ] M7: skill-allowed-tools-not-used (already have partial: skill-disallowed-tools)
- [ ] M4: skill-missing-error-handling
- [ ] M5: skill-missing-examples
- [ ] M6: skill-body-missing-usage-section
- [ ] M8: skill-context-too-broad
- [ ] M9: skill-shell-script-no-error-handling
- [ ] M10: skill-shell-script-hardcoded-paths
- [ ] M12: skill-import-not-used
- [ ] M14: skill-progressive-disclosure-violation
- [ ] M15: skill-frontmatter-missing-tags
- [ ] M16: skill-frontmatter-missing-version
- [ ] M17: skill-description-missing-context

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
| 5a | official-spec-alignment | [tracker.md](./official-spec-alignment/tracker.md) Phase A |
| 5b | official-spec-alignment | [tracker.md](./official-spec-alignment/tracker.md) Phases B + C |
| 6 | dogfood-and-improvements | [progress-tracker.md](./dogfood-and-improvements/progress-tracker.md) T3-14 |
| 7 | dogfood-and-improvements | [progress-tracker.md](./dogfood-and-improvements/progress-tracker.md) T3-13 |
| 8 | dogfood-and-improvements | [progress-tracker.md](./dogfood-and-improvements/progress-tracker.md) T3-15/16/17 |
| 9 | Various | See individual items |

---

**Last Updated:** 2026-02-08
