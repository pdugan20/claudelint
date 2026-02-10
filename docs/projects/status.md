# Project Status Dashboard

**Last Updated:** 2026-02-10

High-level overview of all claudelint projects. **For the sequenced execution plan, see [roadmap.md](./roadmap.md).**

---

## Active Projects

### dogfood-and-improvements (83%)

**Status:** Phase 2 In Progress (Sprint 7)
**Location:** [docs/projects/dogfood-and-improvements/](./dogfood-and-improvements/)

Self-validation bug fixes and linter improvements. Phase 1 (bug fixes) and Sprints 1-6 complete. Sprint 7+ has 5 remaining advanced tasks.

**Completed:** Bug fixes (7/7), quick wins, reference content, workflow restructure, 6 new rules (105 total), pre-commit optimization, SARIF output, auto-fix (3 rules), CI guide, watch mode

**Remaining:**

- T3-13: Codebase cross-referencing (verify npm scripts, file paths in CLAUDE.md)
- T3-14: Medium skill rules (17 rules from [archived specs](./archive/skills-quality-validation/medium-rules.md))
- T3-15: Red flags detection (stale commands, dead refs, old TODOs)
- T3-16: Progressive disclosure validation
- T3-17: Additive guidance engine

---

### plugin-and-md-management (~85%)

**Status:** Phases 0-4 Complete. Phase 5 (testing + release) remaining.
**Location:** [docs/projects/plugin-and-md-management/](./plugin-and-md-management/)

Plugin infrastructure, npm package distribution fix, and CLAUDE.md management skills.

**Completed:** Package distribution fix, plugin.json manifest, interactive skills, constants verification system

**Remaining:**

- Phase 2.5: Wire `check:constants` into pre-commit hook and CI workflow
- Phase 3.8: Manual testing execution
- Phase 5.2-5.5: Manual testing + release

---

### npm-release-setup (~75%)

**Status:** Phases 1-5 Complete, Phases 6-8 Remaining
**Location:** [docs/projects/npm-release-setup/](./npm-release-setup/)

npm package versioning and release automation. Package is published as `claude-code-lint@0.2.0-beta.1`.

**Completed:** npm account, package name, release-it setup, conventional commits, GitHub Actions workflow, beta publish

**Remaining:**

- Phase 6: Release documentation (RELEASING.md, CONTRIBUTING.md updates)
- Phase 7: Stable 0.2.0 release
- Phase 8: Post-release maintenance process

---

### official-spec-alignment (0%)

**Status:** Not started
**Location:** [docs/projects/official-spec-alignment/](./official-spec-alignment/)

Align linter's skill frontmatter schema, validation rules, and our own plugin against the official Claude Code spec. Fixes actively wrong results (false positives on 5 official fields, wrong description max-length default).

**Phases:**

- Phase A: Critical fixes (A1-A4) — fix KNOWN_KEYS, description max-length, thirdPerson() refinement, add missing schema fields
- Phase B: New rules (B5-B9) — trigger phrases, argument hints, side effects, plugin hook paths, component paths
- Phase C: Self-fixes (C10-C14) — remove non-official frontmatter, add disable-model-invocation, scope allowed-tools

**ROADMAP:** Milestones 5a + 5b

---

## Future Projects

### vitepress-docs (0%)

**Status:** Planned, not started
**Location:** [docs/projects/vitepress-docs/](./vitepress-docs/)

Professional documentation website at docs.claudelint.dev. 176 planned tasks across 6 phases. Well-planned and ready when prioritized.

---

## Archived Projects

Projects in `docs/projects/archive/`. Completed or preserved as reference material.

| Project | Status | Notes |
|---------|--------|-------|
| [github-automation](./archive/github-automation/) | 99% | Tasks 1-6, 8-10 complete. **Pending: GitHub repo not yet created.** |
| [manual-testing-infrastructure-refactor](./archive/manual-testing-infrastructure-refactor/) | MVP complete | Phases 0-6 done. Phases 7-8 (fixture cleanup, docs) deferred. |
| [skills-quality-validation](./archive/skills-quality-validation/) | Reference specs | 5/41 rules implemented. Spec files preserved for future rule work. |
| [rule-implementation](./archive/rule-implementation/) | Reference doc | 324 planned rules snapshot (105 implemented + 219 planned). |
| [monorepo-support](./archive/monorepo-support/) | Completed | Config inheritance, workspace detection, parallel validation. |
| [plugin-system-removal](./archive/plugin-system-removal/) | Completed | Removed legacy plugin system. |
| [programmatic-api](./archive/programmatic-api/) | Completed | ClaudeLint class API. See [docs/api/](../api/README.md). |
| [validator-refactor](./archive/validator-refactor/) | Completed | Rule-based architecture foundation. |
| [validator-refactor-2026](./archive/validator-refactor-2026/) | Completed | Removed 1,263 LOC, renamed validators, added architecture docs. |
| [schema-accuracy-fixes](./archive/schema-accuracy-fixes/) | Completed | Fixed 7 schema issues from Anthropic comparison audit (hooks, MCP, attribution, sandbox, settings, output styles). |
| [testing-fixture-infrastructure](./archive/testing-fixture-infrastructure/) | Completed | 9 fluent builders, extended SkillBuilder/PluginBuilder, enhanced fixtures, pinned integration tests. 3 follow-ups in M5a/M5b. |

---

## Consolidated Backlog

Prioritized next steps across all projects. Work these in order.

### P0: Unblock Everything

- **Create GitHub repo** `pdugan20/claudelint` and push code. Remote URL is configured but repo was never created. This blocks CI/CD, branch protection, PR workflows, and the 54 prepared labels. *(from github-automation)*

### P0.5: Fix Wrong Results

- **Official spec alignment** — linter produces false positives on 5 official frontmatter fields, uses wrong description max-length (500 vs 1024), missing 3 official schema fields. *(from official-spec-alignment Phases A-C)*

### ~~P0.75: Harden Test Infrastructure~~ (Complete -- Milestone 4a archived)

### P1: Ship

- **Execute manual testing protocol** for plugin-and-md-management. Unblocks plugin release. *(from plugin-and-md-management Phase 5)*
- **Wire `check:constants` into pre-commit and CI.** npm script exists but isn't in the hook or workflow. *(from plugin-and-md-management Phase 2.5)*
- **Publish stable 0.2.0 release.** Beta is on npm; need release docs and final publish. *(from npm-release-setup Phases 6-8)*

### P2: High-Value Rules

- **T3-14: Medium skill rules** (17 rules). Implementation specs in [archived specs](./archive/skills-quality-validation/medium-rules.md). Priority: M1 (trigger phrases), M13 (hardcoded secrets), M11 (MCP tool names). *(from dogfood-and-improvements)*
- **T3-13: Codebase cross-referencing.** Verify npm scripts, file paths, command names in CLAUDE.md actually exist. *(from dogfood-and-improvements)*

### P3: Advanced Analysis

- **T3-15: Red flags detection.** Stale commands, dead file refs, old TODOs, version mismatches.
- **T3-16: Progressive disclosure validation.** Enforce 3-level content hierarchy.
- **T3-17: Additive guidance engine.** Suggest missing sections, not just flag errors.

### P4: Low Priority / Deferred

- Dependency migrations: Zod 4, markdownlint 0.40, ora 9 *(from github-automation)*
- Manual testing fixture cleanup: 12 tasks from Phases 7-8 *(from manual-testing-infra)*
- T4-21: Hard skill rules (12 rules, requires LLM dependency)
- T4-22: Skill version drift detection
- T4-23: Rule usage analytics
- T4-24: Custom rule plugin API

### Future

- **VitePress documentation site.** 176 tasks planned, ready when prioritized.

---

## Rule Implementation Reference

The linter currently has **105 implemented rules** across 10 categories. An additional **219 non-skill rules** and **36 skill rules** are planned but not yet implemented.

**Spec files for planned rules:**

- Skill rules: [easy-rules.md](./archive/skills-quality-validation/easy-rules.md), [medium-rules.md](./archive/skills-quality-validation/medium-rules.md), [hard-rules.md](./archive/skills-quality-validation/hard-rules.md)
- All rules: [rules-reference.md](./archive/rule-implementation/rules-reference.md)

---

**Last Updated:** 2026-02-10
