# Milestone 4a: Testing Fixture Infrastructure

**Status:** In Progress
**Created:** 2026-02-09
**Plan:** `.claude/plans/piped-imagining-axolotl.md`
**Tracker:** [tracker.md](./tracker.md)

## Overview

Harden the test infrastructure so it's forward-compatible: adding new rules should never break existing tests. Complete missing builders, extend existing ones for planned rules, enhance static fixtures, and adopt per-directory config isolation (stylelint pattern).

## Dependencies

- **Depends on:** Schema Accuracy Fixes (complete)
- **Unblocks:** Milestone 5b (5 new rules need fixtures), Milestone 6 (17 new rules need fixtures)

## Key Documents

| Document | Purpose |
|----------|---------|
| [tracker.md](./tracker.md) | Discrete tasks with checkboxes, organized by phase |
| [industry-audit.md](./industry-audit.md) | ESLint, markdownlint, stylelint testing pattern research |
| [fixture-gap-analysis.md](./fixture-gap-analysis.md) | What future rules need vs what fixtures currently have |

## Architecture Decisions

### Forward-Compatibility: Per-Directory Config (stylelint pattern)

Each fixture project gets a `.claudelintrc.json` with an explicit rule allow-list. New rules added in future milestones won't run against existing fixtures unless explicitly opted in. This is the same pattern stylelint uses for system tests.

### Builder Coverage: All 10 Config Types

Currently 6 of 10 config types have fluent builders. Phase 1 adds the remaining 3 (Agent, OutputStyle, LSP). Commands are deprecated so no builder needed (10th type).

### Integration Test Specificity

Replace vague `toContain('Invalid')` assertions with specific rule ID checks and pinned error counts. This catches regressions precisely without false positives from unrelated rules.

## Phases

| Phase | Summary | Files | Effort |
|-------|---------|-------|--------|
| 1 | Complete missing builders (Agent, OutputStyle, LSP) | 2 | 1-2 days |
| 2 | Extend SkillBuilder (7 capabilities for future rules) | 2 | 2-3 days |
| 3 | Extend PluginBuilder (2 capabilities for future rules) | 2 | 1 day |
| 4 | Enhance static fixtures (valid-complete + invalid-all-categories) | ~12 | 2-3 days |
| 5 | Forward-compatible integration testing (per-directory config) | 3 | 2-3 days |
| 6 | Documentation and validation | 3 | 1 day |
| **Total** | | **~24** | **~1.5-2 weeks** |
