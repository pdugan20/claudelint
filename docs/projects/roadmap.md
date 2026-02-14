# Aggregated Roadmap

**Last Updated:** 2026-02-10
**Purpose:** Single sequenced tracker for all remaining work across all projects.
**Current stats:** 116 rules, 1512 tests, 196 suites

---

## How This Works

**This file is the single source of truth for active work.** Do not update individual project trackers.

- **Working:** Check off tasks here as you complete them.
- **Archiving:** When a milestone finishes all tasks for a source project, that milestone includes a cleanup task to mark the project tracker as "Complete" and move it to `archive/`.
- **status.md:** Update [status.md](./status.md) when projects move between active and archived.
- **Project trackers:** Historical record only. Don't update during day-to-day work.

---

## Active Work

### Milestone 4: Manual Testing

**Source:** plugin-and-md-management Phase 5.2-5.3
**Depends on:** M5b complete (all 9 skills updated)
**Effort:** ~1 day
**Unblocks:** Milestone 5 (stable release)

Smoke testing is complete. Interactive testing remains.

#### Smoke Test (Complete - 2026-02-10)

- [x] Verify npm package contents: `npm pack --dry-run` (9 skills, 315KB)
- [x] Verify CLI executes: `bin/claudelint check-all` runs all validators
- [x] Fix output styles validator false positives
- [x] Fix cache invalidation bug (added build fingerprint)
- [x] Dogfood: `check-all` reports **0 errors, 0 warnings** on our own project

#### Interactive Testing (Pre-Release)

- [ ] Test local plugin install: `/plugin install --source .`
- [ ] Verify all 9 skills load: `/skills list`
- [ ] Execute one skill: `/claudelint:validate-all`
- [ ] Test one natural language trigger: "check my CLAUDE.md"

#### Full Testing (Pre-Release)

**Runbook:** `docs/testing/manual-testing-runbook.md` (v1.1.0)

- [ ] Test GitHub plugin install: `/plugin install github:pdugan20/claudelint` (blocked until repo is public)
- [ ] Test dependency detection in external workspace
- [ ] Skill trigger testing (9 skills, trigger phrases + non-triggers)
- [ ] Functional & quality testing (valid/invalid inputs, conversational quality)
- [ ] Document results in `docs/testing/`

**Cleanup:** Milestones 2 + 4 complete all plugin-and-md-management work.

- [ ] Update `plugin-and-md-management/tracker.md` header to "Complete"
- [ ] Move `plugin-and-md-management/` to `archive/plugin-and-md-management/`
- [ ] Update status.md: move from Active to Archived

---

### Milestone 5: Stable Release (0.2.0)

**Source:** npm-release-setup Phases 7-8
**Depends on:** Milestone 4 (manual testing)
**Effort:** ~2 hours

- [ ] Fix any issues found in manual testing
- [ ] Update CHANGELOG.md
- [ ] Version bump to 0.2.0: `npm run release`
- [ ] Publish: `npm publish --access public`
- [ ] Verify `latest` tag applied
- [ ] Create GitHub release with highlights
- [ ] Remove beta warnings from docs

#### Post-Release

- [ ] Define patch/minor/major release criteria
- [ ] Set up GitHub Actions for automated releases
- [ ] Document security patch process

**Cleanup:** Milestones 3 + 5 complete all npm-release-setup work.

- [ ] Update `npm-release-setup/tracker.md` header to "Complete"
- [ ] Move `npm-release-setup/` to `archive/npm-release-setup/`
- [ ] Update status.md: move from Active to Archived

---

### Milestone 11: CLI Best Practices Overhaul

**Source:** [cli-best-practices project](./cli-best-practices/)
**Depends on:** None (can run in parallel with other milestones)
**Effort:** ~2-3 days

CLI and npm package best practices overhaul. Fixes gaps found by auditing against ESLint, Biome, Prettier, clig.dev, and nodejs-cli-apps-best-practices.

- [ ] **Phase 1**: Quick wins — default command, `exports`, fix `postinstall`, `FORCE_COLOR`, version format
- [ ] **Phase 2**: Flag architecture — shared types, config loader, option builders, reporter builder
- [ ] **Phase 3**: Missing CLI flags — `--output-file`, `--rule`, `--changed`, `--ignore-pattern`, etc.
- [ ] **Phase 4**: Help text — grouped options, usage examples, doc links, command grouping
- [ ] **Phase 5**: Init wizard modernization — detect newer components, registry-based defaults, `--force`
- [ ] **Phase 6**: stdin support — `--stdin`, `--stdin-filename`, virtual file interface
- [ ] **Phase 7**: Update notifications and signal handling — `update-notifier`, SIGINT/SIGTERM
- [ ] **Phase 8**: Tests and enforcement — integration tests, package validation, env var tests
- [ ] **Phase 9**: Website documentation — CLI reference, getting started, troubleshooting updates

**Cleanup:**

- [ ] Update status.md: move cli-best-practices from Active to Archived

---

### Milestone 12: Rule Reliability & Parsing Hardening

**Source:** [rule-reliability project](./rule-reliability/)
**Depends on:** None (can run in parallel with other milestones)
**Effort:** ~2-3 days
**Unblocks:** Milestone 10 (cleaner rule implementations for preset audit)

Fixes hand-rolled YAML parsing, fragile code block stripping, regex correctness bugs, symlink loops, and dead dependencies. Based on comprehensive audit of all 116 rules.

- [x] **Phase 1**: Shared utility hardening -- `stripCodeBlocks()`, fix `extractBodyContent`, regex escaping, line ending normalization
- [x] **Phase 2**: Consolidate hand-rolled parsing -- 5 rules migrated to shared utilities
- [x] **Phase 3**: Regex correctness -- `$VARIABLE` partial token fix, `matchAll()` migration, XML tag backtracking cap
- [x] **Phase 4**: Filesystem & security -- symlink protection, secret detection filtering, URL variable detection
- [x] **Phase 5**: Cleanup & validation -- remove dead `ajv` deps, full test suite, docs regeneration
- [x] **Phase 6**: Banned-pattern CI script -- `check:rule-patterns`, migrate remaining `lastIndex` usages
- [x] **Phase 7**: ESLint restrictions -- `no-restricted-syntax`, `no-restricted-imports` for rule files
- [x] **Phase 8**: Rule authoring docs -- shared utility guidance in `src/CLAUDE.md`
- [x] **Phase 9**: Enrich RuleContext -- lazy `frontmatter`, `bodyContent`, `contentWithoutCode` fields
- [x] **Phase 10**: Pre-commit integration & final verification

**Cleanup:**

- [x] Update status.md: move rule-reliability from Active to Archived

---

### Milestone 10: Preset System (0.3.0)

**Source:** [preset-system project](./preset-system/)
**Depends on:** M5 complete (stable 0.2.0 release)
**Effort:** ~2-3 days

Built-in preset system following the Biome model. Ships `claudelint:recommended` (curated subset) and `claudelint:all` (everything on) as extends targets. Leverages existing `extends` infrastructure.

- [ ] **Phase 1**: Rule audit — categorize all 120 rules as recommended/not
- [ ] **Phase 2**: Metadata migration — move `recommended` from docs to top-level meta
- [ ] **Phase 3**: Preset generation — build-time JSON generation from registry
- [ ] **Phase 4**: Config resolution — wire `claudelint:` prefix into extends resolver
- [ ] **Phase 5**: Init wizard — preset selection instead of hardcoded rules
- [ ] **Phase 6**: Documentation — user docs, website badges, rule author guide
- [ ] **Phase 7**: CI quality gates — freshness checks, pre-commit hooks

**Cleanup:**

- [ ] Update status.md: move preset-system from Future to Active/Archived

---

### Milestone 8: Advanced Analysis

**Source:** dogfood-and-improvements T3-15, T3-16, T3-17
**Standalone** (no blockers)
**Effort:** ~2-3 weeks total

- [ ] **T3-15: Red flags detection** — Stale commands, dead file refs, old TODOs, version mismatches (~3-5 days)
- [ ] **T3-16: Progressive disclosure validation** — Enforce 3-level content hierarchy (~3-5 days)
  - [x] `skill-body-long-code-block` (warn) — code blocks over 20 lines should be in references/
- [ ] **T3-17: Additive guidance engine** — Suggest missing sections, heuristics-based (~1+ week)

**Cleanup:** Milestones 6 + 7 + 8 complete all dogfood-and-improvements work.

- [ ] Update `dogfood-and-improvements/progress-tracker.md` header to "Complete"
- [ ] Move `dogfood-and-improvements/` to `archive/dogfood-and-improvements/`
- [ ] Update status.md: move from Active to Archived

---

### Milestone 9: Deferred / Low Priority

Work these when demand exists or as time permits.

#### Easy Skill Rules (Reconciled)

Of 12 original easy rules from [easy-rules.md](./archive/skills-quality-validation/easy-rules.md), 4 implemented, 7 dropped, 1 remaining:

- [x] E1, E5, E6, E10 — already implemented as `skill-readme-forbidden`, `skill-xml-tags-anywhere`, `skill-body-word-count`, `skill-overly-generic-name`
- [x] E4 — covered by `skill-too-many-files` + `skill-multi-script-missing-readme`
- [x] E2/E3/E8/E9/E11/E12 — dropped (too niche, noisy, or conflicts with existing rules)
- [ ] E7: `skill-placeholder-content` — detect TODO/FIXME/HACK in SKILL.md (simple, low priority)

#### Hard Skill Rules (Needs Infrastructure)

- [ ] H1-H2: MCP registry validation — needs public MCP registry API
- [ ] H3-H5: LLM-based quality evaluation — needs `--llm` flag + Claude API integration
- [ ] H10-H12: External tool integration (shellcheck, pylint, markdownlint) — needs opt-in tool runner
- [ ] H6-H9, H13-H15: Advanced analysis — depends on above infrastructure

See [hard-rules.md](./archive/skills-quality-validation/hard-rules.md) for full specs.

#### Other Deferred Items

- [ ] T4-22: Skill version drift detection — low signal for effort
- [ ] T4-23: Rule usage analytics — needs telemetry infrastructure
- [ ] VitePress documentation site (176 planned tasks, [tracker](./vitepress-docs/implementation-tracker.md))

---

## Completed Work

### Milestone 1: Create GitHub Repo (Complete)

Created `pdugan20/claudelint` repo with CI/CD, branch protection, 46 labels, Codecov, GitHub Discussions. All 15 CI jobs green.

### Milestone 2: Constants Verification Wiring (Skipped)

Not needed. `check:constants` is LLM-based (non-deterministic). Internal consistency enforced by TypeScript compilation in pre-commit.

### Milestone 3: Release Documentation (Complete)

RELEASING.md, CONTRIBUTING.md release section, release-it scripts, GitHub releases for v0.2.0-beta.0 and v0.2.0-beta.1.

### Schema Accuracy Fixes (Complete)

Fixed 7 schema issues from Anthropic comparison audit: hooks.json format, MCP flat format, attribution, hook events, output styles, sandbox, settings fields.

### Milestone 4a: Testing Fixture Infrastructure (Complete)

All 9 config types have fluent builders. SkillBuilder (7 capabilities), PluginBuilder (2 capabilities). Integration tests with pinned counts. 63/70 tasks complete.

### Milestone 5a: Spec Alignment Critical Fixes (Complete)

Updated KNOWN_KEYS (+8 fields), description max-length (500 to 1024), added `license`/`compatibility`/`metadata` to schema.

### Milestone 5b: Spec Alignment New Rules + Self-Fixes (Complete)

5 new rules (B5-B9), self-fixed all 9 skills (C10-C14), updated fixtures and pinned counts. 110 rules at completion.

### Milestone 6: Medium Skill Rules (Complete - 7 of 9)

7 rules implemented: `skill-hardcoded-secrets`, `skill-shell-script-no-error-handling`, `skill-shell-script-hardcoded-paths`, `skill-body-missing-usage-section`, `skill-description-quality`, `skill-allowed-tools-not-used`, `skill-mcp-tool-qualified-name`. 2 deferred (M3: conflicts with B5, M8: too subjective).

### Milestone 7: Codebase Cross-Referencing (Complete)

2 rules: `claude-md-npm-script-not-found` (error), `claude-md-file-reference-invalid` (warn).

### Config System Audit (Complete - 2026-02-10)

Compared against Prettier/ESLint config systems. Removed unimplemented YAML/JS config formats, fixed dead $schema URL, updated all stale rule IDs across codebase (examples, docs, archived docs, source comments), added 13 config edge case tests.

### Dependency Migrations (Complete)

Zod 4 (2026-02-09), markdownlint 0.40 (2026-02-09), ora 9 (Dependabot PR #6).

### Custom Rule Plugin API (Complete)

`CustomRuleLoader` class, tests, comprehensive docs at [docs/custom-rules.md](../custom-rules.md).

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
| 5a | official-spec-alignment (archived) | [tracker.md](./archive/official-spec-alignment/tracker.md) Phase A |
| 5b | official-spec-alignment (archived) | [tracker.md](./archive/official-spec-alignment/tracker.md) Phases B + C |
| 6 | dogfood-and-improvements | [progress-tracker.md](./dogfood-and-improvements/progress-tracker.md) T3-14 |
| 7 | dogfood-and-improvements | [progress-tracker.md](./dogfood-and-improvements/progress-tracker.md) T3-13 |
| 8 | dogfood-and-improvements | [progress-tracker.md](./dogfood-and-improvements/progress-tracker.md) T3-15/16/17 |
| 9 | Various | See individual items |
| 10 | preset-system | [tracker.md](./preset-system/tracker.md) |
| 11 | cli-best-practices | [progress-tracker.md](./cli-best-practices/progress-tracker.md) |
| 12 | rule-reliability | [progress-tracker.md](./rule-reliability/progress-tracker.md) |

---

**Last Updated:** 2026-02-14
