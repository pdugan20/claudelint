# CLI Best Practices Research Notes

**Last Updated**: 2026-02-14

---

## Sources

- [clig.dev (Command Line Interface Guidelines)](https://clig.dev/)
- [Liran Tal's Node.js CLI Apps Best Practices](https://github.com/lirantal/nodejs-cli-apps-best-practices)
- [BetterCLI.org](https://bettercli.org/)
- [NO_COLOR standard](https://no-color.org/)
- [FORCE_COLOR standard](https://force-color.org/)
- ESLint, Biome, Prettier, oxlint official documentation

---

## 1. Default Command Behavior

Every major linter runs its primary action when invoked with no arguments:

- `eslint .` -- lints
- `prettier .` -- formats
- `biome check .` -- lints + formats

**Current claudelint behavior**: Dumps full help text and exits with code 1. Exit code 1 is wrong here -- that code means "lint violations found." Should either run `check-all` as default or show help and exit 0.

**Recommendation**: Make `check-all` the default command. Commander.js supports `{ isDefault: true }` on command registration.

---

## 2. Help Text

**Best practice structure (from clig.dev and ESLint):**

1. Name and one-line description
2. Usage pattern
3. Common examples (most-read section)
4. Commands grouped by purpose
5. Options grouped by category
6. Link to documentation

**ESLint groups options into**: Basic, Fixing, Ignoring, Output. This is critical at 20+ flags.

**Current claudelint**: 22 flags in flat list for `check-all`, 23 commands in flat list at top level.

---

## 3. Version Output

**Minimal**: `tool-name vX.Y.Z` (one line, machine-parseable)

**Enhanced** (via `--version --verbose`):

- Tool version
- Node.js version
- OS and architecture
- Config file location

**Current claudelint**: Bare `0.2.0-beta.1` -- functional but could include tool name.

---

## 4. Init/Setup Commands

**Best practices from Biome and ESLint:**

- Zero-argument `init` creates working config with sensible defaults
- `--yes` / `--defaults` for non-interactive use
- Detect existing config and warn before overwriting
- Generate config from rule metadata (not hardcoded IDs)
- Migration from competing tools is a differentiator

**Current claudelint init**: Working well. Gaps are hardcoded rule IDs (should use registry) and missing detection for newer components (agents, output-styles, commands).

---

## 5. Environment Variables

**Standard variables every CLI should respect:**

| Variable | Purpose | claudelint status |
|----------|---------|-------------------|
| `NO_COLOR` | Disable all ANSI color | Implemented |
| `FORCE_COLOR` | Force color in non-TTY | Documented but NOT implemented |
| `CI` | Running in CI, disable interactive | Implemented (7 CI systems) |
| `NO_UPDATE_NOTIFIER` | Disable update checks | Not applicable (no update checks yet) |
| `DEBUG` | Enable verbose/debug output | Not implemented (use `--verbose` instead) |

**FORCE_COLOR gap**: The website CLI reference page documents `FORCE_COLOR` support, but `src/utils/reporting/reporting.ts` line 86 does not check for it:

```typescript
// Current (missing FORCE_COLOR):
this.options.color = process.stdout.isTTY && !process.env.NO_COLOR;
```

---

## 6. stdin Support

**ESLint pattern**: `--stdin` reads from stdin, `--stdin-filename` provides context for which rules apply.

**Use cases:**

- Editor integration (VS Code sends buffer content via stdin)
- Pipe workflows: `cat CLAUDE.md | claudelint --stdin --stdin-filename CLAUDE.md`
- Git hooks: `git diff --cached | claudelint --stdin`

**Current claudelint**: No stdin support. All validators work with file paths on disk.

---

## 7. Exit Codes

**Standard convention (ESLint, Biome, Prettier):**

| Code | Meaning |
|------|---------|
| 0 | Success (no errors) |
| 1 | Lint errors found |
| 2 | CLI misuse / config error |
| >128 | Killed by signal (128 + signal number) |

**Current claudelint**: Correct. Uses 0/1/2 properly. One issue: running `claudelint` with no args exits 1 (should be 0 or run default command).

---

## 8. Package.json Fields

**Essential modern fields:**

```json
{
  "exports": {
    ".": { "types": "...", "default": "..." },
    "./package.json": "./package.json"
  },
  "engines": { "node": ">=20.0.0" },
  "files": ["dist", "bin"]
}
```

**Current gaps:**

- Missing `exports` field (only `main`/`types`)
- `@types/inquirer` in production `dependencies` (should be devDependencies)
- `postinstall` runs on consumer install (should be `prepare`)

---

## 9. Update Notifications

**Standard approach**: `update-notifier` package.

- Checks npm registry in background (no startup impact)
- Shows notification on next run
- Respects `NO_UPDATE_NOTIFIER` and `CI` env vars
- Once per day / per session

**Current claudelint**: No update notifications.

---

## 10. Signal Handling

**Best practice (from clig.dev):**

- SIGINT (Ctrl+C): exit cleanly, brief message, cleanup
- SIGTERM: same as SIGINT
- Second Ctrl+C: force exit immediately

**Current claudelint**: SIGINT handler in `watch.ts` only. `check-all` has no signal handling.

---

## 11. Postinstall Scripts

**2025-2026 security landscape:**

- pnpm v10 blocks `postinstall` by default
- Bun requires explicit `trustedDependencies`
- Security guidance: never run lifecycle scripts in dependencies

**Current claudelint**: `postinstall` runs `node scripts/util/postinstall.js && bash scripts/util/setup-hooks.sh`. This runs on consumer `npm install`. Should be `prepare` (only runs in development context).

---

## 12. Shell Completion (Low Priority)

**Approach**: Commander.js doesn't have built-in completion, but `tabtab` package provides it.

**Pattern**: `claudelint completion bash|zsh|fish` outputs shell script, user adds `eval` to profile.

**Assessment**: Nice-to-have for power users, not critical for a linter at this stage.

---

## 13. Features Not Needed

Based on research, these were evaluated and intentionally skipped:

- **Manpages**: No modern JS CLI tools ship manpages. `--help` + web docs is sufficient.
- **Telemetry**: Not worth the trust cost at current scale. Track via npm download counts.
- **PAGER**: Linter output is usually short. No pager needed.
- **XDG_CONFIG_HOME**: Our config is project-local (`.claudelintrc.json`), not user-global.

---

## 14. CLI Flag Architecture

**Audit findings from examining check-all.ts, validator-commands.ts, and watch.ts:**

Four structural issues make the flag system inconsistent and error-prone:

| Issue | Impact | Location |
|-------|--------|----------|
| Duplicated config loading | `--no-config` missing from check-all (bug) | `check-all.ts` lines 88-169 |
| Inline option types | 3 separate anonymous types with inconsistent properties | `check-all.ts`, `validator-commands.ts`, `watch.ts` |
| Flat option registration | 24 `.option()` calls with no grouping structure | `check-all.ts` |
| Manual Reporter mapping | 10-property merge with 3 different strategies mixed inline | `check-all.ts` lines 203-215 |

**Proposed solution (A+B+C+D):**

- **A**: Shared `CLIOptions` interface in `src/cli/types.ts`
- **B**: Refactor `check-all` to use existing `loadAndValidateConfig()` utility
- **C**: Option builder functions (`addCommonOptions`, `addOutputOptions`, etc.) that compose groups
- **D**: `buildReporterOptions()` utility that encapsulates CLI-to-Reporter merge logic

Option builders (C) provide natural grouping for help text display. Reporter builder (D) eliminates the most bug-prone code in the CLI layer.

**Design doc**: [Flag Architecture Spec](flag-architecture-spec.md)

---

## Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Default command | High | Low | P0 |
| `exports` field | Medium | Low | P0 |
| Fix `postinstall` | Medium | Low | P0 |
| Move `@types/inquirer` | Low | Trivial | P0 |
| Implement `FORCE_COLOR` | Medium | Low | P0 |
| Fix init wizard URL | Low | Trivial | P0 |
| Tool name in `--version` | Low | Trivial | P0 |
| Help text grouping | High | Medium | P1 |
| Usage examples in help | Medium | Low | P1 |
| Init wizard modernization | Medium | Medium | P1 |
| stdin support | Medium | High | P2 |
| Update notifications | Medium | Low | P2 |
| Signal handling (check-all) | Low | Low | P2 |
| Shell completion | Low | High | P3 |
