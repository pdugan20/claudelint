# File Discovery Centralization & Format Command Fixes

**Project Start**: 2026-02-15
**Status**: In Progress

## Problem

claudelint has 5+ separate places defining file patterns for Claude Code file discovery. These patterns diverge from each other and from the official Claude Code documentation, causing:

- The format command misses nested `CLAUDE.md` files, skill files, and agent files
- The MCP validator uses a wrong path (`**/.claude/mcp.json` instead of `**/.mcp.json`)
- The markdownlint `--fix` mode is a no-op (accepts `fix` param but does nothing)
- ShellCheck invocation has a command injection risk via string concatenation
- Watch command doesn't trigger re-validation for agents, output styles, LSP, or local file variants
- No documentation explaining how claudelint discovers files

## Goals

1. Create a single source of truth for all file patterns (`src/utils/filesystem/patterns.ts`)
2. Fix all format command bugs (markdownlint fix, ShellCheck injection, Prettier config)
3. Add `--fix-dry-run` to format command (consistent with check-all)
4. Align all consumers (validators, watch, init wizard, format) with centralized patterns
5. Add comprehensive tests for file discovery and format command
6. Add file discovery documentation page to the website

## Official Documentation References

- Memory / CLAUDE.md: <https://code.claude.com/docs/en/memory>
- Skills: <https://code.claude.com/docs/en/skills>
- Hooks: <https://code.claude.com/docs/en/hooks>
- Sub-agents: <https://code.claude.com/docs/en/sub-agents>
- Plugins: <https://code.claude.com/docs/en/plugins-reference>
- Settings: <https://code.claude.com/docs/en/settings>
- MCP: <https://code.claude.com/docs/en/mcp>

## Project Files

| File | Purpose |
|---|---|
| `tracker.md` | Phase-by-phase task tracker with checkboxes |
| `deviations.md` | Per-task deviation tracking from original plan |
| `README.md` | This file -- project overview |

## Phases

| Phase | Description | Tasks |
|---|---|---|
| 1 | Centralized pattern constants | 2 |
| 2 | Update `files.ts` discovery | 5 |
| 3 | Fix format command | 7 |
| 4 | Update watch command | 2 |
| 5 | Update validator filePatterns | 7 |
| 6 | Update init wizard | 1 |
| 7 | Documentation | 3 |
| -- | **Total** | **28** |

## Key Files

| File | Action |
|---|---|
| `src/utils/filesystem/patterns.ts` | **New** -- centralized pattern constants |
| `src/utils/filesystem/files.ts` | Update -- import patterns, add `findAllFormattableFiles`, fix hooks |
| `src/cli/commands/format.ts` | Update -- centralized discovery, fix bugs, add `--fix-dry-run` |
| `src/cli/utils/formatters/markdownlint.ts` | Update -- implement actual fix via `applyFixes` |
| `src/cli/utils/formatters/prettier.ts` | Update -- explicit `resolveConfig` |
| `src/cli/commands/watch.ts` | Update -- import `WATCH_TRIGGERS` |
| `src/validators/*.ts` | Update -- import filePatterns from centralized constants |
| `src/cli/init-wizard.ts` | Update -- use `INIT_DETECTION_PATHS` |
| `website/guide/file-discovery.md` | **New** -- file discovery documentation |
