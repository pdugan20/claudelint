# Project Status Dashboard

**Last Updated:** 2026-02-14
**Current stats:** 116 rules, 1512 tests

High-level overview of all claudelint projects. **For the sequenced execution plan, see [roadmap.md](./roadmap.md).**

---

## Active Projects

### plugin-and-md-management (~90%)

**Status:** Phases 0-4 Complete. Phase 5 (interactive testing) remaining.
**Location:** [docs/projects/plugin-and-md-management/](./plugin-and-md-management/)

Plugin infrastructure, npm package distribution, and CLAUDE.md management skills.

**Completed:** Package distribution fix, plugin.json manifest, interactive skills, constants verification system, smoke testing, all 9 skill self-fixes

**Remaining:**

- Milestone 4: Interactive + full manual testing (pre-release)

---

### npm-release-setup (~85%)

**Status:** Phases 1-6 Complete. Phases 7-8 (stable release) remaining.
**Location:** [docs/projects/npm-release-setup/](./npm-release-setup/)

npm package versioning and release automation. Published as `claude-code-lint@0.2.0-beta.1`.

**Completed:** npm account, package name, release-it setup, conventional commits, GitHub Actions, beta publish, release docs (RELEASING.md)

**Remaining:**

- Milestone 5: Stable 0.2.0 release + post-release process

---

### dogfood-and-improvements (~92%)

**Status:** Phase 1 complete, Phase 2 Sprint 7 nearly complete
**Location:** [docs/projects/dogfood-and-improvements/](./dogfood-and-improvements/)

Self-validation bug fixes and linter improvements. Bug fixes (7/7), Sprints 1-6 complete, T3-13 and T3-14 complete via Milestones 6+7.

**Completed:** Bug fixes (7/7), quick wins, reference content, workflow restructure, 21 new rules (Sprint 4 + M5b + M6 + M7), pre-commit optimization, SARIF output, auto-fix (3 rules), CI guide, watch mode, codebase cross-referencing, medium skill rules, custom rule plugin API

**Remaining:**

- T3-15: Red flags detection (stale commands, dead refs, old TODOs)
- T3-16: Progressive disclosure validation (1 of N rules done)
- T3-17: Additive guidance engine

---

### cli-output-ux (~93%)

**Status:** Phases 1-3 Complete. Phase 4 (rich diagnostics) not started.
**Location:** [docs/projects/cli-output-ux/](./cli-output-ux/)

CLI output UX features: summary lines, quiet success, verbose discovery, GitHub formatter, problem matcher, stderr/stdout separation.

**Completed:** 13/14 items (Phases 1-3)

**Remaining:**

- Phase 4: Rich diagnostics with code context (feasibility assessed, not started)

---

### cli-output-overhaul (~28%)

**Status:** Phase 1 Complete. Phases 2-5 remaining.
**Location:** [docs/projects/cli-output-overhaul/](./cli-output-overhaul/)

Output quality overhaul: column alignment via text-table, message content cleanup (74 messages to shorten/rewrite), explain mode enhancement, enforcement guards.

**Key deliverables:**

- `text-table` column alignment (ESLint pattern)
- Remove per-line Fix: labels (fixability in summary only)
- Shorten 54 verbose messages, rewrite 20 worst offenders
- Wire `meta.docs` fields into `--explain` output
- Pre-commit enforcement for message length and content guidelines
- Snapshot tests for reporter output formatting

---

### cli-best-practices (0%)

**Status:** Planned -- 60 tasks across 9 phases
**Location:** [docs/projects/cli-best-practices/](./cli-best-practices/)

CLI and npm package best practices overhaul. Audited against ESLint, Biome, Prettier, clig.dev, and nodejs-cli-apps-best-practices.

**Key deliverables:**

- Default command (`claudelint` runs `check-all`)
- package.json `exports` field, fix `postinstall` to `prepare`
- `FORCE_COLOR` env var support (documented but not implemented)
- Flag architecture refactoring (shared types, option builders, reporter builder)
- Missing CLI flags (`--output-file`, `--rule`, `--changed`, `--ignore-pattern`, etc.)
- Help text with grouped options, usage examples, and doc links
- Init wizard modernization (registry-based defaults, detect newer components)
- `--stdin` / `--stdin-filename` for editor integration and pipes
- Update notifications via `update-notifier`
- SIGINT/SIGTERM signal handling for `check-all`
- Comprehensive tests and website docs updates

---

## Future Projects

### preset-system (0%)

**Status:** Planned — target 0.3.0
**Location:** [docs/projects/preset-system/](./preset-system/)

Built-in preset system (Biome model). Ships `claudelint:recommended` and `claudelint:all` presets. Leverages existing `extends` infrastructure. 34 tasks across 7 phases.

**Key deliverables:**

- Rule audit: categorize all 120 rules as recommended or not
- Preset JSON generation from rule metadata
- Built-in preset resolution in config loader
- Init wizard preset selection
- Documentation and CI quality gates

---

### vitepress-docs (0%)

**Status:** Planned, not started
**Location:** [docs/projects/vitepress-docs/](./vitepress-docs/)

Professional documentation website at claudelint.com. 176 planned tasks across 6 phases.

---

## Archived Projects

Projects in `docs/projects/archive/`. Completed or preserved as reference material.

| Project | Status | Notes |
|---------|--------|-------|
| [github-automation](./archive/github-automation/) | Complete | Repo created, CI/CD, labels, Codecov, Discussions all configured. |
| [manual-testing-infrastructure-refactor](./archive/manual-testing-infrastructure-refactor/) | MVP complete | Phases 0-6 done. Phases 7-8 deferred. |
| [skills-quality-validation](./archive/skills-quality-validation/) | Reconciled | 4 easy rules implemented, 7 dropped, 1 deferred. Hard rules need infrastructure. See roadmap M9. |
| [rule-implementation](./archive/rule-implementation/) | Reference doc | 324 planned rules snapshot (120 implemented). |
| [monorepo-support](./archive/monorepo-support/) | Complete | Config inheritance, workspace detection, parallel validation. |
| [plugin-system-removal](./archive/plugin-system-removal/) | Complete | Removed legacy plugin system. |
| [programmatic-api](./archive/programmatic-api/) | Complete | ClaudeLint class API. See [docs/api/](../api/README.md). |
| [validator-refactor](./archive/validator-refactor/) | Complete | Rule-based architecture foundation. |
| [validator-refactor-2026](./archive/validator-refactor-2026/) | Complete | Removed 1,263 LOC, renamed validators, added architecture docs. |
| [schema-accuracy-fixes](./archive/schema-accuracy-fixes/) | Complete | Fixed 7 schema issues from Anthropic comparison audit. |
| [testing-fixture-infrastructure](./archive/testing-fixture-infrastructure/) | Complete | 9 fluent builders, enhanced fixtures, pinned integration tests. |
| [official-spec-alignment](./archive/official-spec-alignment/) | Complete | 5 new rules (B5-B9), self-fixed all 9 skills. |
| [rule-reliability](./rule-reliability/) | Complete | 30/30 tasks: parsing hardening, regex fixes, regression prevention (CI script, ESLint rules, enriched RuleContext). |

---

## Next Steps (Priority Order)

### 1. Ship Stable Release

1. Complete interactive testing (M4)
2. Fix any issues found
3. Publish 0.2.0 (M5)

### 2. Advanced Analysis (M8)

Red flags detection, progressive disclosure validation, additive guidance engine. These are the last dogfood-and-improvements tasks.

### 3. Deferred (M9)

Hard skill rules (needs MCP registry / LLM infrastructure), version drift detection, rule analytics, VitePress docs site.

---

## Rule Implementation Summary

The linter has **120 implemented rules** across 10 categories:

| Category | Count |
|----------|-------|
| Skills | 46 |
| CLAUDE.md | 16 |
| MCP | 13 |
| Plugin | 12 |
| Agents | 12 |
| LSP | 8 |
| Settings | 5 |
| Hooks | 3 |
| Output Styles | 3 |
| Commands | 2 |

**Spec files for future rules:**

- Skill rules: [easy-rules.md](./archive/skills-quality-validation/easy-rules.md), [medium-rules.md](./archive/skills-quality-validation/medium-rules.md), [hard-rules.md](./archive/skills-quality-validation/hard-rules.md)
- All rules: [rules-reference.md](./archive/rule-implementation/rules-reference.md)

---

**Last Updated:** 2026-02-14
