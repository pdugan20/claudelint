# Project Status Dashboard

**Last Updated:** 2026-02-15
**Current stats:** 113 rules, 1578 tests

High-level overview of all claudelint projects. **For the sequenced execution plan, see [roadmap.md](./roadmap.md).**

---

## Active Projects

### plugin-and-md-management (~90%)

**Status:** Phases 0-4 Complete. Phase 5 (interactive testing) remaining.
**Location:** [docs/projects/plugin-and-md-management/](./plugin-and-md-management/)

Plugin infrastructure, npm package distribution, and CLAUDE.md management skills.

**Remaining:**

- Milestone 4: Interactive + full manual testing (pre-release)

---

### npm-release-setup (~85%)

**Status:** Phases 1-6 Complete. Phases 7-8 (stable release) remaining.
**Location:** [docs/projects/npm-release-setup/](./npm-release-setup/)

npm package versioning and release automation. Published as `claude-code-lint@0.2.0-beta.1`.

**Remaining:**

- Milestone 5: Stable 0.2.0 release + post-release process

---

### agents-rework

**Status:** Complete, pending archive
**Location:** [docs/projects/agents-rework/](./agents-rework/)

Reworked agent discovery to flat file pattern, aligned rules with official docs, fixed schema issues.

---

### branding-and-assets

**Status:** In Progress
**Location:** [docs/projects/branding-and-assets/](./branding-and-assets/)

Branding, logo, and visual assets for the project.

---

### vitepress-docs

**Status:** Launched
**Location:** [docs/projects/vitepress-docs/](./vitepress-docs/)

Documentation website at claudelint.com (VitePress). Live and receiving incremental updates.

---

## Archived Projects

Projects in `docs/projects/archive/`. Completed or preserved as reference material.

| Project | Status | Notes |
|---------|--------|-------|
| [agent-testing-and-plugin](./archive/agent-testing-and-plugin/) | Complete | Color field, plugin agent, test expansion, doc restructuring, rule rename. |
| [cross-category-audit](./archive/cross-category-audit/) | Complete | All 10 rule categories audited against official Anthropic docs. |
| [file-discovery-and-format](./archive/file-discovery-and-format/) | Complete | Centralized discovery patterns, format command fixes, file-discovery docs. |
| [github-automation](./archive/github-automation/) | Complete | Repo created, CI/CD, labels, Codecov, Discussions all configured. |
| [manual-testing-infrastructure-refactor](./archive/manual-testing-infrastructure-refactor/) | MVP complete | Phases 0-6 done. Phases 7-8 deferred. |
| [skills-quality-validation](./archive/skills-quality-validation/) | Reconciled | 4 easy rules implemented, 7 dropped, 1 deferred. |
| [rule-implementation](./archive/rule-implementation/) | Reference doc | 324 planned rules snapshot. |
| [monorepo-support](./archive/monorepo-support/) | Complete | Config inheritance, workspace detection, parallel validation. |
| [plugin-system-removal](./archive/plugin-system-removal/) | Complete | Removed legacy plugin system. |
| [programmatic-api](./archive/programmatic-api/) | Complete | ClaudeLint class API. |
| [validator-refactor](./archive/validator-refactor/) | Complete | Rule-based architecture foundation. |
| [validator-refactor-2026](./archive/validator-refactor-2026/) | Complete | Removed 1,263 LOC, renamed validators, added architecture docs. |
| [schema-accuracy-fixes](./archive/schema-accuracy-fixes/) | Complete | Fixed 7 schema issues from Anthropic comparison audit. |
| [testing-fixture-infrastructure](./archive/testing-fixture-infrastructure/) | Complete | 9 fluent builders, enhanced fixtures, pinned integration tests. |
| [official-spec-alignment](./archive/official-spec-alignment/) | Complete | 5 new rules (B5-B9), self-fixed all 9 skills. |
| [rule-reliability](./archive/rule-reliability/) | Complete | 30/30 tasks: parsing hardening, regex fixes, regression prevention. |
| [dogfood-and-improvements](./archive/dogfood-and-improvements/) | ~92% | 21 new rules, SARIF, auto-fix, watch mode. 3 tasks remaining (T3-15/16/17). |
| [cli-output-ux](./archive/cli-output-ux/) | ~93% | Phases 1-3 complete. Phase 4 (rich diagnostics) not started. |
| [cli-output-overhaul](./archive/cli-output-overhaul/) | ~28% | Phase 1 complete. Message cleanup and explain mode remaining. |
| [cli-best-practices](./archive/cli-best-practices/) | Planned | 60 tasks across 9 phases. CLI/npm best practices overhaul. |
| [preset-system](./archive/preset-system/) | Planned | Built-in presets (recommended, all). Target 0.3.0. |

---

## Rule Implementation Summary

The linter has **113 implemented rules** across 10 categories:

| Category | Count |
|----------|-------|
| Skills | 45 |
| CLAUDE.md | 15 |
| MCP | 11 |
| Plugin | 12 |
| Agents | 11 |
| LSP | 6 |
| Settings | 5 |
| Hooks | 3 |
| Output Styles | 3 |
| Commands | 2 |

---

**Last Updated:** 2026-02-15
