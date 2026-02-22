# Rule Audit

**Last Updated:** 2026-02-21
**Scope:** Audit all 117 rules across 10 categories for conflicts, redundancies, misleading names/messages, and usefulness.

---

## Progress

| Category | Rules | Status | Findings |
|----------|-------|--------|----------|
| Commands | 2 | Audited | 1 issue |
| Hooks | 3 | Audited | Clean |
| Settings | 5 | Audited | Clean |
| LSP | 6 | Audited | 2 minor issues |
| Output Styles | 6 | Audited | 1 question |
| MCP | 11 | Audited | 1 issue, 1 observation |
| Agents | 12 | Audited | 1 minor, F4 extended |
| Plugin | 12 | Audited | 2 issues |
| CLAUDE.md | 15 | Audited | Clean |
| Skills | 45 | Audited | 2 issues |

---

## Findings

### F1: Consolidate redundant commands rules

**Category:** Commands
**Severity:** Redundancy
**Rules:** `commands-deprecated-directory`, `commands-migrate-to-skills`

Both rules check the exact same condition (`directoryExists('.claude/commands')`) and both fire as `warn`. The only difference is the message text and documentation. Users get two warnings for one problem.

**Recommendation:** Merge into a single rule. Keep `commands-deprecated-directory` (better name), fold the migration guidance from `commands-migrate-to-skills` into its `howToFix` and `docs.details`, then deprecate/remove the second rule.

---

### F2: `lsp-command-not-in-path` is misleadingly named

**Category:** LSP
**Severity:** Naming/messaging
**Rule:** `lsp-command-not-in-path`

The rule name implies it checks whether the command binary exists in PATH, but it only checks if the command string starts with `/` or `./`. The message `Command "typescript-language-server" not found` is also misleading -- the command may be perfectly findable via PATH.

**Recommendation:** Rename to something like `lsp-command-bare-name` or `lsp-command-not-explicit-path`. Update the message to `Command uses bare name instead of explicit path` or similar.

**Usefulness note:** Most developers use bare command names for LSP servers and that works fine. This is the weakest rule in the LSP category. Consider whether it should be in the recommended preset or only in `claudelint:all`.

---

### F3: `lsp-language-id-empty` trailing period in message

**Category:** LSP
**Severity:** Consistency (minor)
**Rule:** `lsp-language-id-empty`

Message ends with a period: `Language ID for extension ".ts" in server "my-server" cannot be empty.` -- all other LSP rules omit trailing periods.

**Recommendation:** Remove the trailing period for consistency.

---

### F4: No-op schema-delegated rules -- verify disableability

**Category:** Output Styles
**Severity:** Architectural question
**Rules:** `output-style-name`, `output-style-description`, `output-style-examples`

These rules have empty `validate` functions -- all logic lives in schema validators. They exist as documentation anchors and configurable rule IDs (the "thin wrapper pattern").

**Affected rules:**

- Output Styles: `output-style-name`, `output-style-description`, `output-style-examples`
- Agents: `agent-events`, `agent-hooks-invalid-schema`

**Question:** If a user disables one of these rules in their config, does the corresponding schema validation also get skipped? If the schema validation fires regardless, then disabling the rule has no effect, which is confusing.

**Recommendation:** Verify and document the behavior. If disabling these rules does not suppress their schema-level errors, either wire them up properly or document the limitation.

---

### F5: Empty URL and Invalid URL rules overlap on empty strings

**Category:** MCP
**Severity:** Overlap
**Rules:** `mcp-sse-empty-url` + `mcp-sse-invalid-url`, `mcp-http-empty-url` + `mcp-http-invalid-url`, `mcp-websocket-empty-url` + `mcp-websocket-invalid-url`

For `"url": ""`, both the `*-empty-url` and `*-invalid-url` rules fire for the same transport. The `*-invalid-url` rules skip missing URLs but don't skip empty strings, so `new URL("")` throws and produces a second error on top of the "cannot be empty" message.

**Recommendation:** Add an early return in the `*-invalid-url` rules for empty/whitespace-only URLs: `if (url.trim().length === 0) continue;`

---

### F6: High code duplication across MCP transport URL rules (observation)

**Category:** MCP
**Severity:** Design observation (not a bug)
**Rules:** All 6 transport-specific URL rules

The 6 rules (`*-empty-url` and `*-invalid-url` for SSE, HTTP, WebSocket) are near-identical copies differing only in the `server.type` filter. Separate rule IDs allow per-transport disabling, so the design is intentional. However, if URL validation logic needs updating, 6 files must change.

**Recommendation:** No action required now. Future refactor could extract shared validation into a helper while keeping per-transport rule wrappers.

---

### F7: File discovery and monorepo docs pages have redundant/conflicting content

**Category:** Documentation
**Severity:** Content conflict
**Pages:** `website/guide/file-discovery.md`, `website/integrations/monorepos.md`

Both pages maintain their own file discovery tables, but they disagree on details:

- **Hooks path:** file-discovery says `hooks/hooks.json` (plugin), monorepo says `.claude/hooks/hooks.json`
- **Agent filename:** file-discovery says `.claude/agents/<name>.md`, monorepo says `.claude/agents/*/AGENT.md`
- **Skills paths:** file-discovery lists both `.claude/skills/` and `skills/`, monorepo only lists `**/.claude/skills/`

Each page also has a brief section duplicating the other's primary content (file-discovery has a mini monorepo section; monorepo has a mini discovery table).

**Recommendation:**

1. Fix the factual disagreements (decide correct paths, update both)
2. Make file-discovery.md the single source of truth for the discovery table; monorepo page should link there
3. Make monorepos.md the authority on config inheritance/workspaces; file-discovery page should link there

---

### F8: `agent-body-too-short` doubled word in docs

**Category:** Agents
**Severity:** Typo (minor)
**Rule:** `agent-body-too-short`

Line 48 of `src/rules/agents/agent-body-too-short.ts`: "the markdown body of an agent file file" -- "file" is doubled.

**Recommendation:** Remove the duplicate word.

---

### F9: `plugin-invalid-manifest` is misleadingly named

**Category:** Plugin
**Severity:** Naming
**Rule:** `plugin-invalid-manifest`

The rule name suggests it validates `plugin.json`, but it actually validates `marketplace.json`. The rule checks for duplicate plugin entries, missing source paths, and invalid fields in the marketplace manifest -- none of which apply to `plugin.json`.

**Recommendation:** Rename to `plugin-invalid-marketplace-manifest` or `marketplace-invalid-manifest` to match what it actually validates.

---

### F10: `plugin-hook-missing-plugin-root` examples and logic mismatch

**Category:** Plugin
**Severity:** Bug (docs + logic)
**Rule:** `plugin-hook-missing-plugin-root`
**Issue:** [#40](https://github.com/pdugan20/claudelint/issues/40)

**Examples are wrong:** The rule's `docs.examples` show inline hook definitions in plugin.json (e.g., `"hooks": { "PostToolUse": [...] }`). However, Claude Code rejects inline hook objects at runtime -- the `hooks` field only accepts string paths or arrays of string paths. Verified empirically: Claude Code returns `"hooks: Invalid input"` for inline objects.

**Note:** The official Claude Code docs at `code.claude.com/docs/en/plugins-reference` list the `hooks` type as `string|array|object`, but this is incorrect -- inline objects are rejected at runtime. This inconsistency has been documented in our schema descriptions and docs. `mcpServers` and `lspServers` do correctly support inline objects.

**Validation logic is questionable:** The rule checks whether hook file paths (like `"./config/hooks.json"`) use `${CLAUDE_PLUGIN_ROOT}`. But file paths in plugin.json are resolved relative to the plugin root by the plugin system -- they are *supposed* to start with `./` per the schema pattern `^\\.\/.*\\.json$`. The `${CLAUDE_PLUGIN_ROOT}` variable is needed in hook *commands* (inside hooks.json), not in plugin.json file references.

**Recommendation:**

1. Fix the examples to show file-path scenarios, not inline hook objects
2. Re-evaluate whether the rule should check file paths at all, or whether it should instead validate commands inside referenced hooks.json files
3. Consider whether this rule is useful in its current form

**Docs updated:** Added notes about the official docs inconsistency in `schemas/plugin-manifest.schema.json`, `src/validators/schemas.ts`, and `website/api/schemas/plugin.md`.

---

### F11: `skill-allowed-tools-not-used` incorrect example doesn't match rule behavior

**Category:** Skills
**Severity:** Docs (misleading example)
**Rule:** `skill-allowed-tools-not-used`

The "incorrect" example shows `Bash`, `Read`, and `WebFetch` in `allowed-tools` with `Bash` and `Read` referenced in the body. But the rule only fires when **none** of the tools are referenced -- since 2 of 3 are referenced, this example would actually **pass** the rule.

The rule logic (line 116-125 of `src/rules/skills/skill-allowed-tools-not-used.ts`):

```typescript
const hasAnyReference = allowedTools.some(tool => ...);
if (hasAnyReference) return; // This would skip the "incorrect" example
```

**Recommendation:** Replace the incorrect example with one where zero allowed-tools are mentioned in the body. For example, a skill listing `Bash`, `Read`, `WebFetch` in allowed-tools but a body that says "Run the build pipeline and check the output" (no tool names).

---

### F12: `VALID_TOOLS` missing `ToolSearch` -- false positives in `skill-mcp-tool-qualified-name`

**Category:** Skills (constants)
**Severity:** False positive risk
**Rule:** `skill-mcp-tool-qualified-name`
**Constant:** `src/schemas/constants.ts` `ToolNames` enum

The `VALID_TOOLS` constant is missing at least `ToolSearch` (confirmed built-in tool). Possibly also missing `ListMcpResourcesTool` and `ReadMcpResourceTool`. The `skill-mcp-tool-qualified-name` rule uses `VALID_TOOLS` to distinguish built-in tools from MCP tools -- any tool not in the set is flagged as "Unrecognized tool". A skill with `allowed-tools: [ToolSearch]` would be incorrectly warned.

The existing `docs/projects/archive/plugin-and-md-management/constants-audit.md` already tracks ToolNames as "NEEDS AUDIT". The verification script (`npm run check:tool-names`) fails because it relies on querying the Claude CLI which doesn't return a clean tool list.

**Second pass verification:** Cross-checked all 45 skills rules' examples against their validation logic. Only F11 has a mismatched example. All other 44 rules pass. `KNOWN_KEYS` in `skill-frontmatter-unknown-keys` is complete and correct (18 keys matching the Zod schema).

**Recommendation:** Add `ToolSearch` to `ToolNames`. Verify `ListMcpResourcesTool` and `ReadMcpResourceTool` empirically (they appear in the Claude Code environment but may be dynamically injected rather than core built-ins). Update the supplemental tools list in `scripts/verify/tool-names.ts` for tools the CLI query can't detect.

---

## Completed Categories

- [x] Commands (2 rules) -- 1 finding (F1)
- [x] Hooks (3 rules) -- clean
- [x] Settings (5 rules) -- clean
- [x] LSP (6 rules) -- 2 findings (F2, F3)
- [x] Output Styles (6 rules) -- 1 finding (F4)
- [x] MCP (11 rules) -- 1 finding (F5), 1 observation (F6)
- [x] Agents (12 rules) -- 1 finding (F8), F4 extended
- [x] Plugin (12 rules) -- 2 findings (F9, F10)
- [x] CLAUDE.md (15 rules) -- clean
- [x] Skills (45 rules) -- 2 findings (F11, F12)

---

## Remediation

Full plan: [remediation-plan.md](./remediation-plan.md)

| Finding | Status | Notes |
|---------|--------|-------|
| F1 | Done | commands-migrate-to-skills merged into commands-deprecated-directory |
| F2 | Done | lsp-command-not-in-path renamed to lsp-command-bare-name |
| F3 | Done | Trailing period removed |
| F4 | Done | Thin-wrapper pattern documented in src/CLAUDE.md |
| F5 | Done | Empty-string guard added to all 3 invalid-url rules |
| F6 | Done | Extracted shared mcp-url.ts helper, refactored all 6 MCP URL rules |
| F7 | Done | Deduplicated tables, monorepos.md links to file-discovery.md |
| F8 | Done | Doubled word removed |
| F9 | Done | plugin-invalid-manifest renamed to plugin-invalid-marketplace-manifest |
| F10 | Done | Rule rewritten to match spec (3 formats), deprecated, preset off, schema updated |
| F11 | Done | Incorrect example replaced |
| F12 | Done | ToolSearch, ListMcpResourcesTool, ReadMcpResourceTool added |
