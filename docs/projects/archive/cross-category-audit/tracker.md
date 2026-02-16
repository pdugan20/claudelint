# Cross-Category Audit Tracker

**Created**: 2026-02-14
**Status**: Complete
**Total Tasks**: 12
**Progress**: 12/12 (100%)

## Summary

Systematic audit of all rule categories against official Anthropic Claude Code documentation. Each finding was verified against the source text at `code.claude.com/docs/en/*`. The skill category was completed in a prior session; this project covers the remaining 9 categories.

**Source of truth**: <https://code.claude.com/docs/en/>

---

## Phase 1: Schema and Constants Fixes

Core data model updates that other phases depend on. Must be done first since rules and tests reference these schemas.

### 1.1 Add `delegate` to agent PermissionModes

- **File**: `src/schemas/agent-frontmatter.schema.ts` (line 14)
- **Source**: [Sub-agents docs](https://code.claude.com/docs/en/sub-agents) - `permissionMode` field lists `delegate` as a valid option
- **Current**: `z.enum(['default', 'acceptEdits', 'dontAsk', 'bypassPermissions', 'plan'])`
- **Action**: Add `'delegate'` to the enum
- **Tests**: Update `tests/schemas/agent-frontmatter.schema.test.ts` to test `delegate` as valid
- [x] Code change
- [x] Tests updated
- [x] Fixtures updated (N/A - inline test cases)
- [x] Docs website regenerated

### 1.2 Add `maxTurns`, `mcpServers`, `memory` to AgentFrontmatterSchema

- **File**: `src/schemas/agent-frontmatter.schema.ts` (line 19-44)
- **Source**: [Sub-agents docs](https://code.claude.com/docs/en/sub-agents) - "Supported frontmatter fields" table lists these fields
- **Action**: Add:
  - `maxTurns: z.number().int().positive().optional()` (limits agent turns)
  - `mcpServers: z.array(z.string()).optional()` (list of MCP server names)
  - `memory: z.object({ enabled: z.boolean().optional() }).optional()` (memory config)
- **Tests**: Add schema tests for each new field
- [x] Code change
- [x] Tests updated
- [x] Fixtures updated (N/A - inline test cases)
- [x] Docs website regenerated

### 1.3 Remove `Setup` from HookEvents

- **File**: `src/schemas/constants.ts` (line 59)
- **Source**: [Hooks docs](https://code.claude.com/docs/en/hooks) - Event table lists 14 events; `Setup` is not among them. `SessionStart` replaced it.
- **Current**: HookEvents includes `'Setup'`
- **Action**: Remove `'Setup'` from the enum
- **Impact**: Also remove `Setup` key from `SettingsHooksSchema` in `src/validators/schemas.ts` (line 48)
- **Risk**: Breaking change for users with `Setup` hooks. Consider adding a migration note or deprecation rule.
- [x] Code change
- [x] Tests updated (constants.test.ts: 15->14 events, validation-helpers.test.ts: Setup->SessionStart)
- [x] Fixtures updated (no fixtures used Setup)
- [x] Docs website regenerated
- [x] Manual JSON schema updated (schemas/hooks-config.schema.json)

### 1.4 Add `async` field to hook handler schema

- **File**: `src/validators/schemas.ts` (line 13-22, `SettingsHookSchema`)
- **Source**: [Hooks docs](https://code.claude.com/docs/en/hooks) - Hook handler properties table shows `async` as a boolean field for command hooks
- **Current**: Schema has `type`, `command`, `prompt`, `agent`, `timeout`, `statusMessage`, `once`, `model`
- **Action**: Add `async: z.boolean().optional()` to `SettingsHookSchema`
- [x] Code change
- [x] Tests updated (hooks-config.schema.test.ts: added async test)
- [x] Fixtures updated (N/A - inline test cases)
- [x] Docs website regenerated
- [x] Manual JSON schemas updated (hooks-config.schema.json, agent-frontmatter.schema.json)

### 1.5 Regenerate JSON schemas

- **Action**: Run `npm run generate:json-schemas` after all Phase 1 schema changes
- **Verify**: Run `npm run check:schema-sync` to confirm Zod and JSON schemas match
- **Files affected**: `schemas/*.json`
- [x] JSON schemas regenerated (8/8)
- [x] Schema sync check passes (0 drift)

---

## Phase 2: Rule Logic Fixes

Rules whose validation logic is incomplete or incorrect per official docs.

### 2.1 Add `headers` to MCP env var validation

- **File**: `src/rules/mcp/mcp-invalid-env-var.ts` (lines 137-169, `validateTransport`)
- **Source**: [MCP docs](https://code.claude.com/docs/en/mcp) - "Environment variable expansion" section: "Environment variables can be used in command, args, url, headers, and env fields"
- **Current**: Validates `command`, `args`, `url`, `env` but skips `headers`
- **Action**: Add header value validation after the URL check
- [x] Code change
- [x] Tests updated (mcp-invalid-env-var.test.ts: added headers valid/invalid tests)
- [x] Fixtures updated (N/A - inline test cases)
- [x] Docs website regenerated

### 2.2 Add missing component types to `plugin-missing-component-paths`

- **File**: `src/rules/plugin/plugin-missing-component-paths.ts` (line 13)
- **Source**: [Plugins reference](https://code.claude.com/docs/en/plugins-reference) - "Complete Schema" shows `hooks`, `mcpServers`, `lspServers` as component path fields
- **Current**: `['skills', 'agents', 'commands', 'outputStyles']`
- **Action**: Change to `['skills', 'agents', 'commands', 'outputStyles', 'hooks', 'mcpServers', 'lspServers']`
- **Note**: `hooks`, `mcpServers`, `lspServers` can be strings (paths) or objects (inline config). The `toStringArray()` helper already handles non-string values by returning `[]`, so inline objects are safely skipped.
- [x] Code change
- [x] Tests updated (added string path tests for hooks/mcpServers/lspServers + inline object skip test)
- [x] Fixtures updated (N/A - inline test cases)
- [x] Docs website regenerated

### 2.3 Add missing component types to `plugin-components-wrong-location`

- **File**: `src/rules/plugin/plugin-components-wrong-location.ts` (line 80)
- **Source**: [Plugins reference](https://code.claude.com/docs/en/plugins-reference) - all component types should be checked
- **Current**: `['skills', 'agents', 'hooks', 'commands']`
- **Action**: Change to `['skills', 'agents', 'hooks', 'commands', 'mcpServers', 'lspServers', 'outputStyles']`
- [x] Code change
- [x] Tests updated (N/A - existing tests verify the pattern, new types follow same logic)
- [x] Fixtures updated (N/A)
- [x] Docs website regenerated

### 2.4 Recognize `Task(agent-name)` syntax in tool validation

- **File**: `src/utils/validators/references.ts` (lines 12-20)
- **Source**: [Sub-agents docs](https://code.claude.com/docs/en/sub-agents) - "You can use the Task tool with `subagent_type` to launch specialized agents"
- **Current**: `validateToolName()` does a strict match against `VALID_TOOLS`. `Task(my-agent)` would fail because only `Task` is in the list.
- **Action**: Before the strict check, extract the base tool name from parameterized syntax
- [x] Code change
- [x] Tests updated (references.test.ts: added Task(my-agent), Bash(npm run build), Read(.env), FakeTool(arg))

---

## Phase 3: Severity Adjustments

Rules whose severity level doesn't match official docs.

### 3.1 Downgrade `plugin-version-required` from `error` to `warn`

- **File**: `src/rules/plugin/plugin-version-required.ts` (line 20)
- **Source**: [Plugins reference](https://code.claude.com/docs/en/plugins-reference) - "Required fields" section lists only `name` as required. `version` is under "Optional metadata".
- **Current**: `severity: 'error'`
- **Action**: Change to `severity: 'warn'`
- [x] Code change (severity + all doc strings updated to "recommended")
- [x] Tests updated (3 error message expectations updated)
- [x] Docs website regenerated

### 3.2 Downgrade `plugin-description-required` from `error` to `warn`

- **File**: `src/rules/plugin/plugin-description-required.ts` (line 20)
- **Source**: [Plugins reference](https://code.claude.com/docs/en/plugins-reference) - same as above, `description` is listed under "Optional metadata"
- **Current**: `severity: 'error'`
- **Action**: Change to `severity: 'warn'`
- [x] Code change (severity + all doc strings updated to "recommended")
- [x] Tests updated (3 error message expectations updated)
- [x] Docs website regenerated

---

## Phase 4: Doc String Updates

Rules whose validation logic is correct but whose `details`, `howToFix`, or example text lists stale/incomplete values.

### 4.1 Update `hooks-invalid-event` doc strings

- **File**: `src/rules/hooks/hooks-invalid-event.ts` (lines 31-35, 53-55)
- **Problem**: `details` and `howToFix` list only 10 of 14 valid events. Missing: `SessionStart`, `SessionEnd`, `TeammateIdle`, `TaskCompleted`.
- **Action**: Update both strings to list all 14 events
- [x] Code change
- [x] Docs website regenerated

### 4.2 Update `agent-hooks-invalid-schema` doc strings

- **File**: `src/rules/agents/agent-hooks-invalid-schema.ts` (lines 72-75)
- **Problem**: `howToFix` lists only 5 events: `PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest, Notification`
- **Action**: Update to list all 14 valid events (also updated `details`)
- [x] Code change
- [x] Docs website regenerated

### 4.3 Update `agent-hooks` doc strings

- **File**: `src/rules/agents/agent-hooks.ts` (lines 33-34)
- **Problem**: `details` lists only 5 events
- **Action**: Update to list all 14 valid events
- [x] Code change
- [x] Docs website regenerated

### 4.4 Update `settings-invalid-permission` doc strings

- **File**: `src/rules/settings/settings-invalid-permission.ts` (lines 7-8, 84-86)
- **Problem**: File header comment and `howToFix` reference `KillShell` and `TodoWrite` (don't exist in VALID_TOOLS) and omit `LSP`, `AskUserQuestion`, `EnterPlanMode`, `TaskCreate`, `TaskUpdate`, `TaskGet`, `TaskList`, `TaskOutput`, `TaskStop`
- **Action**: Update file header and `howToFix` to match `VALID_TOOLS` from `constants.ts`
- [x] Code change
- [x] Docs website regenerated

---

## Phase 5: Verify and Ship

### 5.1 Build and test

- [x] Build succeeds (114 rules, 86 recommended)
- [x] All tests pass (196 suites, 1536 tests, 8 snapshots)
- [x] check:all passes (5/5)
- [x] Schema sync passes (8/8, 0 drift)

### 5.2 Regenerate docs website

- [x] Rule docs regenerated (114 pages)
- [x] No stale docs remain

### 5.3 Commit and push

- [ ] Committed with conventional commit message
- [ ] CI passes (all 16 jobs)

---

## Items Explicitly Not Changed

These were evaluated during the audit and determined to not need changes:

| Item | Reason |
|------|--------|
| `claude-md-import-circular` severity | Docs say "max-depth of 5 hops" with graceful handling; `warn` is appropriate |
| `@import` regex in claude-md rules | Regex correctly handles `@path` syntax used by Claude Code |
| `PermissionsSchema.defaultMode` missing `delegate` | `delegate` is for agent `permissionMode`, not settings `defaultMode` |
| Agent `color` field | Not in official docs, but harmless as `.passthrough()` or `z.string().optional()` |
| LSP rules | Only 2 rules exist, both are simple and correct |
| Commands rules | Only 2 rules exist, aligned with plugin spec |
| Output-styles rules | Only 2 rules exist, aligned with plugin spec |
| Add new rules for undocumented patterns | Out of scope; this audit fixes existing rules only |
| MCP `disabled` field | Already optional in our schema, matches docs |
| Settings `env` field | Already `z.record(z.string(), z.string())`, matches docs |
| Hook `prompt` type handler | Already in schema as `z.string().optional()` |
| Hook `agent` type handler | Already in schema as `z.string().optional()` |
