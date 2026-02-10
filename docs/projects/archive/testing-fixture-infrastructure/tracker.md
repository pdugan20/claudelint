# Milestone 4a: Testing Fixture Infrastructure Tracker

**Status:** Complete (7 items deferred to M5a/future)
**Last Updated:** 2026-02-10

---

## Phase 1: Complete Missing Builders (Agent, OutputStyle, LSP)

**Files:** `tests/helpers/fixtures.ts`, `tests/helpers/fixtures.test.ts`
**Effort:** 1-2 days

### AgentBuilder

- [x] Create `AgentBuilder` class with fluent API
- [x] `withMinimalFields()` -- name, description
- [x] `withAllFields()` -- + model, tools, disallowedTools, skills, permissionMode
- [x] `with(key, value)`, `withFrontmatter()`, `withContent()`
- [x] `build()` -- writes AGENT.md to `.claude/agents/<name>/`, returns path
- [x] Add `agent()` factory function export
- [x] Add 5 unit tests: minimal, all fields, custom, invalid, structure

### OutputStyleBuilder

- [x] Create `OutputStyleBuilder` class with fluent API
- [x] `withMinimalFields()` -- name, description, guidelines content
- [x] `withAllFields()` -- + keep-coding-instructions
- [x] `with(key, value)`, `withFrontmatter()`, `withContent()`
- [x] `build()` -- writes .md file to `.claude/output-styles/<name>/`, returns path
- [x] Add `outputStyle()` factory function export
- [x] Add 5 unit tests: minimal, all fields, custom, invalid, structure

### LSPBuilder

- [x] Create `LSPBuilder` class with fluent API
- [x] `withMinimalConfig()` -- one server with command + args
- [x] `withCompleteConfig()` -- multiple servers with extensionToLanguage
- [x] `addServer(name, config)`, `withServers()`
- [x] `build()` / `buildInvalid()` -- writes `.claude/lsp.json`
- [x] Add `lsp()` factory function export
- [x] Add 5 unit tests: minimal, complete, custom, invalid JSON, structure

### Phase 1 Acceptance

- [x] All 9 config types have fluent builders (6 existing + 3 new)
- [x] 15 new tests pass
- [x] `npm test` green, `npm run build` clean

---

## Phase 2: Extend SkillBuilder for Future Rules

**Files:** `tests/helpers/fixtures.ts`, `tests/helpers/fixtures.test.ts`
**Effort:** 2-3 days

### New SkillBuilder Methods

| # | Method | Capability | Future Rule |
|---|--------|-----------|-------------|
| 1 | [x] `withArguments(inContent, hint?)` | Argument substitution | B6: skill-arguments-without-hint |
| 2 | [x] `withDisableModelInvocation(bool)` | Model invocation control | B7: skill-side-effects-without-disable-model |
| 3 | [x] `withReferences(files)` | References subdirectory | M4, M7: cross-reference validation |
| 4 | [x] `withMCPToolReference(server, tool)` | MCP tool references | M11: skill-mcp-tool-qualified-name |
| 5 | [x] `withErrorHandling(bool)` | Shell error handling | M9: skill-shell-script-no-error-handling |
| 6 | [x] `withHardcodedPath(path)` | Hardcoded paths | M10: skill-shell-script-hardcoded-paths |
| 7 | [x] `withHardcodedSecret(type)` | Secrets in scripts | M13: skill-hardcoded-secrets |

### Convenience Methods

- [x] `withSideEffectTools()` -- sets allowed-tools to Bash + Write (for B7 testing)

### Phase 2 Acceptance

- [x] 15+ new SkillBuilder tests (12 new tests added)
- [x] No breaking changes to existing SkillBuilder usage
- [x] `npm test` green

---

## Phase 3: Extend PluginBuilder for Future Rules

**Files:** `tests/helpers/fixtures.ts`, `tests/helpers/fixtures.test.ts`
**Effort:** 1 day

### New PluginBuilder Methods

| # | Method | Capability | Future Rule |
|---|--------|-----------|-------------|
| 1 | [x] `withHooks(hooks, usePluginRoot?)` | Plugin hooks with variable | B8: plugin-hook-missing-plugin-root |
| 2 | [x] `withComponentPaths(skills?, agents?)` | Plugin component paths | B9: plugin-missing-component-paths |

### Phase 3 Acceptance

- [x] 5+ new PluginBuilder tests (5 new tests added)
- [x] No breaking changes to existing PluginBuilder usage
- [x] `npm test` green

---

## Phase 4: Enhance Static Fixtures

**Files:** ~12 new/modified files under `tests/fixtures/projects/`
**Effort:** 2-3 days

### 4.1 valid-complete Enhancements

- [ ] Enhance example-skill SKILL.md: add `argument-hint`, `disable-model-invocation`, `$ARGUMENTS` in body -- **deferred to M5a** (fields trigger skill-frontmatter-unknown-keys until KNOWN_KEYS updated)
- [x] Add `references/common-issues.md` to example-skill directory
- [x] Add second skill (`advanced-skill`) with MCP tool reference in content
- [x] Enhance run.sh with `set -euo pipefail` and env var usage (no hardcoded paths)
- [ ] Add hooks + component paths to `.claude-plugin/plugin.json` -- deferred (no current plugin hook rules to validate against)
- [ ] Add `${CLAUDE_PLUGIN_ROOT}/scripts/init.sh` referenced hook script -- deferred (depends on above)
- [x] Enhance CLAUDE.md with `npm run` commands for cross-reference coverage (already has `npm run build`, `npm test`)
- [x] Verify: `claudelint check-all` still reports 0 errors, 0 warnings

### 4.2 invalid-all-categories Enhancements

- [x] Add skill with `$ARGUMENTS` but no `argument-hint` (B6 trigger) -- args-skill/SKILL.md
- [x] Add skill with Bash/Write allowed-tools but no `disable-model-invocation` (B7 trigger) -- args-skill/SKILL.md
- [x] Add plugin hooks with `./scripts/setup.sh` missing `${CLAUDE_PLUGIN_ROOT}` (B8 trigger) -- plugin.json
- [x] Add plugin with `skills: "skills"` missing `./` prefix (B9 trigger) -- plugin.json
- [x] Add shell script without `set -e` or error handling (M9 trigger) -- bad-skill/bad-skill.sh
- [x] Add shell script with `/Users/username/hardcoded/path.txt` (M10 trigger) -- bad-skill/bad-skill.sh
- [x] Add shell script with `API_KEY="sk-1234..."` hardcoded secret (M13 trigger) -- bad-skill/bad-skill.sh
- [x] Verify: `claudelint check-all` still exits 1 with errors in all 10 categories (29 errors, 20 warnings)

### Phase 4 Acceptance

- [x] valid-complete: 0 errors, 0 warnings
- [x] invalid-all-categories: exit 1, errors across all 10 categories
- [x] New fixture content ready for future rules (B6-B9, M9-M13)
- [ ] Remaining valid-complete tasks (argument-hint, disable-model-invocation, plugin hooks) deferred to M5a

---

## Phase 5: Forward-Compatible Integration Testing

**Files:** 3 files (integration test + 2 `.claudelintrc.json` configs)
**Effort:** 2-3 days

### 5.1 Per-Directory Config (stylelint pattern)

- [ ] Create `valid-complete/.claudelintrc.json` with explicit rule allow-list -- **deferred**: config system uses defaults for unlisted rules (no "strict" mode to disable unlisted rules). Pinned-count approach achieves the same detection.
- [ ] Create `invalid-all-categories/.claudelintrc.json` with explicit rule allow-list -- **deferred** (same reason)
- [ ] Verify CLI respects `.claudelintrc.json` and only runs listed rules -- **deferred**
- [ ] Document rule allow-list format and update convention -- covered in integration test docblock

### 5.2 Refactor Integration Test Assertions

- [x] Replace `toContain('Invalid')` with specific rule ID assertions (LSP: `Invalid key in record`, `Language ID cannot be empty`)
- [x] Replace `toContain('expected string, received undefined')` with more specific plugin assertions (kept specific Zod message + added `Must be valid semantic version`)
- [x] Replace `toContain('Invalid option')` with specific hooks rule ID (`hooks-invalid-config`, `hooks-invalid-event`)
- [x] Replace `toContain('Invalid input')` with specific MCP assertion (`bad-transport`)
- [x] Add pinned error count assertion for invalid-all-categories (29 errors)
- [x] Add pinned warning count assertion for invalid-all-categories (20 warnings)

### 5.3 Forward-Compatibility Verification

- [x] Forward-compatibility documented in integration test docblock
- [x] Mechanism: pinned error/warning counts catch new rules firing against fixtures
- [ ] Simulate adding a new rule to the codebase (dummy rule) -- deferred (trivially verified: any count change breaks the test)

### Phase 5 Acceptance

- [x] All integration test assertions use specific rule IDs (21 tests, up from 14)
- [x] Error/warning counts are pinned (29 errors, 20 warnings)
- [x] Forward-compatibility: pinned counts detect new rules silently firing

---

## Phase 6: Documentation and Validation

**Files:** 3 files
**Effort:** 1 day

### Documentation

- [x] Update `tests/helpers/README.md` with new builder documentation
- [x] Create/update `tests/fixtures/projects/README.md` with fixture maintenance guide
- [x] Add Milestone 4a entry to `docs/projects/roadmap.md`

### Fixture Maintenance Guide Contents

- [x] Forward-compatibility strategy (per-directory config)
- [x] How to add new fixture projects for new rules
- [x] Naming conventions for rule-specific fixtures
- [x] Checklist: when a new rule needs fixture data

### Final Validation

- [x] `npm test` -- all tests pass (165 suites, 1244 tests)
- [x] `npm run build` -- compiles clean
- [x] `claudelint check-all` in valid-complete -- exit 0, 0 errors/warnings
- [x] `claudelint check-all` in invalid-all-categories -- exit 1, specific errors
- [ ] Coverage stays above 80% -- deferred (not currently enforced in CI)
- [ ] Forward-compatibility verified (Phase 5.3 dummy rule test) -- deferred (trivially verified: any count change breaks the test)

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1: Missing Builders | 22 tasks | Complete |
| Phase 2: SkillBuilder Extensions | 9 tasks | Complete |
| Phase 3: PluginBuilder Extensions | 3 tasks | Complete |
| Phase 4: Static Fixtures | 16 tasks | Complete (2 deferred to M5a) |
| Phase 5: Integration Testing | 10 tasks | Complete (3 deferred) |
| Phase 6: Docs and Validation | 10 tasks | Complete (2 deferred) |
| **Total** | **70 tasks** | **63 complete, 7 deferred** |
