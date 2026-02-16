# Agents Rework: Flat File Discovery & Rule Alignment

**Created**: 2026-02-15
**Status**: Complete
**Total Tasks**: 18
**Progress**: 18/18 (100%)

## Summary

Reworked the entire agents subsystem to align with how Claude Code agents actually work. Agents are flat `.md` files (e.g., `.claude/agents/code-reviewer.md`), not directories with `AGENT.md` entrypoints. Updated discovery patterns, file discovery functions, the Zod schema, the validator, all rules, all tests, all fixtures, and all documentation.

**Official docs references:**

- Sub-agents: <https://code.claude.com/docs/en/sub-agents#write-subagent-files>
- Plugin agents: <https://code.claude.com/docs/en/plugins-reference#agents>
- Agent teams: <https://code.claude.com/docs/en/agent-teams>

---

## Phase 1: Update Discovery Patterns

### 1.1 Update `AGENT_PATTERNS` in `patterns.ts`

- **Action**: Change from `*/AGENT.md` directory globs to `*.md` flat file globs
- [x] Updated `.claude/agents/*.md` and `agents/*.md`

### 1.2 Update `FORMATTABLE_MARKDOWN` in `patterns.ts`

- [x] Updated to flat file patterns

### 1.3 Update `VALIDATOR_FILE_PATTERNS` in `patterns.ts`

- [x] Updated to `['**/.claude/agents/*.md', 'agents/*.md']`

### 1.4 Update `WATCH_TRIGGERS` in `patterns.ts`

- [x] Updated to `['.md']`

---

## Phase 2: Update File Discovery Function

### 2.1 Rename `findAgentDirectories` to `findAgentFiles`

- **File**: `src/utils/filesystem/files.ts`
- **Action**: Return file paths directly instead of stripping `/AGENT.md`
- [x] Function renamed and logic updated

### 2.2 Update all callers

- [x] `src/validators/agents.ts` updated
- [x] `tests/utils/file-discovery.test.ts` updated

---

## Phase 3: Update Agent Schema

### 3.1 Fix `memory` field type

- **File**: `src/schemas/agent-frontmatter.schema.ts`
- **Action**: Change from `z.object({ enabled: z.boolean() })` to `z.enum(['user', 'project', 'local'])`
- [x] Schema updated
- [x] Schema test updated

---

## Phase 4: Update Agents Validator

### 4.1 Rewrite `AgentsValidator` for flat files

- **File**: `src/validators/agents.ts`
- **Action**: Iterate file paths directly, filter by basename for specific agent
- [x] Validator rewritten
- [x] `filePatterns` in `ValidatorRegistry.register()` updated

---

## Phase 5: Update Rules

### 5.1 Delete `agent-missing-system-prompt`

- **Reason**: Official docs state the body IS the system prompt; no heading convention exists
- [x] Rule file deleted
- [x] Test file deleted
- [x] `npm run generate:types` regenerated (113 rules, down from 114)

### 5.2 Rewrite `agent-name-directory-mismatch`

- **Action**: Compare name to filename (`basename(filePath, '.md')`) instead of directory name
- [x] Rule rewritten (kept rule ID for backwards compatibility)
- [x] Error message updated to reference "filename"
- [x] Docs metadata updated

### 5.3 Update `agent-body-too-short` guard

- **Action**: Change `filePath.endsWith('AGENT.md')` to `filePath.endsWith('.md')`
- [x] Guard updated

### 5.4 Verify `agent-skills-not-found` path resolution

- **Result**: No code changes needed; existing logic works correctly with flat files
- [x] Verified

---

## Phase 6: Update Test Fixtures

### 6.1 Move valid-complete agent fixture

- `example-agent/AGENT.md` -> `example-agent.md`
- [x] File moved, directory removed
- [x] `## System Prompt` heading removed from content

### 6.2 Move invalid-all-categories agent fixture

- `wrong-dir/AGENT.md` -> `wrong-dir.md`
- [x] File moved, directory removed

---

## Phase 7: Update Tests

### 7.1 Update `agent-name-directory-mismatch.test.ts`

- [x] File paths updated to flat `.md` files
- [x] Error messages updated to reference "filename"

### 7.2 Update `agent-body-too-short.test.ts`

- [x] File paths updated
- [x] Skip test case updated (README.md -> .json to avoid .md matching)

### 7.3 Update `tests/validators/agents.test.ts`

- [x] `createAgent()` helper rewritten for flat files
- [x] `## System Prompt` removed from template content
- [x] Specific agent filtering test updated

### 7.4 Update `tests/validators/scan-metadata.test.ts`

- [x] Agent creation updated for flat files
- [x] Skip reason updated from `"no .claude/agents/"` to `"no agent files"`

### 7.5 Update `tests/utils/file-discovery.test.ts`

- [x] `findAgentDirectories` -> `findAgentFiles`
- [x] Test creates flat files instead of directories
- [x] `findAllFormattableFiles` agent test updated

### 7.6 Update `tests/utils/patterns.test.ts`

- [x] FORMATTABLE_MARKDOWN assertion updated from `AGENT.md` to `agents/`

### 7.7 Update `tests/schemas/agent-frontmatter.schema.test.ts`

- [x] Memory test updated from `{ enabled: true }` to `'project'`

### 7.8 Update `tests/integration/fixture-projects.test.ts`

- [x] Warning count updated (36 -> 35)
- [x] `agent-missing-system-prompt` assertion removed

### 7.9 Update preset snapshots

- [x] Snapshot updated to remove `agent-missing-system-prompt`

---

## Phase 8: Update Documentation

### 8.1 Update `website/guide/file-discovery.md`

- [x] Agents row updated to flat file paths
- [x] Plugin layout example updated
- [x] Format command coverage table updated

### 8.2 Update `website/validators/agents.md`

- [x] Added context about how agents work in Claude Code
- [x] Added "Agents vs Skills" tip
- [x] Added "Not to be confused with AGENTS.md" info box
- [x] Updated rule table
- [x] Added link to official docs

### 8.3 Update `website/api/schemas.md`

- [x] Agent frontmatter section updated with `memory`, `maxTurns`, `mcpServers`, `delegate` fields
- [x] References changed from "AGENT.md" to "Agent file"
- [x] Standalone hooks.json path corrected

---

## Phase 9: Project Tracking

### 9.1 Create project tracker

- [x] `docs/projects/agents-rework/tracker.md` created

### 9.2 Create deviations log

- [x] `docs/projects/agents-rework/deviations.md` created

---

## Verification

- [x] `npm run build` -- TypeScript compiles (113 rules)
- [x] `npm run generate:types` -- regenerated without deleted rule
- [x] `npm test` -- 1570 tests pass across 196 suites
- [x] `npm run check:self` -- claudelint validates itself clean
