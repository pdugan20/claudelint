# Project Status

**Last Updated:** 2026-02-19
**Current stats:** 117 rules, 204 test suites

All active work is tracked in [roadmap.md](./roadmap.md).

---

## Current Status

**Next milestone:** Stable 0.2.0 release.

Published as `claude-code-lint@0.2.0-beta.3`. Plugin marketplace complete. DX overhaul complete. docs-tools plugin scaffolded in [separate repo](https://github.com/pdugan20/claude-docs-tools).

## Active Projects

| Project | Status | Tracker |
|---------|--------|---------|
| claude-assisted-setup | In Progress | [tracker](./claude-assisted-setup/tracker.md) |

---

## Archived Projects

All project trackers are in `docs/projects/archive/`. Completed or preserved as reference.

| Project | Status | Notes |
|---------|--------|-------|
| npm-release-setup | Complete (Phases 1-6) | Beta published. Stable release tracked in roadmap. |
| plugin-and-md-management | Complete (Phases 0-4) | Plugin infra, schemas, skills, deprecation. Testing tracked in roadmap. |
| agent-testing-and-plugin | Complete | Color field, plugin agent, test expansion, doc restructuring. |
| agents-rework | Complete | Flat file discovery, rule alignment, schema fixes. |
| api-docs-verification | Complete | API Extractor, code samples, range-based auto-fix. |
| branding-and-assets | Complete | Logo, OG image, visual assets. |
| cli-best-practices | Complete | `--output-file`, `--rule`, `--changed`, `--stdin`, option-builders. |
| cli-output-overhaul | ~28% | Phase 1 complete. Remaining work deferred. |
| cli-output-ux | ~93% | Phases 1-3 complete. Phase 4 deferred. |
| cross-category-audit | Complete | All 10 rule categories audited. |
| dogfood-and-improvements | ~92% | 21 new rules, SARIF, auto-fix. 3 tasks in roadmap. |
| file-discovery-and-format | Complete | Centralized discovery, format command fixes. |
| github-automation | Complete | Repo, CI/CD, labels, Codecov, Discussions. |
| manual-testing-infrastructure-refactor | MVP complete | Phases 0-6 done. |
| monorepo-support | Complete | Config inheritance, workspace detection. |
| official-spec-alignment | Complete | 5 new rules, self-fixed all 9 skills. |
| plugin-system-removal | Complete | Removed legacy plugin system. |
| preset-system | Complete | `claudelint:recommended` (89 rules), `claudelint:all` (117 rules). |
| programmatic-api | Complete | ClaudeLint class API. |
| rule-implementation | Reference doc | 324 planned rules snapshot. |
| rule-reliability | Complete | 30/30 tasks: parsing, regex, regression prevention. |
| schema-accuracy-fixes | Complete | Fixed 7 schema issues. |
| skills-quality-validation | Reconciled | 4 implemented, 7 dropped, 1 deferred. |
| testing-fixture-infrastructure | Complete | 9 fluent builders, pinned integration tests. |
| validator-refactor | Complete | Rule-based architecture foundation. |
| validator-refactor-2026 | Complete | Removed 1,263 LOC, renamed validators. |
| developer-experience-overhaul | Complete | Default presets, strict tier, rule improvements, bug fixes. |
| pattern-consolidation | Complete | Shared utilities, banned patterns, regex consolidation. |
| plugin-marketplace | Complete | Marketplace, version sync, install UX, SessionStart hook, e2e testing. docs-tools moved to separate repo. |
| plugin-spec-alignment | Complete | Fixed marketplace schema, 2 rules, install syntax, JSON schema. |
| vitepress-docs | Launched | claudelint.com live, incremental updates. |

---

## Rule Implementation Summary

117 implemented rules across 10 categories:

| Category | Count |
|----------|-------|
| Skills | 45 |
| CLAUDE.md | 15 |
| MCP | 11 |
| Plugin | 12 |
| Agents | 12 |
| LSP | 6 |
| Settings | 5 |
| Output Styles | 5 |
| Hooks | 3 |
| Commands | 3 |
