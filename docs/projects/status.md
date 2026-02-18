# Project Status

**Last Updated:** 2026-02-17
**Current stats:** 113 rules, 1625 tests

All active work is tracked in [roadmap.md](./roadmap.md).

---

## Current Status

**Next milestone:** Interactive plugin testing, then stable 0.2.0 release.

Published as `claude-code-lint@0.2.0-beta.1`. All implementation work complete. Release burndown is ~1 day of effort.

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
| vitepress-docs | Launched | claudelint.com live, incremental updates. |

---

## Rule Implementation Summary

113 implemented rules across 10 categories:

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
